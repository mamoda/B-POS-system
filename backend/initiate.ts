import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/initiate", async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    // 1️⃣ Get Auth Token
    const authRes = await fetch(`${process.env.PAYMOB_BASE_URL}/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    });
    const { token } = await authRes.json();

    // 2️⃣ Create Paymob Order
    const orderRes = await fetch(`${process.env.PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amount * 100),
        currency: "EGP",
        delivery_needed: false,
        items: [],
      }),
    });
    const orderData = await orderRes.json();

    // 3️⃣ Get Payment Key
    const integrationId =
      paymentMethod === "wallet"
        ? process.env.PAYMOB_INTEGRATION_ID_WALLET
        : process.env.PAYMOB_INTEGRATION_ID_CARD;

    const paymentKeyRes = await fetch(`${process.env.PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          first_name: "Customer",
          last_name: "Table",
          email: "customer@example.com",
          phone_number: "01000000000",
          apartment: "NA",
          floor: "NA",
          street: "NA",
          building: "NA",
          city: "Cairo",
          country: "EG",
        },
        currency: "EGP",
        integration_id: integrationId,
      }),
    });
    const { token: paymentKey } = await paymentKeyRes.json();

    // 4️⃣ Return iframe URL
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    res.json({ success: true, iframeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
});

export default router;
