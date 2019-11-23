import 'firebase/firestore'
import 'firebase/auth'
import firebase from 'firebase/app'
import { useEffect, useState, createContext } from 'react'

type GlobalContextState = {
  user: firebase.User | null
}

export const GlobalContext = createContext<GlobalContextState>({
  user: null
})

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: 'AIzaSyCOOMqbpsG2MsexWsQRh_UP-eYMtVpz4pc',
    authDomain: 'kbystk-ava.firebaseapp.com',
    projectId: 'kbystk-ava'
  })
}

const App: React.FC = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null)
  useEffect(() => {
    firebase.auth().onAuthStateChanged(u => {
      if (u !== null) {
        setUser(u)
      } else {
        if (location.pathname !== '/') {
          location.href = '/'
        }
      }
    })
  }, [])
  return (
    <GlobalContext.Provider value={{ user }}>{children}</GlobalContext.Provider>
  )
}

export default App
