/**
 * Steam API Helpers
 * Provides functions to fetch game data from Steam's API
 */

import { Game } from "../types";
import { uid } from "./helpers";

// Function to fetch games from Steam API
export const fetchSteamGames = async (steamId: string): Promise<Partial<Game>[]> => {
  try {
    // Using the XML API endpoint for game list
    const apiUrl = `https://steamcommunity.com/profiles/${steamId}/games?tab=all&xml=1`;
    
    // Add a proxy prefix to avoid CORS issues in browser environment
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    const response = await fetch(corsProxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Steam games: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check if the profile is private or not found
    const errorNode = xmlDoc.querySelector("error");
    if (errorNode) {
      throw new Error(errorNode.textContent || "Unknown error fetching Steam profile");
    }
    
    // Parse the games from the XML
    const gameNodes = xmlDoc.querySelectorAll("game");
    const games: Partial<Game>[] = [];
    
    gameNodes.forEach((gameNode) => {
      const appId = gameNode.querySelector("appID")?.textContent;
      const name = gameNode.querySelector("name")?.textContent;
      const hoursPlayed = parseFloat(gameNode.querySelector("hoursOnRecord")?.textContent || "0");
      
      if (appId && name) {
        // Create a partial game object with available data
        const game: Partial<Game> = {
          id: uid(), // Generate a unique ID
          title: name,
          // Set default category
          category: "other",
          // Steam doesn't provide genre and year directly, so we'll leave those to be filled in manually
          // We'll store hours played as a custom property
          steamHoursPlayed: hoursPlayed,
          steamAppId: appId
        };
        
        games.push(game);
      }
    });
    
    // Sort games by hours played (descending)
    return games.sort((a, b) => 
      (b.steamHoursPlayed || 0) - (a.steamHoursPlayed || 0)
    );
  } catch (error) {
    console.error("Error fetching Steam games:", error);
    throw error;
  }
};

// Function to check if a Steam ID is valid
export const isValidSteamId = (steamId: string): boolean => {
  // Steam IDs are typically 17 digits
  return /^\d{17}$/.test(steamId);
};

// Function to check if a game from Steam is already in the collection
export const isGameInCollection = (game: Partial<Game>, existingGames: Game[]): boolean => {
  return existingGames.some(
    existingGame => existingGame.title.toLowerCase() === game.title?.toLowerCase()
  );
}; 