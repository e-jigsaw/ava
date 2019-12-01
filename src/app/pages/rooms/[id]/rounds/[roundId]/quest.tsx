import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Quest } from 'components/pages/rooms/[id]/rounds/[roundId]/quest'

const App = dynamic(() => import('components/App'), {
  ssr: false
})

type Props = {
  id: string
  roundId: string
}

const QuestPage: NextPage<Props> = props => (
  <App>
    <Quest {...props} />
  </App>
)

QuestPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string
  }
}

export default QuestPage
