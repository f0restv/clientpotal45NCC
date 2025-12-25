import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              paymentIntentId: paymentIntent.id,
              paidAt: new Date(),
            },
          });

          // Update product status to SOLD
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            for (const item of order.items) {
              await db.product.update({
                where: { id: item.productId },
                data: { status: "SOLD" },
              });
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceId = invoice.metadata?.invoiceId;

        if (invoiceId) {
          await db.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceId = invoice.metadata?.invoiceId;

        if (invoiceId) {
          await db.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "OVERDUE",
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
