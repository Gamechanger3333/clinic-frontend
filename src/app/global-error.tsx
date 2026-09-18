"use client";

import { useEffect } from "react";

// error.tsx can't catch errors thrown by the root layout itself (it renders
// inside that layout) — Next.js requires this separate file, which replaces
// <html>/<body> entirely, to handle that specific case.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[Root layout error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Something went wrong</h1>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>ClinicFlow failed to load. Please try again.</p>
          <button
            onClick={reset}
            style={{ background: "#0f766e", color: "white", padding: "10px 24px", borderRadius: "8px", fontWeight: 500, border: "none", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
