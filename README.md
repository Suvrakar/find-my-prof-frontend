# Find My Professor - Frontend

React-based frontend for the AI Professor-Hunting Agent.

## Prerequisites

- Node.js 14+ 
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` if needed (default points to `http://localhost:8000`):
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Running the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm lint` - Check code with ESLint

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── Navigation.js
│   ├── SearchBar.js
│   ├── ProfessorCard.js
│   └── ProfessorList.js
├── pages/               # Page components
│   └── Home.js
├── services/            # API service layer
│   └── api.js
├── App.js               # Main App component
├── App.css              # App styles
└── index.js             # Entry point
```

## Features

- **Professor Discovery**: Search and browse professors
- **Smart Filtering**: Filter by department, research interests
- **Profile Cards**: View detailed professor information
- **Responsive Design**: Mobile-friendly interface
- **API Integration**: Connected to Django REST backend

## Key Components

### Navigation
Top navigation bar with links to main sections

### SearchBar
Search input for finding professors

### ProfessorCard
Individual professor profile card with contact and details

### ProfessorList
Grid layout for displaying professor search results

## API Integration

See `src/services/api.js` for all API endpoints and methods:

- `professorService` - Professor data
- `publicationService` - Publication data
- `grantService` - Grant/funding data
- `userService` - User profile
- `matchService` - Match recommendations

## Styling

The app uses:
- CSS Modules for component-scoped styling
- Flexbox and CSS Grid for layouts
- Responsive design with media queries

## Development Tips

- API calls automatically include auth token from `localStorage`
- Backend proxy is configured in `package.json`
- Use browser DevTools to inspect network requests
- Check console for any errors or warnings

## Deployment

Build the app and deploy the `build/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## Contributing

Follow React best practices and ESLint rules.

```bash
npm lint
```

## License

MIT
