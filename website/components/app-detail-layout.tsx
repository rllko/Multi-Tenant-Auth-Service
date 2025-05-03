"use client"

import type React from "react"

import { useState } from "react"

interface AppDetailLayoutProps {
  children: React.ReactNode
}

export function AppDetailLayout({ children }: AppDetailLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
