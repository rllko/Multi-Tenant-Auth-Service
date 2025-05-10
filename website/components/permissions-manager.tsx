"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const permissionGroups = [
  {
    id: "license",
    name: "License Management",
    permissions: [
      { id: "license.add_time_all_unused", name: "Add Time To All Unused Licenses" },
      { id: "license.assign_to_user", name: "Assign A License To A User" },
      { id: "license.ban", name: "Ban License" },
      { id: "license.create", name: "Create A New License" },
      { id: "license.create_user", name: "Create A New User Using A License" },
      { id: "license.delete_all", name: "Delete All Licenses" },
      { id: "license.delete", name: "Delete An Existing License" },
      { id: "license.delete_multiple", name: "Delete Multiple Licenses" },
      { id: "license.delete_all_used", name: "Delete All Used Licenses" },
      { id: "license.delete_all_unused", name: "Delete All Unused Licenses" },
      { id: "license.retrieve_all", name: "Retrieve All Licenses" },
      { id: "license.retrieve_info", name: "Retrieve License Information" },
      { id: "license.set_note", name: "Set Note On Existing License" },
      { id: "license.unban", name: "Unban A License" },
      { id: "license.verify_exists", name: "Verify License Exists" },
    ],
  },
  {
    id: "user",
    name: "User Management",
    permissions: [
      { id: "user.add_hwid", name: "Add An HWID To An Existing User" },
      { id: "user.ban", name: "Ban User" },
      { id: "user.create", name: "Create A New User" },
      { id: "user.change_password", name: "Change Users Password" },
      { id: "user.change_email", name: "Change Users Email" },
      { id: "user.change_username", name: "Change User's Username" },
      { id: "user.delete", name: "Delete An Existing User" },
      { id: "user.delete_all_expired", name: "Delete All Expired Users" },
      { id: "user.delete_variable", name: "Delete A Users Variable" },
      { id: "user.delete_all_variables", name: "Delete All User Variables Using The Variable Name" },
      { id: "user.delete_subscription", name: "Delete A Users Subscription" },
      { id: "user.delete_all", name: "Delete All Users" },
      { id: "user.extend_expiration", name: "Extend Users Expiration" },
      { id: "user.pause", name: "Pause A User" },
      { id: "user.retrieve_all", name: "Retrieve All Users" },
      { id: "user.retrieve_all_variables", name: "Retrieve All User's Variables" },
      { id: "user.retrieve_all_usernames", name: "Retrieve All Usernames" },
      { id: "user.retrieve_all_subscriptions", name: "Retrieve All Users Subscriptions" },
      { id: "user.retrieve_license", name: "Retrieve License From User" },
      { id: "user.retrieve_variable", name: "Retrieve User Variable Data" },
      { id: "user.reset_hwid", name: "Reset A Users HWID" },
      { id: "user.reset_all_hwid", name: "Reset All Users HWID" },
      { id: "user.retrieve_data", name: "Retrieve User Data" },
      { id: "user.set_variable", name: "Set A User Variable" },
      { id: "user.subtract_time", name: "Subtract Time From A Users Expiration" },
      { id: "user.set_hwid_cooldown", name: "Set Users HWID Reset Cooldown Duration" },
      { id: "user.unban", name: "Unban A User" },
      { id: "user.unpause", name: "Unpause A User" },
      { id: "user.verify_exists", name: "Verify A User Exists" },
    ],
  },
  {
    id: "session",
    name: "Session Management",
    permissions: [
      { id: "session.end", name: "End Selected Session" },
      { id: "session.end_all", name: "End All Sessions" },
      { id: "session.retrieve_all", name: "Retrieve All Sessions" },
      { id: "session.check", name: "Check Session" },
    ],
  },
  {
    id: "subscription",
    name: "Subscription Management",
    permissions: [
      { id: "subscription.create", name: "Create A New Subscription" },
      { id: "subscription.delete", name: "Delete An Existing Subscription" },
      { id: "subscription.edit", name: "Edit An Existing Subscription" },
      { id: "subscription.retrieve_all", name: "Retrieve All Subscriptions" },
      { id: "subscription.pause", name: "Pause An Existing Subscription" },
      { id: "subscription.unpause", name: "Unpause An Existing Subscription" },
    ],
  },
  {
    id: "log",
    name: "Log Management",
    permissions: [
      { id: "log.retrieve_all", name: "Retrieve All Logs" },
      { id: "log.delete_all", name: "Delete All Logs" },
      { id: "log.create", name: "Log" },
    ],
  },
  {
    id: "global",
    name: "Global Operations",
    permissions: [
      { id: "global.check_blacklist", name: "Check Blacklist" },
      { id: "global.disable_2fa", name: "Disable 2FA" },
      { id: "global.enable_2fa", name: "Enable 2FA" },
      { id: "global.fetch_online_users", name: "Fetch Online Users" },
      { id: "global.forgot_password", name: "Forgot Password" },
      { id: "global.webhook", name: "Webhook" },
      { id: "global.retrieve_variable", name: "Retrieve Global Variable" },
      { id: "global.download_file", name: "Download File" },
    ],
  },
]

export function PermissionsManager({ selectedEntity = null, onSave = () => {}, selectedOrganization = null }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const filterPermissions = (permissions) => {
    if (!searchQuery) return permissions
    return permissions.filter((permission) => permission.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((current) => {
      if (current.includes(permissionId)) {
        return current.filter((id) => id !== permissionId)
      } else {
        return [...current, permissionId]
      }
    })
  }

  const handleSelectAllInGroup = (groupId: string, isSelected: boolean) => {
    const group = permissionGroups.find((g) => g.id === groupId)
    if (!group) return

    if (isSelected) {
      const permissionIds = group.permissions.map((p) => p.id)
      setSelectedPermissions((current) => [...new Set([...current, ...permissionIds])])
    } else {
      setSelectedPermissions((current) => current.filter((id) => !group.permissions.some((p) => p.id === id)))
    }
  }

  const isGroupSelected = (groupId: string) => {
    const group = permissionGroups.find((g) => g.id === groupId)
    if (!group) return false
    return group.permissions.every((p) => selectedPermissions.includes(p.id))
  }

  const isGroupIndeterminate = (groupId: string) => {
    const group = permissionGroups.find((g) => g.id === groupId)
    if (!group) return false
    const selectedCount = group.permissions.filter((p) => selectedPermissions.includes(p.id)).length
    return selectedCount > 0 && selectedCount < group.permissions.length
  }

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allPermissionIds = permissionGroups.flatMap((group) => group.permissions.map((p) => p.id))
      setSelectedPermissions(allPermissionIds)
    } else {
      setSelectedPermissions([])
    }
  }

  const areAllSelected = permissionGroups.every((group) => isGroupSelected(group.id))
  const areSomeSelected = selectedPermissions.length > 0 && !areAllSelected

  return (
    <Card className="shadow-sm border-border bg-white">
      <CardHeader className="flex flex-row items-center border-b">
        <div className="space-y-1.5">
          <CardTitle>API Permissions</CardTitle>
          <CardDescription>
            {selectedEntity
              ? `Configure API permissions for ${selectedEntity.name}`
              : selectedOrganization
                ? `Configure API permissions for ${selectedOrganization.name}`
                : "Configure API permissions for applications and roles"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search permissions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={areAllSelected}
              onCheckedChange={handleSelectAll}
              {...(areSomeSelected ? { indeterminate: true } : {})}
            />
            <Label htmlFor="select-all" className="font-medium">
              Select All
            </Label>
          </div>
        </div>

        <Tabs defaultValue={permissionGroups[0].id} className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7 mb-4">
            {permissionGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id} className="text-xs">
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {permissionGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id={`select-all-${group.id}`}
                  checked={isGroupSelected(group.id)}
                  onCheckedChange={(checked) => handleSelectAllInGroup(group.id, !!checked)}
                  {...(isGroupIndeterminate(group.id) ? { indeterminate: true } : {})}
                />
                <Label htmlFor={`select-all-${group.id}`} className="font-medium">
                  Select All {group.name}
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filterPermissions(group.permissions).map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <Label htmlFor={permission.id} className="font-normal cursor-pointer">
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>

              {filterPermissions(group.permissions).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No permissions found matching your search.</div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => onSave(selectedPermissions)}>Save Permissions</Button>
        </div>
      </CardContent>
    </Card>
  )
}
