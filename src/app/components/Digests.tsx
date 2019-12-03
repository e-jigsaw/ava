import 'firebase/firestore'
import firebase from 'firebase/app'
import { Button, Icon, Drawer, Timeline, Tag } from 'antd'
import { useState, useCallback, useContext } from 'react'
import { Digest } from 'resources'
import { GlobalContext } from 'pages/_app'

const { Item } = Timeline

type Props = {
  id: string
}

export const Digests: React.FC<Props> = ({ id }) => {
  const { digests, setDigests } = useContext(GlobalContext)
  const [isOpen, setIsOpen] = useState(false)
  const toggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])
  const updateDigest = useCallback(async () => {
    const doc = await firebase
      .firestore()
      .collection('rooms')
      .doc(id)
      .collection('digests')
      .orderBy('createdAt', 'desc')
      .get()
    const _digests = doc.docs.map(digest => digest.data() as Digest)
    setDigests(_digests)
  }, [digests])
  return (
    <>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
        <Button shape="circle" size="large" onClick={toggle}>
          <Icon type="history" />
        </Button>
      </div>
      <Drawer visible={isOpen} onClose={toggle} placement="bottom">
        <Button onClick={updateDigest} style={{ marginBottom: '1rem' }}>
          更新
        </Button>
        <Timeline>
          {digests.map(digest => {
            switch (digest.type) {
              case 'accepted': {
                return (
                  <Item key={digest.createdAt}>
                    <div>
                      <Tag color="green">承認</Tag>
                      {digest.party}
                    </div>
                    <div>
                      <span style={{ marginRight: '1rem' }}>
                        <Tag color="blue">提案</Tag>
                        {digest.owner}
                      </span>
                      <span style={{ marginRight: '1rem' }}>
                        <Tag color="cyan">賛成</Tag>
                        {digest.agreed}
                      </span>
                      <Tag color="magenta">反対</Tag>
                      {digest.disagreed}
                    </div>
                  </Item>
                )
              }
              case 'rejected': {
                return (
                  <Item key={digest.createdAt}>
                    <div>
                      <Tag color="red">却下</Tag>
                      {digest.party}
                    </div>
                    <div>
                      <span style={{ marginRight: '1rem' }}>
                        <Tag color="blue">提案</Tag>
                        {digest.owner}
                      </span>
                      <span style={{ marginRight: '1rem' }}>
                        <Tag color="cyan">賛成</Tag>
                        {digest.agreed}
                      </span>
                      <Tag color="magenta">反対</Tag>
                      {digest.disagreed}
                    </div>
                  </Item>
                )
              }
              case 'quest': {
                return (
                  <Item key={digest.createdAt} color="green">
                    <div>
                      {digest.failure === 0 ? (
                        <Tag color="green">成功</Tag>
                      ) : (
                        <Tag color="red">失敗</Tag>
                      )}
                      {digest.party}
                    </div>
                    <div>
                      <span style={{ marginRight: '1rem' }}>
                        <Tag color="cyan">成功</Tag>
                        {digest.success}
                      </span>
                      <Tag color="magenta">失敗</Tag>
                      {digest.failure}
                    </div>
                  </Item>
                )
              }
            }
          })}
        </Timeline>
      </Drawer>
    </>
  )
}
