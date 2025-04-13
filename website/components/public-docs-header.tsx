"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Menu, Search, X, Github, ExternalLink } from "lucide-react"

export function PublicDocsHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/api-docs" className="flex items-center gap-2 font-bold text-xl">
            <Key className="h-6 w-6" />
            <span className="hidden sm:inline-block">Authio</span>
            <span className="text-muted-foreground font-normal text-sm sm:text-base">API Docs</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/api-docs/getting-started" className="text-sm font-medium hover:underline">
            Getting Started
          </Link>
          <Link href="/api-docs/authentication" className="text-sm font-medium hover:underline">
            Authentication
          </Link>
          <Link href="/api-docs/endpoints" className="text-sm font-medium hover:underline">
            Endpoints
          </Link>
          <Link href="/api-docs/sdks" className="text-sm font-medium hover:underline">
            SDKs
          </Link>
          <Link href="/api-docs/examples" className="text-sm font-medium hover:underline">
            Examples
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <div className="hidden md:flex relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search docs..." className="pl-8 w-[200px] lg:w-[300px]" />
          </div>

          {/* Search toggle - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* GitHub Link */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/authio/docs" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
          </Button>

          {/* Login Button */}
          <Button asChild className="hidden sm:flex">
            <Link href="/login">
              Login
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="border-t p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search docs..." className="pl-8 w-full" />
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="border-t p-4 md:hidden">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                href="/api-docs/getting-started"
                className="text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Getting Started
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/authentication"
                className="text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Authentication
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/endpoints"
                className="text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Endpoints
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/sdks"
                className="text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                SDKs
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/examples"
                className="text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Examples
              </Link>
            </li>
            <li>
              <Button asChild className="w-full sm:hidden">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
