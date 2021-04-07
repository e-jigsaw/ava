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
  query
}) => {
  return {
    props: {
      id: query.id as string,
      roundId: query.roundId as string,
      questId: query.questId as string
    }
  }
}

const QuestPage: NextPage<Props> = ({ id, questId, roundId }) => {
  const [user] = useUser()
  const participants = useParticipants(id)
  const [quest, setQuest] = useState(null)
  const [choices, setChoices] = useState([])
  const party = useMemo(() => {
    if (participants.length > 0 && quest) {
      return quest.party.map(index => participants[index])
    }
    return []
  }, [participants, quest])
  const isMember = useMemo(() => {
    if (party.length > 0 && user) {
      return party.some(p => p.userId === user.id)
    }
    return false
  }, [user, party])
  useEffect(() => {
    supabase
      .from('quests')
      .select()
      .eq('id', questId)
      .then(res => setQuest(res.data[0]))
    supabase
      .from('choices')
      .select()
      .eq('questId', questId)
      .then(res => setChoices([...res.data]))
    const sub = supabase
      .from(`choices:questId=eq.${questId}`)
      .on('*', () => {
        supabase
          .from('choices')
          .select()
          .eq('questId', questId)
          .then(res => setChoices([...res.data]))
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
        succeed: true
      }
    ])
  }, [questId, user])
  const failure = useCallback(async () => {
    await supabase.from('choices').insert([
      {
        questId,
        userId: user.id,
        succeed: false
      }
    ])
  }, [questId, user])
  const isChoose = useMemo(() => {
    if (choices.length > 0 && user) {
      choices.some(c => c.userId === user.id)
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
        choices.filter(c => c.succeed).length,
        choices.filter(c => !c.succeed).length
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
        parent: next
      }
    ])
    router.push(`/rooms/${id}/rounds/${data[0].id}`)
  }, [roundId, participants, id])
  return (
    <div>
      <div>
        {party.map(p => (
          <span key={p.id}>{p.name},&nbsp;</span>
        ))}
        のクエスト
      </div>
      {isMember && isChoose && (
        <div>
          <button onClick={success}>成功</button>
          <button onClick={failure}>失敗</button>
        </div>
      )}
      {isFullfilled && (
        <div>
          <div>成功:&nbsp;{result[0]}</div>
          <div>失敗:&nbsp;{result[1]}</div>
        </div>
      )}
      {isFullfilled && isHost && (
        <div>
          <button onClick={gotoNextRound}>次のラウンドへ</button>
        </div>
      )}
    </div>
  )
}

export default QuestPage
