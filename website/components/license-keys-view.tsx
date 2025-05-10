"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useTeam } from "@/contexts/team-context"
import type { LicenseKey } from "@/lib/schemas"

const plans = [
  { id: "basic", name: "Basic" },
  { id: "pro", name: "Pro" },
  { id: "enterprise", name: "Enterprise" },
]

export function LicenseKeysView() {
  const [licenses, setLicenses] = useState<LicenseKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<LicenseKey | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const { toast } = useToast()
  const { selectedTeam } = useTeam()
  const [newKey, setNewKey] = useState({
    plan: "pro",
    expiresAt: "",
    maxUsages: 1,
    notes: "",
    generateKey: true,
    customKey: "",
    applicationId: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, planFilter, selectedApplicationId])

  useEffect(() => {
    const fetchLicenseKeys = async () => {
      if (!selectedTeam || !selectedApplicationId) return

      try {
        setLoading(true)
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses`
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch license keys: ${response.status}`)
        }
        
        const data = await response.json()
        setLicenses(data)
        setError(null)
      } catch (err) {
        setError("An error occurred while fetching license keys")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLicenseKeys()
  }, [selectedApplicationId, selectedTeam])

  const filteredKeys = licenses.filter((key) => {

    const matchesSearch =
      searchQuery === "" ||
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (key.assignedTo && key.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      key.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || key.status === statusFilter

    const matchesPlan = planFilter === "all" || key.plan.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredKeys.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleEdit = (key: LicenseKey) => {
    setSelectedKey(key)
    setNewKey({
      plan: key.plan.toLowerCase(),
      expiresAt: key.expiresAt || "",
      maxUsages: key.maxUsages,
      notes: key.notes || "",
      generateKey: false,
      customKey: key.key,
      applicationId: key.applicationId,
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setSelectedKey(null)
    setNewKey({
      plan: "pro",
      expiresAt: "",
      maxUsages: 1,
      notes: "",
      generateKey: true,
      customKey: "",
      applicationId: selectedApplicationId || "",
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!selectedTeam || !selectedApplicationId) return
    
    try {
      setLoading(true)

      if (selectedKey) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses/${selectedKey.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan: newKey.plan,
              expiresAt: newKey.expiresAt || undefined,
              maxUsages: Number(newKey.maxUsages),
              notes: newKey.notes,
              key: newKey.generateKey ? undefined : newKey.customKey,
            }),
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to update license: ${response.status}`)
        }
        
        const updatedLicense = await response.json()
        setLicenses(licenses.map((lic) => (lic.id === selectedKey.id ? updatedLicense : lic)))
        
        toast({
          title: "License updated",
          description: "The license has been updated successfully.",
        })
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key: newKey.generateKey ? undefined : newKey.customKey,
              plan: newKey.plan,
              expiresAt: newKey.expiresAt || undefined,
              maxUsages: Number(newKey.maxUsages),
              notes: newKey.notes,
            }),
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to create license: ${response.status}`)
        }
        
        const newLicense = await response.json()
        setLicenses([newLicense, ...licenses])
        
        toast({
          title: "License created",
          description: "A new license has been created successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to save license: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewKey((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setNewKey((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setNewKey((prev) => ({ ...prev, [name]: checked }))
  }

  const handleApplicationSelect = (appId) => {
    setSelectedApplicationId(appId)
    setNewKey({
      ...newKey,
      applicationId: appId,
    })
  }

  const handleBackToApplications = () => {
    setSelectedApplicationId(null)
  }

  const generateRandomKey = () => {
    const segments = []
    for (let i = 0; i < 4; i++) {
      segments.push(Math.random().toString(36).substring(2, 6).toUpperCase())
    }
    return `AUTHIO-${segments.join("-")}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The license key has been copied to your clipboard.",
    })
  }

  const handleDeleteLicense = async (licenseId) => {
    if (!selectedTeam || !selectedApplicationId) return
    
    try {
      setLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses/${licenseId}`,
        {
          method: 'DELETE',
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to delete license: ${response.status}`)
      }
      
      setLicenses(licenses.filter((lic) => lic.id !== licenseId))
      
      toast({
        title: "License deleted",
        description: "The license has been deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to delete license: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeLicense = async (licenseId) => {
    if (!selectedTeam || !selectedApplicationId) return
    
    try {
      setLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses/${licenseId}/revoke`,
        {
          method: 'POST',
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to revoke license: ${response.status}`)
      }
      
      const updatedLicense = await response.json()
      setLicenses(licenses.map((lic) => (lic.id === licenseId ? updatedLicense : lic)))
      
      toast({
        title: "License revoked",
        description: "The license has been revoked successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to revoke license: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBanLicense = async (licenseId) => {
    if (!selectedTeam || !selectedApplicationId) return
    
    try {
      setLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses/${licenseId}/ban`,
        {
          method: 'POST',
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to ban license: ${response.status}`)
      }
      
      const updatedLicense = await response.json()
      setLicenses(licenses.map((lic) => (lic.id === licenseId ? updatedLicense : lic)))
      
      toast({
        title: "License banned",
        description: "The license has been banned successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ban license: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnbanLicense = async (licenseId) => {
    if (!selectedTeam || !selectedApplicationId) return
    
    try {
      setLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApplicationId}/licenses/${licenseId}/unban`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to unban license: ${response.status}`)
      }

      const updatedLicense = await response.json()
      setLicenses(licenses.map((lic) => (lic.id === licenseId ? updatedLicense : lic)))
    }\
