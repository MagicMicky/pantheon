// Test utility for genre migration
import { localStateManager } from './localStateManager';

export function testGenreMigration() {
  console.log('🔍 Testing Genre Migration...');
  
  // Check if migration is needed
  const needsMigration = localStateManager.needsGenreMigration();
  console.log(`Migration needed: ${needsMigration}`);
  
  if (needsMigration) {
    console.log('🚀 Running migration...');
    const migratedCount = localStateManager.migrateGenres();
    console.log(`✅ Migrated ${migratedCount} games`);
    
    // Verify migration was successful
    const stillNeedsMigration = localStateManager.needsGenreMigration();
    console.log(`Migration still needed after run: ${stillNeedsMigration}`);
    
    if (!stillNeedsMigration) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('❌ Migration may have failed');
    }
  } else {
    console.log('✅ No migration needed - all games already have array genres');
  }
  
  // Load games to see the current state
  const games = localStateManager.loadContent('games');
  console.log('📊 Current games state:');
  games.forEach((game: any, index: number) => {
    if (game.contentType === 'games' || (!game.contentType && 'genre' in game)) {
      console.log(`  ${index + 1}. ${game.title}: ${Array.isArray(game.genre) ? `[${game.genre.join(', ')}]` : `"${game.genre}"`}`);
    }
  });
  
  return {
    needsMigration,
    migratedCount: needsMigration ? localStateManager.migrateGenres() : 0,
    totalGames: games.filter((g: any) => g.contentType === 'games' || (!g.contentType && 'genre' in g)).length
  };
}

// Function to import the provided JSON data for testing
export function importTestData(jsonData: any[]) {
  console.log('📥 Importing test data...');
  
  // Convert the data to the expected format
  const games = jsonData.map(game => ({
    ...game,
    contentType: 'games' as const
  }));
  
  // Save to localStorage
  localStorage.setItem('pantheon-games', JSON.stringify(games));
  console.log(`✅ Imported ${games.length} games`);
  
  return games;
}

// Browser console script - copy and paste this into your browser console
export const CONSOLE_MIGRATION_SCRIPT = `
// Manual Genre Migration Script
// Copy and paste this entire block into your browser console

console.log('🎮 Manual Genre Migration Script');

// Get current games data
const currentGames = JSON.parse(localStorage.getItem('pantheon-games') || '[]');
console.log('📊 Found ' + currentGames.length + ' items in storage');

// Count games that need migration
const needsMigration = currentGames.filter(item => {
  const isGame = item.contentType === 'games' || 
                 (!item.contentType && 'genre' in item && 
                  ('steamAppId' in item || 'steamHoursPlayed' in item || 
                   typeof item.genre === 'string'));
  return isGame && typeof item.genre === 'string';
});

console.log('🔄 Games needing migration: ' + needsMigration.length);

if (needsMigration.length > 0) {
  // Perform migration
  const migratedGames = currentGames.map(item => {
    const isGame = item.contentType === 'games' || 
                   (!item.contentType && 'genre' in item && 
                    ('steamAppId' in item || 'steamHoursPlayed' in item || 
                     typeof item.genre === 'string'));
    
    if (isGame) {
      if (typeof item.genre === 'string') {
        return {
          ...item,
          contentType: 'games',
          genre: [item.genre]
        };
      } else {
        return {
          ...item,
          contentType: 'games'
        };
      }
    }
    return item;
  });
  
  // Save migrated data
  localStorage.setItem('pantheon-games', JSON.stringify(migratedGames));
  console.log('✅ Migration complete! Refresh the page to see changes.');
  
  // Show before/after for first few games
  console.log('📈 Sample migrations:');
  needsMigration.slice(0, 5).forEach((game, i) => {
    console.log('  ' + (i+1) + '. ' + game.title + ': "' + game.genre + '" → ["' + game.genre + '"]');
  });
} else {
  console.log('✅ No migration needed!');
}
`; 