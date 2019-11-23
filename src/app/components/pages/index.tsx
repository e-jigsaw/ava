import firebase from 'firebase/app'
import { Button, Input, Row, Col } from 'antd'
import { useCallback, useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GlobalContext } from '../App'

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
  const createRoom = useCallback(() => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    db.collection('rooms')
      .add({
        host: user.uid
      })
      .then(doc => {
        const userRef = db.collection('users').doc(user.uid)
        doc
          .collection('participants')
          .add({
            user: userRef
          })
          .then(() => {
            router.push(`/rooms/${doc.id}`)
          })
      })
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
      <Button type="primary" onClick={createRoom}>
        ルームを作成
      </Button>
    </>
  ) : (
    <Button type="primary" onClick={login}>
      ログイン
    </Button>
  )
}
