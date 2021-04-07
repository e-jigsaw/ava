export type Maybe<T> = T | null

export type User = {
  uid: string
  name: string
}

export type Vote = {
  voter: User
  voting: boolean
}

export type Participant = {
  order: number
  user: User
}

export type Mission = {
  choice: boolean
  uid: string
}

type ElectionDigest = {
  createdAt: number
  type: 'rejected' | 'accepted'
  party: string
  agreed: string
  disagreed: string
  owner: string
}

type QuestDigest = {
  createdAt: number
  type: 'quest'
  party: string
  success: number
  failure: number
}

export type Digest = ElectionDigest | QuestDigest

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)
