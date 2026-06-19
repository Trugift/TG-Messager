# TG Messenger

A two-way messaging platform built with vanilla HTML, CSS, and JavaScript.

## Project Structure

```
TG-Messager/
├── index.html          # Main HTML file
├── css/
│   └── styles.css     # All CSS styles
├── js/
│   └── app.js         # All JavaScript logic
└── README.md          # This file
```

## Features

- 💬 Real-time messaging with contacts
- ✏️ Compose messages via SMS, MMS, or Email
- 📎 File attachments support
- 👥 Contact management (add, edit, delete)
- 💾 Local storage persistence
- 📱 Responsive design
- 🎨 Modern UI with smooth animations

## Getting Started

1. Clone the repository or download the files
2. Open `index.html` in your web browser
3. Start messaging!

## File Organization

### `index.html`
Contains all the HTML structure and references to external CSS and JavaScript files.

### `css/styles.css`
All styling for the application including:
- Layout and grid system
- Component styles (buttons, inputs, modals)
- Animations and transitions
- Responsive design breakpoints

### `js/app.js`
Complete application logic including:
- State management
- Contact management
- Message handling
- File uploads
- UI interactions

## Development Tips

### In VSCode:
1. Open the project folder
2. Each file (HTML, CSS, JS) is organized in separate folders for easy navigation
3. Use the Live Server extension to run the app locally
4. Open Developer Tools (F12) to debug

### Key Functions in app.js

- `switchPage()` - Navigate between pages
- `selectContact()` - Select a contact to chat with
- `sendMessage()` - Send a message
- `renderContacts()` - Display contacts list
- `renderMessages()` - Display messages

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Free to use and modify.
