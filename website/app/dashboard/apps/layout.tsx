"use client"

import type React from "react"

import { SidebarNavigation } from "@/components/sidebar-navigation"
import { useState } from "react"

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-full">
      <SidebarNavigation isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
