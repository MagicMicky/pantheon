import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, X, Pen, RefreshCw, GripVertical,
  Share2, Copy, ArrowLeft, Download, Upload, History
} from "lucide-react";

// Import types
import { Game, CategoryID } from "./types";

// Import components
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/Card";
import { Button, IconBtn } from "./components/ui/Buttons";
import { Input, Select } from "./components/ui/Inputs";
import { Autocomplete } from "./components/Autocomplete";
import { DeityBadge, DeitySelector, DeityPopup } from "./components/DeityComponents";
import { Confirm } from "./components/ui/Confirm";
import { Tooltip } from "./components/Tooltip";
import { SteamGamesImport } from "./components/SteamGamesImport";

// Import data
import { CATEGORIES, CATEGORY_COLORS } from "./data/categories";
import { GENRE_ICON_MAPPING } from "./data/genreIcons";

// Import utilities
import { uid, encodeGameData, decodeGameData, getGenreIcon } from "./utils/helpers";
import { wikipediaInfo } from "./utils/wikipediaHelpers";
import { localStateManager } from "./utils/localStateManager";

// Helper function to set meta tags
const setMetaTag = (nameOrProperty: string, content: string, isProperty: boolean = false) => {
  let element = document.querySelector(isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`);
  if (element) {
    element.setAttribute("content", content);
  } else {
    element = document.createElement("meta");
    if (isProperty) {
      element.setAttribute("property", nameOrProperty);
    } else {
      element.setAttribute("name", nameOrProperty);
    }
    element.setAttribute("content", content);
    document.head.appendChild(element);
  }
};

/**
 * Pantheon v8 ────────────────────────────────────────────────────────────────
 * Sophisticated museum-quality design
 * • Refined, desaturated color palette with subtle accents
 * • Elegant typography with proper hierarchy
 * • Enhanced card design with depth and translucency
 * • Sophisticated UI elements and interactions
 */

// ────────────────────────────────────────── Main component
export default function GamePantheon() {
  // Initialize with empty array instead of SAMPLE_GAMES
  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewGame] = useState<Partial<Game>>({category: "hero"});
  const [editing, setEditing] = useState<string|null>(null);
  const [draft, setDraft] = useState<Partial<Game>>({});
  const [isSharedView, setIsSharedView] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharedTitle, setSharedTitle] = useState<string>("");
  const [compressionStats, setCompressionStats] = useState<{original: number, compressed: number, ratio: number}>({
    original: 0, 
    compressed: 0, 
    ratio: 0
  });
  
  // Add states for confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string|null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<Array<{timestamp: string, index: number}>>([]);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState<boolean>(false);
  
  // Add a new state for inline deity editing
  const [inlineDeityEdit, setInlineDeityEdit] = useState<string | null>(null);
  
  // Add state for drop position indicators
  const [dropIndicator, setDropIndicator] = useState<{gameId: string, position: 'before' | 'after'} | null>(null);
  
  // Helper function to determine if a category supports deities
  const supportsDieties = (category?: CategoryID): boolean => {
    return category ? ['olympian', 'titan', 'hero'].includes(category) : false;
  };
  
  // Helper function to get used deity IDs (excluding the current game being edited)
  const getUsedDeityIds = (excludeGameId?: string): string[] => {
    return games
      .filter(game => game.id !== excludeGameId && game.mythologicalFigureId)
      .map(game => game.mythologicalFigureId!)
      .filter(Boolean);
  };
  
  // Add a ref to track if this is first render
  const isInitialMount = useRef(true);
  
  // Force dark mode and load data
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const url = new URL(window.location.href);
    const sharedData = url.searchParams.get('shared');
    const sharedTitleParam = url.searchParams.get('title');
    const currentUrl = url.href; // Get the full current URL

    // Default meta tags (can be overwritten by shared view)
    setMetaTag("description", "Game Pantheon - Organize your favorite games into mythological tiers");
    setMetaTag("og:type", "website", true);
    setMetaTag("twitter:card", "summary_large_image");
    // Placeholder image, replace later
    setMetaTag("og:image", "https://example.com/default-pantheon-preview.png", true);
    setMetaTag("twitter:image", "https://example.com/default-pantheon-preview.png");
    setMetaTag("twitter:image:alt", "Game Pantheon tier list");


    if (sharedData) {
      try {
        const decodedGames = decodeGameData(sharedData);
        setGames(decodedGames);
        setIsSharedView(true);
        let pageTitle = "Shared Game Pantheon";
        let metaDescription = "Check out this Game Pantheon list!";

        if (sharedTitleParam) {
          const decodedTitle = decodeURIComponent(sharedTitleParam);
          setSharedTitle(decodedTitle);
          pageTitle = `${decodedTitle} - Game Pantheon`;
          document.title = pageTitle;
          metaDescription = `View the '${decodedTitle}' Game Pantheon list.`;
        } else {
          document.title = "Shared Game Pantheon";
        }
        
        // Update meta tags for shared view
        setMetaTag("og:title", pageTitle, true);
        setMetaTag("twitter:title", pageTitle);
        setMetaTag("og:description", metaDescription, true);
        setMetaTag("twitter:description", metaDescription);
        setMetaTag("og:url", currentUrl, true);
        // Placeholder dynamic image URL - replace when image generation service is ready
        setMetaTag("og:image", "https://example.com/placeholder-dynamic-image.png", true); 
        setMetaTag("twitter:image", "https://example.com/placeholder-dynamic-image.png");
        setMetaTag("twitter:image:alt", `Preview of ${pageTitle}`);

      } catch (e) {
        console.error("Failed to parse shared games", e);
        // Fallback to default titles and tags if parsing fails
        document.title = "Game Pantheon";
        setMetaTag("og:title", "Game Pantheon", true);
        setMetaTag("twitter:title", "Game Pantheon");
        setMetaTag("og:description", "Organize your favorite games into mythological tiers.", true);
        setMetaTag("twitter:description", "Organize your favorite games into mythological tiers.");
        setMetaTag("og:url", window.location.origin, true); // Use base URL for default
      }
    } else {
      // Load games using the enhanced manager
      setGames(localStateManager.loadGames());
      document.title = "Game Pantheon";
      // Set default meta tags for non-shared view
      setMetaTag("og:title", "Game Pantheon", true);
      setMetaTag("twitter:title", "Game Pantheon");
      setMetaTag("og:description", "Organize your favorite games into mythological tiers.", true);
      setMetaTag("twitter:description", "Organize your favorite games into mythological tiers.");
      setMetaTag("og:url", window.location.origin, true); // Use base URL for default
    }
  }, []);

  // Save games to localStorage whenever they change (only if not in shared view)
  useEffect(() => {
    // Skip saving on the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!isSharedView) {
      localStateManager.saveGames(games);
    }
  }, [games, isSharedView]);
  
  // Sharing functionality
  const generateShareLink = () => {
    // Get both compressed and uncompressed sizes for comparison
    const rawData = JSON.stringify(games);
    const rawBase64 = btoa(encodeURIComponent(rawData));
    
    const encodedData = encodeGameData(games);
    const url = new URL(window.location.href);
    // Remove any existing shared parameter
    url.searchParams.delete('shared');
    url.searchParams.delete('title');
    // Add the encoded data
    url.searchParams.set('shared', encodedData);
    // Add the shared title if provided
    if (sharedTitle) {
      url.searchParams.set('title', encodeURIComponent(sharedTitle));
    }
    setShareUrl(url.toString());
    
    // Calculate compression stats
    const compressionRatio = Math.round((1 - (encodedData.length / rawBase64.length)) * 100);
    setCompressionStats({
      original: rawBase64.length,
      compressed: encodedData.length,
      ratio: compressionRatio
    });
    
    setShowShareModal(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };
  
  const createNewFromShared = () => {
    // Check if there's existing custom data to warn about override
    // We need to check localStorage directly since loadGames() always returns at least one default game
    try {
      const savedGames = localStorage.getItem('pantheonGames');
      if (savedGames) {
        // User has saved their own data
        setShowOverrideConfirm(true);
      } else {
        confirmCreateFromShared();
      }
    } catch (e) {
      // If there's an error accessing localStorage, just proceed
      confirmCreateFromShared();
    }
  };
  
  const confirmCreateFromShared = () => {
    // Save current games to localStorage and exit shared view
    localStateManager.saveGames(games);
    setIsSharedView(false);
    
    // Remove shared parameter from URL without refreshing
    const url = new URL(window.location.href);
    url.searchParams.delete('shared');
    url.searchParams.delete('title');
    window.history.pushState({}, '', url.toString());
    
    // Reset the shared title and update page title
    setSharedTitle("");
    document.title = "Game Pantheon";
    
    // Close confirmation dialog if open
    setShowOverrideConfirm(false);
  };
  
  // Update startFresh to use confirmation
  const requestStartFresh = () => {
    setShowResetConfirm(true);
  };
  
  const confirmStartFresh = () => {
    setGames([{
      id: uid(),
      title: "The Legend of Zelda: Breath of the Wild",
      genre: "Action‑Adventure",
      year: 2017,
      category: "olympian", 
      mythologicalFigureId: "zeus"
    }]);
    setIsSharedView(false);
    
    // Remove shared parameter from URL without refreshing
    const url = new URL(window.location.href);
    url.searchParams.delete('shared');
    window.history.pushState({}, '', url.toString());
    
    setShowResetConfirm(false);
  };
  
  // CRUD operations
  const add = () => {
    if (!newGame.title || !newGame.genre || !newGame.year) return;
    setGames([...games, {...(newGame as Game), id: uid()}]);
    setNewGame({category: "hero"});
  };
  
  // Update remove to use confirmation
  const requestRemove = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmRemove = () => {
    if (itemToDelete) {
      setGames(games.filter(g => g.id !== itemToDelete));
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
  };
  
  const save = (id: string) => {
    if (!draft.title || !draft.genre || !draft.year) return;
    setGames(games.map(g => g.id === id ? {...g, ...draft as Game} : g));
    setEditing(null);
  };
  
  // New data management functions
  const exportData = () => {
    localStateManager.exportData();
  };
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const importedGames = localStateManager.importData(content);
        if (importedGames.length > 0) {
          setGames(importedGames);
        }
      } catch (error) {
        console.error("Failed to import file", error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };
  
  const openHistoryModal = () => {
    const history = localStateManager.getHistory();
    setHistoryItems(history.map((item: any, index: number) => ({
      timestamp: item.timestamp,
      index
    })));
    setShowHistoryModal(true);
  };
  
  const restoreFromHistory = (index: number) => {
    const restoredGames = localStateManager.restoreFromHistory(index);
    if (restoredGames) {
      setGames(restoredGames);
      setShowHistoryModal(false);
    }
  };
  
  // Drag & drop functionality
  const onDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    // Set the data to be the ID
    e.dataTransfer.setData("application/json", JSON.stringify({ 
      id,
      fromSteam: false 
    }));
    e.dataTransfer.effectAllowed = "move";
  };
  
  const onDragEnd = () => {
    // Always clear drop indicators when drag ends
    setDropIndicator(null);
  };
  
  // Helper function to calculate drop position
  const calculateDropPosition = (e: React.DragEvent, targetElement: HTMLElement): 'before' | 'after' => {
    const rect = targetElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const elementMiddle = rect.top + rect.height / 2;
    return mouseY < elementMiddle ? 'before' : 'after';
  };
  
  // Helper function to insert item at specific position
  const insertAtPosition = (
    games: Game[], 
    newGame: Game, 
    targetGameId: string, 
    position: 'before' | 'after',
    targetCategory: CategoryID
  ): Game[] => {
    const categoryGames = games.filter(g => g.category === targetCategory);
    const otherGames = games.filter(g => g.category !== targetCategory);
    
    const targetIndex = categoryGames.findIndex(g => g.id === targetGameId);
    if (targetIndex === -1) {
      // If target not found, add at the end
      return [...otherGames, ...categoryGames, newGame];
    }
    
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    const newCategoryGames = [...categoryGames];
    newCategoryGames.splice(insertIndex, 0, newGame);
    
    return [...otherGames, ...newCategoryGames];
  };
  
  const onDrop = async (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => {
    e.preventDefault();
    
    // Clear any drop indicators
    setDropIndicator(null);
    
    // Get the data from the drag operation
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    
    const dragData = JSON.parse(data);
    const id = dragData.id;
    
    if (dragData.fromSteam) {
      // This is a new game from Steam
      const steamGame = dragData.game;
      const newGame: Game = {
        ...steamGame,
        id: uid(), // Generate a new ID
        category: target,
        // Fill in required fields that might be missing
        genre: steamGame.genre || "Unknown",
        year: steamGame.year || new Date().getFullYear(),
        // Remove deity if not supported by the target category
        mythologicalFigureId: supportsDieties(target) ? steamGame.mythologicalFigureId : undefined
      };
      
      // Add the game at the end of the category
      setGames(prevGames => [...prevGames, newGame]);
      
      // Then try to fetch additional details in the background
      try {
        if (newGame.title) {
          const additionalInfo = await wikipediaInfo(newGame.title);
          
          // Update the game with the fetched information if available
          if (additionalInfo) {
            setGames(prevGames => prevGames.map(g => {
              if (g.id === newGame.id) {
                return {
                  ...g,
                  // Only update genre if it was "Unknown"
                  genre: g.genre === "Unknown" && additionalInfo.genre ? additionalInfo.genre : g.genre,
                  // Only update year if it wasn't set
                  year: (!g.year || g.year === new Date().getFullYear()) && additionalInfo.year ? additionalInfo.year : g.year
                };
              }
              return g;
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch additional game info:", error);
        // The game is already added with default values, so we don't need additional error handling
      }
    } else {
      // This is an existing game being moved
      setGames(games.map(g => {
        if (g.id === id) {
          return { 
            ...g, 
            category: target,
            // Remove deity if not supported by the target category
            mythologicalFigureId: supportsDieties(target) ? g.mythologicalFigureId : undefined
          };
        }
        return g;
      }));
    }
    
    // Remove any highlights
    const elements = document.querySelectorAll('.drag-over');
    elements.forEach(el => el.classList.remove('drag-over'));
  };
  
  // New function for handling drops on individual games (for reordering)
  const onDropOnGame = async (e: React.DragEvent<HTMLLIElement>, targetGameId: string, targetCategory: CategoryID) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear drop indicator
    setDropIndicator(null);
    
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    
    const dragData = JSON.parse(data);
    const draggedGameId = dragData.id;
    
    // Calculate drop position
    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
    
    // Handle Steam game drops - add them to the target category at the drop position
    if (dragData.fromSteam) {
      const steamGame = dragData.game;
      const newGame: Game = {
        ...steamGame,
        id: uid(), // Generate a new ID
        category: targetCategory,
        // Fill in required fields that might be missing
        genre: steamGame.genre || "Unknown",
        year: steamGame.year || new Date().getFullYear(),
        // Remove deity if not supported by the target category
        mythologicalFigureId: supportsDieties(targetCategory) ? steamGame.mythologicalFigureId : undefined
      };
      
      // Insert at the calculated position
      const newGames = insertAtPosition(games, newGame, targetGameId, position, targetCategory);
      setGames(newGames);
      
      // Then try to fetch additional details in the background
      try {
        if (newGame.title) {
          const additionalInfo = await wikipediaInfo(newGame.title);
          
          // Update the game with the fetched information if available
          if (additionalInfo) {
            setGames(prevGames => prevGames.map(g => {
              if (g.id === newGame.id) {
                return {
                  ...g,
                  // Only update genre if it was "Unknown"
                  genre: g.genre === "Unknown" && additionalInfo.genre ? additionalInfo.genre : g.genre,
                  // Only update year if it wasn't set
                  year: (!g.year || g.year === new Date().getFullYear()) && additionalInfo.year ? additionalInfo.year : g.year
                };
              }
              return g;
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch additional game info:", error);
        // The game is already added with default values, so we don't need additional error handling
      }
      return;
    }
    
    // Skip if trying to drop on itself
    if (draggedGameId === targetGameId) return;
    
    const draggedGame = games.find(g => g.id === draggedGameId);
    const targetGame = games.find(g => g.id === targetGameId);
    
    if (!draggedGame || !targetGame) return;
    
    // If moving to a different category, move to the calculated position
    if (draggedGame.category !== targetCategory) {
      const updatedGame = { 
        ...draggedGame, 
        category: targetCategory,
        // Remove deity if not supported by the target category
        mythologicalFigureId: supportsDieties(targetCategory) ? draggedGame.mythologicalFigureId : undefined
      };
      
      // Remove from old position and insert at new position
      const gamesWithoutDragged = games.filter(g => g.id !== draggedGameId);
      const newGames = insertAtPosition(gamesWithoutDragged, updatedGame, targetGameId, position, targetCategory);
      setGames(newGames);
      return;
    }
    
    // Reorder within the same category
    const categoryGames = games.filter(g => g.category === targetCategory);
    const otherGames = games.filter(g => g.category !== targetCategory);
    
    // Find positions
    const draggedIndex = categoryGames.findIndex(g => g.id === draggedGameId);
    const targetIndex = categoryGames.findIndex(g => g.id === targetGameId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Don't do anything if we're trying to insert in the same position
    if ((position === 'before' && targetIndex === draggedIndex + 1) || 
        (position === 'after' && targetIndex === draggedIndex - 1)) {
      return;
    }
    
    // Create a new array and perform the reordering
    const newCategoryGames = [...categoryGames];
    const [draggedItem] = newCategoryGames.splice(draggedIndex, 1);
    
    // Calculate the insertion index after removing the dragged item
    let insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    
    // Adjust for the removed item
    if (draggedIndex < targetIndex) {
      insertIndex -= 1;
    }
    
    newCategoryGames.splice(insertIndex, 0, draggedItem);
    
    // Combine with other categories
    setGames([...otherGames, ...newCategoryGames]);
  };
  
  // Drag highlight management
  const allowDrop = (e: React.DragEvent<HTMLElement>, category: CategoryID) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Get target element and check if already highlighted
    const target = e.currentTarget as HTMLElement;
    
    // Clear any existing highlights before adding new ones
    document.querySelectorAll('.drag-highlight').forEach(el => {
      if (el !== target) {
        el.classList.remove('drag-highlight');
        (el as HTMLElement).style.outlineStyle = '';
        (el as HTMLElement).style.outlineWidth = '';
        (el as HTMLElement).style.outlineColor = '';
        (el as HTMLElement).style.backgroundColor = '';
      }
    });
    
    // Skip if already highlighted
    if (target.classList.contains('drag-highlight')) return;
    
    // Add highlight class
    target.classList.add('drag-highlight');
    
    // Get colors for this category
    const colors = CATEGORY_COLORS[category];
    
    // Apply category-specific styles
    target.style.outlineStyle = 'dashed';
    target.style.outlineWidth = '2px';
    target.style.outlineColor = colors.highlight;
    target.style.backgroundColor = `${colors.highlight}33`; // 33 is ~20% opacity in hex
  };
  
  const removeDragHighlight = (e: React.DragEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-highlight');
    
    // Reset styles
    target.style.outlineStyle = '';
    target.style.outlineWidth = '';
    target.style.outlineColor = '';
    target.style.backgroundColor = '';
  };
  
  // Autofill functions
  const autoNew = async () => {
    if (!newGame.title) return;
    setNewGame({...newGame, ...await wikipediaInfo(newGame.title)});
  };
  
  const autoEdit = async () => {
    if (!draft.title) return;
    setDraft({...draft, ...await wikipediaInfo(draft.title)});
  };

  // Add function to handle drag start from Steam game
  const onSteamGameDragStart = (e: React.DragEvent<HTMLLIElement>, game: Partial<Game>) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: game.id,
      fromSteam: true,
      game
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  // Add a function to handle inline deity updates
  const updateDeity = (gameId: string, deityId: string | undefined) => {
    setGames(games.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          mythologicalFigureId: deityId
        };
      }
      return g;
    }));
    setInlineDeityEdit(null);
  };

  // Return JSX
  return (
    <div className="p-8 bg-gradient-to-br from-slate-950 to-gray-900 min-h-screen select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] font-sans">
      <header className="text-center mb-10 relative">
        <h1 className="text-5xl font-serif font-bold tracking-wider text-white mb-1">
          <span className="inline-block mr-2 transform translate-y-1">🏛️</span> 
          The Game Pantheon
        </h1>
        <p className="text-gray-400 text-sm tracking-wide mt-2 italic">Curate your personal collection of gaming greatness</p>
        
        {/* Data management and share buttons */}
        <div className="absolute right-0 top-0 flex gap-2">
          {isSharedView ? (
            <>
              {/* "Save as Mine" button removed to avoid duplication with banner below */}
            </>
          ) : (
            <>
              <Tooltip content="Share your collection" position="bottom">
                <Button onClick={generateShareLink} className="p-2 bg-slate-800 hover:bg-slate-700">
                  <Share2 className="w-5 h-5" />
                </Button>
              </Tooltip>
              <Tooltip content="Export as JSON file" position="bottom">
                <Button onClick={exportData} className="p-2 bg-slate-800 hover:bg-slate-700">
                  <Download className="w-5 h-5" />
                </Button>
              </Tooltip>
              <div className="relative">
                <input 
                  type="file" 
                  id="import-input" 
                  accept=".json" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={importData}
                />
                <Tooltip content="Import from JSON file" position="bottom">
                  <Button className="p-2 bg-slate-800 hover:bg-slate-700">
                    <Upload className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
              <Tooltip content="View version history" position="bottom">
                <Button onClick={openHistoryModal} className="p-2 bg-slate-800 hover:bg-slate-700">
                  <History className="w-5 h-5" />
                </Button>
              </Tooltip>
            </>
          )}
        </div>
        
        {/* Shared view banner */}
        {isSharedView && (
          <div className="absolute left-0 top-0 flex items-center">
            <Button onClick={() => {
              // Remove shared parameters from URL
              const url = new URL(window.location.href);
              url.searchParams.delete('shared');
              url.searchParams.delete('title');
              window.history.pushState({}, '', url.toString());
              
              // Exit shared view
              setIsSharedView(false);
              
              // Load user's own games
              setGames(localStateManager.loadGames());
              
              // Reset title
              document.title = "Game Pantheon";
            }} className="mr-3 bg-slate-800 hover:bg-slate-700 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to My Collection
            </Button>
            <div className="bg-slate-800/80 backdrop-blur-sm text-white py-2 px-4 rounded-md flex items-center text-sm">
              <span className="text-amber-300 mr-2">👁️</span> 
              {sharedTitle ? (
                <>Viewing <span className="font-medium text-amber-200 mx-1">{sharedTitle}</span></>
              ) : (
                <>Viewing a shared pantheon</>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* "Create your own" banner for shared view */}
      {isSharedView && (
        <div className="mx-auto max-w-2xl bg-amber-900/30 border border-amber-700/30 backdrop-blur-md p-4 rounded-xl shadow-xl mb-12 text-center">
          <h3 className="text-amber-200 font-medium mb-2">Want to create your own pantheon?</h3>
          <div className="flex justify-center gap-4">
            <Button onClick={createNewFromShared} className="bg-amber-800 hover:bg-amber-700">Start with this collection</Button>
            <Button onClick={requestStartFresh} className="bg-slate-700 hover:bg-slate-600">Start from scratch</Button>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-400" /> Share Your Pantheon
            </h2>
            <p className="text-gray-400 mb-4 text-sm">Add a title for your shared pantheon (optional):</p>
            <div className="mb-4">
              <Input 
                placeholder="My Favorite Games" 
                value={sharedTitle} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSharedTitle(e.target.value);
                  // Regenerate the URL with the new title
                  const url = new URL(window.location.href);
                  url.searchParams.delete('shared');
                  url.searchParams.delete('title');
                  url.searchParams.set('shared', encodeGameData(games));
                  if (e.target.value) {
                    url.searchParams.set('title', encodeURIComponent(e.target.value));
                  }
                  setShareUrl(url.toString());
                }}
                className="w-full bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <p className="text-gray-400 mb-4 text-sm">Share this link with friends to show them your game pantheon:</p>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm overflow-hidden" 
              />
              <Button onClick={copyToClipboard} className="bg-slate-700 hover:bg-slate-600 flex-shrink-0 flex items-center gap-2">
                <Copy className="w-4 h-4" /> Copy
              </Button>
            </div>
            
            {/* Compression stats */}
            <div className="bg-slate-800/50 rounded-md p-3 mb-6 text-sm">
              <h3 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
                <span className="text-amber-300">📊</span> Compression Statistics
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="text-gray-400">Original data size:</div>
                <div className="text-gray-300">{compressionStats.original.toLocaleString()} chars</div>
                
                <div className="text-gray-400">Compressed size:</div>
                <div className="text-gray-300">{compressionStats.compressed.toLocaleString()} chars</div>
                
                <div className="text-gray-400">Size reduction:</div>
                <div className="text-amber-300 font-medium">{compressionStats.ratio}%</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowShareModal(false)} className="bg-slate-700 hover:bg-slate-600">Done</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" /> Version History
            </h2>
            
            {historyItems.length > 0 ? (
              <div className="mb-6 max-h-[300px] overflow-y-auto">
                <ul className="space-y-2">
                  {historyItems.map((item, i) => (
                    <li key={i} className="border border-slate-700 rounded p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300 text-sm">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <span className="text-amber-300 text-xs">
                          Version {historyItems.length - i}
                        </span>
                      </div>
                      <Button 
                        onClick={() => restoreFromHistory(item.index)} 
                        className="bg-amber-800 hover:bg-amber-700 w-full text-sm"
                      >
                        Restore This Version
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-6 text-gray-400 text-center p-6 border border-dashed border-gray-700 rounded-md">
                No history available yet. Changes will appear here after you make edits.
              </div>
            )}
            
            <div className="flex justify-end">
              <Button onClick={() => setShowHistoryModal(false)} className="bg-slate-700 hover:bg-slate-600">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Form - only show if not in shared view */}
      {!isSharedView && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mx-auto max-w-4xl mb-12">
          <div className="md:col-span-7 bg-slate-900/70 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-800/50">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-white mb-4 tracking-wide">
              <Plus className="w-5 h-5"/> Add Game
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Autocomplete 
                value={newGame.title??""} 
                onChange={v => setNewGame({...newGame, title: v})} 
                onSelect={async v => setNewGame({...newGame, title: v, ...await wikipediaInfo(v)})}
              />
              <Input 
                placeholder="Genre" 
                value={newGame.genre??""} 
                onChange={e => setNewGame({...newGame, genre: e.target.value})}
              />
              <Input 
                type="number" 
                placeholder="Year" 
                value={newGame.year??""} 
                onChange={e => setNewGame({...newGame, year: +e.target.value})}
              />
              <Select 
                value={newGame.category} 
                onChange={e => setNewGame({...newGame, category: e.target.value as CategoryID})}
              >
                {Object.entries(CATEGORIES).map(([k,v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </Select>
            </div>
            
            {/* Mythological Figure Selector - only show for appropriate categories */}
            {supportsDieties(newGame.category) && (
              <DeitySelector 
                tier={newGame.category as 'olympian' | 'titan' | 'hero'}
                selectedDeityId={newGame.mythologicalFigureId}
                onChange={(id) => setNewGame({...newGame, mythologicalFigureId: id})}
                usedDeityIds={getUsedDeityIds()}
              />
            )}
            
            <div className="flex justify-between mt-6">
              <Button onClick={autoNew} className="bg-slate-700 hover:bg-slate-600 text-gray-200">Auto‑Fill</Button>
              <Button onClick={add} className="bg-slate-700 hover:bg-slate-600">Add</Button>
            </div>
          </div>
          
          {/* Steam Games Import Panel */}
          <div className="md:col-span-5">
            <SteamGamesImport 
              existingGames={games} 
              onGameDragStart={onSteamGameDragStart} 
            />
          </div>
        </div>
      )}

      <div className="grid gap-6" style={{gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))"}}>
        {Object.entries(CATEGORIES).map(([cid, meta]) => {
          const categoryID = cid as CategoryID;
          const Icon = meta.icon;
          const list = games.filter(g => g.category === categoryID);
          const colors = CATEGORY_COLORS[categoryID];
          
          return (
            <Card 
              key={cid} 
              category={categoryID}
              onDragOver={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => allowDrop(e, categoryID) : undefined} 
              onDragLeave={!isSharedView ? removeDragHighlight : undefined}
              onDragEnter={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => {
                e.stopPropagation();
                allowDrop(e, categoryID);
              } : undefined}
              onDrop={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => {
                removeDragHighlight(e);
                setDropIndicator(null); // Clear any lingering drop indicators
                onDrop(e, categoryID);
              } : undefined}
            >
              <CardHeader category={categoryID}>
                <Icon className="w-5 h-5 text-white opacity-90"/>
                <CardTitle category={categoryID}>{meta.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-2 italic">{meta.blurb}</p>
                {list.length ? (
                  <ul className="space-y-2 text-sm divide-y divide-gray-800/30">
                    {list.map(g => editing !== g.id ? (
                      <li 
                        key={g.id} 
                        className="flex flex-col gap-1 pt-2 first:pt-0 pl-7 relative group/item" 
                        draggable={!isSharedView} 
                        onDragStart={!isSharedView ? e => onDragStart(e, g.id) : undefined}
                        onDragEnd={!isSharedView ? onDragEnd : undefined}
                        onDragOver={!isSharedView ? (e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          
                          // Calculate and set drop indicator
                          const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
                          setDropIndicator({gameId: g.id, position});
                        } : undefined}
                        onDragLeave={!isSharedView ? (e) => {
                          // Only clear if we're actually leaving this element and not entering a child
                          const relatedTarget = e.relatedTarget as HTMLElement;
                          const currentTarget = e.currentTarget as HTMLElement;
                          
                          if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
                            setDropIndicator(null);
                          }
                        } : undefined}
                        onDrop={!isSharedView ? (e) => {
                          setDropIndicator(null); // Always clear indicator on drop
                          onDropOnGame(e, g.id, categoryID);
                        } : undefined}
                      >
                        {/* Drop indicator before this item */}
                        {dropIndicator?.gameId === g.id && dropIndicator.position === 'before' && (
                          <div className={`absolute -top-1 left-0 right-0 h-0.5 rounded-full opacity-80 z-10`} style={{backgroundColor: colors.highlight}} />
                        )}
                        
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 flex justify-center">
                          {!isSharedView && (
                            <div className="absolute opacity-0 group-hover/item:opacity-100 text-gray-500 cursor-grab transition-opacity duration-200">
                              <GripVertical size={14} strokeWidth={1.5} />
                            </div>
                          )}
                          {React.createElement(getGenreIcon(g.genre, GENRE_ICON_MAPPING), {
                            className: `w-4 h-4 ${colors.text} flex-shrink-0 ${!isSharedView ? "group-hover/item:opacity-0" : ""} transition-opacity duration-200`,
                            strokeWidth: 1.5
                          })}
                        </div>
                        <div className={!isSharedView ? "cursor-grab flex items-center gap-1 flex-wrap" : "flex items-center gap-1 flex-wrap"}>
                          <div className="flex items-center">
                            <span className="font-medium pr-1 leading-tight text-white">{g.title}</span>
                            {g.mythologicalFigureId ? (
                              <DeityBadge mythologicalFigureId={g.mythologicalFigureId} />
                            ) : supportsDieties(g.category) && !isSharedView ? (
                              <DeityPopup
                                tier={g.category as 'olympian' | 'titan' | 'hero'}
                                usedDeityIds={getUsedDeityIds(g.id)}
                                onSelect={(id) => updateDeity(g.id, id)}
                                onCancel={() => setInlineDeityEdit(null)}
                                isOpen={inlineDeityEdit === g.id}
                                onToggle={() => {
                                  if (inlineDeityEdit === g.id) {
                                    setInlineDeityEdit(null);
                                  } else {
                                    setInlineDeityEdit(g.id);
                                  }
                                }}
                              >
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  className="border border-dashed border-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-gray-400 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                                  title="Add mythological figure"
                                >
                                  +
                                </button>
                              </DeityPopup>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">{g.genre} · {g.year}</span>
                          {!isSharedView && (
                            <div className="flex gap-1 opacity-70 group-hover/item:opacity-100 transition-opacity duration-200">
                              <IconBtn title="Edit" onClick={() => {setEditing(g.id); setDraft({...g})}}><Pen className="w-3 h-3" strokeWidth={1.5}/></IconBtn>
                              <IconBtn title="Delete" onClick={() => requestRemove(g.id)}><X className="w-3 h-3" strokeWidth={1.5}/></IconBtn>
                            </div>
                          )}
                        </div>
                        
                        {/* Drop indicator after this item */}
                        {dropIndicator?.gameId === g.id && dropIndicator.position === 'after' && (
                          <div className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full opacity-80 z-10`} style={{backgroundColor: colors.highlight}} />
                        )}
                      </li>
                    ) : (
                      // Edit form
                      (!isSharedView && editing === g.id) && (
                        <li key={g.id} className="flex flex-col gap-3 pt-2 first:pt-0 pl-7 relative">
                          <div className="absolute left-0 top-[calc(1rem+8px)] w-5 flex justify-center">
                            {React.createElement(getGenreIcon(draft.genre || "", GENRE_ICON_MAPPING), {
                              className: `w-4 h-4 ${colors.text} flex-shrink-0`,
                              strokeWidth: 1.5
                            })}
                          </div>
                          <div>
                            <Autocomplete 
                              value={draft.title||""} 
                              onChange={v => setDraft({...draft, title: v})} 
                              onSelect={async v => setDraft({...draft, title: v, ...await wikipediaInfo(v)})} 
                              inputClass="text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              value={draft.genre||""} 
                              onChange={e => setDraft({...draft, genre: e.target.value})} 
                              className="text-xs" 
                              placeholder="Genre"
                            />
                            <Input 
                              type="number" 
                              value={draft.year||""} 
                              onChange={e => setDraft({...draft, year: +e.target.value})} 
                              className="text-xs" 
                              placeholder="Year"
                            />
                          </div>
                          
                          {/* Inline Mythological Figure Selector in Edit Mode */}
                          {supportsDieties(draft.category) && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">Deity:</span>
                              {draft.mythologicalFigureId ? (
                                <DeityBadge mythologicalFigureId={draft.mythologicalFigureId} />
                              ) : (
                                <DeityPopup
                                  tier={draft.category as 'olympian' | 'titan' | 'hero'}
                                  usedDeityIds={getUsedDeityIds(g.id)}
                                  onSelect={(id) => setDraft({...draft, mythologicalFigureId: id})}
                                  onCancel={() => setInlineDeityEdit(null)}
                                  isOpen={inlineDeityEdit === g.id}
                                  onToggle={() => {
                                    if (inlineDeityEdit === g.id) {
                                      setInlineDeityEdit(null);
                                    } else {
                                      setInlineDeityEdit(g.id);
                                    }
                                  }}
                                >
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                    }}
                                    className="border border-dashed border-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-gray-400 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                                    title="Add mythological figure"
                                  >
                                    +
                                  </button>
                                </DeityPopup>
                              )}
                              {draft.mythologicalFigureId && (
                                <button 
                                  onClick={() => setDraft({...draft, mythologicalFigureId: undefined})}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                  title="Remove deity"
                                >
                                  <X className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                              )}
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-2 items-center">
                            <IconBtn title="Auto‑Fill" onClick={autoEdit}><RefreshCw className="w-3 h-3" strokeWidth={1.5}/></IconBtn>
                            <Button onClick={() => save(g.id)} className="bg-green-800 hover:bg-green-700 px-2 py-1 text-xs">Save</Button>
                            <Button onClick={() => setEditing(null)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs">Cancel</Button>
                          </div>
                        </li>
                      )
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-16 text-gray-500 italic text-sm border border-dashed border-gray-700/30 rounded-lg">
                    No games in this category yet
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Confirmation dialogs */}
      <Confirm
        isOpen={showDeleteConfirm}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={confirmRemove}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      <Confirm
        isOpen={showResetConfirm}
        title="Reset Collection"
        message="Are you sure you want to reset your entire collection? All your current games will be lost."
        onConfirm={confirmStartFresh}
        onCancel={() => setShowResetConfirm(false)}
      />
      
      <Confirm
        isOpen={showOverrideConfirm}
        title="Override Existing Collection"
        message="You already have games in your collection. Using this shared collection will override your existing data. Continue?"
        onConfirm={confirmCreateFromShared}
        onCancel={() => setShowOverrideConfirm(false)}
      />
    </div>
  );
} 