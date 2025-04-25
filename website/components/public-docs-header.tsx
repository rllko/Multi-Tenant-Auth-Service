"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, Github, ExternalLink } from "lucide-react"

export function PublicDocsHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/api-docs" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-md bg-keyauth-blue flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 12h4" />
                <path d="M10 16h4" />
                <path d="M10 8h1" />
              </svg>
            </div>
            <span className="text-foreground">KeyAuth</span>
            <span className="text-muted-foreground font-normal text-sm sm:text-base">API Docs</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/api-docs/getting-started" className="text-foreground hover:text-keyauth-blue">
            Getting Started
          </Link>
          <Link href="/api-docs/authentication" className="text-foreground hover:text-keyauth-blue">
            Authentication
          </Link>
          <Link href="/api-docs/endpoints" className="text-foreground hover:text-keyauth-blue">
            Endpoints
          </Link>
          <Link href="/api-docs/models" className="text-foreground hover:text-keyauth-blue">
            Models
          </Link>
          <Link href="/api-docs/sdks" className="text-foreground hover:text-keyauth-blue">
            SDKs
          </Link>
          <Link href="/api-docs/examples" className="text-foreground hover:text-keyauth-blue">
            Examples
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <div className="hidden md:flex relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search docs..."
              className="pl-8 w-[200px] lg:w-[300px] bg-background text-foreground border-border"
            />
          </div>

          {/* Search toggle - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* GitHub Link */}
          <Button variant="ghost" size="icon" asChild className="text-foreground">
            <Link href="https://github.com/authio/docs" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
          </Button>

          {/* Login Button */}
          <Button asChild className="hidden sm:flex bg-keyauth-blue hover:bg-keyauth-blue/90 text-white">
            <Link href="/login">
              Login
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="border-t border-border p-4 md:hidden bg-background">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search docs..."
              className="pl-8 w-full bg-background text-foreground border-border"
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="border-t border-border p-4 md:hidden bg-background">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                href="/api-docs/getting-started"
                className="text-foreground hover:text-keyauth-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                Getting Started
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/authentication"
                className="text-foreground hover:text-keyauth-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                Authentication
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/endpoints"
                className="text-foreground hover:text-keyauth-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                Endpoints
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/models"
                className="text-foreground hover:text-keyauth-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                Models
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/sdks"
                className="text-foreground hover:text-keyauth-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                SDKs
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs/examples"
                className="text-foreground hover:text-keyauth-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                Examples
              </Link>
            </li>
            <li>
              <Button asChild className="w-full bg-keyauth-blue hover:bg-keyauth-blue/90 text-white">
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
