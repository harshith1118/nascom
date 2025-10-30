import { config } from 'dotenv';
config();

// LangChain-based AI flows for test case generation and compliance checking
import '@/ai/flows/compliance-check-test-cases.ts';
import '@/ai/flows/generate-test-cases-from-requirements.ts';
import '@/ai/flows/modify-test-cases-with-natural-language.ts';