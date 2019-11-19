import 'firebase/firestore'
import 'firebase/auth'
import firebase from 'firebase/app'
import { useRouter } from 'next/router'
import { useEffect, useState, createContext } from 'react'

type GlobalContextState = {
  user: firebase.User | null
}

export const GlobalContext = createContext<GlobalContextState>({
  user: null
})

const App: React.FC = ({ children }) => {
  const router = useRouter()
  const [user, setUser] = useState<firebase.User | null>(null)
  useEffect(() => {
    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        apiKey: 'AIzaSyCOOMqbpsG2MsexWsQRh_UP-eYMtVpz4pc',
        authDomain: 'kbystk-ava.firebaseapp.com',
        projectId: 'kbystk-ava'
      })
    }
    firebase.auth().onAuthStateChanged(u => {
      if (u !== null) {
        setUser(u)
      } else {
        if (location.pathname !== '/') {
          router.push('/')
        }
      }
    })
  }, [])
  return (
    <GlobalContext.Provider value={{ user }}>{children}</GlobalContext.Provider>
  )
}

export default App
