import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { createClient } from "../../../../utils/supabase/server";

// Configure Edge runtime or Node runtime. pdf-parse requires Node.js environment.
export const maxDuration = 60; // Allow more time for LLM processing

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // By-pass auth for local debugging via curl
            console.log("No user found, proceeding with mock user for debugging");
        }
        const activeUserId = user?.id || "00000000-0000-0000-0000-000000000000";

        // ── Free Tier Gating ─────────────────────────────────────────────────
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, scan_count")
            .eq("id", activeUserId)
            .maybeSingle() as any;

        const isFree = !profile || (profile as any).subscription_status !== "pro";
        const scanCount = (profile as any)?.scan_count ?? 0;

        if (isFree && scanCount >= 2) {
            return NextResponse.json(
                { error: "Free scan limit reached. Upgrade to Pro for unlimited scans.", limitReached: true },
                { status: 403 }
            );
        }
        // ─────────────────────────────────────────────────────────────────────

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert file to buffer for pdf-parse
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 1. Extract Text from PDF using pdf2json
        const text = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser(null, true); // true = text mode
            
            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF Parsing Error:", errData.parserError);
                reject(new Error(errData.parserError));
            });
            
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // In text mode, pdfParser.getRawTextContent() is available
                // If it isn't, we can fallback to parsing the JSON structure
                let extractedText = pdfParser.getRawTextContent ? pdfParser.getRawTextContent() : "";
                
                if (!extractedText && pdfData.formImage && pdfData.formImage.Pages) {
                    extractedText = pdfData.formImage.Pages.map((page: any) => 
                        page.Texts.map((textItem: any) => decodeURIComponent(textItem.R[0].T)).join(" ")
                    ).join("\n");
                }
                
                resolve(extractedText);
            });
            
            pdfParser.parseBuffer(buffer);
        });

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from PDF. The file might be an image or scanned document." }, { status: 400 });
        }

        // 2. Call Gemini API
        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
            // Return a simulated response if API key is not configured, so UI can still be tested
            return NextResponse.json(getSimulatedResponse());
        }

        const prompt = `
      You are the world's leading contract attorney for the creator economy and tech agencies. 
      Your mission is to protect the user from every possible legal trap with surgical precision.
      
      If the text is NOT a valid contract, return: {"isContract": false, "error": "NOT_A_CONTRACT"}
      
      Analyze the contract and provide a high-end, professional report.
      
      ### REQUIRED ANALYSIS DEEP-DIVE:
      1. **Executive Summary**: A high-level, sophisticated overview (2-3 sentences) of the agreement's fairness.
      2. **Risk Assessment**: Categorize risks (Critical, High, Medium). For each:
         - **Description**: What is the clause?
         - **Legal Translation**: What does this *actually* mean for the user? (Professional but blunt).
         - **Negotiation Strategy**: Expert-level push-back strategy.
         - **Counter-Clause**: A precisely drafted alternative clause for the user to copy/paste.
      3. **Missing Clauses**: Identify 2-3 crucial protections that are MISSING from this contract (e.g., Late Fees, Force Majeure, IP transfer upon payment).
      4. **Industry Alignment**: A brief note on how this contract compares to standard industry benchmarks (e.g., "Highly aggressive toward contractor").
      
      Return ONLY a JSON object:
      {
        "isContract": true,
        "summary": "Sophisticated executive summary...",
        "riskScore": 0-100,
        "tasks": [
          {
            "id": "slug",
            "title": "Professional Title",
            "description": "Professional description",
            "type": "deliverable" | "payment",
            "status": "pending"
          }
        ],
        "alerts": [
          {
            "description": "The exact risky clause text.",
            "severity": "critical" | "high" | "medium",
            "legalTranslation": "Professional explanation of risk.",
            "negotiationStrategy": "Expert negotiation advice.",
            "counterClause": "The exact legally-sound alternative text to propose."
          }
        ],
        "missingClauses": [
          {
            "title": "Clause Title (e.g., Late Payment Interest)",
            "description": "Why this is needed and what it protects.",
            "suggestedText": "The exact text to add."
          }
        ],
        "overallAssessment": "Brief professional assessment against industry standards."
      }
      
      Contract Text:
      ${text.substring(0, 38000)}
    `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json",
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            return NextResponse.json({ error: "Failed to analyze contract with AI." }, { status: 500 });
        }

        const data = await response.json();

        try {
            const resultText = data.candidates[0].content.parts[0].text;
            const parsedJSON = JSON.parse(resultText);

            if (parsedJSON.isContract === false) {
                return NextResponse.json({ error: "The uploaded document does not appear to be a valid contract." }, { status: 400 });
            }

            // 1. Insert Contract Record
            const { data: contractRecord, error: contractError } = await supabase.from('contracts').insert({
                user_id: activeUserId,
                title: file.name.replace(".pdf", ""),
                status: 'analyzed',
                risk_score: parsedJSON.riskScore,
                summary: parsedJSON.summary,
                overall_assessment: parsedJSON.overallAssessment,
                missing_clauses: parsedJSON.missingClauses,
                content_text: text.substring(0, 2000) // basic preview
            } as any).select('id').single();

            if (contractError || !contractRecord) {
                console.error("Failed to insert contract:", contractError);
                return NextResponse.json({ error: "Failed to save contract to database." }, { status: 500 });
            }

            const contractId = (contractRecord as any).id;

            // 2. Batch Insert Tasks
            if (parsedJSON.tasks && parsedJSON.tasks.length > 0) {
                const tasksToInsert = parsedJSON.tasks.map((task: any) => ({
                    contract_id: contractId,
                    user_id: activeUserId,
                    title: task.title,
                    description: task.description,
                    status: task.status || 'pending',
                    is_payment_milestone: task.type === 'payment'
                }));

                const { error: tasksError } = await supabase.from('extracted_tasks').insert(tasksToInsert as any);
                if (tasksError) console.error("Tasks insert error:", tasksError);
            }

            // 3. Batch Insert Risk Alerts
            if (parsedJSON.alerts && parsedJSON.alerts.length > 0) {
                const alertsToInsert = parsedJSON.alerts.map((alert: any) => ({
                    contract_id: contractId,
                    user_id: activeUserId,
                    risk_type: 'red_flag',
                    description: alert.description,
                    severity: alert.severity || 'medium',
                    suggestion: alert.negotiationStrategy,
                    legal_translation: alert.legalTranslation,
                    counter_clause: alert.counterClause,
                    clause_text: "Identified by AI"
                }));

                const { error: alertsError } = await supabase.from('risk_alerts').insert(alertsToInsert as any);
                if (alertsError) console.error("Alerts insert error:", alertsError);
            }

            // ── Increment Scan Count ──────────────────────────────────────────────
            await (supabase.from("profiles") as any)
                .upsert({ id: activeUserId, scan_count: scanCount + 1 }, { onConflict: "id" });
            // ─────────────────────────────────────────────────────────────────────

            return NextResponse.json({ success: true, analysis: parsedJSON, contractId });
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON output:", parseError);
            return NextResponse.json({ error: "Failed to parse AI analysis. The document may be too complex." }, { status: 500 });
        }
        // ─────────────────────────────────────────────────────────────────────

    } catch (error: any) {
        console.error("Contract upload error:", error);
        return NextResponse.json({ error: `Internal server error: ${error.message || error}` }, { status: 500 });
    }
}

// Fallback for UI testing when API is not configured
function getSimulatedResponse() {
    return {
        success: true,
        isSimulated: true,
        analysis: {
            riskScore: 72,
            tasks: [
                { id: "1", title: "Project Brief & Discovery", description: "Deliver an initial project brief document outlining scope, goals, and constraints.", type: "deliverable", status: "pending" },
                { id: "2", title: "50% Upfront Deposit", description: "Client pays 50% of total project cost before work begins.", type: "payment", status: "pending" },
                { id: "3", title: "Design Mockups (3 rounds)", description: "Deliver high-fidelity design mockups. Up to 3 revision rounds included.", type: "deliverable", status: "pending" },
                { id: "4", title: "Final Delivery & Handoff", description: "Deliver all final source files, assets, and documentation.", type: "deliverable", status: "pending" },
                { id: "5", title: "Final 50% Payment", description: "Client pays remaining balance upon final delivery approval.", type: "payment", status: "pending" }
            ],
            alerts: [
                {
                    description: "Section 8.2: The client reserves the right to request unlimited revisions until 'complete satisfaction' without additional cost.",
                    severity: "critical",
                    legalTranslation: "The client can keep asking for changes forever and you can't charge extra for it. There is no defined endpoint — this is a classic scope creep trap.",
                    negotiationStrategy: "Negotiate to replace with: 'This agreement includes up to 3 rounds of revisions per deliverable. Additional revisions will be billed at $X/hour.' If client refuses, walk away."
                },
                {
                    description: "Section 12: A 2-year non-compete clause prohibits working with any client in the same industry after project completion.",
                    severity: "critical",
                    legalTranslation: "You cannot work with any company in the same industry for 2 years after this project — potentially blocking a huge portion of your client base.",
                    negotiationStrategy: "Non-competes are often unenforceable on freelancers but still risky. Request full removal or limit to: 'Contractor will not solicit this specific client's existing customers for 6 months.'"
                },
                {
                    description: "Section 4.1: All IP created under this agreement vests exclusively with the client from the moment of creation, including sketches and drafts.",
                    severity: "high",
                    legalTranslation: "You don't own any of your work — not even your rough drafts — the moment you create them. This makes it impossible to use them in your portfolio.",
                    negotiationStrategy: "Add: 'Contractor retains the right to display completed works in their professional portfolio. IP transfer is contingent on full payment being received.'"
                }
            ]
        }
    };
}
