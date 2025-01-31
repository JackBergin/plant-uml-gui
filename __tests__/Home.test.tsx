import { render, screen, fireEvent } from '@testing-library/react'
import Home from '@/app/page'
import '@testing-library/jest-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ThemeProvider } from '@/app/theme-context'

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <DndProvider backend={HTML5Backend}>
        {component}
      </DndProvider>
    </ThemeProvider>
  )
}

describe('UML Diagram Editor', () => {
  beforeEach(() => {
    renderWithProviders(<Home />)
  })

  describe('Header', () => {
    test('should render title and theme toggle', () => {
      expect(screen.getByText('UML Diagram Editor')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    })

    test('should render Copy UML button', () => {
      const copyButton = screen.getByRole('button', { name: /copy uml/i })
      expect(copyButton).toBeInTheDocument()
    })
  })

  describe('Box Controls', () => {
    test('should render box type selector with all options', () => {
      const selector = screen.getByRole('combobox')
      expect(selector).toBeInTheDocument()
      
      const options = ['Class', 'Interface', 'Abstract Class', 'Enum']
      options.forEach(option => {
        expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
      })
    })

    test('should render text input and add box button', () => {
      expect(screen.getByPlaceholderText('Enter box text')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add box/i })).toBeInTheDocument()
    })

    test('should add a new box when clicking add button', () => {
      const input = screen.getByPlaceholderText('Enter box text')
      const addButton = screen.getByRole('button', { name: /add box/i })

      fireEvent.change(input, { target: { value: 'Test Box' } })
      fireEvent.click(addButton)

      expect(screen.getByText('Test Box')).toBeInTheDocument()
    })
  })

  describe('Connection Controls', () => {
    test('should render connection type selector', () => {
      const options = ['Association', 'Inheritance', 'Implementation', 'Dependency']
      options.forEach(option => {
        expect(screen.getByRole('option', { name: new RegExp(option, 'i') })).toBeInTheDocument()
      })
    })

    test('should render add connection button', () => {
      const button = screen.getByRole('button', { name: /add connection/i })
      expect(button).toBeInTheDocument()
      expect(button).not.toHaveTextContent('Connecting...')
    })
  })

  describe('Box Functionality', () => {
    beforeEach(() => {
      // Add a test box
      const input = screen.getByPlaceholderText('Enter box text')
      const addButton = screen.getByRole('button', { name: /add box/i })
      fireEvent.change(input, { target: { value: 'Test Box' } })
      fireEvent.click(addButton)
    })

    test('should render box with correct type label', () => {
      expect(screen.getByText('Class')).toBeInTheDocument()
    })

    test('should allow text editing', () => {
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Updated Text' } })
      fireEvent.blur(textarea)
      expect(screen.getByText('Updated Text')).toBeInTheDocument()
    })

    test('should show connection points on hover', async () => {
      const box = screen.getByText('Test Box').parentElement
      if (!box) throw new Error('Box not found')

      fireEvent.mouseEnter(box)
      
      // Should find 4 connection points
      const connectionPoints = document.querySelectorAll('.rounded-full.bg-blue-500')
      expect(connectionPoints.length).toBe(4)
    })

    test('should show delete button', () => {
      const deleteButton = screen.getByTitle('Delete box')
      expect(deleteButton).toBeInTheDocument()

      fireEvent.click(deleteButton)
      expect(screen.queryByText('Test Box')).not.toBeInTheDocument()
    })
  })

  describe('Connection Functionality', () => {
    beforeEach(() => {
      // Add two test boxes
      const input = screen.getByPlaceholderText('Enter box text')
      const addButton = screen.getByRole('button', { name: /add box/i })

      fireEvent.change(input, { target: { value: 'Box 1' } })
      fireEvent.click(addButton)
      fireEvent.change(input, { target: { value: 'Box 2' } })
      fireEvent.click(addButton)
    })

    test('should start connection mode when clicking add connection', () => {
      const addConnectionButton = screen.getByRole('button', { name: /add connection/i })
      fireEvent.click(addConnectionButton)
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
    })

    test('should show line style toggle and delete button on hover', () => {
      // Create a connection
      const addConnectionButton = screen.getByRole('button', { name: /add connection/i })
      fireEvent.click(addConnectionButton)

      // Simulate connecting two boxes
      const box1 = screen.getByText('Box 1').parentElement
      const box2 = screen.getByText('Box 2').parentElement
      if (!box1 || !box2) throw new Error('Boxes not found')

      fireEvent.click(box1)
      fireEvent.click(box2)

      // Find and hover over the connection
      const connection = document.querySelector('path[stroke="transparent"]')
      if (!connection) throw new Error('Connection not found')

      fireEvent.mouseEnter(connection)
      
      // Check for control buttons
      expect(document.querySelector('g[transform="translate(60, 0)"]')).toBeInTheDocument()
      expect(document.querySelector('g[transform="translate(85, 0)"]')).toBeInTheDocument()
    })
  })

  describe('PlantUML Generation', () => {
    beforeEach(() => {
      // Add two connected boxes
      const input = screen.getByPlaceholderText('Enter box text')
      const addButton = screen.getByRole('button', { name: /add box/i })
      
      fireEvent.change(input, { target: { value: 'Box 1' } })
      fireEvent.click(addButton)
      fireEvent.change(input, { target: { value: 'Box 2' } })
      fireEvent.click(addButton)

      const addConnectionButton = screen.getByRole('button', { name: /add connection/i })
      fireEvent.click(addConnectionButton)

      const box1 = screen.getByText('Box 1').parentElement
      const box2 = screen.getByText('Box 2').parentElement
      if (!box1 || !box2) throw new Error('Boxes not found')

      fireEvent.click(box1)
      fireEvent.click(box2)
    })

    test('should generate PlantUML code', () => {
      const mockClipboard = {
        writeText: jest.fn()
      }
      Object.assign(navigator, {
        clipboard: mockClipboard
      })

      const copyButton = screen.getByRole('button', { name: /copy uml/i })
      fireEvent.click(copyButton)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('@startuml'))
      expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('class "Box 1"'))
      expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('class "Box 2"'))
    })
  })
})

