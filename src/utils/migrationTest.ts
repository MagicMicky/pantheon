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
    if (game.contentType === 'games') {
      console.log(`  ${index + 1}. ${game.title}: ${Array.isArray(game.genre) ? `[${game.genre.join(', ')}]` : `"${game.genre}"`}`);
    }
  });
  
  return {
    needsMigration,
    migratedCount: needsMigration ? localStateManager.migrateGenres() : 0,
    totalGames: games.filter((g: any) => g.contentType === 'games').length
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