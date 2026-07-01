"use client"

import {useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {Button} from "@/components/ui/button"
import {KeyRound, Menu, X} from "lucide-react"
import {cn} from "@/lib/utils"

const navLinks = [
    {href: "/api-docs", label: "API Reference"},
    {href: "/api-docs/getting-started", label: "Getting Started"},
    {href: "/api-docs/models", label: "Models"},
]

export function PublicDocsHeader() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <KeyRound className="h-5 w-5 text-primary"/>
                        <span>Authio</span>
                        <span className="hidden sm:inline text-muted-foreground font-normal text-sm">Docs</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-3 py-2 text-sm rounded-md transition-colors",
                                    pathname === link.href
                                        ? "text-foreground font-medium bg-accent"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Log in</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/register">Sign up</Link>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
                </Button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "block px-3 py-2 text-sm rounded-md",
                                pathname === link.href
                                    ? "text-foreground font-medium bg-accent"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex gap-2 pt-2 border-t mt-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button size="sm" className="flex-1" asChild>
                            <Link href="/register">Sign up</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    )
}
