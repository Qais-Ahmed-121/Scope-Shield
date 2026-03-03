"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, AlertCircle, Loader2, Shield } from "lucide-react";

interface UploadZoneProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
}

export function UploadZone({ onUpload, isProcessing }: UploadZoneProps) {
    const [error, setError] = useState<string | null>(null);
    const [progressStage, setProgressStage] = useState(0);

    const stages = [
        "Scanning Document...",
        "Extracting Terms...",
        "AI Analysis Running...",
        "Generating Shield Report..."
    ];

    // Simulate multi-stage loading while isProcessing is true
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
            setProgressStage(0);
            interval = setInterval(() => {
                setProgressStage((prev) => (prev < 3 ? prev + 1 : prev));
            }, 2500); // Change stage every 2.5 seconds
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: unknown[]) => {
        setError(null);
        if (fileRejections.length > 0) {
            setError("Please upload a valid PDF document under 10MB.");
            return;
        }

        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1,
        disabled: isProcessing
    });

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                {...(getRootProps() as Record<string, unknown>)}
                className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-colors
          ${isDragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"}
          ${isDragReject ? "border-red-500 bg-red-50 dark:bg-red-900/10" : ""}
          ${isProcessing ? "opacity-70 cursor-not-allowed border-indigo-200 dark:border-indigo-800" : "cursor-pointer"}
        `}
                animate={{ scale: isDragActive ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <input {...getInputProps()} />

                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50"
                            >
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                            </motion.div>
                        ) : isDragReject ? (
                            <motion.div
                                key="reject"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/50"
                            >
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </motion.div>
                        ) : isDragActive ? (
                            <motion.div
                                key="active"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-200 dark:bg-indigo-800"
                            >
                                <File className="h-8 w-8 text-indigo-700 dark:text-indigo-300" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800"
                            >
                                <UploadCloud className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {isProcessing ? stages[progressStage] :
                                isDragReject ? "Invalid file type" :
                                    isDragActive ? "Drop your contract here" :
                                        "Upload your contract"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isProcessing ? "Our AI is currently scanning the document for risks." : "Drag and drop your PDF here, or click to browse files"}
                        </p>
                    </div>

                    <div className="text-xs text-slate-400 mt-4 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Secure, end-to-end encrypted upload
                    </div>
                </div>

                {/* Scanning Animation Overlay */}
                {isProcessing && (
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-0"
                        initial={{ top: "0%" }}
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    />
                )}
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center text-sm font-medium text-red-500"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
