import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TeamProvider } from "@/contexts/team-context"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TeamProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </TeamProvider>
  )
}
