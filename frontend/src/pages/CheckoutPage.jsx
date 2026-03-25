import { useState } from "react"

function CheckoutPage() {
  const [step, setStep] = useState(1)

  return (
    <div style={{ padding: 40 }}>
      <h1>Checkout</h1>

      {step === 1 && (
        <div>
          <h3>Địa chỉ</h3>
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Vận chuyển</h3>
          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Thanh toán</h3>
          <button>Đặt hàng</button>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage