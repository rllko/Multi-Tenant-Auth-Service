"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
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

// Mock data for tenants
const tenants = [
  {
    id: "tenant_1",
    name: "Acme Inc.",
    color: "#4f46e5",
  },
  {
    id: "tenant_2",
    name: "Globex Corporation",
    color: "#0ea5e9",
  },
  {
    id: "tenant_3",
    name: "Initech",
    color: "#10b981",
  },
  {
    id: "tenant_4",
    name: "Umbrella Corp",
    color: "#f59e0b",
  },
  {
    id: "tenant_5",
    name: "Stark Industries",
    color: "#ef4444",
  },
]

interface TenantSwitcherProps {
  isCollapsed: boolean
}

export function TenantSwitcher({ isCollapsed }: TenantSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTenant, setSelectedTenant] = React.useState(tenants[0])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a tenant"
          className={cn("w-full justify-between", isCollapsed && "px-2")}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedTenant.color }} />
            {!isCollapsed && <span className="truncate">{selectedTenant.name}</span>}
          </div>
          {!isCollapsed && <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search tenant..." />
            <CommandEmpty>No tenant found.</CommandEmpty>
            <CommandGroup heading="Tenants">
              {tenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  onSelect={() => {
                    setSelectedTenant(tenant)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: tenant.color }} />
                  <span>{tenant.name}</span>
                  <Check
                    className={cn("ml-auto h-4 w-4", selectedTenant.id === tenant.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Tenant
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
