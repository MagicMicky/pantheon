import { DEFAULT_MOVIES } from '../data/movies/defaultMovies';
import { DEFAULT_TVSHOWS } from '../data/tvshows/defaultTVShows';
import { Content, ContentType, Game } from '../types';
import { uid } from './helpers';

// Storage keys for different content types
const STORAGE_KEYS = {
  games: 'pantheon-games',
  movies: 'pantheon-movies', 
  tvshows: 'pantheon-tvshows'
} as const;

// Legacy key for migration
const LEGACY_KEY = 'pantheonGames';

// Backup and history keys
const getBackupKey = (contentType: ContentType) => `${STORAGE_KEYS[contentType]}_backup`;
const getHistoryKey = (contentType: ContentType) => `${STORAGE_KEYS[contentType]}_history`;
const getSaveCountKey = (contentType: ContentType) => `${STORAGE_KEYS[contentType]}_saveCount`;

const MAX_HISTORY = 5;

// Migration function to move legacy data to new structure
const migrateLegacyData = (): void => {
  try {
    const legacyData = localStorage.getItem(LEGACY_KEY);
    if (legacyData) {
      // Move legacy games data to new games storage
      localStorage.setItem(STORAGE_KEYS.games, legacyData);
      
      // Also migrate backup if it exists
      const legacyBackup = localStorage.getItem('pantheonGames_backup');
      if (legacyBackup) {
        localStorage.setItem(getBackupKey('games'), legacyBackup);
      }
      
      // Migrate history if it exists
      const legacyHistory = localStorage.getItem('pantheonGames_history');
      if (legacyHistory) {
        localStorage.setItem(getHistoryKey('games'), legacyHistory);
      }
      
      // Migrate save count if it exists
      const legacySaveCount = localStorage.getItem('saveCount');
      if (legacySaveCount) {
        localStorage.setItem(getSaveCountKey('games'), legacySaveCount);
      }
      
      // Remove legacy keys
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem('pantheonGames_backup');
      localStorage.removeItem('pantheonGames_history');
      localStorage.removeItem('saveCount');
      
      console.log('Successfully migrated legacy game data to new storage structure');
    }
  } catch (e) {
    console.error('Failed to migrate legacy data', e);
  }
};

// Initialize migration on first import
migrateLegacyData();

export const localStateManager = {
  // Check if user has saved content for a specific type
  hasSavedContent: (contentType: ContentType): boolean => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEYS[contentType]);
      return savedContent !== null && savedContent !== '';
    } catch (e) {
      return false;
    }
  },

  // Legacy method for backward compatibility
  hasSavedGames: (): boolean => {
    return localStateManager.hasSavedContent('games');
  },

  // Save content to localStorage with versioning
  saveContent: (content: Content[], contentType: ContentType): void => {
    try {
      // Save to primary storage
      localStorage.setItem(STORAGE_KEYS[contentType], JSON.stringify(content));
      
      // Create backup every 5 saves
      const saveCountKey = getSaveCountKey(contentType);
      const saveCount = parseInt(localStorage.getItem(saveCountKey) || '0');
      if (saveCount % 5 === 0) {
        localStorage.setItem(getBackupKey(contentType), JSON.stringify(content));
      }
      localStorage.setItem(saveCountKey, (saveCount + 1).toString());
      
      // Update history (keep last MAX_HISTORY states)
      const historyKey = getHistoryKey(contentType);
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.push({
        timestamp: new Date().toISOString(),
        content: JSON.stringify(content)
      });
      
      // Keep only the most recent MAX_HISTORY items
      while (history.length > MAX_HISTORY) {
        history.shift();
      }
      
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (e) {
      console.error(`Failed to save ${contentType}`, e);
    }
  },

  // Legacy method for backward compatibility
  saveGames: (games: Game[]): void => {
    localStateManager.saveContent(games, 'games');
  },
  
  // Load content with fallback to backup
  loadContent: (contentType: ContentType): Content[] => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEYS[contentType]);
      if (savedContent) {
        return JSON.parse(savedContent);
      }
    } catch (e) {
      console.error(`Failed to load primary ${contentType} storage, trying backup`, e);
      try {
        const backupContent = localStorage.getItem(getBackupKey(contentType));
        if (backupContent) {
          // Restore from backup
          const content = JSON.parse(backupContent);
          localStorage.setItem(STORAGE_KEYS[contentType], JSON.stringify(content));
          return content;
        }
      } catch (backupError) {
        console.error(`Failed to load ${contentType} backup`, backupError);
      }
    }
    
    // Return default based on content type
    return localStateManager.getDefaultContent(contentType);
  },

  // Legacy method for backward compatibility
  loadGames: (): Game[] => {
    return localStateManager.loadContent('games') as Game[];
  },

  // Get default content for each content type
  getDefaultContent: (contentType: ContentType): Content[] => {
    switch (contentType) {
      case 'games':
        return [{
          id: uid(),
          title: "The Legend of Zelda: Breath of the Wild",
          genre: ["Action‑Adventure"],
          year: 2017,
          category: "olympian", 
          contentType: 'games',
          mythologicalFigureId: "zeus"
        }];
      case 'movies':
        return [DEFAULT_MOVIES[0]];
      case 'tvshows':
        return [DEFAULT_TVSHOWS[0]];
      default:
        return [];
    }
  },
  
  // Export data for a specific content type
  exportContent: (contentType: ContentType): void => {
    try {
      const content = localStorage.getItem(STORAGE_KEYS[contentType]);
      if (!content) return;
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `pantheon_${contentType}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (e) {
      console.error(`Failed to export ${contentType} data`, e);
    }
  },

  // Legacy method for backward compatibility
  exportData: (): void => {
    localStateManager.exportContent('games');
  },
  
  // Import data for a specific content type
  importContent: (jsonData: string, contentType: ContentType): Content[] => {
    try {
      const content = JSON.parse(jsonData);
      // Validate that all items have the correct contentType
      const validContent = content.filter((item: any) => 
        item.contentType === contentType || !item.contentType // Allow items without contentType for legacy support
      );
      // Add contentType to items that don't have it
      const normalizedContent = validContent.map((item: any) => ({
        ...item,
        contentType: item.contentType || contentType
      }));
      return normalizedContent;
    } catch (e) {
      console.error(`Failed to import ${contentType} data`, e);
      return [];
    }
  },

  // Legacy method for backward compatibility
  importData: (jsonData: string): Game[] => {
    return localStateManager.importContent(jsonData, 'games') as Game[];
  },
  
  // Get version history for a specific content type
  getHistory: (contentType: ContentType) => {
    try {
      return JSON.parse(localStorage.getItem(getHistoryKey(contentType)) || '[]');
    } catch (e) {
      console.error(`Failed to load ${contentType} history`, e);
      return [];
    }
  },

  // Legacy method for backward compatibility
  getHistory_legacy: () => {
    return localStateManager.getHistory('games');
  },
  
  // Restore from a specific history point for a content type
  restoreFromHistory: (index: number, contentType: ContentType): Content[] | null => {
    try {
      const history = JSON.parse(localStorage.getItem(getHistoryKey(contentType)) || '[]');
      if (history[index]) {
        const content = JSON.parse(history[index].content);
        return content;
      }
      return null;
    } catch (e) {
      console.error(`Failed to restore ${contentType} from history`, e);
      return null;
    }
  },

  // Legacy method for backward compatibility
  restoreFromHistory_legacy: (index: number): Game[] | null => {
    return localStateManager.restoreFromHistory(index, 'games') as Game[] | null;
  },

  // Get all content types that have saved data
  getAvailableContentTypes: (): ContentType[] => {
    const availableTypes: ContentType[] = [];
    const contentTypes: ContentType[] = ['games', 'movies', 'tvshows'];
    
    contentTypes.forEach(type => {
      if (localStateManager.hasSavedContent(type)) {
        availableTypes.push(type);
      }
    });
    
    return availableTypes;
  },

  // Clear all data for a specific content type
  clearContent: (contentType: ContentType): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS[contentType]);
      localStorage.removeItem(getBackupKey(contentType));
      localStorage.removeItem(getHistoryKey(contentType));
      localStorage.removeItem(getSaveCountKey(contentType));
    } catch (e) {
      console.error(`Failed to clear ${contentType} data`, e);
    }
  },

  // Utility to clean up misplaced content (content with wrong contentType in wrong storage)
  cleanupMisplacedContent: () => {
    const contentTypes: ContentType[] = ['games', 'movies', 'tvshows'];
    let cleanupCount = 0;
    
    contentTypes.forEach(storageType => {
      try {
        const savedContent = localStorage.getItem(STORAGE_KEYS[storageType]);
        if (savedContent) {
          const content: Content[] = JSON.parse(savedContent);
          
          // Filter out content that doesn't match the storage type
          const correctContent = content.filter(item => {
            // Only remove if contentType is explicitly wrong (not missing)
            const isCorrect = !item.contentType || item.contentType === storageType;
            if (!isCorrect) {
              console.log(`Removing misplaced ${item.contentType} "${item.title}" from ${storageType} storage`);
              cleanupCount++;
            }
            return isCorrect;
          });
          
          // Save cleaned content back if any changes were made
          if (correctContent.length !== content.length) {
            console.log(`Cleaned ${storageType} storage: ${content.length} → ${correctContent.length} items`);
            localStorage.setItem(STORAGE_KEYS[storageType], JSON.stringify(correctContent));
          }
        }
      } catch (e) {
        console.error(`Failed to cleanup ${storageType} storage:`, e);
      }
    });
    
    if (cleanupCount > 0) {
      console.log(`Data cleanup completed: Fixed ${cleanupCount} misplaced content items`);
    }
    
    return cleanupCount;
  },
}; 

// Run cleanup to fix any content type mismatches
localStateManager.cleanupMisplacedContent(); 