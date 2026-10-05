# Simple REST Client

A lightweight REST client application built with vanilla web technologies (HTML, CSS, JavaScript). Provides a simple interface for making HTTP requests directly from your browser.

## Features

- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Query Parameters**: Add custom query parameters to requests
- **Headers**: Add custom headers for authentication and configuration
- **Body Types**: JSON, Multipart File (drag & drop), or None
- **Environment Variables**: Use `{{env_var}}` syntax to reference stored variables
- **Session Cookie**: Save and reuse session cookies across requests
- **Save Requests**: Save request configurations for quick access
- **Import/Export**: Export all saved requests to JSON or import from a file
- **Drag & Drop**: Reorder saved requests by dragging
- **Folders**: Organize requests into folders with drag-and-drop

## Folders

Organize your requests into folders for better management:

- **Create Folder**: Click "New Folder" button in the drawer to create a new folder
- **Rename Folder**: Click the edit icon (✎) next to a folder to rename it
- **Delete Folder**: Click the delete icon (✕) to delete a folder (requests move to root)
- **Collapse/Expand**: Click the chevron icon to hide/show folder contents
- **Move Requests**: Drag and drop requests between folders or to root
- **Empty Folders**: Folders can exist without any requests

## Usage

1. Open `index.html` in a web browser
2. Enter the API URL in the input field (use `{{env_var}}` for environment variables)
3. Select the HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
4. Add custom headers if needed (use `{{env_var}}` for values)
5. Add query parameters if needed (use `{{env_var}}` for values)
6. Select body type (JSON, Multipart File, or None)
7. Enter request body content
8. Enable session cookie if needed and enter token
9. Click "Send Request" or press `Ctrl+Enter` to execute

## Project Structure

```
simple-rest-client/
├── index.html                      # Main HTML page with UI structure
├── styles/
│   └── styles.css                  # Modern and beautiful styling
├── scripts/
│   ├── rest_client.js              # Base class for HTTP request handling
│   ├── scripts.js                  # Business logic, event listeners, DOM manipulation
│   ├── db.js                       # Data persistence layer (localStorage)
│   └── toast.js                    # Toast notification system
├── AGENTS.md                       # Agent guidelines
├── README.md                       # Project documentation
├── LICENSE
├── .editorconfig
└── .gitignore
```

## Keyboard Shortcuts

- `Ctrl+Enter` - Send request
- `Ctrl+B` - Toggle drawer
- `Escape` - Close drawer/dialogs

## Development Rules

### Scope Enforcement

1. **No Extra Features**: Do not implement any features beyond what the user explicitly requests.

2. **No Unrequested Changes**: Do not modify or add functionality that was not explicitly requested by the user.

3. **Out-of-Scope Questions**: If a task requires implementing something outside the user's defined scope, ask for confirmation before proceeding.

### Language Requirement

- All code, comments, and documentation must be written in **English**
- File names, variable names, and function names must use English naming conventions
- Error messages and UI text must be in English

### Code Quality

- Follow vanilla JavaScript best practices (no external libraries unless requested)
- Use ES6+ syntax
- Maintain separation of concerns between files
- Keep code modular and maintainable
- Write clear, concise comments where necessary

### File Organization

- Each file should have a single, clear responsibility
- `rest_client.js` handles HTTP logic only
- `scripts.js` handles DOM interaction and business logic
- `db.js` handles data persistence only
- `toast.js` handles notifications only
- `index.html` contains only markup
- No JavaScript inline in HTML
