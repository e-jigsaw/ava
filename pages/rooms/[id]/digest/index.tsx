import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import { supabase } from 'resources'
import Link from 'next/link'

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

const DigestPage: NextPage<Props> = ({ id }) => {
  const [rounds, setRounds] = useState([])
  useEffect(() => {
    supabase
      .from('rounds')
      .select()
      .eq('roomId', id)
      .order('createdAt')
      .then(res => setRounds([...res.data]))
  }, [])
  console.log(rounds)
  return (
    <div>
      <div>ラウンドの履歴</div>
      <div>
        {rounds.map((round, index) => (
          <Link key={round.id} href={`/rooms/${id}/digest/rounds/${round.id}`}>
            <div>{index + 1}ラウンド</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DigestPage
