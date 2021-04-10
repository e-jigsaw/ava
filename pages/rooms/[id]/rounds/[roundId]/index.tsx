import { Header } from 'components/Header'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from 'resources'
import { useParticipants, useRound, useUser } from 'resources/hooks'

type Props = {
  id: string
  roundId: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  return {
    props: {
      id: query.id as string,
      roundId: query.roundId as string,
    },
  }
}

const RoundPage: NextPage<Props> = ({ id, roundId }) => {
  const router = useRouter()
  const [user] = useUser()
  const participants = useParticipants(id)
  const round = useRound(roundId)
  const parent = useMemo(() => {
    if (participants.length > 0 && round) {
      return participants[round.parent]
    }
    return null
  }, [participants, round])
  const startElection = useCallback(async () => {
    const party = []
    document.querySelectorAll('input').forEach((input, index) => {
      if (input.checked) {
        party.push(index)
      }
    })
    const { data } = await supabase.from('elections').insert([
      {
        roundId: roundId,
        party,
        by: parent.name,
      },
    ])
    await supabase
      .from('rooms')
      .update({
        site: `/rooms/${id}/rounds/${roundId}/elections/${data[0].id}`,
      })
      .match({ id })
    router.push(`/rooms/${id}/rounds/${roundId}/elections/${data[0].id}`)
  }, [roundId, parent])
  if (parent && user) {
    return (
      <div className="p-4">
        <Header></Header>
        <div className="text-2xl text-center">{parent.name}が選択中...</div>
        {user && parent.userId === user.id && (
          <div>
            {participants.map((p) => (
              <div key={p.id} className="text-lg mb-1">
                <input
                  type="checkbox"
                  id={p.id}
                  className="scale-150 transform"
                ></input>
                <label htmlFor={p.id} className="ml-2">
                  {p.name}
                </label>
              </div>
            ))}
            <div>
              <button
                onClick={startElection}
                className="text-xl bg-green-500 text-white rounded px-4 py-2 mt-8"
              >
                選択したメンバーでクエストに行きたい
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  return <div>loading...</div>
}

export default RoundPage
