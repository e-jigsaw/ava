import { Header } from 'components/Header'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from 'resources'
import { useIsHost, useParticipants, useUser } from 'resources/hooks'

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  return {
    props: {
      id: query.id as string,
      roundId: query.roundId as string,
      electionId: query.electionId as string,
    },
  }
}

export type Props = {
  id: string
  roundId: string
  electionId: string
}

const ElectionPage: NextPage<Props> = ({ id, roundId, electionId }) => {
  const router = useRouter()
  const [user] = useUser()
  const [election, setElection] = useState(null)
  const [votes, setVotes] = useState([])
  const participants = useParticipants(id)
  useEffect(() => {
    supabase
      .from('elections')
      .select()
      .eq('id', electionId)
      .then((res) => setElection(res.data[0]))
    supabase
      .from('votes')
      .select()
      .eq('electionId', electionId)
      .then((res) => setVotes([...res.data]))
    const sub = supabase
      .from(`votes:electionId=eq.${electionId}`)
      .on('*', () => {
        supabase
          .from('votes')
          .select()
          .eq('electionId', electionId)
          .then((res) => setVotes([...res.data]))
      })
      .subscribe()
    return () => {
      supabase.removeSubscription(sub)
    }
  }, [])
  const agree = useCallback(async () => {
    await supabase.from('votes').insert([
      {
        userId: user.id,
        electionId,
        agreed: true,
      },
    ])
  }, [user, electionId])
  const disagree = useCallback(async () => {
    await supabase.from('votes').insert([
      {
        userId: user.id,
        electionId,
        agreed: false,
      },
    ])
  }, [user, electionId])
  const isVoted = useMemo(() => {
    if (user) {
      return votes.some((vote) => vote.userId === user.id)
    }
    return false
  }, [votes, user])
  const isFullfilled = useMemo(
    () =>
      participants.length > 0 ? participants.length === votes.length : false,
    [participants, votes]
  )
  const participantWithVotes = useMemo(
    () =>
      participants.map((p) => ({
        ...p,
        isVoted: votes.some((vote) => vote.userId === p.userId),
      })),
    [participants, votes]
  )
  const participantWithResults = useMemo(() => {
    if (isFullfilled) {
      return participants.map((p) => ({
        ...p,
        agreed: votes.find((vote) => vote.userId === p.userId).agreed,
      }))
    }
    return []
  }, [participants, votes])
  const isHost = useIsHost(id)
  const isWin = useMemo(() => {
    if (isFullfilled && votes.length > 0 && participants.length > 0) {
      const agrees = votes.filter((v) => v.agreed)
      return agrees.length > participants.length / 2
    }
    return false
  }, [participants, votes])
  const gotoNextElection = useCallback(async () => {
    const prev = await supabase
      .from('rounds')
      .select('parent')
      .eq('id', roundId)
    const next =
      prev.data[0].parent + 1 === participants.length
        ? 0
        : prev.data[0].parent + 1
    await supabase
      .from('rounds')
      .update({ parent: next })
      .match({ id: roundId })
    await supabase
      .from('rooms')
      .update({ site: `/rooms/${id}/rounds/${roundId}` })
      .match({ id })
    router.push(`/rooms/${id}/rounds/${roundId}`)
  }, [participants, roundId])
  const gotoQuest = useCallback(async () => {
    const { data } = await supabase.from('quests').insert([
      {
        party: election.party,
        roundId,
      },
    ])
    await supabase
      .from('rooms')
      .update({ site: `/rooms/${id}/rounds/${roundId}/quests/${data[0].id}` })
      .match({ id })
    router.push(`/rooms/${id}/rounds/${roundId}/quests/${data[0].id}`)
  }, [election, roundId])
  if (election && participants.length > 0) {
    return (
      <div className="p-4">
        <Header></Header>
        <div>提案者:&nbsp;{election.by}</div>
        <div>
          パーティ:&nbsp;
          {election.party.map((index) => {
            const member = participants[index]
            return <span key={member.id}>{member.name},&nbsp;</span>
          })}
        </div>
        {!isVoted ? (
          <div className="flex justify-around my-8">
            <button
              onClick={agree}
              className="bg-green-500 text-3xl text-white rounded px-4 py-2"
            >
              賛成
            </button>
            <button
              onClick={disagree}
              className="text-3xl text-white rounded px-4 py-2 bg-red-500"
            >
              反対
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center my-8">
            <span className="text-3xl text-white rounded px-4 py-2 bg-gray-400">
              投票済
            </span>
          </div>
        )}
        {isFullfilled
          ? participantWithResults.map((p) => (
              <div key={p.id} className="my-2">
                {p.agreed ? (
                  <span className="rounded text-white p-1 bg-green-500">
                    賛成
                  </span>
                ) : (
                  <span className="rounded text-white p-1 bg-red-500">
                    反対
                  </span>
                )}
                &nbsp;-&nbsp;{p.name}
              </div>
            ))
          : participantWithVotes.map((p) => (
              <div key={p.id} className="my-2">
                {p.isVoted ? (
                  <span className="rounded text-white p-1 bg-yellow-300">
                    投票済
                  </span>
                ) : (
                  <span className="bg-gray-500 rounded text-white p-1">
                    未投票
                  </span>
                )}
                &nbsp;-&nbsp;{p.name}
              </div>
            ))}
        {isFullfilled && isHost && isWin && (
          <div className="flex flex-col items-center">
            <button
              onClick={gotoQuest}
              className="text-3xl bg-green-500 text-white rounded px-4 py-2 mt-8"
            >
              クエストへ
            </button>
          </div>
        )}
        {isFullfilled && isHost && !isWin && (
          <div className="flex flex-col items-center">
            <button
              onClick={gotoNextElection}
              className="text-3xl bg-green-500 text-white rounded px-4 py-2 mt-8"
            >
              次の投票へ
            </button>
          </div>
        )}
      </div>
    )
  }
  return <div>Loading...</div>
}

export default ElectionPage
