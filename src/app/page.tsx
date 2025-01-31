'use client'

import { useState, useRef, useEffect } from "react"
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTheme } from './theme-context'
import { Box, Connection, BoxType, ConnectionType } from './types'
import { FiSun, FiMoon, FiBox, FiLink, FiCopy } from 'react-icons/fi'

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [activeConnection, setActiveConnection] = useState<string | null>(null)
  const [boxText, setBoxText] = useState('')
  const [selectedBoxType, setSelectedBoxType] = useState<BoxType>('class')
  const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionType>('association')

  type ConnectionPoint = {
    position: 'top' | 'right' | 'bottom' | 'left'
    style: React.CSSProperties
    coords: { x: number; y: number }
  }

  const connectionPoints: ConnectionPoint[] = [
    { position: 'top', style: { top: '-6px', left: '50%', transform: 'translate(-50%, -50%)' }, coords: { x: 0.5, y: 0 } },
    { position: 'right', style: { top: '50%', right: '-6px', transform: 'translate(50%, -50%)' }, coords: { x: 1, y: 0.5 } },
    { position: 'bottom', style: { bottom: '-6px', left: '50%', transform: 'translate(-50%, 50%)' }, coords: { x: 0.5, y: 1 } },
    { position: 'left', style: { top: '50%', left: '-6px', transform: 'translate(-50%, -50%)' }, coords: { x: 0, y: 0.5 } }
  ]

  const addBox = () => {
    const newBox: Box = {
      id: `box-${boxes.length + 1}`,
      text: boxText || `Box ${boxes.length + 1}`,
      left: 100,
      top: 100,
      width: 150,
      height: 50,
      type: selectedBoxType
    }
    setBoxes([...boxes, newBox])
    setBoxText('')
  }

  const addConnection = () => {
    const newConnection: Connection = {
      id: `conn-${connections.length + 1}`,
      start: null,
      end: null,
      text: 'relates to',
      type: selectedConnectionType,
      lineStyle: 'rigid'
    }
    setConnections([...connections, newConnection])
    setActiveConnection(`conn-${connections.length + 1}`)
  }

  const handleBoxClick = (boxId: string) => {
    if (!activeConnection) return

    const connection = connections.find(c => c.id === activeConnection)
    if (!connection) return

    if (!connection.start) {
      setConnections(prev => prev.map(c => 
        c.id === activeConnection ? { ...c, start: boxId } : c
      ))
    } else if (!connection.end && connection.start !== boxId) {
      setConnections(prev => prev.map(c => 
        c.id === activeConnection ? { ...c, end: boxId } : c
      ))
      setActiveConnection(null)
    }
  }

  const generatePlantUML = () => {
    let uml = '@startuml\n\n'
    boxes.forEach(box => {
      uml += `class "${box.text}" as ${box.id}\n`
    })
    uml += '\n'
    connections.forEach(conn => {
      if (conn.start && conn.end) {
        uml += `${conn.start} --> ${conn.end} : ${conn.text}\n`
      }
    })
    uml += '\n@enduml'
    navigator.clipboard.writeText(uml)
    alert('PlantUML code copied to clipboard!')
  }

  const deleteBox = (boxId: string) => {
    setBoxes(prev => prev.filter(b => b.id !== boxId))
    setConnections(prev => prev.filter(c => c.start !== boxId && c.end !== boxId))
  }

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId))
  }

  const DraggableBox = ({ box, onDelete }: { box: Box; onDelete: () => void }) => {
    const boxRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLTextAreaElement>(null)
    const [localText, setLocalText] = useState(box.text)
    const [isResizing, setIsResizing] = useState(false)
    const [dimensions, setDimensions] = useState({ width: box.width, height: box.height })

    // Auto-resize textarea
    useEffect(() => {
      if (textRef.current) {
        textRef.current.style.height = '0'
        textRef.current.style.height = `${textRef.current.scrollHeight}px`
      }
    }, [localText])

    // Update box dimensions
    useEffect(() => {
      setDimensions({ width: box.width, height: box.height })
    }, [box.width, box.height])

    const handleResizeStart = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsResizing(true)
    }

    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !boxRef.current) return

      const rect = boxRef.current.getBoundingClientRect()
      const newWidth = Math.max(150, e.clientX - rect.left)
      const newHeight = Math.max(100, e.clientY - rect.top)

      setDimensions({ width: newWidth, height: newHeight })
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      // Only update the box dimensions in the parent state when resize ends
      setBoxes(prev => prev.map(b =>
        b.id === box.id ? { ...b, width: dimensions.width, height: dimensions.height } : b
      ))
    }

    useEffect(() => {
      if (isResizing) {
        window.addEventListener('mousemove', handleResizeMove)
        window.addEventListener('mouseup', handleResizeEnd)
        return () => {
          window.removeEventListener('mousemove', handleResizeMove)
          window.removeEventListener('mouseup', handleResizeEnd)
        }
      }
    }, [isResizing, dimensions.width, dimensions.height])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = e.currentTarget.selectionStart
        const end = e.currentTarget.selectionEnd
        const newText = localText.substring(0, start) + '    ' + localText.substring(end)
        setLocalText(newText)
        // Set cursor position after the inserted tab
        setTimeout(() => {
          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4
        }, 0)
      }
    }

    const handleBlur = () => {
      setBoxes(prev => prev.map(b => 
        b.id === box.id ? { ...b, text: localText } : b
      ))
    }

    const [{ isDragging }, drag] = useDrag<Box, unknown, { isDragging: boolean }>(() => ({
      type: 'BOX',
      item: box,
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }))

    const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.stopPropagation()
    }

    const handleConnectionPointClick = (position: 'top' | 'right' | 'bottom' | 'left') => (e: React.MouseEvent) => {
      e.stopPropagation()
      if (activeConnection) {
        const connection = connections.find(c => c.id === activeConnection)
        if (connection && !connection.end) {
          setConnections(prev => prev.map(c =>
            c.id === activeConnection ? { ...c, end: box.id, endPosition: position } : c
          ))
          setActiveConnection(null)
        }
      } else {
        addConnection()
        setConnections(prev => {
          const newConn = prev[prev.length - 1]
          return prev.map(c =>
            c.id === newConn.id ? { ...c, start: box.id, startPosition: position } : c
          )
        })
        setActiveConnection(`conn-${connections.length + 1}`)
      }
    }

    const onBoxClick = () => {
      if (activeConnection) {
        handleBoxClick(box.id)
      }
    }

    return (
      <div
        ref={drag as any}
        className={`absolute rounded-md shadow-lg z-10 group
          ${isDragging ? 'opacity-50' : 'opacity-100'}
          ${activeConnection ? 'hover:border-green-500' : 'cursor-move'}
          ${getBoxStyle(box.type)}`}
        style={{ 
          left: box.left, 
          top: box.top,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          minWidth: '150px',
          minHeight: '100px',
          position: 'absolute',
          zIndex: isResizing ? 50 : 10
        }}
        onClick={onBoxClick}
      >
        {/* Main box content */}
        <div ref={boxRef} className="p-4 h-full flex flex-col relative">
          <div className="flex justify-between items-center text-xs opacity-60 mb-2">
            <span>{box.type.charAt(0).toUpperCase() + box.type.slice(1)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="hover:text-red-500 transition-colors"
              title="Delete box"
            >
              ×
            </button>
          </div>
          <div className="relative flex-grow">
            <textarea
              ref={textRef}
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={handleBlur}
              onClick={handleTextareaClick}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none w-full h-full resize-none font-mono text-sm whitespace-pre-wrap"
              style={{
                minHeight: 'calc(100% - 20px)',
                lineHeight: '1.5'
              }}
              placeholder="Enter text here...
• Use bullet points with •
• Press Tab for indentation
• Use multiple lines"
            />
          </div>

          {/* Resize handle */}
          <div
            className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize transition-opacity
              ${isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onMouseDown={handleResizeStart}
            style={{
              zIndex: 60,
              pointerEvents: 'all'
            }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                d="M16 16L22 22M10 22L22 10M16 22L22 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Connection points */}
        <div
          className="absolute w-3 h-3 -top-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-125"
          onClick={handleConnectionPointClick('top')}
          style={{ zIndex: 55 }}
        />
        <div
          className="absolute w-3 h-3 top-1/2 -right-2 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-125"
          onClick={handleConnectionPointClick('right')}
          style={{ zIndex: 55 }}
        />
        <div
          className="absolute w-3 h-3 -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-125"
          onClick={handleConnectionPointClick('bottom')}
          style={{ zIndex: 55 }}
        />
        <div
          className="absolute w-3 h-3 top-1/2 -left-2 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-125"
          onClick={handleConnectionPointClick('left')}
          style={{ zIndex: 55 }}
        />
      </div>
    )
  }

  const ConnectionLine = ({ connection, onDelete }: { connection: Connection; onDelete: () => void }) => {
    const startBox = boxes.find(b => b.id === connection.start)
    const endBox = boxes.find(b => b.id === connection.end)
    const [isEditing, setIsEditing] = useState(false)
    const [localText, setLocalText] = useState(connection.text)
    const [isHovered, setIsHovered] = useState(false)

    if (!startBox || !endBox) return null

    const getConnectionPoint = (box: Box, position: string) => {
      const boxCenter = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2
      }

      switch (position) {
        case 'top':
          return { x: boxCenter.x, y: box.top - 8 }
        case 'right':
          return { x: box.left + box.width + 8, y: boxCenter.y }
        case 'bottom':
          return { x: boxCenter.x, y: box.top + box.height + 8 }
        case 'left':
          return { x: box.left - 8, y: boxCenter.y }
        default:
          return boxCenter
      }
    }

    const start = getConnectionPoint(startBox, connection.startPosition || 'right')
    const end = getConnectionPoint(endBox, connection.endPosition || 'left')
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    const handleLabelBlur = () => {
      setConnections(connections.map(c =>
        c.id === connection.id ? { ...c, text: localText } : c
      ))
      setIsEditing(false)
    }

    const style = getConnectionStyle(connection.type)

    const getPathData = () => {
      if (connection.lineStyle === 'rigid') {
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
      } else {
        const dx = end.x - start.x
        const dy = end.y - start.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Determine control point offsets based on connection positions
        let startOffset = 0.4 * distance
        let endOffset = 0.4 * distance

        // Adjust control points based on connection positions
        let cp1x = start.x
        let cp1y = start.y
        let cp2x = end.x
        let cp2y = end.y

        switch (connection.startPosition) {
          case 'right':
            cp1x = start.x + startOffset
            cp1y = start.y
            break
          case 'left':
            cp1x = start.x - startOffset
            cp1y = start.y
            break
          case 'top':
            cp1x = start.x
            cp1y = start.y - startOffset
            break
          case 'bottom':
            cp1x = start.x
            cp1y = start.y + startOffset
            break
        }

        switch (connection.endPosition) {
          case 'right':
            cp2x = end.x + endOffset
            cp2y = end.y
            break
          case 'left':
            cp2x = end.x - endOffset
            cp2y = end.y
            break
          case 'top':
            cp2x = end.x
            cp2y = end.y - endOffset
            break
          case 'bottom':
            cp2x = end.x
            cp2y = end.y + endOffset
            break
        }

        // Create cubic Bezier curve
        return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`
      }
    }

    const toggleLineStyle = () => {
      setConnections(prev => prev.map(c =>
        c.id === connection.id
          ? { ...c, lineStyle: c.lineStyle === 'rigid' ? 'curved' : 'rigid' }
          : c
      ))
    }

    return (
      <svg 
        className="absolute top-0 left-0 w-full h-full" 
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <marker
            id={`arrowhead-${connection.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#007acc' : '#2563eb'} />
          </marker>
        </defs>
        <g style={{ pointerEvents: 'all' }}>
          {/* Invisible wider path for better hover detection */}
          <path
            d={getPathData()}
            stroke="transparent"
            strokeWidth="20"
            fill="none"
            style={{ pointerEvents: 'all' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-pointer"
          />
          {/* Visible path */}
          <path
            d={getPathData()}
            fill="none"
            stroke={theme === 'dark' ? '#007acc' : '#2563eb'}
            strokeWidth="2"
            strokeDasharray={style.strokeDasharray}
            markerEnd={`url(#arrowhead-${connection.id})`}
            pointerEvents="none"
          />
          
          {/* Controls container with hover area */}
          <g 
            transform={`translate(${midX}, ${midY - 10})`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Label */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={theme === 'dark' ? '#d4d4d4' : '#374151'}
              className="text-sm hover:text-blue-500 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {!isEditing && connection.text}
            </text>

            {/* Control buttons with transition */}
            <g className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {/* Line style toggle button */}
              <g
                transform="translate(60, 0)"
                onClick={toggleLineStyle}
                className="hover:opacity-80 cursor-pointer"
              >
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  fill={theme === 'dark' ? '#2d2d2d' : '#f3f4f6'}
                  rx="4"
                />
                {connection.lineStyle === 'rigid' ? (
                  <path
                    d="M4 4L-4 -4M4 -4L-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                ) : (
                  <path
                    d="M-4 -4Q4 -4 4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                )}
              </g>
              {/* Delete button */}
              <g
                transform="translate(85, 0)"
                onClick={() => onDelete()}
                className="hover:opacity-80 cursor-pointer"
              >
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  fill={theme === 'dark' ? '#2d2d2d' : '#f3f4f6'}
                  rx="4"
                />
                <path
                  d="M-4 -4L4 4M-4 4L4 -4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </g>
            </g>
          </g>
        </g>

        {isEditing && (
          <foreignObject
            x={midX - 50}
            y={midY - 25}
            width="100"
            height="30"
            style={{ pointerEvents: 'all' }}
          >
            <input
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={handleLabelBlur}
              className="bg-[#3c3c3c] text-[#d4d4d4] px-2 py-1 rounded border border-[#454545] w-full text-sm"
              autoFocus
            />
          </foreignObject>
        )}
      </svg>
    )
  }

  const DropArea = () => {
    const [, drop] = useDrop(() => ({
      accept: 'BOX',
      drop: (item: Box, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset()
        if (delta) {
          const left = Math.round(item.left + delta.x)
          const top = Math.round(item.top + delta.y)
          setBoxes(prev => prev.map(box => 
            box.id === item.id ? { ...box, left, top } : box
          ))
        }
      },
      canDrop: () => !activeConnection // Prevent dropping while connecting
    }))

    return (
      <div 
        ref={drop as any} 
        className="relative w-full h-[600px] bg-opacity-50 border border-gray-200 
          dark:border-gray-700 rounded-lg overflow-hidden"
      >
        {boxes.map(box => (
          <DraggableBox 
            key={box.id} 
            box={box} 
            onDelete={() => deleteBox(box.id)} 
          />
        ))}
        {connections.map(conn => (
          <ConnectionLine 
            key={conn.id} 
            connection={conn} 
            onDelete={() => deleteConnection(conn.id)} 
          />
        ))}
      </div>
    )
  }

  const getConnectionStyle = (type: ConnectionType) => {
    switch (type) {
      case 'inheritance':
        return { strokeDasharray: 'none', markerEnd: 'url(#triangle)' }
      case 'implementation':
        return { strokeDasharray: '5,5', markerEnd: 'url(#triangle)' }
      case 'dependency':
        return { strokeDasharray: '5,5', markerEnd: 'url(#arrowhead)' }
      default:
        return { strokeDasharray: 'none', markerEnd: 'url(#arrowhead)' }
    }
  }

  const getBoxStyle = (type: BoxType) => {
    const baseStyle = theme === 'dark' 
      ? 'bg-[#1e1e1e] border-2 border-white/20 text-[#d4d4d4]'
      : 'bg-white border-2 border-gray-300 text-gray-800'

    switch (type) {
      case 'interface':
        return `${baseStyle} border-blue-500/50 italic`
      case 'abstract':
        return `${baseStyle} border-purple-500/50 italic font-semibold`
      case 'enum':
        return `${baseStyle} border-green-500/50 font-mono`
      default: // class
        return `${baseStyle} border-orange-500/50`
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-[#1e1e1e] text-[#d4d4d4]' 
          : 'bg-gray-100 text-gray-800'
      } transition-colors duration-200`}>
        <nav className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">UML Diagram Editor</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={generatePlantUML}
                  className="flex items-center gap-2 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Copy UML to clipboard"
                >
                  <FiCopy /> Copy UML
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  {theme === 'dark' ? <FiSun /> : <FiMoon />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Box Controls */}
            <div className="p-4 rounded-lg bg-opacity-50 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Box Settings</h2>
              <div className="flex gap-2">
                <select
                  value={selectedBoxType}
                  onChange={(e) => setSelectedBoxType(e.target.value as BoxType)}
                  className="bg-transparent border rounded px-3 py-2 dark:border-gray-600"
                >
                  <option value="class">Class</option>
                  <option value="interface">Interface</option>
                  <option value="abstract">Abstract Class</option>
                  <option value="enum">Enum</option>
                </select>
                <input
                  type="text"
                  value={boxText}
                  onChange={(e) => setBoxText(e.target.value)}
                  placeholder="Enter box text"
                  className="flex-1 bg-transparent border rounded px-3 py-2 dark:border-gray-600"
                />
                <button
                  onClick={addBox}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <FiBox /> Add Box
                </button>
              </div>
            </div>

            {/* Connection Controls */}
            <div className="p-4 rounded-lg bg-opacity-50 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Connection Settings</h2>
              <div className="flex gap-2">
                <select
                  value={selectedConnectionType}
                  onChange={(e) => setSelectedConnectionType(e.target.value as ConnectionType)}
                  className="bg-transparent border rounded px-3 py-2 dark:border-gray-600"
                >
                  <option value="association">Association (→)</option>
                  <option value="inheritance">Inheritance (▷)</option>
                  <option value="implementation">Implementation (--▷)</option>
                  <option value="dependency">Dependency (--{'>'})</option>
                </select>
                <button
                  onClick={addConnection}
                  className={`flex items-center gap-2 px-4 py-2 rounded ${
                    activeConnection
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  <FiLink /> {activeConnection ? 'Connecting...' : 'Add Connection'}
                </button>
              </div>
            </div>

            <DropArea />
          </div>
        </main>
      </div>
    </DndProvider>
  )
}
