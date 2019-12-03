import 'firebase/auth'
import firebase from 'firebase/app'
import App from 'next/app'
import { createContext } from 'react'
import { Digest } from 'resources'

type GlobalContextState = {
  user: firebase.User | null
  digests: Digest[]
  setDigests(digests: Digest[]): void
}

export const GlobalContext = createContext<GlobalContextState>({
  user: null,
  digests: [],
  setDigests: () => {}
})

export default class extends App {
  public state: GlobalContextState = {
    user: null,
    digests: [],
    setDigests: () => {}
  }

  componentDidMount() {
    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        apiKey: 'AIzaSyCOOMqbpsG2MsexWsQRh_UP-eYMtVpz4pc',
        authDomain: 'kbystk-ava.firebaseapp.com',
        projectId: 'kbystk-ava'
      })
    }
    firebase.auth().onAuthStateChanged(u => {
      if (u !== null) {
        this.setState({ user: u })
      } else {
        if (location.pathname !== '/') {
          location.href = '/'
        }
      }
    })
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <GlobalContext.Provider
        value={{ ...this.state, setDigests: this.setDigests }}
      >
        <Component {...pageProps} />
      </GlobalContext.Provider>
    )
  }

  public setDigests = (digests: Digest[]) => this.setState({ digests })
}
