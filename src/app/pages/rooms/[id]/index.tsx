import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Room = dynamic(() => import('components/pages/rooms/[id]'), {
  ssr: false
})

type Props = {
  id: string
}

const RoomPage: NextPage<Props> = ({ id }) => <Room id={id}></Room>

RoomPage.getInitialProps = async ({ query }) => {
  return {
    id: query.id as string
  }
}

export default RoomPage
