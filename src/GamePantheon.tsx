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
import { ShareModal, HistoryModal } from "./components/modals";
import { SharedViewBanner, HeaderControls, SharedViewCTA } from "./components/shared";

// Import data
import { CATEGORIES, CATEGORY_COLORS } from "./data/categories";
import { GENRE_ICON_MAPPING } from "./data/genreIcons";

// Import utilities
import { uid, encodeGameData, decodeGameData, getGenreIcon } from "./utils/helpers";
import { wikipediaInfo } from "./utils/wikipediaHelpers";
import { localStateManager } from "./utils/localStateManager";
import { removeShareParams, getShareParams } from "./utils/urlHelpers";
import { calculateDropPosition } from "./utils/dragHelpers";
import { supportsDieties, getUsedDeityIds } from "./utils/gameHelpers";

// Import hooks
import { useShareFeature } from "./hooks/useShareFeature";
import { useMetaTags, setDefaultMetaTags } from "./hooks/useMetaTags";
import { useModalState, useConfirmationModal } from "./hooks/useModalState";
import { useDragAndDrop } from "./hooks/useDragAndDrop";

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
  
  // Use share feature hook
  const {
    shareUrl,
    showShareModal,
    sharedTitle,
    compressionStats,
    setSharedTitle,
    generateShareLink,
    copyToClipboard,
    closeShareModal,
    updateShareUrl
  } = useShareFeature(games);
  
  // Use drag and drop hook
  const {
    dropIndicator,
    onDragStart,
    onDragEnd,
    onDrop,
    onDropOnGame,
    allowDrop,
    removeDragHighlightHandler,
    onSteamGameDragStart,
    setDropIndicator
  } = useDragAndDrop(games, setGames);
  
  // Modal states using the hook
  const deleteConfirm = useConfirmationModal<string>();
  const resetConfirm = useModalState();
  const historyModal = useModalState();
  const overrideConfirm = useModalState();
  
  const [historyItems, setHistoryItems] = useState<Array<{timestamp: string, index: number}>>([]);
  
  // Add a new state for inline deity editing
  const [inlineDeityEdit, setInlineDeityEdit] = useState<string | null>(null);
  
  // Add a ref to track if this is first render
  const isInitialMount = useRef(true);
  
  // Prepare meta tags configuration
  const [metaTagsConfig, setMetaTagsConfig] = useState<{
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogUrl?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterImageAlt?: string;
  }>({});
  
  // Apply meta tags
  useMetaTags(metaTagsConfig);
  
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
  
  // Force dark mode and load data
  useEffect(() => {
    document.documentElement.classList.add('dark');
    setDefaultMetaTags(); // Set default og:type and twitter:card
    
    const { sharedData, sharedTitle: sharedTitleParam } = getShareParams();
    const currentUrl = window.location.href;

    // Default meta tags configuration
    const defaultConfig = {
      description: "Game Pantheon - Organize your favorite games into mythological tiers",
      ogUrl: window.location.origin,
      ogImage: "https://example.com/default-pantheon-preview.png",
      twitterImage: "https://example.com/default-pantheon-preview.png",
      twitterImageAlt: "Game Pantheon tier list"
    };

    if (sharedData) {
      try {
        const decodedGames = decodeGameData(sharedData);
        setGames(decodedGames);
        setIsSharedView(true);
        let pageTitle = "Shared Game Pantheon";
        let metaDescription = "Check out this Game Pantheon list!";

        if (sharedTitleParam) {
          setSharedTitle(sharedTitleParam);
          pageTitle = `${sharedTitleParam} - Game Pantheon`;
          metaDescription = `View the '${sharedTitleParam}' Game Pantheon list.`;
        }
        
        // Update meta tags for shared view
        setMetaTagsConfig({
          ...defaultConfig,
          title: pageTitle,
          ogTitle: pageTitle,
          twitterTitle: pageTitle,
          ogDescription: metaDescription,
          twitterDescription: metaDescription,
          ogUrl: currentUrl,
          twitterImageAlt: `Preview of ${pageTitle}`
        });

      } catch (e) {
        console.error("Failed to parse shared games", e);
        // Fallback to default
        setMetaTagsConfig({
          ...defaultConfig,
          title: "Game Pantheon",
          ogTitle: "Game Pantheon",
          twitterTitle: "Game Pantheon",
          ogDescription: defaultConfig.description,
          twitterDescription: defaultConfig.description
        });
      }
    } else {
      // Load games using the enhanced manager
      setGames(localStateManager.loadGames());
      // Set default meta tags for non-shared view
      setMetaTagsConfig({
        ...defaultConfig,
        title: "Game Pantheon",
        ogTitle: "Game Pantheon",
        twitterTitle: "Game Pantheon",
        ogDescription: defaultConfig.description,
        twitterDescription: defaultConfig.description
      });
    }
  }, [setSharedTitle]);

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
  
  const createNewFromShared = () => {
    // Check if there's existing custom data to warn about override
    // We need to check localStorage directly since loadGames() always returns at least one default game
    try {
      const savedGames = localStorage.getItem('pantheonGames');
      if (savedGames) {
        // User has saved their own data
        overrideConfirm.open();
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
    removeShareParams();
    
    // Reset the shared title and update page title
    setSharedTitle("");
    document.title = "Game Pantheon";
    
    // Close confirmation dialog if open
    overrideConfirm.close();
  };
  
  // Update startFresh to use confirmation
  const requestStartFresh = () => {
    resetConfirm.open();
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
    removeShareParams();
    
    resetConfirm.close();
  };
  
  // CRUD operations
  const add = () => {
    if (!newGame.title || !newGame.genre || !newGame.year) return;
    setGames([...games, {...(newGame as Game), id: uid()}]);
    setNewGame({category: "hero"});
  };
  
  // Update remove to use confirmation
  const requestRemove = (id: string) => {
    deleteConfirm.openWithData(id);
  };
  
  const confirmRemove = () => {
    const itemToDelete = deleteConfirm.data;
    if (itemToDelete) {
      setGames(games.filter(g => g.id !== itemToDelete));
    }
    deleteConfirm.close();
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
    historyModal.open();
  };
  
  const restoreFromHistory = (index: number) => {
    const restoredGames = localStateManager.restoreFromHistory(index);
    if (restoredGames) {
      setGames(restoredGames);
      historyModal.close();
    }
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
        <HeaderControls
          isSharedView={isSharedView}
          onShare={generateShareLink}
          onExport={exportData}
          onImport={importData}
          onOpenHistory={openHistoryModal}
        />
        
        {/* Shared view banner */}
        {isSharedView && (
          <SharedViewBanner
            sharedTitle={sharedTitle}
            onBackToCollection={() => {
              // Remove shared parameters from URL
              removeShareParams();
              
              // Exit shared view
              setIsSharedView(false);
              
              // Load user's own games
              setGames(localStateManager.loadGames());
              
              // Reset title
              document.title = "Game Pantheon";
            }}
          />
        )}
      </header>
      
      {/* "Create your own" banner for shared view */}
      <SharedViewCTA
        isSharedView={isSharedView}
        onCreateFromShared={createNewFromShared}
        onStartFresh={requestStartFresh}
      />
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        shareUrl={shareUrl}
        sharedTitle={sharedTitle}
        compressionStats={compressionStats}
        games={games}
        onClose={closeShareModal}
        onTitleChange={setSharedTitle}
        onCopyToClipboard={copyToClipboard}
        onUpdateShareUrl={updateShareUrl}
      />
      
      {/* History Modal */}
      <HistoryModal
        isOpen={historyModal.isOpen}
        historyItems={historyItems}
        onClose={historyModal.close}
        onRestore={restoreFromHistory}
      />
      
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
              onDragLeave={!isSharedView ? removeDragHighlightHandler : undefined}
              onDragEnter={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => {
                e.stopPropagation();
                allowDrop(e, categoryID);
              } : undefined}
              onDrop={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => {
                removeDragHighlightHandler(e);
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
                        onDrop={!isSharedView ? (e => {
                          setDropIndicator(null); // Always clear indicator on drop
                          onDropOnGame(e, g.id, categoryID);
                        }) : undefined}
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
        isOpen={deleteConfirm.isOpen}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={confirmRemove}
        onCancel={() => deleteConfirm.close()}
      />
      
      <Confirm
        isOpen={resetConfirm.isOpen}
        title="Reset Collection"
        message="Are you sure you want to reset your entire collection? All your current games will be lost."
        onConfirm={confirmStartFresh}
        onCancel={() => resetConfirm.close()}
      />
      
      <Confirm
        isOpen={overrideConfirm.isOpen}
        title="Override Existing Collection"
        message="You already have games in your collection. Using this shared collection will override your existing data. Continue?"
        onConfirm={confirmCreateFromShared}
        onCancel={() => overrideConfirm.close()}
      />
    </div>
  );
} 