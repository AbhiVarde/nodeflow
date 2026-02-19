# Flow Builder

A visual flow builder for creating conditional node-based flows — similar to how chatbot or automation tools like n8n work. Built as a frontend assignment.

**Live Demo → [flow-builder-bolna.vercel.app/](https://flow-builder-bolna.vercel.app/)**

---

## What it does

- Add, drag, and delete nodes on an interactive canvas
- Connect nodes by drawing edges between them
- Each edge has a condition label (e.g. "user says yes")
- Mark one node as the start node
- Edit node name, description, and edges from a sidebar
- Live JSON export that updates as you build
- Import JSON to reconstruct a flow
- Copy or download the JSON
- Validation with inline errors and warnings
- Light and dark mode

## Stack

- **Next.js 16** — framework
- **React Flow (@xyflow/react)** — canvas, nodes, edges
- **shadcn/ui** — all UI components
- **Zustand** — state management
- **Tailwind CSS v4** — styling

## Run locally
```bash
git clone https://github.com/yourusername/flow-builder.git
cd flow-builder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to use

1. Click **Add Node** to create a node
2. Click a node to open the edit panel
3. Set a name, description, and mark one as **Start**
4. Drag from the bottom dot of a node to the top dot of another to connect
5. Set a condition on each edge
6. Watch the JSON panel update live on the right
7. Copy or download the JSON when ready

## Design choices

- Zustand for state — simple and no boilerplate compared to Redux
- React Flow handles all canvas complexity out of the box
- shadcn/ui gives consistent, accessible components without custom CSS
- Warnings shown inline rather than blocking — better UX for iterative building