import 'firebase/firestore'
import firebase from 'firebase/app'
import { Button, Row, Col } from 'antd'
import { useEffect, useState, useContext, useMemo, useCallback } from 'react'
import { User, Mission } from 'resources'
import { GlobalContext } from 'components/App'
import { LocationWatcher } from 'components/LocationWatcher'
import { Block } from 'components/Block'

type Props = {
  id: string
  roundId: string
}

export const Quest: React.FC<Props> = ({ id, roundId }) => {
  const { user } = useContext(GlobalContext)
  const [party, setParty] = useState<User[]>([])
  const [mission, setMission] = useState<Mission[]>([])
  const [host, setHost] = useState('')
  useEffect(() => {
    const db = firebase.firestore()
    const room = db.collection('rooms').doc(id)
    room.get().then(doc => {
      const data = doc.data()
      if (data) {
        setHost(data.host)
      }
    })
    const round = room.collection('rounds').doc(roundId)
    round.onSnapshot(async doc => {
      const data = doc.data()
      if (data) {
        const partyRef: firebase.firestore.DocumentData[] = await Promise.all(
          data.party.map(d => d.get())
        )
        const _party = partyRef.map(ref => ref.data())
        setParty(_party)
      }
    })
    round.collection('mission').onSnapshot(async doc => {
      const _mission = doc.docs.map(d => {
        const data = d.data()
        return {
          choice: data.choice,
          uid: data.user.id
        }
      })
      setMission(_mission)
    })
  }, [])
  const isMember = useMemo(() => {
    if (!user) {
      return false
    }
    return party.some(u => u.uid === user.uid)
  }, [user, party])
  const isChoose = useMemo(() => {
    if (!user) {
      return true
    }
    return mission.some(m => m.uid === user.uid)
  }, [user, mission])
  const missionResult = useMemo(
    () =>
      party.length > 0 && party.length === mission.length
        ? {
            success: mission.filter(m => m.choice).length,
            failure: mission.filter(m => !m.choice).length
          }
        : null,
    [party, mission]
  )
  const isHost = useMemo(() => {
    if (!user) {
      return false
    }
    return user.uid === host
  }, [user, host])
  const success = useCallback(() => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    db.collection('rooms')
      .doc(id)
      .collection('rounds')
      .doc(roundId)
      .collection('mission')
      .add({
        user: db.collection('users').doc(user.uid),
        choice: true
      })
  }, [user])
  const failure = useCallback(() => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    db.collection('rooms')
      .doc(id)
      .collection('rounds')
      .doc(roundId)
      .collection('mission')
      .add({
        user: db.collection('users').doc(user.uid),
        choice: false
      })
  }, [user])
  const gotoNextRound = useCallback(async () => {
    const db = firebase.firestore()
    const room = db.collection('rooms').doc(id)
    const doc = await room
      .collection('rounds')
      .doc(roundId)
      .get()
    const data = doc.data()
    if (!data) {
      return
    }
    const next = await room.collection('rounds').add({
      parent: data.parent
    })
    room.update({
      location: `/rooms/${id}/rounds/${next.id}`
    })
  }, [])
  return (
    <div>
      <Block>
        <h1>
          {party.map(user => (
            <span key={user.uid}>{user.name},</span>
          ))}
          のクエスト
        </h1>
      </Block>
      {isMember && !isChoose && (
        <Block>
          <Row>
            <Col span={12} style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={success} size="large">
                成功
              </Button>
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
              <Button type="danger" onClick={failure} size="large">
                失敗
              </Button>
            </Col>
          </Row>
        </Block>
      )}
      {missionResult !== null && (
        <ul>
          <li>成功:&nbsp;{missionResult.success}</li>
          <li>失敗:&nbsp;{missionResult.failure}</li>
        </ul>
      )}
      {missionResult !== null && isHost && (
        <Block center>
          <Button type="primary" onClick={gotoNextRound} size="large">
            次のラウンドへ
          </Button>
        </Block>
      )}
      <LocationWatcher id={id} />
    </div>
  )
}
