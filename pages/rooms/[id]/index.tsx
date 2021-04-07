import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useMemo, useCallback } from 'react'
import { supabase } from 'resources'
import { useIsHost, useParticipants, useUser } from 'resources/hooks'

type Props = {
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query
}) => {
  return {
    props: {
      id: query.id as string
    }
  }
}

const RoomPage: NextPage<Props> = ({ id }) => {
  const router = useRouter()
  const participants = useParticipants(id)
  const [user, name] = useUser()
  const isHost = useIsHost(id)
  const join = useCallback(async () => {
    if (!user) {
      return
    }
    await supabase.from('participants').insert([
      {
        roomId: id,
        userId: user.id,
        order: Math.random(),
        name
      }
    ])
  }, [id, user, name])
  const isJoined = useMemo(() => {
    if (user) {
      return participants.some(({ userId }) => userId === user.id)
    }
    return false
  }, [user, participants])
  const createRound = useCallback(async () => {
    const { data } = await supabase.from('rounds').insert([
      {
        roomId: id
      }
    ])
    router.push(`/rooms/${id}/rounds/${data[0].id}`)
  }, [id, participants])
  return (
    <div>
      <div>{isHost ? 'あなたはホストです' : 'あなたは参加者です'}</div>
      <div>参加者を待っています...</div>
      <div>
        参加者:&nbsp;
        {participants.map(p => (
          <span key={p.userId}>{p.name},&nbsp;</span>
        ))}
      </div>
      {!isJoined && (
        <div>
          <button onClick={join}>参加する</button>
        </div>
      )}
      {isHost && (
        <div>
          <button onClick={createRound}>ラウンドをスタート</button>
        </div>
      )}
    </div>
  )
}

export default RoomPage
