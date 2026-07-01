"use client"

import {useState} from "react"
import Link from "next/link"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {ChevronRight, Lock, Search} from "lucide-react"

interface Endpoint {
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
    path: string
    name: string
    description: string
    scope?: string
    requestBody?: string
    responseBody?: string
}

interface EndpointGroup {
    id: string
    name: string
    description: string
    endpoints: Endpoint[]
}

const endpointGroups: EndpointGroup[] = [
    {
        id: "auth",
        name: "Authentication",
        description: "Register, log in, and manage sessions for dashboard users (tenants).",
        endpoints: [
            {
                method: "POST",
                path: "/auth/tenant/register",
                name: "Register",
                description: "Create a new tenant account.",
                requestBody: `{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "your-password"
}`,
                responseBody: `200 OK`,
            },
            {
                method: "POST",
                path: "/auth/tenant/login",
                name: "Login",
                description: "Authenticate with email and password. Returns a bearer token used for all authenticated requests.",
                requestBody: `{
  "email": "user@example.com",
  "password": "your-password"
}`,
                responseBody: `{
  "token": "<jwt>",
  "expires_in": "3600",
  "token_type": "Bearer",
  "user": { "id": "...", "name": "...", "email": "...", "role": "" }
}`,
            },
            {
                method: "POST",
                path: "/auth/tenant/refresh",
                name: "Refresh session",
                description: "Refresh an existing session using the refresh token claim.",
            },
            {
                method: "DELETE",
                path: "/auth/tenant/",
                name: "Logout",
                description: "Invalidate the current session.",
            },
            {
                method: "POST",
                path: "/me",
                name: "Get profile",
                description: "Return the profile of the currently authenticated tenant.",
                responseBody: `{
  "id": "...",
  "discordId": null,
  "email": "user@example.com",
  "role": "",
  "name": "Jane Doe"
}`,
            },
        ],
    },
    {
        id: "teams",
        name: "Teams",
        description: "Create teams and list the teams you belong to.",
        endpoints: [
            {
                method: "GET",
                path: "/teams",
                name: "List teams",
                description: "List all teams the authenticated tenant belongs to.",
            },
            {
                method: "POST",
                path: "/teams",
                name: "Create team",
                description: "Create a new team owned by the authenticated tenant.",
                requestBody: `{
  "name": "My Team"
}`,
            },
        ],
    },
    {
        id: "members",
        name: "Members & Invites",
        description: "Manage team membership and invitations.",
        endpoints: [
            {
                method: "GET",
                path: "/teams/{teamId}/members",
                name: "List members",
                description: "List all tenants in a team.",
                scope: "team.fetch_team_members",
            },
            {
                method: "GET",
                path: "/teams/{teamId}/members/{memberId}",
                name: "Get member",
                description: "Get a single team member.",
                scope: "team.fetch_team_members",
            },
            {
                method: "POST",
                path: "/teams/{teamId}/members",
                name: "Invite member",
                description: "Send a team invitation to a tenant by email.",
                scope: "team.invite",
                requestBody: `{
  "email": "colleague@example.com",
  "inviteMessage": "Join our team!"
}`,
            },
            {
                method: "PATCH",
                path: "/teams/{teamId}/members/{memberId}",
                name: "Update member role",
                description: "Change the role assigned to a team member.",
                scope: "team.update_roles",
                requestBody: `{
  "roleId": 2
}`,
            },
            {
                method: "DELETE",
                path: "/teams/{teamId}/members/{memberId}",
                name: "Remove member",
                description: "Remove a tenant from the team.",
                scope: "team.kick",
            },
            {
                method: "GET",
                path: "/teams/invites/received",
                name: "Received invites",
                description: "List invitations received by the authenticated tenant.",
            },
            {
                method: "GET",
                path: "/teams/invites/sent",
                name: "Sent invites",
                description: "List invitations sent by the authenticated tenant.",
                scope: "global.invite_management",
            },
            {
                method: "GET",
                path: "/teams/invites/pending",
                name: "Pending invites",
                description: "List pending invitations for the authenticated tenant.",
            },
            {
                method: "POST",
                path: "/teams/invites/{inviteToken}/accept",
                name: "Accept invite",
                description: "Accept a team invitation using its token.",
            },
            {
                method: "POST",
                path: "/teams/invites/{inviteToken}/decline",
                name: "Decline invite",
                description: "Decline a team invitation using its token.",
            },
        ],
    },
    {
        id: "roles",
        name: "Roles & Permissions",
        description: "Manage roles and the permission scopes assigned to them.",
        endpoints: [
            {
                method: "GET",
                path: "/teams/{teamId}/roles",
                name: "List roles",
                description: "List the roles defined for a team.",
                scope: "team.fetch_team_roles",
            },
            {
                method: "POST",
                path: "/teams/{teamId}/roles",
                name: "Create role",
                description: "Create a new team role. The slug is derived from the name when omitted.",
                scope: "team.create_roles",
                requestBody: `{
  "name": "Support",
  "description": "Read-only support staff"
}`,
            },
            {
                method: "PATCH",
                path: "/teams/{teamId}/roles/{roleId}",
                name: "Update role",
                description: "Update the attributes of a role.",
                scope: "team.update_roles",
            },
            {
                method: "PATCH",
                path: "/teams/{teamId}/roles/{roleId}/permissions",
                name: "Update role permissions",
                description: "Replace the permission scopes assigned to a role. The server computes the difference and applies it.",
                scope: "team.update_roles",
                requestBody: `{
  "scopes": [1, 4, 7]
}`,
            },
            {
                method: "GET",
                path: "/teams/{teamId}/permissions",
                name: "List team permissions",
                description: "List all permission scopes available to a team.",
                scope: "team.fetch_team_roles",
            },
        ],
    },
    {
        id: "applications",
        name: "Applications",
        description: "Manage applications, their OAuth clients, and their licenses.",
        endpoints: [
            {
                method: "GET",
                path: "/teams/{teamId}/apps",
                name: "List applications",
                description: "List the applications owned by a team.",
                scope: "application.retrieve",
            },
            {
                method: "GET",
                path: "/teams/{teamId}/apps/{appId}",
                name: "Get application",
                description: "Get a single application by id.",
                scope: "application.retrieve",
            },
            {
                method: "GET",
                path: "/teams/{teamId}/apps/{appId}/permissions",
                name: "List application permissions",
                description: "List the permission scopes available to an application.",
                scope: "application.retrieve",
            },
            {
                method: "GET",
                path: "/teams/{teamId}/apps/{appId}/licenses",
                name: "List licenses",
                description: "List the licenses issued for an application.",
                scope: "license.retrieve_info",
            },
            {
                method: "GET",
                path: "/teams/{teamId}/apps/{appId}/oauth/clients",
                name: "List OAuth clients",
                description: "List the OAuth clients registered for an application.",
                scope: "application.retrieve",
            },
            {
                method: "POST",
                path: "/teams/{teamId}/apps/{appId}/oauth/clients",
                name: "Create OAuth client",
                description: "Register a new OAuth client for an application.",
                scope: "application.create",
            },
        ],
    },
]

const methodColors: Record<Endpoint["method"], string> = {
    GET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    POST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    PATCH: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    PUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function PublicApiDocumentation() {
    const [searchQuery, setSearchQuery] = useState("")

    const filterEndpoints = (endpoints: Endpoint[]) => {
        if (!searchQuery) return endpoints
        const query = searchQuery.toLowerCase()
        return endpoints.filter(
            (endpoint) =>
                endpoint.name.toLowerCase().includes(query) ||
                endpoint.path.toLowerCase().includes(query) ||
                endpoint.description.toLowerCase().includes(query),
        )
    }

    return (
        <div className="container px-4 py-8 md:py-12 mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">API Reference</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Complete reference for the Authio REST API. All authenticated endpoints expect a{" "}
                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code>{" "}
                    header obtained from the login endpoint.
                </p>
                <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/api-docs/getting-started">
                            Getting Started
                            <ChevronRight className="ml-1 h-4 w-4"/>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/api-docs/models">
                            Data Models
                            <ChevronRight className="ml-1 h-4 w-4"/>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="relative w-full max-w-md mb-6">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    type="search"
                    placeholder="Search endpoints..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Tabs defaultValue={endpointGroups[0].id} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-5 mb-6 h-auto">
                    {endpointGroups.map((group) => (
                        <TabsTrigger key={group.id} value={group.id} className="text-xs sm:text-sm">
                            {group.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {endpointGroups.map((group) => (
                    <TabsContent key={group.id} value={group.id} className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">{group.name}</h2>
                            <p className="text-muted-foreground">{group.description}</p>
                        </div>

                        {filterEndpoints(group.endpoints).length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No endpoints match your search.
                                </CardContent>
                            </Card>
                        ) : (
                            filterEndpoints(group.endpoints).map((endpoint) => (
                                <Card key={`${endpoint.method}-${endpoint.path}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={methodColors[endpoint.method]}>{endpoint.method}</Badge>
                                            <code className="text-sm font-mono">{endpoint.path}</code>
                                            {endpoint.scope && (
                                                <Badge variant="outline" className="ml-auto gap-1">
                                                    <Lock className="h-3 w-3"/>
                                                    {endpoint.scope}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-base mt-1">{endpoint.name}</CardTitle>
                                        <CardDescription>{endpoint.description}</CardDescription>
                                    </CardHeader>
                                    {(endpoint.requestBody || endpoint.responseBody) && (
                                        <CardContent className="grid gap-4 md:grid-cols-2">
                                            {endpoint.requestBody && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Request
                                                        body</p>
                                                    <pre
                                                        className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{endpoint.requestBody}</code></pre>
                                                </div>
                                            )}
                                            {endpoint.responseBody && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                                                    <pre
                                                        className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{endpoint.responseBody}</code></pre>
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            ))
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
