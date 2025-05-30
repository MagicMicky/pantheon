// Movie genres for validation and autocomplete suggestions
export const MOVIE_GENRES = [
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
  
  // Documentary and factual
  "Documentary",
  "Biography",
  "History",
  
  // Family and animation
  "Animation",
  "Family",
  "Musical",
  
  // Specialized genres
  "War",
  "Sport",
  "Superhero",
  "Film Noir",
  "Psychological Thriller",
  "Dark Comedy",
  "Romantic Comedy",
  "Action Comedy",
  "Supernatural",
  "Disaster",
  "Heist",
  "Spy",
  "Road Movie",
  "Coming of Age",
  "Anthology"
] as const;

// Export type for TypeScript
export type MovieGenre = typeof MOVIE_GENRES[number];

// Genre categories for better organization
export const MOVIE_GENRE_CATEGORIES = {
  action: ["Action", "Adventure", "War", "Spy", "Superhero"],
  drama: ["Drama", "Romance", "Biography", "History", "Coming of Age"],
  comedy: ["Comedy", "Romantic Comedy", "Action Comedy", "Dark Comedy"],
  thriller: ["Thriller", "Mystery", "Crime", "Psychological Thriller", "Heist"],
  fantastical: ["Sci-Fi", "Fantasy", "Horror", "Supernatural", "Disaster"],
  specialized: ["Documentary", "Animation", "Musical", "Western", "Film Noir", "Road Movie", "Anthology"],
  family: ["Family", "Sport", "Coming of Age"]
} as const; 