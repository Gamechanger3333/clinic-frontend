"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In a real deployment this is where you'd forward to an error-tracking
    // service (Sentry, etc). Logging client-side for now so the failure is
    // at least visible in the browser console during development/triage.
    console.error("[Unhandled UI error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h1 className="text-2xl font-display font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred while loading this page. Your data is safe — try again, or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <a href="/dashboard" className="inline-flex items-center gap-2 border border-border px-6 py-2 rounded-lg font-medium hover:bg-muted/40 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
