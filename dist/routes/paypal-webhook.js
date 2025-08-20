"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/paypal-webhook.ts
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
router.post("/paypal-webhook", express_1.default.json(), async (req, res) => {
    const event = req.body;
    if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
        const email = event.resource.subscriber.email_address;
        await prisma_1.prisma.user.update({
            where: { email },
            data: { role: "PAID", paypalSubscriptionId: event.resource.id },
        });
    }
    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
        const email = event.resource.subscriber.email_address;
        await prisma_1.prisma.user.update({
            where: { email },
            data: { role: "FREE", paypalSubscriptionId: null },
        });
    }
    res.status(200).send("OK");
});
exports.default = router;
