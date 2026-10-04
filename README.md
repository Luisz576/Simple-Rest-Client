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
