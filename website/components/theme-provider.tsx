"use client"

import type React from "react"
import {ThemeProvider as NextThemesProvider} from "next-themes"

// Single source of truth for theming: next-themes drives the class on <html>.
// Re-export its hook so both import paths resolve to the same context.
export {useTheme} from "next-themes"

export function ThemeProvider({
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
