import Stripe from "stripe";
import { getConfig } from "./index";

const config = getConfig();

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});
