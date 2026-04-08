import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}