# Simple REST Client

A lightweight REST client application built with vanilla web technologies (HTML, CSS, JavaScript). Provides a simple interface for making HTTP requests directly from your browser.

## Features

- **HTTP Methods**: Support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods
- **Request Headers**: Add custom headers to your requests
- **Request Body**: Support for JSON and multipart/form-data (file uploads)
- **Response Display**: View response status, headers, and body
- **Error Handling**: Clear error messages for failed requests

## Project Structure

```
simple-rest-client/
├── index.html          # Main HTML page with UI structure
├── styles.css          # Modern and beautiful styling
├── rest_client.js      # Base class for HTTP request handling
├── scripts.js          # DOM manipulation and event handling
└── README.md           # This file
```

## Usage

1. Open `index.html` in a web browser
2. Enter the API URL in the input field
3. Select the HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
4. Add custom headers if needed
5. Enter request body (JSON or multipart/form-data for files)
6. Click "Send Request" to execute

## How It Works

The application is divided into two main components:

### Client Layer (`rest_client.js`)
Handles all HTTP logic including:
- Creating HTTP requests with the selected method
- Managing headers and body content
- Parsing responses based on content type
- Handling errors and network issues

### UI Layer (`scripts.js`)
Manages the user interface:
- Capturing user inputs (URL, method, headers, body)
- Triggering HTTP requests through the client layer
- Displaying responses and errors in the UI
- Updating the interface state
