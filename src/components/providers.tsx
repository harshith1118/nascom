"use client";

import { TestCasesProvider } from "@/contexts/TestCasesContext";
import React from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return <TestCasesProvider>{children}</TestCasesProvider>;
}
