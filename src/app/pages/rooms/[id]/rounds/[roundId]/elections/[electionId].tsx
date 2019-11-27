import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Election } from 'components/pages/rooms/[id]/rounds/[roundId]/elections/[electionId]'

const App = dynamic(() => import('components/App'), {
  ssr: false
})

export type Props = {
  id: string
  roundId: string
  electionId: string
}

const ElectionPage: NextPage<Props> = props => (
  <App>
    <Election {...props} />
  </App>
)

ElectionPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string,
    electionId: query.electionId as string
  }
}

export default ElectionPage
