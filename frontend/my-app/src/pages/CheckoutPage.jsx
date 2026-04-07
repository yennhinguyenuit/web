import { useEffect, useState } from "react";
import api from "../services/api";

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [addressId, setAddressId] = useState("");
  const [shipping, setShipping] = useState("");
  const [payment, setPayment] = useState("");

  // 🔥 load data
  useEffect(() => {
    api.get("/account/addresses")
      .then(res => {
        if (res.data.success) {
          setAddresses(res.data.data);
        }
      });

    api.get("/shipping-methods")
      .then(res => setShippingMethods(res.data.data));

    api.get("/payment-methods")
      .then(res => setPaymentMethods(res.data.data));
  }, []);

  // 🔥 đặt hàng
  const placeOrder = () => {
    if (!addressId || !shipping || !payment) {
      alert("Chọn đầy đủ thông tin");
      return;
    }

    api.post("/orders", {
      addressId: addressId,
      shippingMethodCode: shipping,
      paymentMethodCode: payment
    })
    .then(res => {
      if (res.data.success) {
        alert("Đặt hàng thành công");

        // 👉 redirect
        window.location.href = "/orders";
      }
    })
    .catch(err => console.log(err));
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Checkout</h1>

      {/* ADDRESS */}
      <h3>Chọn địa chỉ</h3>
      {addresses.map(a => (
        <div key={a.id}>
          <input
            type="radio"
            name="address"
            onChange={() => setAddressId(a.id)}
          />
          {a.fullName} - {a.addressLine}
        </div>
      ))}

      {/* SHIPPING */}
      <h3>Shipping</h3>
      {shippingMethods.map(s => (
        <div key={s.code}>
          <input
            type="radio"
            name="shipping"
            onChange={() => setShipping(s.code)}
          />
          {s.name} - {s.price}đ
        </div>
      ))}

      {/* PAYMENT */}
      <h3>Payment</h3>
      {paymentMethods.map(p => (
        <div key={p.code}>
          <input
            type="radio"
            name="payment"
            onChange={() => setPayment(p.code)}
          />
          {p.name}
        </div>
      ))}

      <button onClick={placeOrder} style={{ marginTop: 20 }}>
        Đặt hàng
      </button>
    </div>
  );
}