"use client"

import { useEffect } from "react"

// Global error boundary runs outside of providers, so we use fallback text
// since translations may not be available
const FALLBACK_TEXT = {
  somethingWentWrong: "Something went wrong",
  unexpectedErrorDescription: "We encountered an unexpected error. Our team has been notified and is working on a fix.",
  tryAgain: "Try again",
  errorId: "Error ID:",
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <div style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              {FALLBACK_TEXT.somethingWentWrong}
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
              {FALLBACK_TEXT.unexpectedErrorDescription}
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {FALLBACK_TEXT.tryAgain}
            </button>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "1.5rem" }}>
                {FALLBACK_TEXT.errorId} {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
