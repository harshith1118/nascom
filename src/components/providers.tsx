"use client";

import { TestCasesProvider } from "@/contexts/TestCasesContext";
import { UserProvider } from "@/contexts/UserContext";
import React from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <TestCasesProvider>{children}</TestCasesProvider>
        </UserProvider>
    );
}
