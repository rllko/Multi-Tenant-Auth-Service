import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-keyauth-blue text-white hover:bg-keyauth-blue/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-keyauth-red text-white hover:bg-keyauth-red/80",
        outline: "text-foreground",
        success: "border-transparent bg-keyauth-green text-white hover:bg-keyauth-green/80",
        warning: "border-transparent bg-keyauth-orange text-white hover:bg-keyauth-orange/80",
        purple: "border-transparent bg-keyauth-purple text-white hover:bg-keyauth-purple/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
