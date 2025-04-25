"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Copy, Edit, Eye, EyeOff, Globe, Loader2, MoreHorizontal, Plus, RefreshCw, Search, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getOAuthApps, createOAuthApp, updateOAuthApp, deleteOAuthApp, rotateOAuthAppSecret } from "@/lib/api-service"
import type { OAuthApp } from "@/lib/schemas"

export function OAuthClientsTab({ applicationId }: { applicationId: string }) {
  const [clients, setClients] = useState<OAuthApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRotate, setConfirmRotate] = useState(false)
  const [selectedClient, setSelectedClient] = useState<OAuthApp | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const { toast } = useToast()

  // Fetch OAuth clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await getOAuthApps()
        if (response.success && response.data) {
          // Filter clients by applicationId if provided
          const filteredClients = applicationId
            ? response.data.filter((client) => client.id === applicationId)
            : response.data
          setClients(filteredClients)
        } else {
          setError("Failed to fetch OAuth clients")
        }
      } catch (err) {
        setError("An error occurred while fetching OAuth clients")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [applicationId])

  // Filter clients based on search query
  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.clientId.includes(searchQuery),
  )

  const handleEdit = (client: OAuthApp) => {
    setSelectedClient(client)
    setOpen(true)
  }

  const handleCreate = () => {
    setSelectedClient(null)
    setOpen(true)
  }

  const handleSave = async (formData: FormData) => {
    try {
      setLoading(true)

      const clientData = {
        name: formData.get("name") as string,
        type: formData.get("type") as string,
        redirectUris: (formData.get("redirectUris") as string).split("\n").filter((uri) => uri.trim() !== ""),
        scopes: (formData.get("scopes") as string).split(",").map((scope) => scope.trim()),
        organization: formData.get("organization") as string,
      }

      if (selectedClient) {
        // Update existing client
        const response = await updateOAuthApp(selectedClient.id, clientData)
        if (response.success && response.data) {
          setClients(clients.map((client) => (client.id === selectedClient.id ? response.data : client)))
          toast({
            title: "Client updated",
            description: "OAuth client has been updated successfully",
          })
        }
      } else {
        // Create new client
        const response = await createOAuthApp(clientData as any)
        if (response.success && response.data) {
          setClients([...clients, response.data])
          toast({
            title: "Client created",
            description: "New OAuth client has been created successfully",
          })
        }
      }
      setOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save OAuth client",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedClient) return

    try {
      setLoading(true)
      const response = await deleteOAuthApp(selectedClient.id)
      if (response.success) {
        setClients(clients.filter((client) => client.id !== selectedClient.id))
        toast({
          title: "Client deleted",
          description: "OAuth client has been deleted successfully",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete OAuth client",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
      setSelectedClient(null)
    }
  }

  const handleRotateSecret = async () => {
    if (!selectedClient) return

    try {
      setLoading(true)
      const response = await rotateOAuthAppSecret(selectedClient.id)
      if (response.success && response.data) {
        setClients(clients.map((client) => (client.id === selectedClient.id ? response.data : client)))
        setSelectedClient(response.data)
        toast({
          title: "Secret rotated",
          description: "Client secret has been rotated successfully",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to rotate client secret",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setConfirmRotate(false)
    }
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: message,
    })
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading OAuth clients...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary/50 rounded-t-lg">
          <div className="space-y-1.5">
            <CardTitle>OAuth Clients</CardTitle>
            <CardDescription>Manage OAuth clients for your application.</CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-center mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or client ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No OAuth clients found. Create a new client to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{client.clientId}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(client.clientId, "Client ID copied to clipboard")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {client.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={client.status === "active" ? "default" : "secondary"}
                          className={
                            client.status === "active"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.lastUsed || "Never"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedClient(client)
                                setConfirmRotate(true)
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Rotate Secret
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedClient(client)
                                setConfirmDelete(true)
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Client Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedClient ? "Edit OAuth Client" : "Create OAuth Client"}</DialogTitle>
            <DialogDescription>
              {selectedClient ? "Update OAuth client details." : "Configure a new OAuth client."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave(new FormData(e.currentTarget))
            }}
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Client Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={selectedClient?.name || ""}
                      placeholder="My Application"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Client Type</Label>
                    <select
                      id="type"
                      name="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={selectedClient?.type || "web"}
                    >
                      <option value="web">Web Application</option>
                      <option value="native">Native Application</option>
                      <option value="spa">Single Page Application</option>
                      <option value="service">Service/Backend</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="redirectUris">Redirect URIs</Label>
                    <textarea
                      id="redirectUris"
                      name="redirectUris"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="https://example.com/callback"
                      defaultValue={selectedClient?.redirectUris.join("\n") || ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter one URI per line. These are the authorized redirect URIs for your application.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      defaultValue={selectedClient?.organization || ""}
                      placeholder="Your Organization"
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="scopes">Scopes</Label>
                    <Input
                      id="scopes"
                      name="scopes"
                      defaultValue={selectedClient?.scopes.join(", ") || ""}
                      placeholder="read:users,write:users"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of scopes this client can request.
                    </p>
                  </div>

                  {selectedClient && (
                    <div className="grid gap-2">
                      <Label htmlFor="clientSecret">Client Secret</Label>
                      <div className="relative">
                        <Input
                          id="clientSecret"
                          type={showSecret ? "text" : "password"}
                          value={selectedClient.clientSecret}
                          className="pr-10 font-mono"
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(selectedClient.clientSecret, "Client secret copied to clipboard")
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Secret
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConfirmRotate(true)
                          }}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rotate Secret
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep this secret secure. It will not be shown again.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedClient ? "Updating..." : "Creating..."}
                  </>
                ) : selectedClient ? (
                  "Update Client"
                ) : (
                  "Create Client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete OAuth Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this OAuth client? This action cannot be undone and will revoke access for
              all applications using this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Client"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rotate Secret Dialog */}
      <AlertDialog open={confirmRotate} onOpenChange={setConfirmRotate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate Client Secret</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rotate this client secret? This will invalidate the current secret and generate a
              new one. All applications using this client will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRotateSecret}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rotating...
                </>
              ) : (
                "Rotate Secret"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
