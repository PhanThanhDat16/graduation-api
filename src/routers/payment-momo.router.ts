import express from "express";
import { paymentController } from "@/controllers/payments/payment-momo.controller";
import { requireAuth } from "@/middlewares/auth.middlewares";

const router = express.Router();

// Create a new MoMo QR payment
router.post("/create",requireAuth, paymentController.createPayment);

// Handle MoMo IPN callback
router.post("/callback", paymentController.handleCallback);

// Handle MoMo redirect after payment — MUST be before /:orderId
router.get("/return", paymentController.handleReturn);

// Get order status
router.get("/:orderId", paymentController.getOrderStatus);

export const PaymentMomoRouter = router;
