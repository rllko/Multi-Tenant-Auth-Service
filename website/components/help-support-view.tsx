"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Video,
  Send,
} from "lucide-react"

// Mock FAQ data
const faqData = [
  {
    id: "faq_1",
    question: "How do I reset my password?",
    answer:
      "You can reset your password by clicking on the 'Forgot Password' link on the login page. You will receive an email with instructions to reset your password.",
    category: "account",
  },
  {
    id: "faq_2",
    question: "How do I create a new OAuth client?",
    answer:
      "To create a new OAuth client, navigate to the OAuth Clients page and click on the 'New Client' button. Fill in the required information and click 'Create'.",
    category: "oauth",
  },
  {
    id: "faq_3",
    question: "What are the rate limits for the API?",
    answer:
      "The API is rate limited to 100 requests per minute per API key. If you exceed this limit, you will receive a 429 Too Many Requests response.",
    category: "api",
  },
  {
    id: "faq_4",
    question: "How do I add team members to my tenant?",
    answer:
      "To add team members, go to the Team Members page and click on the 'Add Member' button. Enter the email address of the person you want to invite and select their role.",
    category: "team",
  },
  {
    id: "faq_5",
    question: "How do I generate license keys?",
    answer:
      "You can generate license keys by navigating to the License Keys page and clicking on the 'Generate Keys' button. You can specify the number of keys to generate and their properties.",
    category: "licenses",
  },
  {
    id: "faq_6",
    question: "How do I upgrade my subscription plan?",
    answer:
      "To upgrade your subscription, go to the Billing page and click on the 'Change Plan' button. Select the plan you want to upgrade to and follow the instructions.",
    category: "billing",
  },
]

// Mock documentation data
const docsData = [
  {
    id: "doc_1",
    title: "Getting Started Guide",
    description: "Learn the basics of KeyAuth and how to set up your account",
    icon: <BookOpen className="h-5 w-5" />,
    url: "#",
  },
  {
    id: "doc_2",
    title: "API Documentation",
    description: "Comprehensive documentation for the KeyAuth API",
    icon: <FileText className="h-5 w-5" />,
    url: "#",
  },
  {
    id: "doc_3",
    title: "OAuth Integration Guide",
    description: "Learn how to implement OAuth authentication with KeyAuth",
    icon: <HelpCircle className="h-5 w-5" />,
    url: "#",
  },
  {
    id: "doc_4",
    title: "License Key Management",
    description: "How to create, distribute, and manage license keys",
    icon: <FileText className="h-5 w-5" />,
    url: "#",
  },
]

// Mock video tutorial data
const videoData = [
  {
    id: "video_1",
    title: "Getting Started with KeyAuth",
    description: "A quick introduction to KeyAuth and its features",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "5:32",
    url: "#",
  },
  {
    id: "video_2",
    title: "Setting Up OAuth Authentication",
    description: "Learn how to implement OAuth authentication in your applications",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "8:45",
    url: "#",
  },
  {
    id: "video_3",
    title: "Managing Team Permissions",
    description: "How to set up and manage team member permissions",
    thumbnail: "/placeholder.svg?height=120&width=200",
    duration: "6:20",
    url: "#",
  },
]

export function HelpSupportView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("faq")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportCategory, setSupportCategory] = useState("general")
  const { toast } = useToast()

  // Filter FAQ data based on search query
  const filteredFaqs = faqData.filter(
    (faq) =>
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the message to your support system
    toast({
      title: "Message sent",
      description: "Your support request has been submitted. We'll get back to you soon.",
    })

    // Reset form
    setSupportMessage("")
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for help articles, FAQs, and more..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No FAQs Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {faq.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{faq.answer}</p>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="text-sm text-muted-foreground">Was this helpful?</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Yes
                    </Button>
                    <Button variant="outline" size="sm">
                      No
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {docsData.map((doc) => (
              <Card key={doc.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">{doc.icon}</div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{doc.description}</p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read Documentation
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {videoData.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative">
                  <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Watch Tutorial
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Live Chat
                </CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Available Monday to Friday, 9:00 AM to 5:00 PM Eastern Time.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Support
                </CardTitle>
                <CardDescription>Send us an email and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our typical response time is within 24 hours during business days.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:support@keyauth.io">
                    <Mail className="h-4 w-4 mr-2" />
                    support@keyauth.io
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone Support
                </CardTitle>
                <CardDescription>Call us for urgent issues</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Available for Business and Enterprise customers only.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="tel:+18005551234">
                    <Phone className="h-4 w-4 mr-2" />
                    +1 (800) 555-1234
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send a Support Request</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={supportCategory} onValueChange={setSupportCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="billing">Billing & Subscription</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  rows={5}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Attach Files</Button>
              <Button onClick={handleSendSupportMessage}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
