import { NextPage } from 'next'
import dynamic from 'next/dynamic'
const Top = dynamic(() => import('components/pages'), { ssr: false })

const TopPage: NextPage = () => <Top></Top>

export default TopPage
