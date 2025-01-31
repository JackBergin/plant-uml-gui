export type BoxType = 'class' | 'interface' | 'abstract' | 'enum'
export type ConnectionType = 'association' | 'inheritance' | 'implementation' | 'dependency'
export type LineStyle = 'rigid' | 'curved'

export interface Box {
  id: string
  text: string
  left: number
  top: number
  width: number
  height: number
  type: BoxType
}

export interface Connection {
  id: string
  start: string | null
  end: string | null
  text: string
  type: ConnectionType
  startPosition?: 'top' | 'right' | 'bottom' | 'left'
  endPosition?: 'top' | 'right' | 'bottom' | 'left'
  lineStyle: LineStyle
} 