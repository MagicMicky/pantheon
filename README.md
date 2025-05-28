# Game Pantheon 🎮

A React application for organizing your favorite video games into tiered categories inspired by Greek mythology.

## Features

- **Six mythological tiers**: Organize games as Olympian Gods, Titans, Demi-Gods, Muses, Heroes, and Monsters & Curios
- **Wikipedia integration**: Search and auto-fill game information from Wikipedia
- **Drag-and-drop functionality**: Easily move games between tiers
- **Persistent storage**: Your game list is saved in your browser's localStorage
- **Edit & delete**: Manage your game collection with inline editing
- **Responsive design**: Works on all device sizes

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

- **Add a game**: Fill out the form at the top and click "Add"
- **Auto-fill information**: Type a game title and click "Auto-Fill" to fetch genre and year data from Wikipedia
- **Re-categorize games**: Drag and drop games between category cards
- **Edit game details**: Click the edit icon (✏️) on any game to modify its information
- **Remove games**: Click the delete icon (✖️) to remove a game from your pantheon

## Implementation Details

- Built with React and TypeScript
- Uses the Wikipedia API for game information
- Styled with Tailwind CSS
- Utilizes HTML5 drag-and-drop API
- Icons from Lucide React 