import { NextPage } from 'next'

type Props = {
  id: string
  roundId: string
  electionId: string
}

const ElectionPage: NextPage<Props> = () => <div>yoyo</div>

ElectionPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string,
    roundId: query.roundId as string,
    electionId: query.electionId as string
  }
}

export default ElectionPage
