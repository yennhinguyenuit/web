export default function Textarea(props) {
  return (
    <textarea
      {...props}
      className="border px-3 py-2 rounded w-full min-h-[80px]"
    />
  );
}