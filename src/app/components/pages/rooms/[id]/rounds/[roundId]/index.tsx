import 'firebase/firestore'
import firebase from 'firebase/app'
import { Switch, Button, Row, Col } from 'antd'
import { useEffect, useState, useCallback, useContext } from 'react'
import { Maybe, User, Participant } from 'resources'
import { GlobalContext } from 'components/App'
import { LocationWatcher } from 'components/LocationWatcher'
import { Block } from 'components/Block'

type Props = {
  id: string
  roundId: string
}

export const Round: React.FC<Props> = ({ id, roundId }) => {
  const { user } = useContext(GlobalContext)
  const [participants, setParticipants] = useState<User[]>([])
  const [parent, setParent] = useState<Maybe<Participant>>(null)
  const [candidates, setCandidates] = useState<string[]>([])
  const updateCandidates = useCallback(
    (candidate: User) => (checked: boolean) => {
      if (checked) {
        setCandidates([...candidates, candidate.uid])
      } else {
        setCandidates(candidates.filter(id => id !== candidate.uid))
      }
    },
    [candidates]
  )
  const startElection = useCallback(async () => {
    if (!user || !parent) {
      return
    }
    const db = firebase.firestore()
    const userRefs = candidates.map(id => db.collection('users').doc(id))
    const roomRef = db.collection('rooms').doc(id)
    let nextParentRef = await roomRef
      .collection('participants')
      .where('order', '>', parent.order)
      .orderBy('order')
      .limit(1)
      .get()
    if (nextParentRef.docs.length === 0) {
      nextParentRef = await roomRef
        .collection('participants')
        .orderBy('order')
        .limit(1)
        .get()
    }
    const roundRef = roomRef.collection('rounds').doc(roundId)
    await roundRef.set({
      parent: nextParentRef.docs[0].data()
    })
    const doc = await roundRef.collection('elections').add({
      party: userRefs,
      owner: db.collection('users').doc(user.uid)
    })
    roomRef.update({
      location: `/rooms/${id}/rounds/${roundId}/elections/${doc.id}`
    })
  }, [candidates, user, parent])
  useEffect(() => {
    const db = firebase.firestore()
    db.collection('rooms')
      .doc(id)
      .collection('participants')
      .get()
      .then(async q => {
        const refs = await Promise.all(q.docs.map(doc => doc.data().user.get()))
        const ps = refs.map(ref => ref.data())
        setParticipants(ps)
      })
    db.collection('rooms')
      .doc(id)
      .collection('rounds')
      .doc(roundId)
      .onSnapshot(async doc => {
        const data = doc.data()
        if (data) {
          const user = await data.parent.user.get()
          setParent({
            ...data.parent,
            user: user.data()
          })
        }
      })
  }, [])
  return (
    <div>
      <Block>
        <h1>{parent && `${parent.user.name}が選択中`}</h1>
      </Block>
      {user && parent ? (
        user.uid === parent.user.uid ? (
          <>
            <Block center>パーティを選択</Block>
            <Block>
              <Row>
                {participants.map(participant => (
                  <Col span={6} key={participant.uid}>
                    <div>{participant.name}</div>
                    <div>
                      <Switch
                        onChange={updateCandidates(participant)}
                        checked={candidates.some(c => c === participant.uid)}
                      ></Switch>
                    </div>
                  </Col>
                ))}
              </Row>
            </Block>
            <Block center style={{ marginTop: '3rem' }}>
              <Button type="primary" onClick={startElection} size="large">
                クエストに行きたい
              </Button>
            </Block>
          </>
        ) : null
      ) : null}
      <LocationWatcher id={id} />
    </div>
  )
}
