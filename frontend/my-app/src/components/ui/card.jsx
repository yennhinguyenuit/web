import React from "react"
import { cn } from "./utils"

export function Card({ className, ...props }) {
  return (
    <div className={cn("rounded-xl border bg-white shadow", className)} {...props} />
  )
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props} />
  )
}

export function CardFooter({ className, ...props }) {
  return (
    <div className={cn("p-4 pt-0", className)} {...props} />
  )
}