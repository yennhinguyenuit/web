export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead className="border-b">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="border-b hover:bg-gray-50">{children}</tr>;
}

export function TableHead({ children }) {
  return <th className="text-left p-2 font-medium">{children}</th>;
}

export function TableCell({ children }) {
  return <td className="p-2">{children}</td>;
}