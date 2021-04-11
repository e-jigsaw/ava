import { Header } from 'components/Header'
import { GetServerSideProps } from 'next'
import { useMemo } from 'react'
import { useParticipants, useUser } from 'resources/hooks'

type Props = {
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  return {
    props: {
      id: query.id as string,
    },
  }
}

const RolePage = ({ id }) => {
  const [user] = useUser()
  const participants = useParticipants(id)
  const participant = useMemo(() => {
    if (user && participants.length > 0) {
      return participants.find((p) => p.userId === user.id)
    }
    return null
  }, [user, participants])
  const reds = useMemo(
    () =>
      participants.filter(
        (p) => p.role === 'red' || p.role === 'killer' || p.role === 'modred'
      ),
    [participants]
  )
  const visibleReds = useMemo(
    () => participants.filter((p) => p.role === 'red' || p.role === 'killer'),
    [participants]
  )
  const merlin = useMemo(
    () => participants.filter((p) => p.role === 'merlin'),
    [participants]
  )
  if (participant) {
    return (
      <div className="p-4">
        {participant.role === 'blue' && (
          <div className="text-gray-400 text-xs">
            あなたは青です。仲間を信じてがんばって
          </div>
        )}
        {participant.role === 'red' && (
          <div className="text-gray-400 text-xs">
            あなたは赤です。バレないようにがんばって
          </div>
        )}
        {participant.role === 'killer' && (
          <div className="text-gray-400 text-xs">
            あなたは暗殺者です。マーリンをさがそう
          </div>
        )}
        {participant.role === 'merlin' && (
          <div className="text-gray-400 text-xs">
            あなたはマーリンです。暗殺者にきをつけて
          </div>
        )}
        {participant.role === 'percival' && (
          <div className="text-gray-400 text-xs">
            あなたはパーシバルです。マーリンを助けてあげて
          </div>
        )}
        {(participant.role === 'red' || participant.role === 'killer') && (
          <div className="text-gray-400 text-xs">
            仲間:&nbsp;
            {reds.map((r) => (
              <span key={r.id}>{r.name},</span>
            ))}
          </div>
        )}
        {participant.role === 'merlin' && (
          <div className="text-gray-400 text-xs">
            敵:&nbsp;
            {visibleReds.map((r) => (
              <span key={r.id}>{r.name},</span>
            ))}
          </div>
        )}
        {participant.role === 'percival' && (
          <div className="text-gray-400 text-xs">
            マーリン:&nbsp;
            {merlin.map((m) => (
              <span key={m.id}>{m.name},</span>
            ))}
          </div>
        )}
        <Header></Header>
      </div>
    )
  }
  return (
    <div className="p-4">
      loading...
      <Header></Header>
    </div>
  )
}

export default RolePage
