import { useState } from "react"

function BlogPage() {
  const [search, setSearch] = useState("")

  const posts = [
    { id: 1, title: "Xu hướng thời trang 2024" },
    { id: 2, title: "Phối đồ công sở" },
    { id: 3, title: "Street style Việt" }
  ]

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      {/* SEARCH */}
      <input
        placeholder="Tìm kiếm..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded mb-6 outline-none focus:ring-2 focus:ring-red-500"
      />

      {/* POSTS */}
      <div className="grid gap-4">

        {filtered.map(p => (
          <div
            key={p.id}
            className="border p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-semibold text-lg">{p.title}</h3>
          </div>
        ))}

      </div>

    </div>
  )
}

export default BlogPage