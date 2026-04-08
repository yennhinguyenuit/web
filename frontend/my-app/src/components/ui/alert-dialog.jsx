import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// cn thay thế
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function AlertDialog({ children, ...props }) {
  return <AlertDialogPrimitive.Root {...props}>{children}</AlertDialogPrimitive.Root>;
}

export function AlertDialogTrigger(props) {
  return <AlertDialogPrimitive.Trigger {...props} />;
}

export function AlertDialogContent({ children, className }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow",
          className
        )}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogTitle(props) {
  return <AlertDialogPrimitive.Title className="font-bold text-lg" {...props} />;
}

export function AlertDialogDescription(props) {
  return <AlertDialogPrimitive.Description className="text-sm text-gray-500" {...props} />;
}

export function AlertDialogAction(props) {
  return (
    <AlertDialogPrimitive.Action
      className="bg-blue-500 text-white px-4 py-2 rounded"
      {...props}
    />
  );
}

export function AlertDialogCancel(props) {
  return (
    <AlertDialogPrimitive.Cancel
      className="border px-4 py-2 rounded"
      {...props}
    />
  );
}