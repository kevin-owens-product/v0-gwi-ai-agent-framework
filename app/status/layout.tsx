import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Status | GWI Insights",
  description: "Real-time status and incident history for the GWI Insights platform.",
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
