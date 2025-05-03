"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CreditCard,
  Download,
  ChevronRight,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Zap,
  Users,
  Database,
  HardDrive,
} from "lucide-react"

// Mock billing data
const subscriptionData = {
  plan: "Business",
  status: "active",
  billingCycle: "monthly",
  nextBillingDate: "2023-10-15",
  amount: "$99.00",
  paymentMethod: {
    type: "card",
    last4: "4242",
    brand: "Visa",
    expMonth: 12,
    expYear: 2024,
  },
}

// Mock usage data
const usageData = {
  apiCalls: {
    used: 850000,
    limit: 1000000,
    percentage: 85,
  },
  storage: {
    used: 7.5,
    limit: 10,
    percentage: 75,
  },
  users: {
    used: 18,
    limit: 25,
    percentage: 72,
  },
}

// Mock invoices data
const invoicesData = [
  {
    id: "inv_1234",
    date: "2023-09-15",
    amount: "$99.00",
    status: "paid",
  },
  {
    id: "inv_1233",
    date: "2023-08-15",
    amount: "$99.00",
    status: "paid",
  },
  {
    id: "inv_1232",
    date: "2023-07-15",
    amount: "$79.00",
    status: "paid",
  },
  {
    id: "inv_1231",
    date: "2023-06-15",
    amount: "$79.00",
    status: "paid",
  },
  {
    id: "inv_1230",
    date: "2023-05-15",
    amount: "$79.00",
    status: "paid",
  },
]

export function BillingView() {
  const [activeTab, setActiveTab] = useState("overview")

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Your current plan and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">{subscriptionData.plan} Plan</h3>
                    <p className="text-muted-foreground">
                      {subscriptionData.billingCycle.charAt(0).toUpperCase() + subscriptionData.billingCycle.slice(1)}{" "}
                      billing
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Active
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{subscriptionData.amount} / month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span className="font-medium">{formatDate(subscriptionData.nextBillingDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-medium">
                      {subscriptionData.paymentMethod.brand} ending in {subscriptionData.paymentMethod.last4}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Change Plan</Button>
                <Button variant="default">Manage Subscription</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Your current usage and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>API Calls</span>
                    </div>
                    <span className="text-sm font-medium">
                      {usageData.apiCalls.used.toLocaleString()} / {usageData.apiCalls.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={usageData.apiCalls.percentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <HardDrive className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Storage</span>
                    </div>
                    <span className="text-sm font-medium">
                      {usageData.storage.used} GB / {usageData.storage.limit} GB
                    </span>
                  </div>
                  <Progress value={usageData.storage.percentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      <span>Team Members</span>
                    </div>
                    <span className="text-sm font-medium">
                      {usageData.users.used} / {usageData.users.limit}
                    </span>
                  </div>
                  <Progress value={usageData.users.percentage} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  View Detailed Usage
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your recent billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData.slice(0, 3).map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            invoice.status === "paid"
                              ? "bg-green-500/10 text-green-600 border-green-300"
                              : "bg-amber-500/10 text-amber-600 border-amber-300"
                          }
                        >
                          {invoice.status === "paid" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("invoices")}>
                View All Invoices
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Your complete billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            invoice.status === "paid"
                              ? "bg-green-500/10 text-green-600 border-green-300"
                              : "bg-amber-500/10 text-amber-600 border-amber-300"
                          }
                        >
                          {invoice.status === "paid" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {subscriptionData.paymentMethod.brand} ending in {subscriptionData.paymentMethod.last4}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Expires {subscriptionData.paymentMethod.expMonth}/{subscriptionData.paymentMethod.expYear}
                      </p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>

              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
              <CardDescription>Your billing address information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Acme Inc.</h3>
                  <p className="text-sm">123 Main Street</p>
                  <p className="text-sm">Suite 100</p>
                  <p className="text-sm">San Francisco, CA 94103</p>
                  <p className="text-sm">United States</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Update Billing Address
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Contact</CardTitle>
              <CardDescription>Who should receive billing communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-1">
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm">john@example.com</p>
                  <p className="text-sm">+1 (555) 123-4567</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Update Billing Contact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
