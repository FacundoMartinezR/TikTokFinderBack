// src/routes/paypal-webhook.ts
import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

router.post("/paypal-webhook", express.json(), async (req, res) => {
  const event = req.body;

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const email = event.resource.subscriber.email_address;
    await prisma.user.update({
      where: { email },
      data: { role: "PAID", paypalSubscriptionId: event.resource.id },
    });
  }

  if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
    const email = event.resource.subscriber.email_address;
    await prisma.user.update({
      where: { email },
      data: { role: "FREE", paypalSubscriptionId: null },
    });
  }

  res.status(200).send("OK");
});

export default router;
