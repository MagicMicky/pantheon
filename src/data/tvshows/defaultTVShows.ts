import { TVShow } from '../../types';
import { uid } from '../../utils/helpers';

// Default TV show collection - a small curated list to demonstrate the system
export const DEFAULT_TVSHOWS: TVShow[] = [
  {
    id: uid(),
    title: "Breaking Bad",
    genre: ["Crime", "Drama", "Thriller"],
    year: 2008,
    category: "olympian",
    contentType: 'tvshows',
    seasons: 5,
    status: "ended",
    mythologicalFigureId: "hades"
  },
  {
    id: uid(),
    title: "The Sopranos", 
    genre: ["Crime", "Drama"],
    year: 1999,
    category: "olympian",
    contentType: 'tvshows',
    seasons: 6,
    status: "ended",
    mythologicalFigureId: "zeus"
  },
  {
    id: uid(),
    title: "Game of Thrones",
    genre: ["Action", "Adventure", "Drama", "Fantasy"],
    year: 2011,
    category: "titan",
    contentType: 'tvshows',
    seasons: 8,
    status: "ended"
  },
  {
    id: uid(),
    title: "Stranger Things",
    genre: ["Drama", "Fantasy", "Horror", "Mystery"],
    year: 2016,
    category: "titan", 
    contentType: 'tvshows',
    seasons: 4,
    status: "ongoing"
  },
  {
    id: uid(),
    title: "The Office",
    genre: ["Comedy"],
    year: 2005,
    category: "hero",
    contentType: 'tvshows',
    seasons: 9,
    status: "ended"
  },
  {
    id: uid(),
    title: "Avatar: The Last Airbender",
    genre: ["Animation", "Action", "Adventure", "Comedy", "Drama", "Family", "Fantasy"],
    year: 2005,
    category: "muse",
    contentType: 'tvshows',
    seasons: 3,
    status: "ended"
  },
  {
    id: uid(),
    title: "The Mandalorian",
    genre: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
    year: 2019,
    category: "demigod",
    contentType: 'tvshows', 
    seasons: 3,
    status: "ongoing"
  }
]; 