import { createClient } from '@supabase/supabase-js'
import { Membership } from '../../types/membership'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ProfileUpdate {
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  membership?: Membership
}

export async function updateProfile(profileId: string, update: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

export async function updateProfileByCustomerId(customerId: string, update: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('stripeCustomerId', customerId)
    .single()

  if (error) {
    console.error('Error updating profile by customer ID:', error)
    return null
  }

  return data
}

export async function getProfileByCustomerId(customerId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripeCustomerId', customerId)
    .single()

  if (error) {
    console.error('Error fetching profile by customer ID:', error)
    return null
  }

  return data
}