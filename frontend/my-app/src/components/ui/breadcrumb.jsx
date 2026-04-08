import React from "react";

export function Breadcrumb({ children }) {
  return <nav>{children}</nav>;
}

export function BreadcrumbList({ children }) {
  return <ol className="flex gap-2 text-sm text-gray-500">{children}</ol>;
}

export function BreadcrumbItem({ children }) {
  return <li className="flex items-center gap-1">{children}</li>;
}

export function BreadcrumbLink({ href, children }) {
  return (
    <a href={href} className="hover:text-black">
      {children}
    </a>
  );
}

export function BreadcrumbSeparator() {
  return <span>/</span>;
}