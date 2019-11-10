import { Button } from 'antd'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const App = dynamic(() => import('../components/App'), { ssr: false })

const TopPage: NextPage = () => {
  return (
    <App>
      <Button type="primary">ルームを作成</Button>
    </App>
  )
}

export default TopPage
