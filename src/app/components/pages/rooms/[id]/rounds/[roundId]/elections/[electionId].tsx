import 'firebase/firestore'
import firebase from 'firebase/app'
import { Button, Row, Col } from 'antd'
import { useEffect, useState, useCallback, useContext, useMemo } from 'react'
import { Props } from 'pages/rooms/[id]/rounds/[roundId]/elections/[electionId]'
import { User, Maybe, Vote } from 'resources'
import { GlobalContext } from 'components/App'
import { LocationWatcher } from 'components/LocationWatcher'
import { Block } from 'components/Block'

export const Election: React.FC<Props> = ({ id, roundId, electionId }) => {
  const { user } = useContext(GlobalContext)
  const [owner, setOwner] = useState<Maybe<User>>(null)
  const [party, setParty] = useState<User[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [participantCount, setParticipantCount] = useState(-1)
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
    room
      .collection('participants')
      .get()
      .then(doc => setParticipantCount(doc.size))
    const election = room
      .collection('rounds')
      .doc(roundId)
      .collection('elections')
      .doc(electionId)
    election.get().then(async doc => {
      const data = doc.data()
      if (data) {
        const _owner = await data.owner.get()
        setOwner(_owner.data())
        const partyRefs: firebase.firestore.DocumentData[] = await Promise.all(
          data.party.map(p => p.get())
        )
        const _party = partyRefs.map(r => r.data())
        setParty(_party)
      }
    })
    election.collection('votes').onSnapshot(async snapshot => {
      const _votes = await Promise.all(
        snapshot.docs.map(async doc => {
          const data = doc.data()
          if (data) {
            const voter = await data.voter.get()
            return {
              voter: voter.data(),
              voting: data.voting
            }
          }
        })
      )
      setVotes(_votes as Vote[])
    })
  }, [])
  const isIvoted = useMemo(() => {
    if (!user) {
      return false
    }
    return votes.some(vote => vote.voter.uid === user.uid)
  }, [votes])
  const agree = useCallback(() => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    const userRef = db.collection('users').doc(user.uid)
    db.collection('rooms')
      .doc(id)
      .collection('rounds')
      .doc(roundId)
      .collection('elections')
      .doc(electionId)
      .collection('votes')
      .add({
        voting: true,
        voter: userRef
      })
  }, [user])
  const disagree = useCallback(() => {
    if (!user) {
      return
    }
    const db = firebase.firestore()
    const userRef = db.collection('users').doc(user.uid)
    db.collection('rooms')
      .doc(id)
      .collection('rounds')
      .doc(roundId)
      .collection('elections')
      .doc(electionId)
      .collection('votes')
      .add({
        voting: false,
        voter: userRef
      })
  }, [user])
  const isHost = useMemo(() => {
    if (!user) {
      return false
    }
    return user.uid === host
  }, [user, host])
  const isFullfill = useMemo(() => votes.length === participantCount, [
    votes,
    participantCount
  ])
  const isWin = useMemo(() => {
    if (!isFullfill) {
      return false
    }
    const agrees = votes.reduce(
      (prev, curr) => (curr.voting ? prev + 1 : prev),
      0
    )
    return agrees > participantCount / 2
  }, [isFullfill, votes])
  const gotoNextElection = useCallback(() => {
    firebase
      .firestore()
      .collection('rooms')
      .doc(id)
      .update({
        location: `/rooms/${id}/rounds/${roundId}`
      })
  }, [id, roundId])
  const gotoQuest = useCallback(async () => {
    const db = firebase.firestore()
    const partyRef = party.map(user => db.collection('users').doc(user.uid))
    const room = db.collection('rooms').doc(id)
    await room
      .collection('rounds')
      .doc(roundId)
      .update({
        party: partyRef
      })
    room.update({
      location: `/rooms/${id}/rounds/${roundId}/quest`
    })
  }, [party])
  return (
    <div>
      <Block>起案者:&nbsp;{owner ? owner.name : ''}</Block>
      <Block style={{ fontSize: '2rem' }}>
        パーティ:&nbsp;
        {party.map(member => (
          <span key={member.uid}>{member.name},&nbsp;</span>
        ))}
      </Block>
      {!isIvoted && (
        <Block>
          <Row>
            <Col span={12} style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={agree} size="large">
                賛成
              </Button>
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
              <Button type="danger" onClick={disagree} size="large">
                反対
              </Button>
            </Col>
          </Row>
        </Block>
      )}
      {isFullfill && (
        <>
          <ul>
            {votes.map(vote => (
              <li key={vote.voter.uid}>
                {vote.voter.name}:&nbsp;{vote.voting ? '賛成' : '反対'}
              </li>
            ))}
          </ul>
          {isHost && isWin && (
            <Block center>
              <Button type="primary" onClick={gotoQuest} size="large">
                クエストへ
              </Button>
            </Block>
          )}
          {isHost && !isWin && (
            <Block center>
              <Button type="primary" onClick={gotoNextElection} size="large">
                次の投票へ
              </Button>
            </Block>
          )}
        </>
      )}
      <LocationWatcher id={id} />
    </div>
  )
}
