import { NextPage } from 'next'
import { useCallback, useState, useEffect } from 'react'
import { supabase } from 'resources'
import { User } from '@supabase/supabase-js'

const TopPage: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const login = useCallback(async () => {
    await supabase.auth.signIn({
      email,
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
        name,
      },
    })
    alert('保存しました')
  }, [user, name])
  return user ? (
    <div className="p-4">
      <div className="text-center text-4xl pb-4">Welcome!</div>
      <div>
        <div>名前を入力して保存してね</div>
        <input
          placeholder="なまえ"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          className="border border-gray-500 text-2xl mr-2 rounded p-1"
        ></input>
        <button
          onClick={updateUser}
          className="text-2xl border border-gray-500 rounded p-1"
        >
          保存
        </button>
      </div>
    </div>
  ) : (
    <div className="p-4">
      <div>メアドを入力してね</div>
      <div>
        <input
          placeholder="merlin@arthur.com"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          className="border border-gray-500 text-2xl mr-2 rounded p-1"
        ></input>
        <button
          onClick={login}
          className="text-2xl border border-gray-500 rounded p-1"
        >
          ログイン
        </button>
      </div>
    </div>
  )
}

export default TopPage
