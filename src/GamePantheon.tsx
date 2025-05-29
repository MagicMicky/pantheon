import React, { useState, useEffect, useRef } from "react";
import { 
  Share2, Copy, ArrowLeft, Download, Upload, History
} from "lucide-react";

// Import types
import { Game, CategoryID } from "./types";

// Import components
import { Button, IconBtn } from "./components/ui/Buttons";
import { Confirm } from "./components/ui/Confirm";
import { SteamGamesImport } from "./components/SteamGamesImport";
import { ShareModal, HistoryModal } from "./components/modals";
import { SharedViewBanner, HeaderControls, SharedViewCTA } from "./components/shared";
import GameCategory from "./components/GameCategory";
import GameItem from "./components/GameItem";
import GameEditForm from "./components/GameEditForm";
import AddGameForm from "./components/AddGameForm";

// Import data
import { CATEGORIES, CATEGORY_COLORS } from "./data/categories";

// Import utilities
import { uid, encodeGameData, decodeGameData } from "./utils/helpers";
import { wikipediaInfo } from "./utils/wikipediaHelpers";
import { localStateManager } from "./utils/localStateManager";
import { removeShareParams, getShareParams } from "./utils/urlHelpers";
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
        // Fallback to loading user's own games
        setGames(localStateManager.loadGames());
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
      setIsSharedView(false);
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
    
    // Only save if we're not in shared view and we have games to save
    if (!isSharedView && games.length > 0) {
      localStateManager.saveGames(games);
    }
  }, [games, isSharedView]);
  
  const createNewFromShared = () => {
    // Check if there's existing custom data to warn about override
    if (localStateManager.hasSavedGames()) {
      // User has saved their own data
      overrideConfirm.open();
    } else {
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
  
  // Add a function to properly handle returning to user's collection
  const returnToMyCollection = () => {
    // Remove shared parameters from URL
    removeShareParams();
    
    // Exit shared view
    setIsSharedView(false);
    
    // Check if user actually has saved games
    if (localStateManager.hasSavedGames()) {
      // Load user's saved games
      const userGames = localStateManager.loadGames();
      setGames(userGames);
    } else {
      // User has no saved games, so they'll start with the default
      const defaultGames = localStateManager.loadGames();
      setGames(defaultGames);
    }
    
    // Reset title
    document.title = "Game Pantheon";
    
    // Reset the shared title
    setSharedTitle("");
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

  // Callback functions for the new components
  const handleEdit = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setEditing(gameId);
      setDraft(game);
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setDraft({});
  };

  const handleDraftChange = (updates: Partial<Game>) => {
    setDraft(updates);
  };

  const handleSave = (gameId: string) => {
    save(gameId);
  };

  const handleToggleDeityEdit = (gameId: string | null) => {
    setInlineDeityEdit(gameId);
  };

  const handleNewGameChange = (updates: Partial<Game>) => {
    setNewGame(updates);
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
            onBackToCollection={returnToMyCollection}
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
          <AddGameForm
            newGame={newGame}
            games={games}
            onNewGameChange={handleNewGameChange}
            onAdd={add}
            onAutoFill={autoNew}
          />
          
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
        {Object.entries(CATEGORIES).map(([categoryId, meta]) => (
          <GameCategory
            key={categoryId}
            categoryId={categoryId as CategoryID}
            games={games}
            isSharedView={isSharedView}
            editing={editing}
            draft={draft}
            dropIndicator={dropIndicator}
            inlineDeityEdit={inlineDeityEdit}
            onEdit={handleEdit}
            onDelete={requestRemove}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            onDraftChange={handleDraftChange}
            onAutoFill={autoEdit}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={allowDrop}
            onDragLeave={removeDragHighlightHandler}
            onDragEnter={(e: React.DragEvent<HTMLDivElement>) => {
                e.stopPropagation();
              allowDrop(e, categoryId as CategoryID);
            }}
            onDrop={(e: React.DragEvent<HTMLDivElement>, target: CategoryID) => {
              removeDragHighlightHandler(e);
                            setDropIndicator(null);
              onDrop(e, target);
            }}
            onDropOnGame={onDropOnGame}
            onUpdateDeity={updateDeity}
            onToggleDeityEdit={handleToggleDeityEdit}
            setDropIndicator={setDropIndicator}
          />
        ))}
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