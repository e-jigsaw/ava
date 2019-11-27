import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Top } from 'components/pages'

const App = dynamic(() => import('components/App'), { ssr: false })

const TopPage: NextPage = () => {
  return (
    <App>
      <Top></Top>
    </App>
  )
}

export default TopPage
