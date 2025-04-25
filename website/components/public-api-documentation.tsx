"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Copy, ChevronRight, ExternalLink, FileText, Key, Shield, User, Globe } from "lucide-react"
import { permissionGroups } from "./permissions-manager"

export function PublicApiDocumentation() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(permissionGroups[0].id)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Filter endpoints based on search query
  const filterEndpoints = (endpoints) => {
    if (!searchQuery) return endpoints
    return endpoints.filter((endpoint) => endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  // Get icon for category
  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case "license":
        return <Key className="h-5 w-5" />
      case "user":
        return <User className="h-5 w-5" />
      case "global":
        return <Globe className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  return (
    <div className="container px-4 py-8 md:py-12 lg:py-16 mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">KeyAuth API Documentation</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          Complete reference documentation for the KeyAuth API. Learn how to authenticate, manage users, handle
          licenses, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-keyauth-blue hover:bg-keyauth-blue/90 text-white" asChild>
            <Link href="/api-docs/getting-started">
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted" asChild>
            <Link href="/login">
              Dashboard Access
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search API endpoints..."
          className="pl-10 py-6 text-lg bg-background text-foreground border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* API Reference */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">API Reference</h2>
        </div>

        <Tabs
          defaultValue={permissionGroups[0].id}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-8"
        >
          <div className="overflow-x-auto pb-3">
            <TabsList className="inline-flex w-auto bg-muted">
              {permissionGroups.map((group) => (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(group.id)}
                    <span>{group.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {permissionGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(group.id)}
                    <div>
                      <CardTitle className="text-foreground">{group.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        API endpoints for {group.name.toLowerCase()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {filterEndpoints(group.permissions).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No endpoints found matching your search.
                      </div>
                    ) : (
                      filterEndpoints(group.permissions).map((endpoint) => (
                        <div key={endpoint.id} className="border-b border-border pb-8 last:border-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-medium mb-2 flex items-center gap-2 text-foreground">
                                {endpoint.name}
                                <Badge variant="outline" className="ml-2 border-border text-foreground">
                                  {endpoint.id.split(".")[1]}
                                </Badge>
                              </h3>
                              <p className="text-muted-foreground">{endpoint.description || endpoint.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-keyauth-blue text-white">GET</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-border text-foreground hover:bg-muted"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Docs
                              </Button>
                            </div>
                          </div>

                          <div className="bg-muted rounded-lg p-4 font-mono text-sm relative">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                              <Badge variant="outline" className="border-border text-foreground">
                                Endpoint
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <code className="break-all text-foreground">
                                GET /api/v1/{endpoint.id.replace(".", "/")}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-foreground hover:bg-muted"
                                onClick={() =>
                                  navigator.clipboard.writeText(`GET /api/v1/${endpoint.id.replace(".", "/")}`)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Permission</h4>
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                                {endpoint.id}
                              </code>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Scope</h4>
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                                {endpoint.id.split(".")[0]}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="mt-16 bg-keyauth-blue text-white rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Sign up for KeyAuth today and start building secure authentication into your applications.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-white hover:bg-white/10 text-white"
            asChild
          >
            <Link href="/contact-sales">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
