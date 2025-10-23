## CipherStudio

CipherStudio is a lightweight web-based code editor built with React, TypeScript, and Vite. It uses Monaco Editor (the same editor as VS Code) and Tailwind CSS for a fast, modern, and responsive development experience.

https://www.surajv.me/projects/cipherstudio



### Tech Stack

| Category          | Technologies                                                                    |
| ----------------- | ------------------------------------------------------------------------------- |
| Core              | React 18, TypeScript, Vite                                                      |
| Editor            | Monaco Editor                                                                   |
| UI & Styling      | Tailwind CSS, shadcn/ui, Radix UI, Lucide React                                 |
| State & Utilities | React Context API, React Router, TanStack Query, React Resizable Panels, Sonner |

## Features

- Create, rename, and delete files or folders
- Auto-save with live preview
- IntelliSense support via Monaco Editor
- Import/export projects as JSON
- Dark/light mode toggle
- Resizable panels and keyboard shortcuts

## Keyboard Shortcuts

| Action          | Shortcut              |
| --------------- | --------------------- |
| Save            | Ctrl + S              |
| Find            | Ctrl + F              |
| Replace         | Ctrl + H              |
| Command Palette | F1 / Ctrl + Shift + P |
| Format Document | Shift + Alt + F       |

---

## Setup

```bash
git clone https://github.com/yourusername/cipherstudio.git
cd cipherstudio
npm install
npm run dev
```

Open at `http://localhost:5173`.
