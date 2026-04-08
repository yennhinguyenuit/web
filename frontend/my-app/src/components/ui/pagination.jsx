export default function Pagination({ page, total, onChange }) {
  return (
    <div className="flex gap-2 justify-center mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded"
      >
        Prev
      </button>

      <span className="px-3">{page}</span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="px-3 py-1 border rounded"
      >
        Next
      </button>
    </div>
  );
}