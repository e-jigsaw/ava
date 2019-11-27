import 'firebase/firestore'
import firebase from 'firebase/app'
import { Switch, Button } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useContext } from 'react'
import { Maybe } from '../../../../../next-env'
import { User } from 'components/pages/rooms/[id]'
import { GlobalContext } from 'components/App'

type Props = {
  id: string
  roundId: string
}

export const Round: React.FC<Props> = ({ id, roundId }) => {
  const router = useRouter()
  const { user } = useContext(GlobalContext)
  const [participants, setParticipants] = useState<User[]>([])
  const [round, setRound] = useState<Maybe<firebase.firestore.DocumentData>>(
    null
  )
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
  const startElection = useCallback(() => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    const userRefs = candidates.map(id => db.collection('users').doc(id))
    db.collection('rooms')
      .doc(id)
      .collection('rounds')
      .doc(roundId)
      .collection('elections')
      .add({
        party: userRefs,
        owner: db.collection('users').doc(user.uid)
      })
      .then(doc =>
        router.push(`/rooms/${id}/rounds/${roundId}/elections/${doc.id}`)
      )
  }, [candidates])
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
      .onSnapshot(doc => {
        const data = doc.data()
        if (data) {
          setRound(data)
        }
      })
  }, [])
  console.log(round, participants, candidates)
  return (
    <div>
      <div>パーティを選択</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {participants.map(participant => (
          <div key={participant.uid}>
            <div>{participant.name}</div>
            <div>
              <Switch
                onChange={updateCandidates(participant)}
                checked={candidates.some(c => c === participant.uid)}
              ></Switch>
            </div>
          </div>
        ))}
      </div>
      <Button type="primary" onClick={startElection}>
        クエストに行きたい
      </Button>
    </div>
  )
}
