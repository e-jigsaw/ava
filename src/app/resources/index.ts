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
