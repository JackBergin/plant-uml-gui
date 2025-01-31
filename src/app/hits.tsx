'use client'

import { useState, useRef, useEffect } from "react"
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface Box {
  id: string
  text: string
  left: number
  top: number
  width: number
  height: number
}

interface Connection {
  id: string
  start: string | null
  end: string | null
  text: string
}

export default function Home() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [activeConnection, setActiveConnection] = useState<string | null>(null)
  const [boxText, setBoxText] = useState('')

  const addBox = () => {
    const newBox: Box = {
      id: `box-${boxes.length + 1}`,
      text: boxText || `Box ${boxes.length + 1}`,
      left: 100,
      top: 100,
      width: 150,
      height: 50
    }
    setBoxes([...boxes, newBox])
    setBoxText('')
  }

  const addConnection = () => {
    const newConnection: Connection = {
      id: `conn-${connections.length + 1}`,
      start: null,
      end: null,
      text: 'relates to'
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

  const DraggableBox = ({ box }: { box: Box }) => {
    const boxRef = useRef<HTMLDivElement>(null)
    const [localText, setLocalText] = useState(box.text)

    useEffect(() => {
      if (boxRef.current) {
        const { width, height } = boxRef.current.getBoundingClientRect()
        const hasChanged = width !== box.width || height !== box.height
        if (hasChanged) {
          setBoxes(prev => prev.map(b => 
            b.id === box.id ? { ...b, width, height } : b
          ))
        }
      }
    }, [box.id, box.width, box.height])

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

    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation()
    }

    const onBoxClick = () => {
      if (activeConnection) {
        handleBoxClick(box.id)
      }
    }

    return (
      <div
        ref={drag as any}
        className={`absolute p-4 rounded-md shadow-lg z-10
          ${isDragging ? 'opacity-50' : 'opacity-100'}
          ${activeConnection ? 'hover:border-green-500' : 'cursor-move'}
          bg-[#1e1e1e] border border-[#454545] text-[#d4d4d4]
          hover:border-[#007acc]`}
        style={{ left: box.left, top: box.top }}
        onClick={onBoxClick}
      >
        <div ref={boxRef}>
          <input
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleBlur}
            onClick={handleInputClick}
            className="bg-transparent outline-none text-[#d4d4d4] w-full"
          />
        </div>
      </div>
    )
  }

  const ConnectionLine = ({ connection }: { connection: Connection }) => {
    const startBox = boxes.find(b => b.id === connection.start)
    const endBox = boxes.find(b => b.id === connection.end)
    const [isEditing, setIsEditing] = useState(false)
    const [localText, setLocalText] = useState(connection.text)

    if (!startBox || !endBox) return null

    const start = {
      x: startBox.left + startBox.width,
      y: startBox.top + startBox.height / 2
    }

    const end = {
      x: endBox.left,
      y: endBox.top + endBox.height / 2
    }

    const handleLabelBlur = () => {
      setConnections(connections.map(c =>
        c.id === connection.id ? { ...c, text: localText } : c
      ))
      setIsEditing(false)
    }

    return (
      <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#007acc"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(start.x + end.x) / 2}
          y={(start.y + end.y) / 2}
          textAnchor="middle"
          fill="#d4d4d4"
          className="text-sm cursor-pointer"
          onClick={() => setIsEditing(true)}
          style={{ pointerEvents: 'all' }}
        >
          {!isEditing && connection.text}
        </text>
        {isEditing && (
          <foreignObject
            x={(start.x + end.x) / 2 - 50}
            y={(start.y + end.y) / 2 - 15}
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
        className="relative w-full h-[600px] bg-[#252526] border border-[#454545] rounded-md"
      >
        {boxes.map(box => (
          <DraggableBox key={box.id} box={box} />
        ))}
        {connections.map(conn => (
          <ConnectionLine key={conn.id} connection={conn} />
        ))}
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] p-8">
        <h1 className="text-2xl font-bold mb-4">UML Diagram Editor</h1>
        
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={boxText}
            onChange={(e) => setBoxText(e.target.value)}
            placeholder="Enter box text"
            className="bg-[#3c3c3c] border border-[#454545] p-2 rounded-md focus:border-[#007acc] outline-none"
          />
          <button
            onClick={addBox}
            className="bg-[#007acc] text-white px-4 py-2 rounded-md hover:bg-[#005999] transition-colors"
          >
            Add Box
          </button>
          <button
            onClick={addConnection}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeConnection 
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]'
            }`}
          >
            {activeConnection ? 'Connecting...' : 'Add Connection'}
          </button>
          <button
            onClick={generatePlantUML}
            className="bg-[#3c3c3c] text-[#d4d4d4] px-4 py-2 rounded-md hover:bg-[#4c4c4c] transition-colors"
          >
            Generate PlantUML
          </button>
        </div>

        <DropArea />

        <svg className="absolute top-0 left-0 w-0 h-0">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#007acc" />
            </marker>
          </defs>
        </svg>
      </div>
    </DndProvider>
  )
}
