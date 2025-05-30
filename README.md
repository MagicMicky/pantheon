# Multi-Content Pantheon 🏛️

A sophisticated multi-content management system for organizing your favorite **Games**, **Movies**, and **TV Shows** into mythological tiers. Built with React, TypeScript, and modern web technologies.

![Multi-Content Pantheon](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Bundle Size](https://img.shields.io/badge/Bundle%20Size-76KB%20gzipped-green)

## ✨ Features

### 🎮 Multi-Content Support
- **Games**: Full Steam integration with automatic data fetching
- **Movies**: Director, runtime, and genre management
- **TV Shows**: Status tracking (ongoing/ended/cancelled) and genre arrays
- **Seamless Switching**: Dynamic content type selector with elegant dropdown

### 🏛️ Mythological Organization
- **Six Tiers**: Olympian, Titan, Demigod, Muse, Hero, Other
- **Deity Assignment**: Assign mythological figures to your content
- **Visual Hierarchy**: Color-coded categories with intuitive design

### 🔄 Advanced Interactions
- **Drag & Drop**: Reorder and categorize content with smooth animations
- **Wikipedia Integration**: Auto-fill content information from Wikipedia
- **Steam Import**: Drag games directly from your Steam library
- **Real-time Search**: Intelligent autocomplete with Wikipedia suggestions

### 🌐 Sharing & Collaboration
- **URL Sharing**: Share your pantheons with compressed, shareable links
- **Content-Type Aware**: Automatic content type detection in shared URLs
- **Social Media Ready**: Optimized meta tags for sharing platforms
- **Legacy Compatibility**: Existing game-only shares continue to work

### 💾 Data Management
- **Separate Storage**: Independent localStorage for each content type
- **Import/Export**: JSON-based backup and restore functionality
- **Version History**: Track changes with automatic history snapshots
- **Data Migration**: Seamless migration from legacy game-only version

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd pantheon

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Building for Production
```bash
# Create production build
npm run build

# Analyze bundle size
npm run analyze

# Serve production build locally
npm install -g serve
serve -s build
```

## 📱 Usage Guide

### Content Management
1. **Select Content Type**: Use the dropdown in the title to switch between Games, Movies, and TV Shows
2. **Add Content**: Fill out the form with title, genre, year, and category
3. **Auto-fill**: Use Wikipedia integration for automatic data completion
4. **Organize**: Drag and drop content between mythological categories

### Steam Integration (Games Only)
1. **Enter Steam ID**: Add your Steam ID in the import panel
2. **Browse Library**: View your Steam games with automatic filtering
3. **Drag to Add**: Drag games directly to categories for instant addition
4. **Auto-fetch**: Wikipedia data automatically supplements Steam information

### Sharing
1. **Generate Link**: Click share button and add optional title
2. **Copy URL**: Share the generated link with compression stats
3. **View Shared**: Recipients see your pantheon without affecting their data
4. **Import**: "Create your own" button saves shared content locally

## 🛠️ Technical Architecture

### Core Technologies
- **React 18.2**: Modern hooks and concurrent features
- **TypeScript**: Full type safety and IntelliSense
- **Tailwind CSS**: Utility-first styling with custom design system
- **Lucide React**: Consistent iconography
- **LZ-String**: Advanced compression for sharing URLs

### Performance Optimizations
- **Bundle Size**: 76KB gzipped (exceptionally optimized)
- **React.memo**: Optimized component re-rendering
- **useCallback/useMemo**: Cached expensive operations
- **Debounced Saves**: Efficient localStorage operations
- **Lazy Loading**: Dynamic imports for improved initial load

### State Management
- **Context API**: Centralized multi-content state management
- **Reducer Pattern**: Predictable state updates
- **Content Type Isolation**: Separate storage and state per content type
- **Legacy Compatibility**: Backward compatibility with game-only version

## 📊 Bundle Analysis

| Component | Size (Estimated) | Purpose |
|-----------|------------------|---------|
| React Core | ~35KB | Framework and runtime |
| App Logic | ~25KB | Multi-content management |
| UI Components | ~16KB | Interface and interactions |
| **Total** | **~76KB** | **Production bundle** |

## 🔧 Configuration

### Environment Variables
Create a `.env` file for custom configuration:
```env
# Optional: Custom API endpoints
REACT_APP_WIKIPEDIA_API_BASE=https://en.wikipedia.org/api/rest_v1
REACT_APP_STEAM_API_BASE=https://api.steampowered.com
```

### Customization
- **Categories**: Modify `src/data/categories.ts` for custom tiers
- **Mythological Figures**: Update `src/data/mythologicalFigures.ts`
- **Genres**: Customize genre lists in `src/data/[type]/[type]Genres.ts`
- **Colors**: Adjust theme in `src/data/categories.ts`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy automatically on push

### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Enable automatic deploys

### Manual Hosting
```bash
npm run build
# Upload contents of 'build' folder to your web server
```

## 📝 API Reference

### Content Types
```typescript
type ContentType = 'games' | 'movies' | 'tvshows';

interface Game {
  id: string;
  title: string;
  genre: string;
  year: number;
  category: CategoryID;
  contentType: 'games';
  steamAppId?: string;
  mythologicalFigureId?: string;
}

interface Movie {
  id: string;
  title: string;
  genre: string[];
  year: number;
  director?: string;
  runtime?: number;
  category: CategoryID;
  contentType: 'movies';
  mythologicalFigureId?: string;
}

interface TVShow {
  id: string;
  title: string;
  genre: string[];
  year: number;
  status?: 'ongoing' | 'ended' | 'cancelled';
  category: CategoryID;
  contentType: 'tvshows';
  mythologicalFigureId?: string;
}
```

### Context API
```typescript
const {
  currentContentType,
  currentContent,
  switchContentType,
  addContent,
  updateContent,
  deleteContent
} = usePantheonContext();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use React hooks and functional components
- Maintain backward compatibility
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Wikipedia API**: Content information and search suggestions
- **Steam Web API**: Game library integration
- **Lucide**: Beautiful icon library
- **Tailwind CSS**: Utility-first CSS framework
- **React Community**: Excellent ecosystem and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/[username]/pantheon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[username]/pantheon/discussions)
- **Documentation**: [Wiki](https://github.com/[username]/pantheon/wiki)

---

**Built with ❤️ using React and TypeScript** 