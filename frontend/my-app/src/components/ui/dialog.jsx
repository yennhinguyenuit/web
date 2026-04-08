import React, { useState } from "react"

export function Dialog({ children }) {
  return <>{children}</>
}

export function DialogTrigger({ children, onClick }) {
  return <div onClick={onClick}>{children}</div>
}

export function DialogContent({ children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[400px]">
        {children}
      </div>
    </div>
  )
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-bold mb-2">{children}</h2>
}