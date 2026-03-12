"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UsageContextType {
    scanCount: number;
    setScanCount: React.Dispatch<React.SetStateAction<number>>;
    tier: string;
    setTier: React.Dispatch<React.SetStateAction<string>>;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export function UsageProvider({ 
    children, 
    initialScanCount, 
    initialTier 
}: { 
    children: React.ReactNode; 
    initialScanCount: number; 
    initialTier: string;
}) {
    const [scanCount, setScanCount] = useState(initialScanCount);
    const [tier, setTier] = useState(initialTier);

    // Sync from server-side props if they change (e.g. on navigation)
    useEffect(() => {
        setScanCount(initialScanCount);
        setTier(initialTier);
    }, [initialScanCount, initialTier]);

    return (
        <UsageContext.Provider value={{ scanCount, setScanCount, tier, setTier }}>
            {children}
        </UsageContext.Provider>
    );
}

export function useUsage() {
    const context = useContext(UsageContext);
    if (context === undefined) {
        throw new Error("useUsage must be used within a UsageProvider");
    }
    return context;
}
