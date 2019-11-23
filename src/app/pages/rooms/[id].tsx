import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Room } from '../../components/pages/rooms/[id]'

const App = dynamic(() => import('../../components/App'), { ssr: false })

type Props = {
  id: string
}

const RoomPage: NextPage<Props> = ({ id }) => (
  <App>
    <Room id={id}></Room>
  </App>
)

RoomPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string
  }
}

export default RoomPage
