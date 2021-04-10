import { Header } from 'components/Header'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from 'resources'
import { useIsHost, useParticipants, useUser } from 'resources/hooks'

type Props = {
  id: string
  roundId: string
  questId: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  return {
    props: {
      id: query.id as string,
      roundId: query.roundId as string,
      questId: query.questId as string,
    },
  }
}

const QuestPage: NextPage<Props> = ({ id, questId, roundId }) => {
  const [user] = useUser()
  const participants = useParticipants(id)
  const [quest, setQuest] = useState(null)
  const [choices, setChoices] = useState([])
  const party = useMemo(() => {
    if (participants.length > 0 && quest) {
      return quest.party.map((index) => participants[index])
    }
    return []
  }, [participants, quest])
  const isMember = useMemo(() => {
    if (party.length > 0 && user) {
      return party.some((p) => p.userId === user.id)
    }
    return false
  }, [user, party])
  useEffect(() => {
    supabase
      .from('quests')
      .select()
      .eq('id', questId)
      .then((res) => setQuest(res.data[0]))
    supabase
      .from('choices')
      .select()
      .eq('questId', questId)
      .then((res) => setChoices([...res.data]))
    const sub = supabase
      .from(`choices:questId=eq.${questId}`)
      .on('*', () => {
        supabase
          .from('choices')
          .select()
          .eq('questId', questId)
          .then((res) => setChoices([...res.data]))
      })
      .subscribe()
    return () => {
      supabase.removeSubscription(sub)
    }
  }, [])
  const success = useCallback(async () => {
    await supabase.from('choices').insert([
      {
        questId,
        userId: user.id,
        succeed: true,
      },
    ])
  }, [questId, user])
  const failure = useCallback(async () => {
    await supabase.from('choices').insert([
      {
        questId,
        userId: user.id,
        succeed: false,
      },
    ])
  }, [questId, user])
  const isChoose = useMemo(() => {
    if (choices.length > 0 && user) {
      return choices.some((c) => c.userId === user.id)
    }
    return false
  }, [choices, user])
  const isFullfilled = useMemo(() => {
    if (choices.length > 0 && party.length > 0) {
      return choices.length === party.length
    }
    return false
  }, [choices, party])
  const result = useMemo(() => {
    if (isFullfilled) {
      return [
        choices.filter((c) => c.succeed).length,
        choices.filter((c) => !c.succeed).length,
      ]
    }
    return [0, 0]
  }, [isFullfilled])
  const isHost = useIsHost(id)
  const router = useRouter()
  const gotoNextRound = useCallback(async () => {
    const parent = await supabase
      .from('rounds')
      .select('parent')
      .eq('id', roundId)
    const next =
      parent.data[0].parent + 1 === participants.length
        ? 0
        : parent.data[0].parent + 1
    const { data } = await supabase.from('rounds').insert([
      {
        roomId: id,
        parent: next,
      },
    ])
    await supabase
      .from('rooms')
      .update({ site: `/rooms/${id}/rounds/${data[0].id}` })
      .match({ id })
    router.push(`/rooms/${id}/rounds/${data[0].id}`)
  }, [roundId, participants, id])
  return (
    <div className="p-4">
      <Header></Header>
      <div className="text-3xl text-center">
        {party.map((p) => (
          <span key={p.id}>{p.name},&nbsp;</span>
        ))}
        のクエスト
      </div>
      {isMember && !isChoose && (
        <div className="flex justify-around my-8">
          <button
            onClick={success}
            className="bg-green-500 text-3xl text-white rounded px-4 py-2"
          >
            成功
          </button>
          <button
            onClick={failure}
            className="text-3xl text-white rounded px-4 py-2 bg-red-500"
          >
            失敗
          </button>
        </div>
      )}
      {isFullfilled && (
        <div className="mt-2">
          <div>
            <span className="text-xl text-white bg-green-500 p-1 rounded">
              成功
            </span>
            <span className="text-2xl ml-1 p-1">{result[0]}</span>
          </div>
          <div className="mt-1">
            <span className="text-xl text-white bg-red-500 p-1 rounded">
              失敗
            </span>
            <span className="text-2xl ml-1 p-1">{result[1]}</span>
          </div>
        </div>
      )}
      {isFullfilled && isHost && (
        <div className="flex flex-col items-center mt-4">
          <button
            onClick={gotoNextRound}
            className="bg-green-500 text-2xl text-white rounded px-4 py-2"
          >
            次のラウンドへ
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestPage
