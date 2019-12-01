import 'firebase/firestore'
import firebase from 'firebase/app'
import { Button, Input, Row, Col } from 'antd'
import { useCallback, useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GlobalContext } from 'components/App'
import { Block } from 'components/Block'

export const Top: React.FC = () => {
  const router = useRouter()
  const { user } = useContext(GlobalContext)
  const login = useCallback(() => {
    firebase.auth().signInAnonymously()
  }, [firebase])
  const [name, setName] = useState('')
  const updateUser = useCallback(() => {
    if (!user) {
      return
    }
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        uid: user.uid,
        name
      })
  }, [firebase, user, name])
  const createRoom = useCallback(async () => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    const doc = await db.collection('rooms').add({
      host: user.uid
    })
    const userRef = db.collection('users').doc(user.uid)
    await doc.collection('participants').add({
      user: userRef,
      order: Math.random()
    })
    router.push(`/rooms/${doc.id}`)
  }, [firebase, user])
  useEffect(() => {
    if (user === null) {
      return
    }
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then(doc => {
        const data = doc.data()
        if (!data) {
          return
        }
        setName(data.name)
      })
  }, [firebase, name, user])
  return user ? (
    <>
      <div>Welcome!</div>
      <Block>
        <Row>
          <Col span={12}>
            <Input
              placeholder="なまえ"
              value={name}
              onChange={event => setName(event.currentTarget.value)}
            ></Input>
          </Col>
          <Col span={4}>
            <Button onClick={updateUser}>更新</Button>
          </Col>
        </Row>
      </Block>
      <Block center>
        <Button type="primary" onClick={createRoom} size="large">
          ルームを作成
        </Button>
      </Block>
    </>
  ) : (
    <Block center>
      <Button type="primary" onClick={login} size="large">
        ログイン
      </Button>
    </Block>
  )
}
