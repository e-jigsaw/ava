import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Round } from 'components/pages/rooms/[id]/rounds/[roundId]'

const App = dynamic(() => import('components/App'), {
  ssr: false
})

type Props = {
  id: string
  roundId: string
}

const RoundPage: NextPage<Props> = ({ id, roundId }) => (
  <App>
    <Round id={id} roundId={roundId}></Round>
  </App>
)

RoundPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string
  }
}

export default RoundPage
