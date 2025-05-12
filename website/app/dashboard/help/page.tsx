import {HelpSupportView} from "@/components/help-support-view"

export default function HelpSupportPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">Get help with Authio and contact support</p>
            </div>
            <HelpSupportView/>
        </div>
    )
}
