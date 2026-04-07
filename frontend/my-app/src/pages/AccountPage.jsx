import { useEffect, useState } from "react"
import api from "../services/api"

function AccountPage() {
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    api.get("/account/addresses")
      .then(res => {
        if (res.data.success) {
          setAddresses(res.data.data)
        }
      })
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>Địa chỉ của bạn</h1>

      {addresses.map(a => (
        <div key={a.id}>
          <p>{a.fullName}</p>
          <p>{a.phone}</p>
          <p>{a.addressLine}</p>
        </div>
      ))}
    </div>
  )
}

export default AccountPage