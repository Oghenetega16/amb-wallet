"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background:  "#111f3a",
              color:       "#e8edf8",
              border:      "1px solid rgba(79,142,247,0.3)",
              borderRadius: "12px",
              fontFamily: "DM Sans, sans-serif",
              fontSize:    "13px",
              padding:     "12px 16px",
            },
            success: { iconTheme: { primary: "#22d3a5", secondary: "#111f3a" } },
            error:   { iconTheme: { primary: "#f75f7b", secondary: "#111f3a" } },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
