import {
  updateProfile,
  updateProfileByCustomerId
} from "../db/queries/profiles-queries"
import { Membership } from "../types/membership"
import Stripe from "stripe"
import { stripe } from "../lib/stripe"

const getMembershipStatus = (
  status: Stripe.Subscription.Status,
  membership: Membership
): Membership => {
  switch (status) {
    case "active":
    case "trialing":
      return membership
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      return "free"
    default:
      return "free"
  }
}

export const updateStripeCustomer = async (
  profileId: string,
  subscriptionId: string,
  customerId: string
) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"]
  })

  const updatedProfile = await updateProfile(profileId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id
  })

  if (!updatedProfile) {
    throw new Error("Failed to update customer")
  }
}

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"]
  })

  const product = await stripe.products.retrieve(productId)
  const membership = product.metadata.membership as Membership

  const membershipStatus = getMembershipStatus(subscription.status, membership)

  await updateProfileByCustomerId(customerId, {
    stripeSubscriptionId: subscription.id,
    membership: membershipStatus
  })
}