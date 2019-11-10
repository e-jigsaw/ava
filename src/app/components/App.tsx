import 'firebase/firestore'
import firebase from 'firebase/app'
import { useEffect } from 'react'

const App: React.FC = ({ children }) => {
  useEffect(() => {
    firebase.initializeApp({
      apiKey: 'AIzaSyCOOMqbpsG2MsexWsQRh_UP-eYMtVpz4pc',
      authDomain: 'kbystk-ava.firebaseapp.com',
      projectId: 'kbystk-ava'
    })
    const db = firebase.firestore()
    console.log(db)
  }, [])
  return <div>{children}</div>
}

export default App
