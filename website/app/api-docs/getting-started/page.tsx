import type {Metadata} from "next"
import Link from "next/link"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Button} from "@/components/ui/button"
import {CheckCircle, ChevronRight, Code, Copy, FileText, Terminal} from "lucide-react"

export const metadata: Metadata = {
    title: "Getting Started",
    description: "Learn how to get started with the Authio API",
}

export default function GettingStartedPage() {
    return (
        <div className="container px-4 py-8 md:py-12 lg:py-16 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <aside className="md:w-64 lg:w-72 shrink-0">
                    <div className="sticky top-24">
                        <div className="bg-card rounded-lg border shadow-sm p-4">
                            <h3 className="font-semibold mb-4 text-foreground">On This Page</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#introduction"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Introduction
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#authentication"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Authentication
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#installation"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Installation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#making-requests"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Making Requests
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#error-handling"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Error Handling
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#next-steps"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Next Steps
                                    </a>
                                </li>
                            </ul>

                            <h3 className="font-semibold mt-8 mb-4 text-foreground">Getting Started</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="/api-docs/getting-started"
                                        className="text-primary font-medium flex py-1 px-2 rounded bg-primary/10"
                                    >
                                        Overview
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/api-docs/authentication"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Authentication
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/api-docs/endpoints"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Endpoints
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/api-docs/sdks"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        SDKs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/api-docs/examples"
                                        className="text-muted-foreground hover:text-foreground transition-colors flex py-1 px-2 rounded hover:bg-accent"
                                    >
                                        Examples
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6" id="introduction">
                        Getting Started with Authio API
                    </h1>

                    <div className="prose prose-gray max-w-none">
                        <p className="lead text-xl text-muted-foreground mb-8">
                            Welcome to the Authio API documentation. This guide will help you get started with
                            integrating Authio into
                            your applications.
                        </p>

                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-8">
                            <h3 className="flex items-center text-lg font-medium mb-2">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                Prerequisites
                            </h3>
                            <ul className="space-y-2 mb-0">
                                <li>An Authio account (sign up at authio.com)</li>
                                <li>API key (generated from your dashboard)</li>
                                <li>Basic understanding of REST APIs</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold mt-12 mb-4" id="authentication">
                            Authentication
                        </h2>
                        <p>
                            All API requests must be authenticated using your API key. You can obtain an API key from
                            your Authio
                            dashboard.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm my-6 relative">
                            <div className="absolute right-2 top-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                            <code className="break-all">
                                curl -X GET https://api.authio.com/v1/users \<br/>
                                &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                            </code>
                        </div>

                        <h2 className="text-2xl font-bold mt-12 mb-4" id="installation">
                            Installation
                        </h2>

                        <Tabs defaultValue="npm" className="w-full my-6">
                            <TabsList>
                                <TabsTrigger value="npm">npm</TabsTrigger>
                                <TabsTrigger value="yarn">yarn</TabsTrigger>
                                <TabsTrigger value="pnpm">pnpm</TabsTrigger>
                            </TabsList>
                            <TabsContent value="npm" className="mt-2">
                                <div className="bg-gray-950 text-gray-50 rounded-lg p-4 font-mono text-sm relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                                    >
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                    <div className="flex items-start">
                                        <Terminal className="h-5 w-5 mr-2 mt-0.5 text-gray-400"/>
                                        <code>npm install @authio/sdk</code>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="yarn" className="mt-2">
                                <div className="bg-gray-950 text-gray-50 rounded-lg p-4 font-mono text-sm relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                                    >
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                    <div className="flex items-start">
                                        <Terminal className="h-5 w-5 mr-2 mt-0.5 text-gray-400"/>
                                        <code>yarn add @authio/sdk</code>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="pnpm" className="mt-2">
                                <div className="bg-gray-950 text-gray-50 rounded-lg p-4 font-mono text-sm relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                                    >
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                    <div className="flex items-start">
                                        <Terminal className="h-5 w-5 mr-2 mt-0.5 text-gray-400"/>
                                        <code>pnpm add @authio/sdk</code>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <h2 className="text-2xl font-bold mt-12 mb-4" id="making-requests">
                            Making Requests
                        </h2>
                        <p>Here's a simple example of how to use the Authio SDK to authenticate a user:</p>

                        <div className="bg-gray-950 text-gray-50 rounded-lg p-4 font-mono text-sm my-6 relative">
                            <div className="absolute right-2 top-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="flex items-start">
                                <Code className="h-5 w-5 mr-2 mt-0.5 text-gray-400"/>
                                <pre className="overflow-x-auto">
                  <code>
                    {`import { Authio } from '@authio/sdk';

// Initialize the client
const authio = new Authio({
  apiKey: 'YOUR_API_KEY',
});

// Authenticate a user
async function authenticateUser(username, password) {
  try {
    const user = await authio.users.authenticate({
      username,
      password,
    });
    
    return user;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}`}
                  </code>
                </pre>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mt-12 mb-4" id="error-handling">
                            Error Handling
                        </h2>
                        <p>
                            The Authio API uses conventional HTTP response codes to indicate the success or failure of
                            an API request.
                            Here are some common status codes you might encounter:
                        </p>

                        <ul className="list-disc pl-6 my-4 space-y-2">
                            <li>
                                <strong>200 - OK:</strong> Everything worked as expected.
                            </li>
                            <li>
                                <strong>400 - Bad Request:</strong> The request was unacceptable, often due to missing a
                                required
                                parameter.
                            </li>
                            <li>
                                <strong>401 - Unauthorized:</strong> No valid API key provided.
                            </li>
                            <li>
                                <strong>403 - Forbidden:</strong> The API key doesn't have permissions to perform the
                                request.
                            </li>
                            <li>
                                <strong>404 - Not Found:</strong> The requested resource doesn't exist.
                            </li>
                            <li>
                                <strong>429 - Too Many Requests:</strong> Too many requests hit the API too quickly.
                            </li>
                            <li>
                                <strong>500, 502, 503, 504 - Server Errors:</strong> Something went wrong on Authio's
                                end.
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-12 mb-4" id="next-steps">
                            Next Steps
                        </h2>
                        <p>Now that you understand the basics, you can explore more specific aspects of the Authio
                            API:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5"/>
                                        Authentication
                                    </CardTitle>
                                    <CardDescription>Learn about authentication methods and security</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/api-docs/authentication">
                                            View Guide
                                            <ChevronRight className="ml-2 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5"/>
                                        API Endpoints
                                    </CardTitle>
                                    <CardDescription>Explore all available API endpoints</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/api-docs/endpoints">
                                            View Endpoints
                                            <ChevronRight className="ml-2 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
