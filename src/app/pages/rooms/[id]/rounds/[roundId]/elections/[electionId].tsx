import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Election = dynamic(
  () =>
    import(
      'components/pages/rooms/[id]/rounds/[roundId]/elections/[electionId]'
    ),
  {
    ssr: false
  }
)

export type Props = {
  id: string
  roundId: string
  electionId: string
}

const ElectionPage: NextPage<Props> = props => <Election {...props} />

ElectionPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string,
    electionId: query.electionId as string
  }
}

export default ElectionPage
