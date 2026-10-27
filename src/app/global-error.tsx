"use client";

// Replaces the root layout, so it can't use globals.css — styles are inline.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#F3EFE4",
          color: "#2B2A26",
          fontFamily: "Archivo, Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontFamily: "Lora, Georgia, serif", fontSize: 24, margin: 0 }}>
          Something went wrong
        </h1>
        <button
          onClick={() => retry()}
          style={{
            background: "#C79A3C",
            color: "#2B2A26",
            border: 0,
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
