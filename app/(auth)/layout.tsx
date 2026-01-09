import type { ReactNode } from "react"
import Link from "next/link"
import { Brain } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/30 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">GWI Agents</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "GWI Agents transformed how we approach consumer research. What used to take weeks now happens in hours with
            unprecedented accuracy."
          </blockquote>
          <div>
            <p className="font-semibold">Sarah Chen</p>
            <p className="text-muted-foreground">VP of Insights, Unilever</p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>99.9% uptime</span>
          </div>
          <div>SOC 2 Compliant</div>
          <div>GDPR Ready</div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
