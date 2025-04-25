import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default: "bg-keyauth-blue text-white hover:bg-keyauth-blue/90 active:bg-keyauth-blue/80",
        destructive: "bg-keyauth-red text-white hover:bg-keyauth-red/90 active:bg-keyauth-red/80",
        outline: "border border-input bg-background hover:bg-accent/10 hover:text-accent active:bg-accent/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent/10 hover:text-accent active:bg-accent/20",
        link: "text-keyauth-blue underline-offset-4 hover:underline",
        success: "bg-keyauth-green text-white hover:bg-keyauth-green/90 active:bg-keyauth-green/80",
        warning: "bg-keyauth-orange text-white hover:bg-keyauth-orange/90 active:bg-keyauth-orange/80",
        purple: "bg-keyauth-purple text-white hover:bg-keyauth-purple/90 active:bg-keyauth-purple/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
