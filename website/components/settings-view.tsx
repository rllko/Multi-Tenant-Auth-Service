"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Switch} from "@/components/ui/switch"
import {Separator} from "@/components/ui/separator"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {useToast} from "@/hooks/use-toast"
import {apiService} from "@/lib/api-service"
import {CreditCard, Loader2, Lock, Save, Shield, User,} from "lucide-react"

export function SettingsView() {
    const [activeTab, setActiveTab] = useState("general")
    const [isLoading, setIsLoading] = useState(false)
    const [teamId, setTeamId] = useState<string>("")
    const {toast} = useToast()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        jobTitle: "",
        bio: "",
        sessionTimeout: "60",
        twoFactor: false,
    })

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Get current user first
                const user = await apiService.auth.getCurrentUser()
                if (user?.teamId) {
                    setTeamId(user.teamId)

                    // Load team settings
                    const settings = await apiService.settings.getSettings(user.teamId)
                    if (settings) {
                        setFormData((prev) => ({
                            ...prev,
                            ...settings,
                            name: user.name || prev.name,
                            email: user.email || prev.email,
                        }))
                    }
                }
            } catch (error) {
                console.error("Failed to load settings:", error)
                toast({
                    title: "Error loading settings",
                    description: "Failed to load your settings. Please try again.",
                    variant: "destructive",
                })
            }
        }

        loadSettings()
    }, [toast])

    const handleSave = async () => {
        if (!teamId) {
            toast({
                title: "Error",
                description: "Team ID not found. Please refresh and try again.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            await apiService.settings.updateSettings(teamId, formData)
            toast({
                title: "Settings saved",
                description: "Your settings have been saved successfully.",
            })
        } catch (error) {
            console.error("Failed to save settings:", error)
            toast({
                title: "Error saving settings",
                description: "Failed to save your settings. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        try {
            // This would typically call a password reset endpoint
            toast({
                title: "Password reset email sent",
                description: "Check your email for password reset instructions.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send password reset email. Please try again.",
                variant: "destructive",
            })
        }
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {id, value, type} = e.target
        const checked = (e.target as HTMLInputElement).checked
        setFormData({
            ...formData,
            [id]: type === "checkbox" ? checked : value,
        })
    }

    const handleSelectChange = (id: string, value: string) => {
        setFormData({
            ...formData,
            [id]: value,
        })
    }

    const handleSwitchChange = (id: string, checked: boolean) => {
        setFormData({
            ...formData,
            [id]: checked,
        })
    }

    return (
        <div className="container py-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and tenant settings</p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="flex flex-col lg:flex-row gap-6"
            >
                {/* Sidebar Navigation */}
                <div className="lg:w-64 space-y-1">
                    <TabsList className="flex flex-col h-auto space-y-1 bg-transparent p-0">
                        <TabsTrigger
                            value="profile"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <User className="h-4 w-4 mr-2"/>
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="billing"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <CreditCard className="h-4 w-4 mr-2"/>
                            Billing
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <Shield className="h-4 w-4 mr-2"/>
                            Security
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content Area */}
                <div className="flex-1">

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Manage your personal profile information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={formData.name} onChange={handleChange}/>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={handleChange}/>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title</Label>
                                        <Input id="jobTitle" value={formData.jobTitle} onChange={handleChange}/>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Tell us about yourself"
                                            value={formData.bio}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2"/>
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Manage your account security</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password"/>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password"/>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password"/>
                                    </div>

                                    <Separator className="my-2"/>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                                            <Switch
                                                id="twoFactor"
                                                checked={formData.twoFactor}
                                                onCheckedChange={(checked) => handleSwitchChange("twoFactor", checked)}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account with two-factor
                                            authentication.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="sessionTimeout">Session Timeout</Label>
                                            <Select
                                                value={formData.sessionTimeout}
                                                onValueChange={(value) => handleSelectChange("sessionTimeout", value)}
                                            >
                                                <SelectTrigger id="sessionTimeout" className="w-[180px]">
                                                    <SelectValue placeholder="Select timeout"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 minutes</SelectItem>
                                                    <SelectItem value="30">30 minutes</SelectItem>
                                                    <SelectItem value="60">1 hour</SelectItem>
                                                    <SelectItem value="120">2 hours</SelectItem>
                                                    <SelectItem value="240">4 hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Automatically log out after a
                                            period of inactivity.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={handlePasswordReset}>
                                    <Lock className="h-4 w-4 mr-2"/>
                                    Reset Password
                                </Button>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2"/>
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="billing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Settings</CardTitle>
                                <CardDescription>Manage your billing information and subscription</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Current Plan</h3>
                                        <div className="bg-muted rounded-md p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Business Plan</h4>
                                                    <p className="text-sm text-muted-foreground">$49/month, billed
                                                        annually</p>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    Change Plan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Payment Method</h3>
                                        <div className="bg-muted rounded-md p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-background p-2 rounded">
                                                        <CreditCard className="h-5 w-5"/>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">Visa ending in 4242</h4>
                                                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    Update
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2"/>
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
