"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/paypal-webhook.ts
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
router.post("/", express_1.default.json(), async (req, res) => {
    console.log("[PAYPAL WEBHOOK] evento recibido:", JSON.stringify(req.body, null, 2));
    const event = req.body;
    try {
        const email = event.resource?.subscriber?.email_address;
        if (!email) {
            console.warn("[PayPal Webhook] No email found in event:", event);
            return res.status(400).send("No email in event");
        }
        switch (event.event_type) {
            case "BILLING.SUBSCRIPTION.ACTIVATED":
                console.log(`[PayPal Webhook] Subscription activated for ${email}`);
                await prisma_1.prisma.user.update({
                    where: { email },
                    data: { role: "PAID", paypalSubscriptionId: event.resource.id },
                });
                break;
            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.EXPIRED":
                console.log(`[PayPal Webhook] Subscription cancelled/expired for ${email}`);
                await prisma_1.prisma.user.update({
                    where: { email },
                    data: { role: "FREE", paypalSubscriptionId: null },
                });
                break;
            case "PAYMENT.SALE.DENIED":
            case "PAYMENT.SALE.REFUSED":
                console.log(`[PayPal Webhook] Payment failed for ${email}, setting role to FREE`);
                await prisma_1.prisma.user.update({
                    where: { email },
                    data: { role: "FREE" },
                });
                break;
            default:
                console.log("[PayPal Webhook] Event ignored:", event.event_type);
        }
        res.status(200).send("OK");
    }
    catch (err) {
        console.error("[PayPal Webhook] Error processing event:", err);
        res.status(500).send("Internal Server Error");
    }
});
exports.default = router;
