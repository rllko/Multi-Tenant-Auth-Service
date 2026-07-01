"use client"

import Link from "next/link"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {ArrowRight, BookOpen, Boxes, Rocket} from "lucide-react"
import {PublicApiDocumentation} from "@/components/public-api-documentation"

export function ApiDocsView() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <Rocket className="h-8 w-8 text-primary mb-2"/>
                        <CardTitle className="text-base">Getting Started</CardTitle>
                        <CardDescription>Authenticate and make your first request</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/api-docs/getting-started">
                                Read guide
                                <ArrowRight className="ml-2 h-3.5 w-3.5"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <BookOpen className="h-8 w-8 text-primary mb-2"/>
                        <CardTitle className="text-base">API Reference</CardTitle>
                        <CardDescription>Every endpoint, scope, and payload</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/api-docs">
                                Open reference
                                <ArrowRight className="ml-2 h-3.5 w-3.5"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Boxes className="h-8 w-8 text-primary mb-2"/>
                        <CardTitle className="text-base">Data Models</CardTitle>
                        <CardDescription>The objects the API returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/api-docs/models">
                                View models
                                <ArrowRight className="ml-2 h-3.5 w-3.5"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <PublicApiDocumentation/>
        </div>
    )
}
