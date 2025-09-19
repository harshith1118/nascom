import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold text-primary", className)}>
       <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V6.3l7-3.11v9.8z"
          fill="currentColor"
        />
      </svg>
      <span className="text-xl text-foreground">MediTestAI</span>
    </div>
  );
}
