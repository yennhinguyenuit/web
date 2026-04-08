import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

// hàm thay cho cn (gộp class)
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Root
export function Accordion({ children, ...props }) {
  return <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>;
}

// Item
export function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b", className)}
      {...props}
    />
  );
}

// Trigger
export function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between py-4 text-sm font-medium transition hover:underline",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// Content
export function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}