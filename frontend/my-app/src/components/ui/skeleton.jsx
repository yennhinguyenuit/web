export default function Skeleton({ className = "" }) {
  return (
    <div className={`bg-gray-300 animate-pulse rounded ${className}`} />
  );
}