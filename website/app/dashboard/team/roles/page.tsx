import { RolesPermissionsView } from "@/components/roles-permissions-view"

export default function TeamRolesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">Manage roles and their associated permissions</p>
      </div>
      <RolesPermissionsView
        selectedOrganization={{
          id: "org_1",
          name: "Acme Inc.",
          members: 12,
          role: "admin",
        }}
      />
    </div>
  )
}
