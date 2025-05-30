import { Movie } from '../../types';
import { uid } from '../../utils/helpers';

// Default movie collection - a small curated list to demonstrate the system
export const DEFAULT_MOVIES: Movie[] = [
  {
    id: uid(),
    title: "The Godfather",
    genre: ["Crime", "Drama"],
    year: 1972,
    category: "olympian",
    contentType: 'movies',
    director: "Francis Ford Coppola",
    runtime: 175,
    mythologicalFigureId: "zeus"
  },
  {
    id: uid(),
    title: "Pulp Fiction", 
    genre: ["Crime", "Drama"],
    year: 1994,
    category: "olympian",
    contentType: 'movies',
    director: "Quentin Tarantino",
    runtime: 154,
    mythologicalFigureId: "poseidon"
  },
  {
    id: uid(),
    title: "Inception",
    genre: ["Action", "Sci-Fi", "Thriller"],
    year: 2010,
    category: "titan",
    contentType: 'movies',
    director: "Christopher Nolan",
    runtime: 148
  },
  {
    id: uid(),
    title: "Parasite",
    genre: ["Comedy", "Drama", "Thriller"],
    year: 2019,
    category: "titan",
    contentType: 'movies',
    director: "Bong Joon-ho",
    runtime: 132
  },
  {
    id: uid(),
    title: "Mad Max: Fury Road",
    genre: ["Action", "Adventure", "Sci-Fi"],
    year: 2015,
    category: "demigod",
    contentType: 'movies',
    director: "George Miller",
    runtime: 120
  },
  {
    id: uid(),
    title: "Spider-Man: Into the Spider-Verse",
    genre: ["Animation", "Action", "Adventure"],
    year: 2018,
    category: "muse",
    contentType: 'movies',
    director: "Bob Persichetti",
    runtime: 117
  },
  {
    id: uid(),
    title: "John Wick",
    genre: ["Action", "Crime", "Thriller"],
    year: 2014,
    category: "hero",
    contentType: 'movies',
    director: "Chad Stahelski",
    runtime: 101
  }
]; 