import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      className={cn("w-10 h-10 rounded-full overflow-hidden", className)}
      {...props}
    />
  );
}

export function AvatarImage(props) {
  return <AvatarPrimitive.Image className="w-full h-full object-cover" {...props} />;
}

export function AvatarFallback(props) {
  return (
    <AvatarPrimitive.Fallback className="flex items-center justify-center bg-gray-300 w-full h-full">
      ?
    </AvatarPrimitive.Fallback>
  );
}