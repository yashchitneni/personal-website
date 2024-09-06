import Stripe from "stripe";

/**
 * Initialized Stripe instance.
 * @type {Stripe}
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
  appInfo: {
    name: "Todo App",
    version: "0.1.0"
  }
});