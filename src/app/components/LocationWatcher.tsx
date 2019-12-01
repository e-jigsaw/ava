import 'firebase/firestore'
import firebase from 'firebase/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

type Props = {
  id: string
}

export const LocationWatcher: React.FC<Props> = ({ id }) => {
  const router = useRouter()
  useEffect(() => {
    firebase
      .firestore()
      .collection('rooms')
      .doc(id)
      .onSnapshot(doc => {
        const data = doc.data()
        if (data) {
          if (data.location) {
            if (location.pathname !== data.location) {
              router.push(data.location)
            }
          }
        }
      })
  }, [])
  return null
}
