import React from "react"
import { cn } from "./utils"

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-500",
        className
      )}
      {...props}
    />
  )
}