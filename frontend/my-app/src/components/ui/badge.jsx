import React from "react"
import { cn } from "./utils"

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn("px-2 py-1 text-xs bg-gray-200 rounded", className)}
      {...props}
    />
  )
}