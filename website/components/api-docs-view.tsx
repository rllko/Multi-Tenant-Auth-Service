"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, ChevronRight, Key, Lock, Shield, Database, Users, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ApiDocsView() {
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard.",
      duration: 2000,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Learn how to integrate with our API</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-lg font-semibold">Introduction</h3>
                  <p>
                    The KeyAuth API provides programmatic access to manage users, applications, and license keys. This
                    documentation will help you get started with integrating our API into your applications.
                  </p>

                  <h3 className="text-lg font-semibold mt-6">Base URL</h3>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>https://api.keyauth.io/v1</span>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard("https://api.keyauth.io/v1")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">Rate Limits</h3>
                  <p>
                    The API is rate limited to 100 requests per minute per API key. If you exceed this limit, you will
                    receive a 429 Too Many Requests response.
                  </p>

                  <h3 className="text-lg font-semibold mt-6">Available Resources</h3>
                  <ul className="space-y-2 mt-2">
                    <li className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Users - Manage user accounts and permissions</span>
                    </li>
                    <li className="flex items-center">
                      <Key className="h-4 w-4 mr-2 text-green-500" />
                      <span>License Keys - Create and validate license keys</span>
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-purple-500" />
                      <span>OAuth - Manage OAuth clients and tokens</span>
                    </li>
                    <li className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Analytics - Access usage and performance data</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="authentication" className="space-y-4">
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-lg font-semibold">Authentication</h3>
                  <p>
                    All API requests require authentication using an API key. You can generate an API key in your
                    account settings.
                  </p>

                  <h3 className="text-lg font-semibold mt-6">API Key Authentication</h3>
                  <p>
                    Include your API key in the <code>Authorization</code> header of all requests:
                  </p>

                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>Authorization: Bearer YOUR_API_KEY</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">OAuth Authentication</h3>
                  <p>
                    For user-based authentication, you can use OAuth 2.0. This allows users to grant your application
                    access to their data without sharing their credentials.
                  </p>

                  <div className="bg-muted p-3 rounded-md font-mono text-sm mt-4">
                    <div className="flex items-center justify-between">
                      <span>Authorization: Bearer OAUTH_ACCESS_TOKEN</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard("Authorization: Bearer OAUTH_ACCESS_TOKEN")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="endpoints" className="space-y-4">
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-lg font-semibold">API Endpoints</h3>
                  <p>Here are the main endpoints available in the KeyAuth API:</p>

                  <div className="mt-4 space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-green-500 hover:bg-green-600 mr-2">GET</Badge>
                          <span className="font-mono text-sm">/users</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Docs
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">List all users in your tenant</p>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-blue-500 hover:bg-blue-600 mr-2">POST</Badge>
                          <span className="font-mono text-sm">/users</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Docs
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">Create a new user</p>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-green-500 hover:bg-green-600 mr-2">GET</Badge>
                          <span className="font-mono text-sm">/licenses</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Docs
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">List all license keys</p>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-blue-500 hover:bg-blue-600 mr-2">POST</Badge>
                          <span className="font-mono text-sm">/licenses</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Docs
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">Create a new license key</p>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-amber-500 hover:bg-amber-600 mr-2">PUT</Badge>
                          <span className="font-mono text-sm">/licenses/{"{id}"}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Docs
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">Update a license key</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-lg font-semibold">Code Examples</h3>
                  <p>Here are some examples of how to use the KeyAuth API in different programming languages:</p>

                  <div className="mt-4">
                    <h4 className="font-medium">JavaScript (Node.js)</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm mt-2 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';

async function getUsers() {
  try {
    const response = await axios.get('https://api.keyauth.io/v1/users', {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

getUsers();`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs overflow-x-auto">
                        {`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';

async function getUsers() {
  try {
    const response = await axios.get('https://api.keyauth.io/v1/users', {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

getUsers();`}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium">Python</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm mt-2 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(`import requests

api_key = 'YOUR_API_KEY'

def get_users():
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get('https://api.keyauth.io/v1/users', headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.status_code}')
        return None

users = get_users()
print(users)`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs overflow-x-auto">
                        {`import requests

api_key = 'YOUR_API_KEY'

def get_users():
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get('https://api.keyauth.io/v1/users', headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.status_code}')
        return None

users = get_users()
print(users)`}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Your API keys for authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Production Key</h3>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Input
                    type="password"
                    value="sk_live_••••••••••••••••••••••••••••••"
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Development Key</h3>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Input
                    type="password"
                    value="sk_test_••••••••••••••••••••••••••••••"
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Manage API Keys
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Helpful resources for developers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <h3 className="font-medium">API Reference</h3>
                      <p className="text-sm text-muted-foreground">Complete API documentation</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <h3 className="font-medium">Authentication Guide</h3>
                      <p className="text-sm text-muted-foreground">Learn about authentication methods</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <h3 className="font-medium">SDK Documentation</h3>
                      <p className="text-sm text-muted-foreground">Client libraries for various languages</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
