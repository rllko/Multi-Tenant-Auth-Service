"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
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
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Edit, MoreHorizontal, Plus, Settings, Trash, Users} from "lucide-react"
import {Tenant} from "@/lib/schemas";

const tenants = [
    {
        id: "t1",
        name: "Acme Inc.",
        domain: "acme.com",
        plan: "Enterprise",
        users: 125,
        status: "active",
        createdAt: "2023-01-15",
    },
    {
        id: "t2",
        name: "Globex Corporation",
        domain: "globex.com",
        plan: "Business",
        users: 78,
        status: "active",
        createdAt: "2023-02-20",
    },
    {
        id: "t3",
        name: "Initech",
        domain: "initech.com",
        plan: "Starter",
        users: 23,
        status: "active",
        createdAt: "2023-03-10",
    },
    {
        id: "t4",
        name: "Umbrella Corp",
        domain: "umbrella.com",
        plan: "Enterprise",
        users: 210,
        status: "inactive",
        createdAt: "2023-04-05",
    },
]

export function TenantsView() {
    const [open, setOpen] = useState(false)
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
    const [newTenant, setNewTenant] = useState({
        name: "",
        domain: "",
        plan: "Starter",
    })

    const handleEdit = (tenant: Tenant) => {
        setSelectedTenant(tenant)
        setOpen(true)
    }

    const handleCreate = () => {
        setSelectedTenant(null)
        setNewTenant({
            name: "",
            domain: "",
            plan: "Starter",
        })
        setOpen(true)
    }

    const handleSave = () => {
        setOpen(false)
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setNewTenant((prev) => ({...prev, [name]: value}))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Organizations</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4"/>
                    New Organization
                </Button>
            </div>

            <Card className="shadow-sm border-border bg-white">
                <CardHeader className="flex flex-row items-center border-b">
                    <div className="space-y-1.5">
                        <CardTitle>Organizations</CardTitle>
                        <CardDescription>Manage tenant organizations in your system.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Organization</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.map((tenant) => (
                                <TableRow key={tenant.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`/placeholder.svg?height=32&width=32`}
                                                             alt={tenant.name}/>
                                                <AvatarFallback
                                                    className="bg-primary/10">{tenant.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{tenant.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{tenant.domain}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{tenant.plan}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Users className="mr-2 h-4 w-4 text-muted-foreground"/>
                                            <span>{tenant.users}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={tenant.status === "active" ? "default" : "secondary"}
                                            className={
                                                tenant.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                                            }
                                        >
                                            {tenant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit Organization
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Settings className="mr-2 h-4 w-4"/>
                                                    Settings
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4"/>
                                                    Delete Organization
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedTenant ? "Edit Organization" : "Create New Organization"}</DialogTitle>
                        <DialogDescription>
                            {selectedTenant
                                ? "Update the organization details below."
                                : "Fill in the details to create a new organization."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={newTenant.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Acme Inc."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                name="domain"
                                value={newTenant.domain}
                                onChange={handleInputChange}
                                placeholder="e.g. acme.com"
                            />
                            <p className="text-xs text-muted-foreground">Used for email domain verification and SSO</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="plan">Plan</Label>
                            <select
                                id="plan"
                                name="plan"
                                value={newTenant.plan}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="Starter">Starter</option>
                                <option value="Business">Business</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>{selectedTenant ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
