import { useState } from "react";

const REVIEWS = [
  { id: 1, name: "Hà", rating: 5, content: "Rất đẹp" },
  { id: 2, name: "Tuấn", rating: 4, content: "Ổn" },
];

export default function ReviewsPage() {
  const [search, setSearch] = useState("");

  const data = REVIEWS.filter(r =>
    r.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 40 }}>
      <h1>Reviews</h1>

      <input
        placeholder="Search"
        onChange={e => setSearch(e.target.value)}
      />

      {data.map(r => (
        <div key={r.id}>
          <p>{r.name}</p>
          <p>{r.rating}⭐</p>
          <p>{r.content}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}