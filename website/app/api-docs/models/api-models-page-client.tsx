"use client"

import {useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Search} from "lucide-react"

interface ModelField {
    name: string
    type: string
    description: string
    nullable?: boolean
}

interface Model {
    name: string
    description: string
    fields: ModelField[]
}

const models: Model[] = [
    {
        name: "Tenant",
        description: "A dashboard user account. Returned by POST /me and team member endpoints.",
        fields: [
            {name: "id", type: "uuid", description: "Unique tenant identifier."},
            {name: "discordId", type: "string", description: "Linked Discord account id.", nullable: true},
            {name: "email", type: "string", description: "Email address used to log in."},
            {name: "name", type: "string", description: "Display name."},
            {name: "role", type: "string", description: "Role of the tenant in the current context."},
        ],
    },
    {
        name: "Team",
        description: "A group of tenants that share applications, roles, and licenses.",
        fields: [
            {name: "id", type: "uuid", description: "Unique team identifier."},
            {name: "name", type: "string", description: "Team display name."},
            {name: "createdBy", type: "uuid", description: "Tenant that created the team.", nullable: true},
            {name: "createdAt", type: "datetime", description: "Creation timestamp (UTC)."},
        ],
    },
    {
        name: "Role",
        description: "A named set of permission scopes that can be assigned to team members.",
        fields: [
            {name: "roleId", type: "int", description: "Unique role identifier."},
            {name: "roleName", type: "string", description: "Role display name."},
            {name: "description", type: "string", description: "What the role is for."},
            {name: "createdBy", type: "uuid", description: "Team that created the role. Null for system roles.", nullable: true},
            {name: "scopes", type: "int[]", description: "Ids of the permission scopes assigned to the role."},
        ],
    },
    {
        name: "Scope (Permission)",
        description: "A single permission that can be granted through a role.",
        fields: [
            {name: "id", type: "int", description: "Unique scope identifier."},
            {name: "name", type: "string", description: "Machine name, e.g. team.invite."},
            {name: "description", type: "string", description: "Human-readable explanation."},
            {name: "createdBy", type: "uuid", description: "Creator. Null for system scopes.", nullable: true},
            {name: "impact", type: "string", description: "Impact level of granting this scope."},
            {name: "resource", type: "string", description: "Resource category the scope belongs to."},
        ],
    },
    {
        name: "Application",
        description: "An application owned by a team that issues licenses and OAuth clients.",
        fields: [
            {name: "id", type: "uuid", description: "Unique application identifier."},
            {name: "name", type: "string", description: "Application display name."},
            {name: "description", type: "string", description: "Optional description.", nullable: true},
            {name: "role", type: "ApplicationRole[]", description: "Roles defined at the application level."},
        ],
    },
    {
        name: "License",
        description: "A license key issued for an application.",
        fields: [
            {name: "id", type: "long", description: "Unique license identifier."},
            {name: "value", type: "string", description: "The license key string."},
            {name: "creationDate", type: "unix timestamp", description: "When the license was created."},
            {name: "activated", type: "bool", description: "Whether the license has been activated."},
            {name: "paused", type: "bool", description: "Whether the license is currently paused."},
            {name: "expirationDate", type: "unix timestamp", description: "When the license expires."},
            {name: "email", type: "string", description: "Email bound to the license.", nullable: true},
            {name: "discord", type: "long", description: "Discord account bound to the license.", nullable: true},
        ],
    },
    {
        name: "TeamInvite",
        description: "An invitation for a tenant to join a team.",
        fields: [
            {name: "inviteToken", type: "string", description: "Token used to accept or decline the invite."},
            {name: "createdBy", type: "string", description: "Name of the tenant that sent the invite."},
            {name: "createdByEmail", type: "string", description: "Email of the tenant that sent the invite."},
            {name: "teamName", type: "string", description: "Name of the team the invite is for."},
            {name: "status", type: "string", description: "pending, accepted, declined, expired, or revoked."},
            {name: "createdAt", type: "datetime", description: "When the invite was sent."},
            {name: "expiresAt", type: "datetime", description: "When the invite expires."},
        ],
    },
    {
        name: "OAuthClient",
        description: "An OAuth client registered under an application.",
        fields: [
            {name: "clientId", type: "int", description: "Unique client identifier."},
            {name: "clientIdentifier", type: "string", description: "Public client identifier.", nullable: true},
            {name: "clientSecret", type: "string", description: "Client secret.", nullable: true},
            {name: "grantType", type: "string", description: "OAuth grant type of the client.", nullable: true},
            {name: "role", type: "int", description: "Application role assigned to the client.", nullable: true},
            {name: "team", type: "uuid", description: "Owning team.", nullable: true},
            {name: "clientUri", type: "string", description: "Redirect/base URI of the client.", nullable: true},
        ],
    },
]

export function ApiModelsPageClient() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredModels = models.filter((model) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            model.name.toLowerCase().includes(query) ||
            model.description.toLowerCase().includes(query) ||
            model.fields.some((field) => field.name.toLowerCase().includes(query))
        )
    })

    return (
        <div className="container px-4 py-8 md:py-12 mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Data Models</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    The objects returned by the Authio API and the fields they contain.
                </p>
            </div>

            <div className="relative w-full max-w-md mb-8">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    type="search"
                    placeholder="Search models and fields..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                {filteredModels.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No models match your search.
                        </CardContent>
                    </Card>
                ) : (
                    filteredModels.map((model) => (
                        <Card key={model.name} id={model.name.toLowerCase()}>
                            <CardHeader>
                                <CardTitle className="font-mono text-lg">{model.name}</CardTitle>
                                <CardDescription>{model.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Field</th>
                                            <th className="text-left p-3 font-medium">Type</th>
                                            <th className="text-left p-3 font-medium">Description</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                        {model.fields.map((field) => (
                                            <tr key={field.name}>
                                                <td className="p-3 font-mono text-xs">{field.name}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="outline"
                                                               className="font-mono text-xs">{field.type}</Badge>
                                                        {field.nullable && (
                                                            <Badge variant="secondary"
                                                                   className="text-xs">nullable</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-muted-foreground">{field.description}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
