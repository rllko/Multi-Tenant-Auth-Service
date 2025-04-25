import { BillingView } from "@/components/billing-view"

export default function ResourcesBillingPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>
      <BillingView />
    </div>
  )
}
