import React from "react";

// thay cho cn
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Alert chính
export function Alert({ className, variant = "default", ...props }) {
  const base =
    "relative w-full rounded-lg border px-4 py-3 text-sm flex gap-3 items-start";

  const variants = {
    default: "bg-white text-black",
    destructive: "bg-red-100 text-red-600 border-red-400",
  };

  return (
    <div
      role="alert"
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

// Title
export function AlertTitle({ className, ...props }) {
  return (
    <div className={cn("font-medium", className)} {...props} />
  );
}

// Description
export function AlertDescription({ className, ...props }) {
  return (
    <div className={cn("text-sm opacity-80", className)} {...props} />
  );
}