"use client"

import React, {useState} from "react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Switch} from "@/components/ui/switch"
import {Separator} from "@/components/ui/separator"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {useToast} from "@/hooks/use-toast"
import {useTheme} from "@/components/theme-provider"
import {
    AlertTriangle,
    Bell,
    Building,
    CreditCard,
    Key,
    Loader2,
    Lock,
    Save,
    Settings,
    Shield,
    Trash,
    User
} from "lucide-react"
import {useMutation, useSettings} from "@/hooks/use-api"
import {useTeam} from "@/contexts/team-context"
import {apiService} from "@/lib/api-service"

export function SettingsView() {
    const [activeTab, setActiveTab] = useState("general")
    const {toast} = useToast()
    const {theme, setTheme} = useTheme()
    const {selectedTeam} = useTeam()

    const {data: settings, isLoading, error, refetch} = useSettings(selectedTeam?.id || null)

    const [formData, setFormData] = useState({
        language: "en",
        timezone: "utc",
        darkMode: theme === "dark",
        name: "",
        email: "",
        jobTitle: "",
        bio: "",
        tenantName: "",
        tenantDomain: "",
        publicSignup: false,
        requireMfa: true,
        sessionTimeout: "60",
    })

    React.useEffect(() => {
        if (settings) {
            setFormData({
                language: settings.language || "en",
                timezone: settings.timezone || "utc",
                darkMode: theme === "dark",
                name: settings.user?.name || "",
                email: settings.user?.email || "",
                jobTitle: settings.user?.jobTitle || "",
                bio: settings.user?.bio || "",
                tenantName: settings.tenant?.name || "",
                tenantDomain: settings.tenant?.domain || "",
                publicSignup: settings.tenant?.publicSignup || false,
                requireMfa: settings.tenant?.requireMfa || true,
                sessionTimeout: settings.security?.sessionTimeout || "60",
            })
        }
    }, [settings, theme])

    const handleChange = (e) => {
        const {id, value, checked, type} = e.target
        setFormData({
            ...formData,
            [id]: type === "checkbox" ? checked : value,
        })
    }

    const handleSelectChange = (id, value) => {
        setFormData({
            ...formData,
            [id]: value,
        })
    }

    const handleSwitchChange = (id, checked) => {
        setFormData({
            ...formData,
            [id]: checked,
        })
    }

    const updateSettingsMutation = useMutation(
        (data) => apiService.settings.updateSettings(selectedTeam?.id || "", data),
        {
            onSuccess: () => {
                toast({
                    title: "Settings saved",
                    description: "Your settings have been saved successfully.",
                })
                refetch()
            },
            errorMessage: "Failed to save settings. Please try again.",
        },
    )

    const handleSave = () => {
        if (!selectedTeam?.id) {
            toast({
                title: "Error",
                description: "No team selected. Please select a team first.",
                variant: "destructive",
            })
            return
        }

        const apiData = {
            language: formData.language,
            timezone: formData.timezone,
            user: {
                name: formData.name,
                email: formData.email,
                jobTitle: formData.jobTitle,
                bio: formData.bio,
            },
            tenant: {
                name: formData.tenantName,
                domain: formData.tenantDomain,
                publicSignup: formData.publicSignup,
                requireMfa: formData.requireMfa,
            },
            security: {
                sessionTimeout: formData.sessionTimeout,
            },
        }

        updateSettingsMutation.mutate(apiData)
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
                            value="general"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <Settings className="h-4 w-4 mr-2"/>
                            General
                        </TabsTrigger>
                        <TabsTrigger
                            value="profile"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <User className="h-4 w-4 mr-2"/>
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="tenant"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <Building className="h-4 w-4 mr-2"/>
                            Tenant
                        </TabsTrigger>
                        <TabsTrigger
                            value="billing"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <CreditCard className="h-4 w-4 mr-2"/>
                            Billing
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <Bell className="h-4 w-4 mr-2"/>
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <Shield className="h-4 w-4 mr-2"/>
                            Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="api"
                            className="justify-start px-3 py-2 h-9 rounded-md data-[state=active]:bg-muted w-full"
                        >
                            <Key className="h-4 w-4 mr-2"/>
                            API Keys
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Manage your general account preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    </div>
                                ) : error ? (
                                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                                        <p>Failed to load settings. Please try again.</p>
                                        <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                                            Retry
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="language">Language</Label>
                                            <Select
                                                value={formData.language}
                                                onValueChange={(value) => handleSelectChange("language", value)}
                                            >
                                                <SelectTrigger id="language">
                                                    <SelectValue placeholder="Select language"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                    <SelectItem value="de">German</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="ja">Japanese</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select
                                                value={formData.timezone}
                                                onValueChange={(value) => handleSelectChange("timezone", value)}
                                            >
                                                <SelectTrigger id="timezone">
                                                    <SelectValue placeholder="Select timezone"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="utc">UTC</SelectItem>
                                                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                                                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                                                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="darkMode">Dark Mode</Label>
                                                <Switch
                                                    id="darkMode"
                                                    checked={formData.darkMode}
                                                    onCheckedChange={(checked) => {
                                                        setTheme(checked ? "dark" : "light")
                                                        handleSwitchChange("darkMode", checked)
                                                        toast({
                                                            title: `${checked ? "Dark" : "Light"} mode activated`,
                                                            description: `The interface is now in ${checked ? "dark" : "light"} mode.`,
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Enable dark mode for a better viewing experience in low-light
                                                environments.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading || updateSettingsMutation.isLoading}>
                                    {updateSettingsMutation.isLoading ? (
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

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Manage your personal profile information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    </div>
                                ) : error ? (
                                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                                        <p>Failed to load settings. Please try again.</p>
                                        <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                                            Retry
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={formData.name} onChange={handleChange}/>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" type="email" value={formData.email}
                                                   onChange={handleChange}/>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="jobTitle">Job Title</Label>
                                            <Input id="jobTitle" value={formData.jobTitle} onChange={handleChange}/>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <textarea
                                                id="bio"
                                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                placeholder="Tell us about yourself"
                                                value={formData.bio}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading || updateSettingsMutation.isLoading}>
                                    {updateSettingsMutation.isLoading ? (
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

                    <TabsContent value="tenant">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tenant Settings</CardTitle>
                                <CardDescription>Manage your tenant configuration</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    </div>
                                ) : error ? (
                                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                                        <p>Failed to load settings. Please try again.</p>
                                        <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                                            Retry
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tenantName">Tenant Name</Label>
                                            <Input id="tenantName" value={formData.tenantName} onChange={handleChange}/>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tenantDomain">Domain</Label>
                                            <Input id="tenantDomain" value={formData.tenantDomain}
                                                   onChange={handleChange}/>
                                        </div>

                                        <Separator className="my-2"/>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="publicSignup">Public Signup</Label>
                                                <Switch
                                                    id="publicSignup"
                                                    checked={formData.publicSignup}
                                                    onCheckedChange={(checked) => handleSwitchChange("publicSignup", checked)}
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Allow users to sign up with an email address from your domain.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="requireMfa">Require MFA</Label>
                                                <Switch
                                                    id="requireMfa"
                                                    checked={formData.requireMfa}
                                                    onCheckedChange={(checked) => handleSwitchChange("requireMfa", checked)}
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Require multi-factor authentication for all users in this tenant.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading || updateSettingsMutation.isLoading}>
                                    {updateSettingsMutation.isLoading ? (
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
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    </div>
                                ) : error ? (
                                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                                        <p>Failed to load settings. Please try again.</p>
                                        <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                                            Retry
                                        </Button>
                                    </div>
                                ) : (
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
                                                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                                                <Switch id="two-factor"/>
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
                                            <p className="text-sm text-muted-foreground">
                                                Automatically log out after a period of inactivity.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">
                                    <Lock className="h-4 w-4 mr-2"/>
                                    Reset Password
                                </Button>
                                <Button onClick={handleSave} disabled={isLoading || updateSettingsMutation.isLoading}>
                                    {updateSettingsMutation.isLoading ? (
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

                    <TabsContent value="api">
                        <Card>
                            <CardHeader>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>Manage API keys for programmatic access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Active API Keys</h3>
                                        <div className="rounded-md border divide-y">
                                            <div className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Production API Key</h4>
                                                        <p className="text-sm text-muted-foreground">Created 3 months
                                                            ago</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Trash className="h-4 w-4 mr-1"/>
                                                        Revoke
                                                    </Button>
                                                </div>
                                                <div className="mt-2 font-mono text-xs bg-muted p-2 rounded-md">
                                                    sk_live_••••••••••••••••••••••••••••••
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Development API Key</h4>
                                                        <p className="text-sm text-muted-foreground">Created 1 month
                                                            ago</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Trash className="h-4 w-4 mr-1"/>
                                                        Revoke
                                                    </Button>
                                                </div>
                                                <div className="mt-2 font-mono text-xs bg-muted p-2 rounded-md">
                                                    sk_test_••••••••••••••••••••••••••••••
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4">
                                        <div className="flex gap-3">
                                            <AlertTriangle
                                                className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0"/>
                                            <div>
                                                <h4 className="font-medium text-amber-800 dark:text-amber-400">API Key
                                                    Security</h4>
                                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                    API keys provide full access to your account. Keep them secure and
                                                    never share them in public
                                                    repositories or client-side code.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>
                                    <Key className="h-4 w-4 mr-2"/>
                                    Generate New API Key
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
                                <Button onClick={handleSave} disabled={isLoading || updateSettingsMutation.isLoading}>
                                    {updateSettingsMutation.isLoading ? (
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

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>Manage how you receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Email Notifications</h4>
                                                <p className="text-sm text-muted-foreground">Receive notifications via
                                                    email</p>
                                            </div>
                                            <Switch id="email-notifications" defaultChecked/>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Security Alerts</h4>
                                                <p className="text-sm text-muted-foreground">Get notified about security
                                                    events</p>
                                            </div>
                                            <Switch id="security-alerts" defaultChecked/>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Marketing Updates</h4>
                                                <p className="text-sm text-muted-foreground">Receive product updates and
                                                    offers</p>
                                            </div>
                                            <Switch id="marketing-updates"/>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">API Usage Alerts</h4>
                                                <p className="text-sm text-muted-foreground">Get notified when
                                                    approaching usage limits</p>
                                            </div>
                                            <Switch id="api-usage-alerts" defaultChecked/>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading || updateSettingsMutation.isLoading}>
                                    {updateSettingsMutation.isLoading ? (
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
