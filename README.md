# NodeFlow

NodeFlow is a visual builder for designing conditional node-based workflows — inspired by tools like n8n, built for the browser with zero setup required.

**Live Demo → [nodeflow.abhivarde.in](http://nodeflow.abhivarde.in)**

## What it does

- Add, drag, and delete nodes on an interactive canvas
- Connect nodes by drawing edges between them
- Each edge has a condition label (e.g. "user says yes")
- Mark one node as the start node
- Edit node name, description, and edges from a sidebar
- Live JSON preview that updates as you build
- Import JSON to reconstruct a flow instantly
- Copy or download the JSON output
- Inline validation warnings — no blocking errors
- Share any flow via a short URL — no account needed
- Undo / Redo with full history (Ctrl+Z / Ctrl+Shift+Z)
- Light and dark mode

## Technology Stack

| Component        | Technology                 |
| ---------------- | -------------------------- |
| Framework        | Next.js 15                 |
| Canvas & Nodes   | React Flow (@xyflow/react) |
| UI Components    | shadcn/ui                  |
| State Management | Zustand                    |
| Styling          | Tailwind CSS v4            |

## Run locally

```bash
git clone https://github.com/AbhiVarde/nodeflow.git
cd nodeflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to use

1. Click **Add Node** to create a node
2. Click a node to open the edit panel
3. Set a name, description, and mark one as **Start**
4. Drag from the bottom handle of a node to the top of another to connect
5. Set a condition label on each edge
6. Watch the JSON panel update live on the right
7. Click **Share** to generate a short URL anyone can open — no login required
8. Use **Undo/Redo** or Ctrl+Z to step through changes
9. Copy or download the JSON when ready

## Design choices

- **Zustand** for state — simple and minimal, no boilerplate
- **React Flow** handles all canvas and edge complexity out of the box
- **shadcn/ui** provides consistent, accessible components
- **Share via URL** encodes the full flow as base64, shortened via TinyURL API — zero backend needed
- **Undo/Redo** uses `structuredClone` snapshots stored in past/future stacks — no external library
- Inline warnings instead of blocking errors for a smoother build experience
