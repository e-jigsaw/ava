import { NextPage } from 'next'
import { useCallback, useState, useEffect } from 'react'
import { supabase } from 'resources'
import { User } from '@supabase/supabase-js'

const TopPage: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const login = useCallback(async () => {
    await supabase.auth.signIn({
      email
    })
    alert('マジックリンクメールを送信しました')
  }, [email])
  useEffect(() => {
    const u = supabase.auth.user()
    if (u) {
      setUser(u)
      setName(u.user_metadata.name ?? '')
    }
  }, [])
  const [name, setName] = useState('')
  const updateUser = useCallback(async () => {
    if (!user) {
      return
    }
    await supabase.auth.update({
      data: {
        name
      }
    })
    alert('保存しました')
  }, [user, name])
  return user ? (
    <div>
      <div>Welcome!</div>
      <div>
        <input
          placeholder="なまえ"
          value={name}
          onChange={event => setName(event.currentTarget.value)}
        ></input>
        <button onClick={updateUser}>保存</button>
      </div>
    </div>
  ) : (
    <div>
      <input
        value={email}
        onChange={event => setEmail(event.currentTarget.value)}
      ></input>
      <button onClick={login}>ログイン</button>
    </div>
  )
}

export default TopPage
