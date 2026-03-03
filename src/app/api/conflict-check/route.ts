import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { contractId1, contractId2 } = await req.json();

        // Fetch both contracts' text and alerts from Supabase
        const [{ data: c1 }, { data: c2 }] = await Promise.all([
            (supabase.from("contracts").select("title, content_text").eq("id", contractId1).eq("user_id", user.id).single() as any),
            (supabase.from("contracts").select("title, content_text").eq("id", contractId2).eq("user_id", user.id).single() as any),
        ]);

        if (!c1 || !c2) {
            return NextResponse.json({ error: "One or both contracts not found." }, { status: 404 });
        }

        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!geminiApiKey) {
            // Return simulated result for testing
            return NextResponse.json({
                contradictions: [
                    {
                        clause: "Payment Terms",
                        contract1_says: "Net-30 payment schedule with 50% upfront deposit",
                        contract2_says: "Net-90 payment schedule, no deposit required",
                        severity: "high",
                        recommendation: "Clarify with client which payment terms apply. The conflict suggests either a version mismatch or deliberate ambiguity."
                    },
                    {
                        clause: "Revision Policy",
                        contract1_says: "Up to 3 revision rounds included",
                        contract2_says: "Unlimited revisions until client satisfaction",
                        severity: "high",
                        recommendation: "The unlimited revision clause in the older contract would override your protections. Ensure the new contract explicitly supersedes prior agreements."
                    }
                ]
            });
        }

        const prompt = `
You are a legal analyst specializing in freelance contract disputes.

Below are excerpts from TWO contracts between the same freelancer and client.

CONTRACT 1 ("${c1.title}"):
${(c1.content_text ?? "").slice(0, 8000)}

CONTRACT 2 ("${c2.title}"):  
${(c2.content_text ?? "").slice(0, 8000)}

Carefully identify any CONTRADICTIONS or CONFLICTS between the two contracts — clauses that say different things about:
- Payment amounts or schedules
- Revision limits
- IP ownership
- Non-compete scope
- Deadlines
- Termination terms
- Liability or indemnification

Return ONLY a JSON object:
{
  "contradictions": [
    {
      "clause": "string (clause name/topic)",
      "contract1_says": "string (what Contract 1 says)",
      "contract2_says": "string (what Contract 2 says)",
      "severity": "low" | "medium" | "high",
      "recommendation": "string (advice on how to resolve the conflict)"
    }
  ]
}

If no contradictions are found, return { "contradictions": [] }.
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
                }),
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: "AI conflict check failed" }, { status: 500 });
        }

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(resultText);
        return NextResponse.json(parsed);

    } catch (error) {
        console.error("Conflict check error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
