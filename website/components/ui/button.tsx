import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
    {
        variants: {
            variant: {
                default: "bg-authio-blue text-white hover:bg-authio-blue/90 active:bg-authio-blue/80",
                destructive: "bg-authio-red text-white hover:bg-authio-red/90 active:bg-authio-red/80",
                outline: "border border-input bg-background hover:bg-accent/10 hover:text-accent active:bg-accent/20",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
                ghost: "hover:bg-accent/10 hover:text-accent active:bg-accent/20",
                link: "text-authio-blue underline-offset-4 hover:underline",
                success: "bg-authio-green text-white hover:bg-authio-green/90 active:bg-authio-green/80",
                warning: "bg-authio-orange text-white hover:bg-authio-orange/90 active:bg-authio-orange/80",
                purple: "bg-authio-purple text-white hover:bg-authio-purple/90 active:bg-authio-purple/80",
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
    ({className, variant, size, asChild = false, ...props}, ref) => {
        const Comp = asChild ? Slot : "button"
        return <Comp className={cn(buttonVariants({variant, size, className}))} ref={ref} {...props} />
    },
)
Button.displayName = "Button"

export {Button, buttonVariants}
