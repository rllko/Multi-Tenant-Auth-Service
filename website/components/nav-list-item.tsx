import type React from "react"
import Link from "next/link"

export function NavListItem({href, active = false, children}: {
    href: string
    active?: boolean
    children: React.ReactNode
}) {
    return (
        <li>
            <Link
                href={href}
                className={
                    active
                        ? "text-primary font-medium flex py-1 px-2 rounded bg-primary/10"
                        : "text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                }
            >
                {children}
            </Link>
        </li>
    )
}
