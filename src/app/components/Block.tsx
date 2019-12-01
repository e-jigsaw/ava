import { CSSProperties } from 'react'

type Props = {
  center?: boolean
  style?: CSSProperties
}

export const Block: React.FC<Props> = ({ children, center, style }) => (
  <div style={style}>
    <style jsx>{`
      div {
        padding: 4px;
        ${center ? 'text-align: center;' : ''}
      }
    `}</style>
    {children}
  </div>
)
