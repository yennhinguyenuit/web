import React, { useState } from "react";

export default function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>{label}</button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow p-2">
          {children}
        </div>
      )}
    </div>
  );
}