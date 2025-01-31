# 🎨 Plant UML Diagram Editor

A modern, intuitive drag-and-drop interface for creating UML diagrams that generates PlantUML code. Perfect for developers who need to create UML diagrams in environments where traditional diagramming tools aren't available.

## ✨ Features

- 🖱️ Intuitive drag-and-drop interface
- 📊 Multiple UML element types:
  - Classes
  - Interfaces
  - Abstract Classes
  - Enums
- 🔗 Various connection types:
  - Association
  - Inheritance
  - Implementation
  - Dependency
- 💫 Customizable connection styles:
  - Rigid lines
  - Curved paths
  - Multiple connection points
- 🎯 Smart arrow positioning
- 🌓 Dark/Light theme support
- 📋 One-click PlantUML code generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/plant-uml-gui.git
   cd plant-uml-gui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🧪 Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

Run tests in watch mode:
```bash
npm test:watch
# or
yarn test:watch
```

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

## 🏛️ Project Structure

```
plant-uml-gui/
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── page.tsx     # Main UML editor component
│   │   ├── types.ts     # TypeScript type definitions
│   │   └── theme.tsx    # Theme context and styling
├── __tests__/
│   └── Home.test.tsx    # Test files
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

## 🛣️ Roadmap

- [ ] Additional diagram types
  - [ ] Sequence diagrams
  - [ ] Activity diagrams
  - [ ] State diagrams
- [ ] Enhanced layout algorithms
- [ ] Advanced connection routing
- [ ] Diagram templates
- [ ] Backend integration
  - [ ] Save diagrams
  - [ ] Share diagrams
  - [ ] Collaboration features
- [ ] Authentication system
- [ ] Export to different formats
- [ ] Undo/Redo functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Inspired by the need for a simple UML diagramming tool in restricted environments
- Built with [Next.js](https://nextjs.org/)
- Uses [PlantUML](https://plantuml.com/) syntax
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

Jack C. Bergin - [@jackcbergin](https://twitter.com/jackcbergin) - jackcbergin@gmail.com

Project Link: [https://github.com/JackBergin/plant-uml-gui](https://github.com/JackBergin/plant-uml-gui)



