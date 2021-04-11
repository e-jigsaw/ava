import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useMemo, useCallback } from 'react'
import { supabase } from 'resources'
import { useIsHost, useParticipants, useUser } from 'resources/hooks'
import { Header } from 'components/Header'
import { range, shuffle } from 'lodash'

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
    const isPercival = (document.getElementById('percival') as HTMLInputElement)
      .checked
    const isModred = (document.getElementById('modred') as HTMLInputElement)
      .checked
    switch (participants.length) {
      case 5:
      case 6: {
        let [red0, red1, ...blues] = shuffle(range(participants.length))
        await supabase
          .from('participants')
          .update({ role: 'killer' })
          .match({ id: participants[red0].id })
        if (isModred) {
          await supabase
            .from('participants')
            .update({ role: 'modred' })
            .match({ id: participants[red1].id })
        } else {
          await supabase
            .from('participants')
            .update({ role: 'red' })
            .match({ id: participants[red1].id })
        }
        await supabase
          .from('participants')
          .update({ role: 'merlin' })
          .match({ id: participants[blues[0]].id })
        if (isPercival) {
          await supabase
            .from('participants')
            .update({ role: 'percival' })
            .match({ id: participants[blues[1]].id })
        }
        break
      }
      case 7:
      case 8:
      case 9: {
        let [red0, red1, red2, ...blues] = shuffle(range(participants.length))
        await supabase
          .from('participants')
          .update({ role: 'killer' })
          .match({ id: participants[red0].id })
        if (isModred) {
          await supabase
            .from('participants')
            .update({ role: 'modred' })
            .match({ id: participants[red1].id })
        } else {
          await supabase
            .from('participants')
            .update({ role: 'red' })
            .match({ id: participants[red1].id })
        }
        await supabase
          .from('participants')
          .update({ role: 'red' })
          .match({ id: participants[red2].id })
        await supabase
          .from('participants')
          .update({ role: 'merlin' })
          .match({ id: participants[blues[0]].id })
        if (isPercival) {
          await supabase
            .from('participants')
            .update({ role: 'percival' })
            .match({ id: participants[blues[1]].id })
        }
        break
      }
      case 10: {
        // TODO
        break
      }
    }
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
          <div>
            <input type="checkbox" id="percival"></input>
            <label htmlFor="percival">パーシバルを有効化</label>
          </div>
          <div>
            <input type="checkbox" id="modred"></input>
            <label htmlFor="modred">モードレッドを有効化</label>
          </div>
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
