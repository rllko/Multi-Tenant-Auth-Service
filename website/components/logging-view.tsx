"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  AlertCircle,
  Calendar,
  Check,
  Download,
  Filter,
  Info,
  Key,
  RefreshCw,
  Search,
  User,
  X,
  Globe,
} from "lucide-react"

const logs = [
  {
    id: "log_1",
    timestamp: "2023-06-28T14:32:45Z",
    type: "license",
    action: "create",
    severity: "info",
    description: "License key KEYAUTH-1234-5678-9ABC-DEFG created",
    user: "admin@example.com",
    entity: "KEYAUTH-1234-5678-9ABC-DEFG",
    entityType: "license",
    metadata: {
      plan: "Pro",
      expiresAt: "2024-06-28",
    },
  },
  {
    id: "log_2",
    timestamp: "2023-06-28T14:35:12Z",
    type: "license",
    action: "assign",
    severity: "info",
    description: "License key assigned to user john@example.com",
    user: "admin@example.com",
    entity: "KEYAUTH-1234-5678-9ABC-DEFG",
    entityType: "license",
    metadata: {
      assignedTo: "john@example.com",
    },
  },
  {
    id: "log_3",
    timestamp: "2023-06-28T15:10:23Z",
    type: "application",
    action: "create",
    severity: "info",
    description: "Application 'Web Dashboard' created",
    user: "admin@example.com",
    entity: "app_1",
    entityType: "application",
    metadata: {
      clientId: "client_1a2b3c4d5e6f7g8h9i",
      type: "web",
    },
  },
  {
    id: "log_4",
    timestamp: "2023-06-28T16:45:30Z",
    type: "application",
    action: "update_scopes",
    severity: "warning",
    description: "Application 'Web Dashboard' scopes updated",
    user: "admin@example.com",
    entity: "app_1",
    entityType: "application",
    metadata: {
      oldScopes: ["user.read"],
      newScopes: ["user.read", "license.read"],
    },
  },
  {
    id: "log_5",
    timestamp: "2023-06-29T09:12:18Z",
    type: "license",
    action: "verify",
    severity: "info",
    description: "License key verified",
    user: "john@example.com",
    entity: "KEYAUTH-1234-5678-9ABC-DEFG",
    entityType: "license",
    metadata: {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  },
  {
    id: "log_6",
    timestamp: "2023-06-29T10:23:45Z",
    type: "license",
    action: "revoke",
    severity: "warning",
    description: "License key KEYAUTH-3456-7890-ABCD-EFGH revoked",
    user: "admin@example.com",
    entity: "KEYAUTH-3456-7890-ABCD-EFGH",
    entityType: "license",
    metadata: {
      reason: "Violation of terms of service",
    },
  },
  {
    id: "log_7",
    timestamp: "2023-06-29T11:34:56Z",
    type: "application",
    action: "auth_failure",
    severity: "error",
    description: "Authentication failure for application 'Discord Bot'",
    user: "system",
    entity: "app_2",
    entityType: "application",
    metadata: {
      reason: "Invalid client secret",
      ip: "203.0.113.1",
      attempts: 3,
    },
  },
  {
    id: "log_8",
    timestamp: "2023-06-29T12:45:12Z",
    type: "license",
    action: "hwid_reset",
    severity: "warning",
    description: "HWID reset for license KEYAUTH-2345-6789-ABCD-EFGH",
    user: "support@example.com",
    entity: "KEYAUTH-2345-6789-ABCD-EFGH",
    entityType: "license",
    metadata: {
      oldHWID: "HWID-OLD-VALUE",
      newHWID: "HWID-NEW-VALUE",
    },
  },
  {
    id: "log_9",
    timestamp: "2023-06-30T08:12:34Z",
    type: "application",
    action: "token_issued",
    severity: "info",
    description: "OAuth token issued for application 'Web Dashboard'",
    user: "john@example.com",
    entity: "app_1",
    entityType: "application",
    metadata: {
      scopes: ["user.read", "license.read"],
      expiresIn: 3600,
    },
  },
  {
    id: "log_10",
    timestamp: "2023-06-30T09:23:45Z",
    type: "license",
    action: "extend",
    severity: "info",
    description: "License KEYAUTH-1234-5678-9ABC-DEFG extended by 30 days",
    user: "admin@example.com",
    entity: "KEYAUTH-1234-5678-9ABC-DEFG",
    entityType: "license",
    metadata: {
      oldExpiry: "2024-06-28",
      newExpiry: "2024-07-28",
    },
  },
  {
    id: "log_11",
    timestamp: "2023-06-30T10:34:56Z",
    type: "application",
    action: "delete",
    severity: "error",
    description: "Application 'Legacy System' deleted",
    user: "admin@example.com",
    entity: "app_4",
    entityType: "application",
    metadata: {
      clientId: "client_4a5b6c7d8e9f0g1h2i",
    },
  },
  {
    id: "log_12",
    timestamp: "2023-06-30T11:45:12Z",
    type: "license",
    action: "ban",
    severity: "error",
    description: "License KEYAUTH-5678-9012-ABCD-EFGH banned",
    user: "admin@example.com",
    entity: "KEYAUTH-5678-9012-ABCD-EFGH",
    entityType: "license",
    metadata: {
      reason: "Fraudulent activity",
      permanent: true,
    },
  },
]

export function LoggingView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const uniqueActions = [...new Set(logs.map((log) => log.action))]

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || log.type === typeFilter

    const matchesAction = actionFilter === "all" || log.action === actionFilter

    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter

    let matchesDate = true
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0]
      matchesDate = log.timestamp.startsWith(today)
    } else if (dateFilter === "yesterday") {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
      matchesDate = log.timestamp.startsWith(yesterday)
    } else if (dateFilter === "week") {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      matchesDate = log.timestamp >= weekAgo
    }

    return matchesSearch && matchesType && matchesAction && matchesSeverity && matchesDate
  })

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getLogTypeIcon = (type, action) => {
    switch (type) {
      case "license":
        return <Key className="h-4 w-4" />
      case "application":
        return <Globe className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "info":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Info className="mr-1 h-3 w-3" />
            Info
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <X className="mr-1 h-3 w-3" />
            Error
          </Badge>
        )
      case "success":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="mr-1 h-3 w-3" />
            Success
          </Badge>
        )
      default:
        return <Badge>{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="license">License Logs</TabsTrigger>
          <TabsTrigger value="application">Application Logs</TabsTrigger>
          <TabsTrigger value="user">User Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="flex flex-row items-center border-b">
              <div className="space-y-1.5">
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>View all system activity logs.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Type</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Action</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.charAt(0).toUpperCase() + action.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Severity</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Date</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No logs found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="whitespace-nowrap">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getLogTypeIcon(log.type, log.action)}
                            <span className="capitalize">{log.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.description}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="license" className="space-y-4 mt-4">
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="flex flex-row items-center border-b">
              <div className="space-y-1.5">
                <CardTitle>License Activity Logs</CardTitle>
                <CardDescription>View all license-related activity logs.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search license logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>License Key</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs
                    .filter((log) => log.type === "license")
                    .map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="whitespace-nowrap">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell className="font-mono text-xs">{log.entity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.description}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4 mt-4">
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="flex flex-row items-center border-b">
              <div className="space-y-1.5">
                <CardTitle>Application Activity Logs</CardTitle>
                <CardDescription>View all application-related activity logs.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search application logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs
                    .filter((log) => log.type === "application")
                    .map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="whitespace-nowrap">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>{log.entity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.description}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4 mt-4">
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="flex flex-row items-center border-b">
              <div className="space-y-1.5">
                <CardTitle>User Activity Logs</CardTitle>
                <CardDescription>View all user-related activity logs.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search user logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs
                    .filter((log) => log.type === "user")
                    .map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="whitespace-nowrap">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>{log.entity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.description}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
