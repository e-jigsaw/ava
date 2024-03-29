import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useRoom } from 'resources/hooks'
import Link from 'next/link'

export const Header = () => {
  const router = useRouter()
  const room = useRoom(router.query.id)
  const isMatchSite = useMemo(() => {
    if (room) {
      return router.asPath === room.site
    }
    return false
  }, [router.asPath, room])
  return (
    <div className="p-4 flex flex-col items-center fixed bottom-0 left-0 w-full">
      {room && !isMatchSite && (
        <Link href={room.site}>
          <button className="text-2xl bg-green-500 text-white rounded py-2 px-8">
            現場へ
          </button>
        </Link>
      )}
      <Link href={`/rooms/${router.query.id}/role`}>
        <button className="absolute right-2 bottom-4 rounded bg-yellow-200 p-3">
          役職
        </button>
      </Link>
    </div>
  )
}
