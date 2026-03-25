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
    <div style={{ padding: 40 }}>
      <h1>Blog</h1>

      <input
        placeholder="Tìm kiếm..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={{ marginTop: 20 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ marginBottom: 10 }}>
            {p.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlogPage