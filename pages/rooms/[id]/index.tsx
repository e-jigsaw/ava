import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useMemo, useCallback } from 'react'
import { supabase } from 'resources'
import { useIsHost, useParticipants, useUser } from 'resources/hooks'
import { Header } from 'components/Header'

type Props = {
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  return {
    props: {
      id: query.id as string,
    },
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
        name,
      },
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
        roomId: id,
      },
    ])
    await supabase
      .from('rooms')
      .update({ site: `/rooms/${id}/rounds/${data[0].id}` })
      .match({ id })
    router.push(`/rooms/${id}/rounds/${data[0].id}`)
  }, [id, participants])
  return (
    <div className="p-4">
      <Header></Header>
      {isHost && <div className="text-center text-2xl">あなたはホストです</div>}
      <div className="text-center text-xs">参加者を待っています...</div>
      <div className="mt-4 text-lg">
        参加者:&nbsp;
        {participants.map((p) => (
          <span key={p.userId}>{p.name},&nbsp;</span>
        ))}
      </div>
      {!isJoined && (
        <div className="flex flex-col items-center">
          <button
            onClick={join}
            className="text-3xl bg-green-500 text-white rounded px-4 py-2 mt-8"
          >
            参加する
          </button>
        </div>
      )}
      {isHost && (
        <div className="flex flex-col items-center">
          <button
            onClick={createRound}
            className="text-3xl bg-green-500 text-white rounded px-4 py-2 mt-8"
          >
            ラウンドをスタート
          </button>
        </div>
      )}
    </div>
  )
}

export default RoomPage
