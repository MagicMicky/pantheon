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
import { DeityBadge, DeitySelector } from "./components/DeityComponents";
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
  
  // Helper function to determine if a category supports deities
  const supportsDieties = (category?: CategoryID): boolean => {
    return category ? ['olympian', 'titan', 'hero'].includes(category) : false;
  };
  
  // Add a ref to track if this is first render
  const isInitialMount = useRef(true);
  
  // Force dark mode and load data
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Check for shared data in URL
    const url = new URL(window.location.href);
    const sharedData = url.searchParams.get('shared');
    const sharedTitleParam = url.searchParams.get('title');
    
    if (sharedData) {
      try {
        const decodedGames = decodeGameData(sharedData);
        setGames(decodedGames);
        setIsSharedView(true);
        if (sharedTitleParam) {
          const decodedTitle = decodeURIComponent(sharedTitleParam);
          setSharedTitle(decodedTitle);
          // Set page title to include the shared title
          document.title = `${decodedTitle} - Game Pantheon`;
        } else {
          document.title = "Shared Game Pantheon";
        }
      } catch (e) {
        console.error("Failed to parse shared games", e);
      }
    } else {
      // Load games using the enhanced manager
      setGames(localStateManager.loadGames());
      document.title = "Game Pantheon";
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
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => {
    e.preventDefault();
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
      setGames([...games, newGame]);
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
              <Button onClick={createNewFromShared} className="flex items-center gap-2 bg-amber-800 hover:bg-amber-700">
                <ArrowLeft className="w-4 h-4" /> Save as Mine
              </Button>
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
            <Button onClick={() => window.history.back()} className="mr-3 bg-slate-800 hover:bg-slate-700 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back
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
                      >
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
                            {g.mythologicalFigureId && <DeityBadge mythologicalFigureId={g.mythologicalFigureId} />}
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
                          <div className="grid grid-cols-3 gap-2">
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
                            <Select 
                              value={draft.category} 
                              onChange={e => setDraft({...draft, category: e.target.value as CategoryID})} 
                              className="text-xs"
                            >
                              {Object.entries(CATEGORIES).map(([k,v]) => (
                                <option key={k} value={k}>{v.name}</option>
                              ))}
                            </Select>
                          </div>
                          
                          {/* Mythological Figure Selector in Edit Mode */}
                          {supportsDieties(draft.category) && (
                            <div className="mt-1">
                              <DeitySelector 
                                tier={draft.category as 'olympian' | 'titan' | 'hero'}
                                selectedDeityId={draft.mythologicalFigureId}
                                onChange={(id) => setDraft({...draft, mythologicalFigureId: id})}
                              />
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