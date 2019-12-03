import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Round = dynamic(
  () => import('components/pages/rooms/[id]/rounds/[roundId]'),
  {
    ssr: false
  }
)

type Props = {
  id: string
  roundId: string
}

const RoundPage: NextPage<Props> = ({ id, roundId }) => (
  <Round id={id} roundId={roundId}></Round>
)

RoundPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string
  }
}

export default RoundPage
