"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const tenants = [
  { id: "t1", name: "Acme Inc." },
  { id: "t2", name: "Globex Corporation" },
  { id: "t3", name: "Initech" },
  { id: "t4", name: "Umbrella Corp" },
]

export function TenantSelector() {
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(tenants[0])
  const [newTenantName, setNewTenantName] = useState("")

  const handleCreateTenant = () => {
    console.log("Creating tenant:", newTenantName)
    setCreateOpen(false)
    setNewTenantName("")
  }

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[140px] sm:w-[200px] justify-between font-normal text-sm"
          >
            <span className="truncate">{selectedTenant.name}</span>
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search organization..." />
            <CommandList>
              <CommandEmpty>No organization found.</CommandEmpty>
              <CommandGroup heading="Organizations">
                {tenants.map((tenant) => (
                  <CommandItem
                    key={tenant.id}
                    value={tenant.name}
                    onSelect={() => {
                      setSelectedTenant(tenant)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${selectedTenant.id === tenant.id ? "opacity-100" : "opacity-0"}`}
                    />
                    {tenant.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <CommandItem onSelect={() => setCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Organization
                    </CommandItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Organization</DialogTitle>
                      <DialogDescription>Add a new organization to manage applications and users.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                          id="name"
                          value={newTenantName}
                          onChange={(e) => setNewTenantName(e.target.value)}
                          placeholder="Acme Inc."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTenant}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Organizations
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
