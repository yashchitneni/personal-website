import { createClient } from '@supabase/supabase-js'
import { Membership } from '../../app/types/membership'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ProfileUpdate {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  membership?: Membership;
}

/**
 * Represents the structure for updating a profile.
 * @typedef {Object} ProfileUpdate
 * @property {string} [stripeCustomerId] - The Stripe customer ID.
 * @property {string} [stripeSubscriptionId] - The Stripe subscription ID.
 * @property {Membership} [membership] - The membership type.
 */

/**
 * Updates a user profile in the database.
 * @async
 * @function updateProfile
 * @param {string} profileId - The ID of the profile to update.
 * @param {ProfileUpdate} update - The profile update data.
 * @returns {Promise<Object|null>} The updated profile data or null if an error occurs.
 */
export async function updateProfile(profileId: string, update: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', profileId)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Updates a user profile in the database using the Stripe customer ID.
 * @async
 * @function updateProfileByCustomerId
 * @param {string} customerId - The Stripe customer ID.
 * @param {ProfileUpdate} update - The profile update data.
 * @returns {Promise<Object|null>} The updated profile data or null if an error occurs.
 */
export async function updateProfileByCustomerId(customerId: string, update: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('stripeCustomerId', customerId)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Retrieves a user profile from the database using the Stripe customer ID.
 * @async
 * @function getProfileByCustomerId
 * @param {string} customerId - The Stripe customer ID.
 * @returns {Promise<Object|null>} The user profile data or null if an error occurs.
 */
export async function getProfileByCustomerId(customerId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripeCustomerId', customerId)
    .single()

  if (error) {
    return null
  }

  return data
}