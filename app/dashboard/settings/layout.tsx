import type { ReactNode } from "react"
import { SettingsSidebar } from "@/components/settings/settings-sidebar"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex">
      <SettingsSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
