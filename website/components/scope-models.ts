export type ScopeImpactLevel = "Critical Impact" | "High Impact" | "Medium Impact" | "Low Impact"

export interface ScopeCategory {
    id: string
    name: string
    description: string
    icon?: string
}

export interface Scope {
    id: string
    name: string
    description: string
    category: string
    impact: ScopeImpactLevel
    permissions: string[]
    isCustom?: boolean
}

export interface Role {
    id: string
    name: string
    description: string
    scopes: string[]
    isDefault?: boolean
    isCustom?: boolean
}

export const scopeCategories: ScopeCategory[] = [
    {
        id: "user",
        name: "User Management",
        description: "Access to user data and operations",
        icon: "user",
    },
    {
        id: "license",
        name: "License Management",
        description: "Access to license data and operations",
        icon: "key",
    },
    {
        id: "session",
        name: "Session Management",
        description: "Access to session data and operations",
        icon: "activity",
    },
    {
        id: "subscription",
        name: "Subscription Management",
        description: "Access to subscription data and operations",
        icon: "credit-card",
    },
    {
        id: "log",
        name: "Log Management",
        description: "Access to log data and operations",
        icon: "file-text",
    },
    {
        id: "global",
        name: "Global Operations",
        description: "Access to global system operations",
        icon: "globe",
    },
]

export const predefinedScopes: Scope[] = [
    {
        id: "user.read",
        name: "Read User Data",
        description: "View user information including profiles, usernames, and variables",
        category: "user",
        impact: "low",
        permissions: [
            "user.retrieve_all",
            "user.retrieve_all_variables",
            "user.retrieve_all_usernames",
            "user.retrieve_data",
            "user.retrieve_variable",
            "user.verify_exists",
        ],
    },
    {
        id: "user.write",
        name: "Modify User Data",
        description: "Create, update, and delete user accounts and their data",
        category: "user",
        impact: "high",
        permissions: [
            "user.create",
            "user.change_password",
            "user.change_email",
            "user.change_username",
            "user.set_variable",
            "user.extend_expiration",
            "user.subtract_time",
        ],
    },
    {
        id: "user.delete",
        name: "Delete User Data",
        description: "Delete user accounts and their associated data",
        category: "user",
        impact: "critical",
        permissions: [
            "user.delete",
            "user.delete_all",
            "user.delete_all_expired",
            "user.delete_variable",
            "user.delete_all_variables",
            "user.delete_subscription",
        ],
    },
    {
        id: "user.admin",
        name: "User Administration",
        description: "Administrative actions on user accounts",
        category: "user",
        impact: "high",
        permissions: [
            "user.ban",
            "user.unban",
            "user.pause",
            "user.unpause",
            "user.add_hwid",
            "user.reset_hwid",
            "user.reset_all_hwid",
            "user.set_hwid_cooldown",
        ],
    },
    {
        id: "license.read",
        name: "Read License Data",
        description: "View license information",
        category: "license",
        impact: "low",
        permissions: ["license.retrieve_all", "license.retrieve_info", "license.verify_exists"],
    },
    {
        id: "license.write",
        name: "Modify License Data",
        description: "Create and modify license keys",
        category: "license",
        impact: "high",
        permissions: ["license.create", "license.assign_to_user", "license.set_note", "license.add_time_all_unused"],
    },
    {
        id: "license.delete",
        name: "Delete License Data",
        description: "Delete license keys",
        category: "license",
        impact: "critical",
        permissions: [
            "license.delete",
            "license.delete_all",
            "license.delete_multiple",
            "license.delete_all_used",
            "license.delete_all_unused",
        ],
    },
    {
        id: "license.admin",
        name: "License Administration",
        description: "Administrative actions on licenses",
        category: "license",
        impact: "high",
        permissions: ["license.ban", "license.unban", "license.create_user"],
    },
    {
        id: "session.read",
        name: "Read Session Data",
        description: "View session information",
        category: "session",
        impact: "low",
        permissions: ["session.retrieve_all", "session.check"],
    },
    {
        id: "session.write",
        name: "Manage Sessions",
        description: "End user sessions",
        category: "session",
        impact: "medium",
        permissions: ["session.end", "session.end_all"],
    },
    {
        id: "subscription.read",
        name: "Read Subscription Data",
        description: "View subscription information",
        category: "subscription",
        impact: "low",
        permissions: ["subscription.retrieve_all"],
    },
    {
        id: "subscription.write",
        name: "Manage Subscriptions",
        description: "Create and modify subscriptions",
        category: "subscription",
        impact: "high",
        permissions: ["subscription.create", "subscription.edit", "subscription.pause", "subscription.unpause"],
    },
    {
        id: "subscription.delete",
        name: "Delete Subscriptions",
        description: "Delete subscription data",
        category: "subscription",
        impact: "critical",
        permissions: ["subscription.delete"],
    },
    {
        id: "log.read",
        name: "Read Logs",
        description: "View system logs",
        category: "log",
        impact: "low",
        permissions: ["log.retrieve_all"],
    },
    {
        id: "log.write",
        name: "Manage Logs",
        description: "Create and delete logs",
        category: "log",
        impact: "medium",
        permissions: ["log.create", "log.delete_all"],
    },
    {
        id: "global.read",
        name: "Global Read Access",
        description: "Read global system data",
        category: "global",
        impact: "low",
        permissions: ["global.check_blacklist", "global.fetch_online_users", "global.retrieve_variable"],
    },
    {
        id: "global.write",
        name: "Global Write Access",
        description: "Modify global system settings",
        category: "global",
        impact: "high",
        permissions: ["global.disable_2fa", "global.enable_2fa", "global.webhook"],
    },
    {
        id: "global.download",
        name: "File Download",
        description: "Download files from the system",
        category: "global",
        impact: "medium",
        permissions: ["global.download_file"],
    },
]

export const predefinedRoles: Role[] = [
    {
        id: "admin",
        name: "Administrator",
        description: "Full access to all system features",
        scopes: predefinedScopes.map((scope) => scope.id),
        isDefault: true,
    },
    {
        id: "license_manager",
        name: "License Manager",
        description: "Manage licenses and users",
        scopes: ["license.read", "license.write", "license.admin", "user.read", "user.write"],
        isDefault: true,
    },
    {
        id: "support",
        name: "Support Agent",
        description: "Help users with basic issues",
        scopes: ["user.read", "license.read", "session.read", "log.read"],
        isDefault: true,
    },
    {
        id: "readonly",
        name: "Read Only",
        description: "View data without making changes",
        scopes: ["user.read", "license.read", "session.read", "subscription.read", "log.read", "global.read"],
        isDefault: true,
    },
    {
        id: "bot_basic",
        name: "Basic Bot",
        description: "Basic functionality for Discord bots",
        scopes: ["user.read", "license.read", "license.write"],
        isDefault: true,
    },
]

export function getImpactLevelColor(level: ScopeImpactLevel): string {
    switch (level) {
        case "Low Impact":
            return "bg-green-100 text-green-800 border-green-200"
        case "Medium Impact":
            return "bg-blue-100 text-blue-800 border-blue-200"
        case "High Impact":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "Critical Impact":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}

export function getImpactLevelDescription(level: ScopeImpactLevel): string {
    switch (level) {
        case "Low Impact":
            return "Minimal risk, read-only access to non-sensitive data"
        case "Medium Impact":
            return "Moderate risk, may modify some data but with limited impact"
        case "High Impact":
            return "Significant risk, can make important changes to system data"
        case "Critical Impact":
            return "Highest risk, can delete data or perform irreversible actions"
        default:
            return ""
    }
}
