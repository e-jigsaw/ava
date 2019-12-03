import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Quest = dynamic(
  () => import('components/pages/rooms/[id]/rounds/[roundId]/quest'),
  {
    ssr: false
  }
)

type Props = {
  id: string
  roundId: string
}

const QuestPage: NextPage<Props> = props => <Quest {...props} />

QuestPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string
  }
}

export default QuestPage
