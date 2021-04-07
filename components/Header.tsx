import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
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
    <div>
      {room && !isMatchSite && (
        <Link href={room.site}>
          <button>現場へ</button>
        </Link>
      )}
    </div>
  )
}
