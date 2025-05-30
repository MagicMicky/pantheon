// TV show genres for validation and autocomplete suggestions
export const TVSHOW_GENRES = [
  // Primary genres
  "Action",
  "Adventure", 
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
  
  // TV-specific genres
  "Reality",
  "Talk Show",
  "Game Show",
  "News",
  "Documentary",
  "Biography",
  "History",
  "True Crime",
  
  // Family and animation
  "Animation",
  "Family",
  "Kids",
  "Musical",
  
  // Specialized TV genres
  "Sitcom",
  "Medical",
  "Legal",
  "Police Procedural",
  "Soap Opera",
  "Miniseries",
  "Anthology",
  "Variety",
  "Sports",
  "Cooking",
  "Travel",
  "Nature",
  "Science",
  "Technology",
  "Lifestyle",
  "Educational",
  "Religious",
  "Political",
  "Teen",
  "Supernatural",
  "War",
  "Period Drama",
  "Dark Comedy",
  "Romantic Comedy"
] as const;

// Export type for TypeScript
export type TVShowGenre = typeof TVSHOW_GENRES[number];

// Status options for TV shows
export const TVSHOW_STATUSES = ["ongoing", "ended", "cancelled"] as const;
export type TVShowStatus = typeof TVSHOW_STATUSES[number];

// Genre categories for better organization
export const TVSHOW_GENRE_CATEGORIES = {
  drama: ["Drama", "Medical", "Legal", "Period Drama", "Soap Opera"],
  comedy: ["Comedy", "Sitcom", "Dark Comedy", "Romantic Comedy"],
  action: ["Action", "Adventure", "War", "Police Procedural"],
  thriller: ["Thriller", "Mystery", "Crime", "True Crime", "Horror"],
  fantastical: ["Sci-Fi", "Fantasy", "Supernatural"],
  reality: ["Reality", "Talk Show", "Game Show", "Variety"],
  informational: ["Documentary", "News", "Educational", "Science", "Technology", "History", "Biography"],
  lifestyle: ["Cooking", "Travel", "Lifestyle", "Sports", "Nature"],
  family: ["Family", "Kids", "Animation", "Musical"],
  specialized: ["Miniseries", "Anthology", "Western", "Teen", "Religious", "Political"]
} as const; 