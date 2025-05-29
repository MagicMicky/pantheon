import React, { useState, useEffect, useCallback } from "react";
import { Game } from "../types";
import { fetchSteamGames, isGameInCollection, isValidSteamId } from "../utils/steamHelpers";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button, IconBtn } from "./ui/Buttons";
import { Input } from "./ui/Inputs";
import { X, RefreshCw, GripVertical, Edit, EyeOff, RotateCcw } from "lucide-react";
import { getGenreIcon } from "../utils/helpers";
import { GENRE_ICON_MAPPING } from "../data/genreIcons";

const STEAM_ID_STORAGE_KEY = 'pantheonSteamId';
const IGNORED_GAMES_STORAGE_KEY = 'pantheonIgnoredSteamGames';

interface SteamGamesImportProps {
  existingGames: Game[];
  onGameDragStart: (e: React.DragEvent<HTMLLIElement>, game: Partial<Game>) => void;
}

export const SteamGamesImport: React.FC<SteamGamesImportProps> = ({ existingGames, onGameDragStart }) => {
  const [steamId, setSteamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [steamGames, setSteamGames] = useState<Partial<Game>[]>([]);
  const [idError, setIdError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState<boolean>(true);
  const [ignoredAppIds, setIgnoredAppIds] = useState<Set<string>>(new Set());

  // Helper function to load ignored games from localStorage
  const loadIgnoredAppIds = useCallback(() => {
    try {
      const savedIgnoredGames = localStorage.getItem(IGNORED_GAMES_STORAGE_KEY);
      if (savedIgnoredGames) {
        try {
          const ignoredArray = JSON.parse(savedIgnoredGames);
          if (Array.isArray(ignoredArray)) {
            return new Set(ignoredArray);
          }
        } catch (parseErr) {
          console.error("Failed to parse ignored games from localStorage:", parseErr);
        }
      }
    } catch (err) {
      console.error("Failed to load ignored games from localStorage:", err);
    }
    return new Set();
  }, []);

  // Save ignored games to localStorage
  const saveIgnoredAppIds = useCallback((ignoredIds: Set<string>) => {
    try {
      const ignoredArray = Array.from(ignoredIds);
      localStorage.setItem(IGNORED_GAMES_STORAGE_KEY, JSON.stringify(ignoredArray));
    } catch (err) {
      console.error("Failed to save ignored games to localStorage:", err);
    }
  }, []);

  // Load saved Steam ID and ignored games from localStorage on component mount
  useEffect(() => {
    try {
      // Load Steam ID
      const savedSteamId = localStorage.getItem(STEAM_ID_STORAGE_KEY);
      if (savedSteamId) {
        setSteamId(savedSteamId);
        // If there's a saved ID, automatically fetch games
        if (isValidSteamId(savedSteamId)) {
          setShowInput(false);
          fetchGamesWithId(savedSteamId);
        }
      }

      // Load ignored games
      const ignoredGames = loadIgnoredAppIds();
      setIgnoredAppIds(ignoredGames);
    } catch (err) {
      // If localStorage is not available or fails, continue without it
      console.error("Failed to load data from localStorage:", err);
    }
  }, [loadIgnoredAppIds]);

  const handleSteamIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteamId(e.target.value);
    setIdError(null);
  };

  const saveSteamId = (id: string) => {
    try {
      localStorage.setItem(STEAM_ID_STORAGE_KEY, id);
    } catch (err) {
      console.error("Failed to save Steam ID to localStorage:", err);
    }
  };

  const clearSavedSteamId = () => {
    try {
      localStorage.removeItem(STEAM_ID_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to remove Steam ID from localStorage:", err);
    }
  };

  // Extract the fetch logic to allow reuse with saved ID
  const fetchGamesWithId = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const games = await fetchSteamGames(id);
      setSteamGames(games);
      // Hide the input form after successful fetch
      setShowInput(false);
      // Save the ID to localStorage
      saveSteamId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Steam games");
      setSteamGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    if (!steamId.trim()) {
      setIdError("Please enter a Steam ID");
      return;
    }

    if (!isValidSteamId(steamId)) {
      setIdError("Invalid Steam ID format");
      return;
    }

    await fetchGamesWithId(steamId);
  };

  const changeProfile = () => {
    setShowInput(true);
    // Don't clear the ID from the input, but clear from localStorage
    // so user can change to a new ID without losing the current one yet
    clearSavedSteamId();
  };

  const ignoreGame = (game: Partial<Game>) => {
    if (!game.steamAppId) {
      console.error("Cannot ignore game without steamAppId:", game);
      return;
    }
    
    setIgnoredAppIds(prev => {
      const newSet = new Set(prev);
      newSet.add(game.steamAppId!);
      // Save to localStorage
      saveIgnoredAppIds(newSet);
      return newSet;
    });
  };

  const resetIgnoredGames = () => {
    const emptySet = new Set<string>();
    setIgnoredAppIds(emptySet);
    // Save the empty set to localStorage
    saveIgnoredAppIds(emptySet);
  };

  // Filter out games that are already in the collection or ignored
  const filteredGames = steamGames.filter(game => {
    // Skip if the game is in the collection
    if (isGameInCollection(game, existingGames)) {
      return false;
    }
    
    // Skip if the game is ignored (using steamAppId)
    if (game.steamAppId && ignoredAppIds.has(game.steamAppId)) {
      return false;
    }
    
    return true;
  });

  // Count of ignored games that aren't in the collection
  const ignoredCount = steamGames.filter(game => 
    !isGameInCollection(game, existingGames) && 
    game.steamAppId && ignoredAppIds.has(game.steamAppId)
  ).length;

  return (
    <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white">
          <img src="https://store.cloudflare.steamstatic.com/public/shared/images/header/logo_steam.svg" 
               alt="Steam" 
               className="h-5 inline-block mr-2" />
          Import from Steam
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[280px]">
        {showInput ? (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              Enter your Steam ID to import your games. Your profile must be public.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Steam ID (17 digits)"
                value={steamId}
                onChange={handleSteamIdChange}
                className={idError ? "border-red-500" : ""}
              />
              <Button
                onClick={fetchGames}
                className="bg-slate-700 hover:bg-slate-600 flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Fetch Games"}
              </Button>
            </div>
            {idError && <p className="text-red-500 text-xs mt-1">{idError}</p>}
          </div>
        ) : (
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-400">
              Steam ID: <span className="text-white">{steamId}</span>
            </div>
            <Button
              onClick={changeProfile}
              className="bg-slate-700 hover:bg-slate-600 flex items-center gap-1 text-xs px-2 py-1"
            >
              <Edit className="w-3 h-3" /> Change
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800/50 rounded-md p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {steamGames.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">
                Your Steam Games 
                <span className="text-gray-400 ml-2 font-normal">
                  ({filteredGames.length} available)
                </span>
                {ignoredCount > 0 && (
                  <span className="text-gray-500 ml-2 font-normal">
                    · {ignoredCount} ignored
                    <button 
                      onClick={resetIgnoredGames}
                      className="ml-1 text-amber-500 hover:text-amber-400 transition-colors inline-flex items-center"
                      title="Show ignored games"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </h3>
            </div>
            
            {filteredGames.length > 0 ? (
              <div className="h-[180px] overflow-y-auto pr-1">
                <ul className="space-y-2 text-sm divide-y divide-gray-800/30">
                  {filteredGames.map((game) => (
                    <li
                      key={game.id}
                      className="flex flex-col gap-1 pt-2 first:pt-0 pl-7 relative group/item"
                      draggable
                      onDragStart={(e) => onGameDragStart(e, game)}
                    >
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 flex justify-center">
                        <div className="absolute opacity-0 group-hover/item:opacity-100 text-gray-500 cursor-grab transition-opacity duration-200">
                          <GripVertical size={14} strokeWidth={1.5} />
                        </div>
                        {React.createElement(getGenreIcon(game.genre || "", GENRE_ICON_MAPPING), {
                          className: "w-4 h-4 text-blue-300 flex-shrink-0 group-hover/item:opacity-0 transition-opacity duration-200",
                          strokeWidth: 1.5
                        })}
                      </div>
                      <div className="cursor-grab flex items-center gap-1 flex-wrap justify-between">
                        <span className="font-medium pr-1 leading-tight text-white">
                          {game.title}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            ignoreGame(game);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity duration-200"
                          title="Ignore game"
                        >
                          <EyeOff size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">
                          {game.steamHoursPlayed ? `${game.steamHoursPlayed.toFixed(1)} hours played` : ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-gray-500 italic text-sm border border-dashed border-gray-700/30 rounded-lg">
                {ignoredCount > 0 ? (
                  <div className="text-center">
                    <p>All remaining games are ignored</p>
                    <Button 
                      onClick={resetIgnoredGames} 
                      className="mt-2 bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Show ignored games
                    </Button>
                  </div>
                ) : (
                  <p>All your Steam games are already in your collection</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Show this placeholder when no games are loaded */}
        {!steamGames.length && !error && !isLoading && showInput && (
          <div className="flex items-center justify-center h-[180px] text-gray-500 italic text-sm border border-dashed border-gray-700/30 rounded-lg">
            Enter your Steam ID to see your games
          </div>
        )}
        
        {/* Show loading state placeholder */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 border border-dashed border-gray-700/30 rounded-lg">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Fetching your Steam library...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 