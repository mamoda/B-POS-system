import express from "express";
const router = express.Router();
router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;

    if (event.obj && event.obj.success === true) {
      const orderId = event.obj.order.id;
    //   ✅ حدّث حالة الطلب في قاعدة البيانات
      await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Webhook error");
  }
});

export default router;
