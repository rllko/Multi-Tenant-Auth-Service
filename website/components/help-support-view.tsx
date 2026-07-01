"use client"

import Link from "next/link"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {BookOpen, ExternalLink, Github, Mail} from "lucide-react"

const faqs = [
    {
        question: "How do I invite someone to my team?",
        answer:
            "Go to Team → Members and click \"Invite Member\". Enter the email address of an existing Authio account and an optional message. The recipient can accept or decline the invitation from Team → Invites.",
    },
    {
        question: "How do roles and permissions work?",
        answer:
            "Each team defines roles, and each role holds a set of permission scopes. Assign a role to a member from the Members page. What a member can do in the dashboard and through the API is determined by the scopes of their role.",
    },
    {
        question: "How do I create an application?",
        answer:
            "Open the Apps section and click \"Create Application\". Applications own their licenses and OAuth clients, and every application belongs to the currently selected team.",
    },
    {
        question: "Where do I find my API token?",
        answer:
            "Log in through POST /auth/tenant/login to receive a bearer token. Include it in the Authorization header of every request: Authorization: Bearer <token>.",
    },
    {
        question: "Why am I getting 403 responses?",
        answer:
            "Your role is missing the permission scope required by that endpoint. Ask a team admin to update your role from Team → Roles, or check the required scope in the API reference.",
    },
]

export function HelpSupportView() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <BookOpen className="h-8 w-8 text-primary mb-2"/>
                        <CardTitle className="text-base">Documentation</CardTitle>
                        <CardDescription>Guides and a full API reference</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/api-docs">
                                Browse docs
                                <ExternalLink className="ml-2 h-3.5 w-3.5"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Mail className="h-8 w-8 text-primary mb-2"/>
                        <CardTitle className="text-base">Email Support</CardTitle>
                        <CardDescription>Questions, feedback, or account issues</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm" asChild>
                            <a href="mailto:support@authio.dev">Contact support</a>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Github className="h-8 w-8 text-primary mb-2"/>
                        <CardTitle className="text-base">Report an Issue</CardTitle>
                        <CardDescription>Found a bug? Let us know on GitHub</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href="https://github.com/rllko/Multi-Tenant-Auth-Service/issues"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open an issue
                                <ExternalLink className="ml-2 h-3.5 w-3.5"/>
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`faq-${index}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    )
}
