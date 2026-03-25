import { useState } from "react"

function AccountPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  return (
    <div style={{ padding: 40 }}>
      <h1>Tài khoản</h1>

      <div style={{ maxWidth: 400 }}>
        <p>Họ tên</p>
        <input value={name} onChange={e => setName(e.target.value)} />

        <p>SĐT</p>
        <input value={phone} onChange={e => setPhone(e.target.value)} />

        <p>Địa chỉ</p>
        <input value={address} onChange={e => setAddress(e.target.value)} />

        <button>Lưu</button>
      </div>
    </div>
  )
}

export default AccountPage