import { Game } from '../types';
import { uid } from './helpers';

const PRIMARY_KEY = 'pantheonGames';
const BACKUP_KEY = 'pantheonGames_backup';
const HISTORY_KEY = 'pantheonGames_history';
const MAX_HISTORY = 5;

export const localStateManager = {
  // Save games to localStorage with versioning
  saveGames: (games: Game[]): void => {
    try {
      // Save to primary storage
      localStorage.setItem(PRIMARY_KEY, JSON.stringify(games));
      
      // Create backup every 5 saves
      const saveCount = parseInt(localStorage.getItem('saveCount') || '0');
      if (saveCount % 5 === 0) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(games));
      }
      localStorage.setItem('saveCount', (saveCount + 1).toString());
      
      // Update history (keep last MAX_HISTORY states)
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      history.push({
        timestamp: new Date().toISOString(),
        games: JSON.stringify(games)
      });
      
      // Keep only the most recent MAX_HISTORY items
      while (history.length > MAX_HISTORY) {
        history.shift();
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save games", e);
    }
  },
  
  // Load games with fallback to backup
  loadGames: (): Game[] => {
    try {
      const savedGames = localStorage.getItem(PRIMARY_KEY);
      if (savedGames) {
        return JSON.parse(savedGames);
      }
    } catch (e) {
      console.error("Failed to load primary storage, trying backup", e);
      try {
        const backupGames = localStorage.getItem(BACKUP_KEY);
        if (backupGames) {
          // Restore from backup
          const games = JSON.parse(backupGames);
          localStorage.setItem(PRIMARY_KEY, JSON.stringify(games));
          return games;
        }
      } catch (backupError) {
        console.error("Failed to load backup", backupError);
      }
    }
    
    // Return default if all else fails
    return [{
      id: uid(),
      title: "The Legend of Zelda: Breath of the Wild",
      genre: "Action‑Adventure",
      year: 2017,
      category: "olympian", 
      mythologicalFigureId: "zeus"
    }];
  },
  
  // Export all data as JSON file
  exportData: (): void => {
    try {
      const games = localStorage.getItem(PRIMARY_KEY);
      if (!games) return;
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(games);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `pantheon_games_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (e) {
      console.error("Failed to export data", e);
    }
  },
  
  // Import data from JSON file
  importData: (jsonData: string): Game[] => {
    try {
      const games = JSON.parse(jsonData);
      return games;
    } catch (e) {
      console.error("Failed to import data", e);
      return [];
    }
  },
  
  // Get version history
  getHistory: () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },
  
  // Restore from a specific history point
  restoreFromHistory: (index: number): Game[] | null => {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (history[index]) {
        const games = JSON.parse(history[index].games);
        return games;
      }
      return null;
    } catch (e) {
      console.error("Failed to restore from history", e);
      return null;
    }
  }
}; 