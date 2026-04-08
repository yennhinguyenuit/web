import React from "react"

export function Carousel({ children }) {
  return <div className="overflow-x-auto flex gap-4">{children}</div>
}

export function CarouselContent({ children }) {
  return <>{children}</>
}

export function CarouselItem({ children }) {
  return <div className="min-w-full">{children}</div>
}