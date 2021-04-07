import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { supabase } from 'resources'
import { useUser } from 'resources/hooks'

const CreateRoomPage = () => {
  const router = useRouter()
  const [user, name] = useUser()
  const createRoom = useCallback(async () => {
    if (!user) {
      return
    }
    const { data } = await supabase.from('rooms').insert([
      {
        host: user.id
      }
    ])
    await supabase.from('participants').insert([
      {
        roomId: data[0].id,
        userId: user.id,
        order: Math.random(),
        name
      }
    ])
    router.push(`/rooms/${data[0].id}`)
  }, [user, name])
  return (
    <div>
      <button onClick={createRoom}>ルームを作成</button>
    </div>
  )
}

export default CreateRoomPage
