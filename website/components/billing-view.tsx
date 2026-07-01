"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Check, CreditCard} from "lucide-react"

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For personal projects and evaluation",
        current: true,
        features: ["1 team", "2 applications", "100 licenses", "Community support"],
    },
    {
        name: "Pro",
        price: "$19",
        description: "For growing teams",
        current: false,
        features: ["Unlimited teams", "10 applications", "10,000 licenses", "Priority support"],
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations",
        current: false,
        features: ["Unlimited everything", "Dedicated infrastructure", "SLA", "Dedicated support"],
    },
]

export function BillingView() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>You are currently on the Free plan</CardDescription>
                        </div>
                        <Badge>Free</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4"/>
                        <span>No payment method on file. Billing is not yet enabled for this deployment.</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{plan.name}</CardTitle>
                                {plan.current && <Badge variant="outline">Current</Badge>}
                            </div>
                            <div>
                                <span className="text-2xl font-bold">{plan.price}</span>
                                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ul className="space-y-2 text-sm">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary"/>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full" variant={plan.current ? "outline" : "default"}
                                    disabled={plan.current}>
                                {plan.current ? "Current plan" : "Coming soon"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
