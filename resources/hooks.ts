import { User } from '@supabase/supabase-js'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from 'resources'

export const useUser = (): [User, string] => {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  useEffect(() => {
    const u = supabase.auth.user()
    if (u) {
      setUser(u)
      setName(u.user_metadata.name ?? '')
    }
  }, [])
  return [user, name]
}

export const useRoom = id => {
  const [room, setRoom] = useState(null)
  useEffect(() => {
    supabase
      .from('rooms')
      .select()
      .eq('id', id)
      .then(res => {
        setRoom(res.data[0])
      })
  }, [])
  return room
}

export const useParticipants = id => {
  const [participants, setParticipants] = useState([])
  useEffect(() => {
    supabase
      .from('participants')
      .select()
      .eq('roomId', id)
      .then(res => {
        setParticipants([...res.data.sort((x, y) => y.order - x.order)])
      })
    const sub = supabase
      .from(`participants:roomId=eq.${id}`)
      .on('*', () => {
        supabase
          .from('participants')
          .select()
          .eq('roomId', id)
          .then(res => {
            setParticipants([...res.data.sort((x, y) => y.order - x.order)])
          })
      })
      .subscribe()
    return () => {
      supabase.removeSubscription(sub)
    }
  }, [])
  return participants
}

export const useIsHost = id => {
  const [user] = useUser()
  const room = useRoom(id)
  const isHost = useMemo(() => {
    if (user && room) {
      return user.id === room.host
    } else {
      return false
    }
  }, [user, room])
  return isHost
}

export const useRound = roundId => {
  const [round, setRound] = useState(null)
  useEffect(() => {
    supabase
      .from('rounds')
      .select()
      .eq('id', roundId)
      .then(res => setRound(res.data[0]))
  }, [])
  return round
}
