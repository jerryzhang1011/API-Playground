# API Playground

A modern, powerful API debugging and testing tool built with Next.js, Monaco Editor, and TypeScript.

## Features

### Core Features
- **Request Builder**: Build HTTP requests with method, URL, headers, query params, and body
- **Protocol Selector**: Quick switch between `https://`, `http://`, or custom protocols
- **Response Inspector**: View response status, timing, size, headers, and body with syntax highlighting
- **HTML Preview**: Safely preview HTML responses in isolated iframe
- **History Persistence**: Save and replay previous requests (localStorage, max 50 items)
- **CORS Proxy**: Built-in proxy to bypass browser CORS restrictions

### Mock API Endpoints
Built-in mock endpoints for testing without external dependencies:

| Endpoint | Description |
|----------|-------------|
| `GET /api/mock/posts` | Get all posts |
| `GET /api/mock/posts/:id` | Get post by ID |
| `POST /api/mock/posts` | Create a new post |
| `PUT /api/mock/posts/:id` | Update a post |
| `DELETE /api/mock/posts/:id` | Delete a post |
| `GET /api/mock/users` | Get all users |
| `GET/POST /api/mock/echo` | Echo request details back |
| `GET /api/mock/delay/:seconds` | Simulate network delay |
| `GET /api/mock/status/:code` | Return specific HTTP status code |

### Bonus Features
- **OpenAPI/Swagger Import**: Import API specifications from URL or paste content directly
- **TypeScript Client Generator**: Generate TypeScript, JavaScript, Python, or cURL code

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **State Management**: Zustand
- **UI Components**: Radix UI Primitives

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── proxy/          # CORS proxy endpoint
│   │   └── mock/           # Mock API endpoints
│   │       ├── posts/
│   │       ├── users/
│   │       ├── echo/
│   │       ├── delay/
│   │       └── status/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Base UI components
│   ├── Sidebar.tsx         # History, Mock APIs & Collections
│   ├── UrlBar.tsx          # Method + Protocol + URL input
│   ├── RequestBuilder.tsx  # Params, Headers, Body tabs
│   ├── ResponseViewer.tsx  # Response display
│   ├── MonacoEditor.tsx    # Code editor wrapper
│   ├── ImportOpenAPIDialog.tsx
│   └── CodeGeneratorDialog.tsx
├── store/
│   ├── requestStore.ts     # Request state
│   ├── historyStore.ts     # History persistence
│   └── openApiStore.ts     # OpenAPI imports
├── types/
│   └── index.ts            # TypeScript types
└── lib/
    └── utils.ts            # Utility functions
```

## Usage

### Making Requests
1. Select HTTP method (GET, POST, PUT, PATCH, DELETE)
2. Choose protocol (`https://`, `http://`, or custom)
3. Enter URL
4. Add headers and query params as needed
5. For POST/PUT/PATCH, add request body
6. Click "Send" or press `Cmd/Ctrl + Enter`

### Using Mock APIs
1. Expand the **Mock APIs** section in the sidebar (amber colored)
2. Click any endpoint to auto-fill the URL and method
3. Click "Send" to test
4. Try delay endpoints to test loading states
5. Try status endpoints to test error handling

### Setting Cookies
1. Go to the **Headers** tab
2. Click **+ Add**
3. Set Key: `Cookie`
4. Set Value: `session_id=abc123; token=xyz789`

### History
- All requests are automatically saved
- Star important requests to prevent deletion
- Clear all non-starred history with one click
- Click any history item to restore it

### OpenAPI Import
1. Click "Import OpenAPI" in sidebar
2. Enter spec URL or paste content
3. Click endpoints to pre-fill request

### Code Generation
1. Build your request
2. Click the Code icon `</>` in URL bar
3. Select language (TypeScript, JavaScript, Python, cURL)
4. Copy generated code

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Send request |

## Resume Bullet

> Built an API playground UI with request builder, response inspector, protocol selector, mock API endpoints, and history persistence to accelerate debugging and integration. Added OpenAPI import and multi-language code generation.

## License

MIT
