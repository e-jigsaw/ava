import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from 'resources'
import { useParticipants, useRound, useUser } from 'resources/hooks'
import Link from 'next/link'

type Props = {
  id: string
  roundId: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query
}) => {
  return {
    props: {
      id: query.id as string,
      roundId: query.roundId as string
    }
  }
}

const RoundDigestPage: NextPage<Props> = ({ id, roundId }) => {
  const participants = useParticipants(id)
  const [elections, setElections] = useState([])
  useEffect(() => {
    supabase
      .from('elections')
      .select()
      .eq('roundId', roundId)
      .order('createdAt')
      .then(res => setElections([...res.data]))
  }, [])
  if (participants.length > 0 && elections.length > 0) {
    return (
      <div>
        <div>選出の履歴</div>
        <div>
          {elections.map(e => (
            <Link href={`/rooms/${id}/digest/elections/${e.id}`} key={e.id}>
              <div>
                {e.by}:&nbsp;
                {e.party.map(index => (
                  <span>{participants[index].name},&nbsp;</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }
  return <div>Loading...</div>
}

export default RoundDigestPage
