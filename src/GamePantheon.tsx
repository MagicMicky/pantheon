import React, { useEffect, useState } from "react";

// Import types
import { CategoryID, Content, ContentType, Game, Movie, TVShow } from "./types";

// Import components
import AddContentForm from "./components/AddContentForm";
import { ContentTypeSelector } from "./components/ContentTypeSelector";
import GameCategory from "./components/GameCategory";
import { SteamGamesImport } from "./components/SteamGamesImport";
import { HistoryModal, ShareModal } from "./components/modals";
import { HeaderControls, SharedViewBanner, SharedViewCTA } from "./components/shared";
import { Confirm } from "./components/ui/Confirm";

// Import data
import { CATEGORIES } from "./data/categories";

// Import utilities
import { decodeContentData, decodeGameData } from "./utils/helpers";
import { localStateManager } from "./utils/localStateManager";
import { getShareParams, removeShareParams } from "./utils/urlHelpers";
import { wikipediaInfo } from "./utils/wikipediaHelpers";

// Import hooks
import { useContentDragAndDrop } from "./hooks/useContentDragAndDrop";
import { setDefaultMetaTags, useMetaTags } from "./hooks/useMetaTags";
import { useConfirmationModal, useModalState } from "./hooks/useModalState";
import { useShareFeature } from "./hooks/useShareFeature";

// Import context
import { usePantheonContext } from "./contexts/PantheonContext";

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
  // Use PantheonContext for content management
  const {
    currentContentType,
    currentContent,
    switchContentType,
    addContent,
    updateContent,
    deleteContent,
    updateDeity: updateContentDeity,
    setContent,
    resetToDefault,
    // Legacy compatibility for games
    setGames
  } = usePantheonContext();
  
  const [newContent, setNewContent] = useState<Partial<Content>>({category: "hero", contentType: currentContentType});
  const [editing, setEditing] = useState<string|null>(null);
  const [draft, setDraft] = useState<Partial<Content>>({});
  const [isSharedView, setIsSharedView] = useState<boolean>(false);
  const [sharedContent, setSharedContent] = useState<Content[]>([]);
  
  // Determine what content to display - shared content in shared view, otherwise current content
  const displayContent = isSharedView ? sharedContent : currentContent;
  
  // Use share feature hook with current content
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
  } = useShareFeature(displayContent, currentContentType);
  
  // Use generalized drag and drop hook for all content types
  const {
    dropIndicator,
    onDragStart,
    onDragEnd,
    onDrop,
    onDropOnContent,
    allowDrop,
    removeDragHighlightHandler,
    setDropIndicator,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } = useContentDragAndDrop(
    (newContent) => {
      if (currentContentType === 'games') {
        // Legacy compatibility for games
        if (typeof newContent === 'function') {
          setGames(newContent(displayContent as Game[]) as Game[]);
        } else {
          setGames(newContent as Game[]);
        }
      } else {
        // For movies and TV shows, update through context
        if (typeof newContent === 'function') {
          setContent(newContent(displayContent));
        } else {
          setContent(newContent);
        }
      }
    }
  );
  
  // Modal states using the hook
  const deleteConfirm = useConfirmationModal<string>();
  const resetConfirm = useModalState();
  const historyModal = useModalState();
  const overrideConfirm = useModalState();
  
  const [historyItems, setHistoryItems] = useState<Array<{timestamp: string, index: number}>>([]);
  
  // Add a new state for inline deity editing
  const [inlineDeityEdit, setInlineDeityEdit] = useState<string | null>(null);
  
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

  // Get content type display names
  const getContentTypeDisplayName = (contentType: ContentType): string => {
    switch (contentType) {
      case 'games': return 'Game';
      case 'movies': return 'Movie';
      case 'tvshows': return 'TV Show';
      default: return 'Content';
    }
  };
  
  // Force dark mode and load data
  useEffect(() => {
    document.documentElement.classList.add('dark');
    setDefaultMetaTags(); // Set default og:type and twitter:card
    
    const { sharedData, sharedTitle: sharedTitleParam, contentType: sharedContentType } = getShareParams();
    const currentUrl = window.location.href;

    // Default meta tags configuration
    const defaultConfig = {
      description: "Multi-Content Pantheon - Organize your favorite games, movies, and TV shows into mythological tiers",
      ogUrl: window.location.origin,
      ogImage: "https://example.com/default-pantheon-preview.png",
      twitterImage: "https://example.com/default-pantheon-preview.png",
      twitterImageAlt: "Multi-Content Pantheon tier list"
    };

    if (sharedData && sharedContentType) {
      try {
        // Decode content based on the shared content type
        const decodedContent = decodeContentData(sharedData, sharedContentType);
        
        // Switch to the shared content type
        switchContentType(sharedContentType);
        
        // Set shared content for display only (don't overwrite user data)
        setSharedContent(decodedContent);
        setIsSharedView(true);
        
        const contentTypeName = getContentTypeDisplayName(sharedContentType);
        let pageTitle = `Shared ${contentTypeName} Pantheon`;
        let metaDescription = `Check out this ${contentTypeName} Pantheon list!`;

        if (sharedTitleParam) {
          setSharedTitle(sharedTitleParam);
          pageTitle = `${sharedTitleParam} - ${contentTypeName} Pantheon`;
          metaDescription = `View the '${sharedTitleParam}' ${contentTypeName} Pantheon list.`;
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
        console.error("Failed to parse shared content", e);
        // Fallback to loading user's own content
        setIsSharedView(false);
        setMetaTagsConfig({
          ...defaultConfig,
          title: "Multi-Content Pantheon",
          ogTitle: "Multi-Content Pantheon",
          twitterTitle: "Multi-Content Pantheon",
          ogDescription: defaultConfig.description,
          twitterDescription: defaultConfig.description
        });
      }
    } else if (sharedData) {
      // Legacy games-only sharing support
      try {
        const decodedGames = decodeGameData(sharedData);
        switchContentType('games');
        setSharedContent(decodedGames);
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
        setIsSharedView(false);
      }
    } else {
      // No shared data - normal mode
      setIsSharedView(false);
      // Set default meta tags for non-shared view
      setMetaTagsConfig({
        ...defaultConfig,
        title: "Multi-Content Pantheon",
        ogTitle: "Multi-Content Pantheon",
        twitterTitle: "Multi-Content Pantheon",
        ogDescription: defaultConfig.description,
        twitterDescription: defaultConfig.description
      });
    }
  }, [setSharedTitle, switchContentType, setContent, setGames]);

  const createNewFromShared = () => {
    // Check if there's existing custom data to warn about override
    if (localStateManager.hasSavedContent(currentContentType)) {
      // User has saved their own data
      overrideConfirm.open();
    } else {
      confirmCreateFromShared();
    }
  };
  
  const confirmCreateFromShared = () => {
    // Save the shared content to localStorage for the correct content type
    localStateManager.saveContent(sharedContent, currentContentType);
    
    // Load the shared content into the user's actual collection
    if (currentContentType === 'games') {
      setGames(sharedContent as Game[]);
    } else {
      setContent(sharedContent);
    }
    
    setIsSharedView(false);
    
    // Remove shared parameter from URL without refreshing
    removeShareParams();
    
    // Reset the shared title and update page title
    setSharedTitle("");
    document.title = "Multi-Content Pantheon";
    
    // Close confirmation dialog if open
    overrideConfirm.close();
  };
  
  // Add a function to properly handle returning to user's collection
  const returnToMyCollection = () => {
    // Remove shared parameters from URL
    removeShareParams();
    
    // Exit shared view
    setIsSharedView(false);
    
    // Check if user actually has saved content for current type
    if (localStateManager.hasSavedContent(currentContentType)) {
      // Load user's saved content
      if (currentContentType === 'games') {
        const userGames = localStateManager.loadGames();
        setGames(userGames);
      } else {
        const userContent = localStateManager.loadContent(currentContentType);
        setContent(userContent);
      }
    } else {
      // User has no saved content, so they'll start with the default
      const defaultContent = localStateManager.loadContent(currentContentType);
      setContent(defaultContent);
    }
    
    // Reset title
    document.title = "Multi-Content Pantheon";
    
    // Reset the shared title
    setSharedTitle("");
  };
  
  // Update startFresh to use confirmation
  const requestStartFresh = () => {
    resetConfirm.open();
  };
  
  const confirmStartFresh = () => {
    // Reset to default content for current type
    resetToDefault();
    setIsSharedView(false);
    
    // Remove shared parameter from URL without refreshing
    removeShareParams();
    
    resetConfirm.close();
  };
  
  // CRUD operations - Updated to use content management system
  const add = () => {
    if (!newContent.title || !newContent.year) return;
    
    // Validate required fields based on content type
    if (currentContentType === 'games') {
      const gameContent = newContent as Partial<Game>;
      if (!gameContent.genre) return;
    } else if (currentContentType === 'movies') {
      const movieContent = newContent as Partial<Movie>;
      if (!movieContent.genre || movieContent.genre.length === 0) return;
    } else if (currentContentType === 'tvshows') {
      const tvContent = newContent as Partial<TVShow>;
      if (!tvContent.genre || tvContent.genre.length === 0) return;
    }
    
    // Add content using the context method
    addContent({...newContent, contentType: currentContentType} as Omit<Content, 'id'>);
    setNewContent({category: "hero", contentType: currentContentType});
  };
  
  // Update remove to use confirmation and context
  const requestRemove = (id: string) => {
    deleteConfirm.openWithData(id);
  };
  
  const confirmRemove = () => {
    const itemToDelete = deleteConfirm.data;
    if (itemToDelete) {
      deleteContent(itemToDelete);
    }
    deleteConfirm.close();
  };
  
  const save = (id: string) => {
    if (!draft.title || !draft.year) return;
    
    // Basic genre validation
    if (currentContentType === 'games' && !draft.genre) return;
    
    updateContent(id, draft);
    setEditing(null);
  };
  
  // New data management functions
  const exportData = () => {
    localStateManager.exportContent(currentContentType);
  };
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const importedContent = localStateManager.importContent(content, currentContentType);
        if (importedContent.length > 0) {
          if (currentContentType === 'games') {
            setGames(importedContent as Game[]);
          } else {
            setContent(importedContent);
          }
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
    const history = localStateManager.getHistory(currentContentType);
    setHistoryItems(history.map((item: any, index: number) => ({
      timestamp: item.timestamp,
      index
    })));
    historyModal.open();
  };
  
  const restoreFromHistory = (index: number) => {
    const restoredContent = localStateManager.restoreFromHistory(index, currentContentType);
    if (restoredContent) {
      if (currentContentType === 'games') {
        setGames(restoredContent as Game[]);
      } else {
        setContent(restoredContent);
      }
      historyModal.close();
    }
  };
  
  // Autofill functions
  const autoNew = async () => {
    if (!newContent.title) return;
    const info = await wikipediaInfo(newContent.title);
    // Handle genre compatibility for current content type
    const processedInfo: any = { ...info };
    if (currentContentType === 'games' && Array.isArray(info.genre)) {
      processedInfo.genre = info.genre[0]; // Games expect string
    } else if ((currentContentType === 'movies' || currentContentType === 'tvshows') && typeof info.genre === 'string') {
      processedInfo.genre = [info.genre]; // Movies/TV shows expect array
    }
    setNewContent({...newContent, ...processedInfo} as Partial<Content>);
  };
  
  const autoEdit = async () => {
    if (!draft.title) return;
    const info = await wikipediaInfo(draft.title);
    // Handle genre compatibility for current content type
    const processedInfo: any = { ...info };
    if (currentContentType === 'games' && Array.isArray(info.genre)) {
      processedInfo.genre = info.genre[0]; // Games expect string
    } else if ((currentContentType === 'movies' || currentContentType === 'tvshows') && typeof info.genre === 'string') {
      processedInfo.genre = [info.genre]; // Movies/TV shows expect array
    }
    setDraft({...draft, ...processedInfo} as Partial<Content>);
  };

  // Add a function to handle inline deity updates - now content-agnostic
  const updateDeity = (contentId: string, deityId: string | undefined) => {
    updateContentDeity(contentId, deityId);
    setInlineDeityEdit(null);
  };

  // Callback functions for the new components
  const handleEdit = (gameId: string) => {
    const game = displayContent.find(g => g.id === gameId);
    if (game) {
      setEditing(gameId);
      setDraft(game as Content);
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setDraft({});
  };

  const handleDraftChange = (updates: Partial<Content>) => {
    setDraft(updates);
  };

  const handleSave = (gameId: string) => {
    save(gameId);
  };

  const handleToggleDeityEdit = (gameId: string | null) => {
    setInlineDeityEdit(gameId);
  };

  const handleNewContentChange = (updates: Partial<Content>) => {
    setNewContent(updates);
  };

  // Wrapper for Steam game drag start to match interface
  const handleSteamGameDragStart = (e: React.DragEvent<HTMLLIElement>, game: Partial<Game>) => {
    // Use the proper Steam game drag data format
    e.dataTransfer.setData("application/json", JSON.stringify({
      fromSteam: true,
      game: game
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  // Convert dropIndicator for legacy compatibility
  const genericDropIndicator = dropIndicator ? {
    contentId: dropIndicator.contentId,
    position: dropIndicator.position
  } : null;

  // Convert setDropIndicator for legacy compatibility
  const setGenericDropIndicator = (indicator: { contentId: string; position: 'before' | 'after' } | null) => {
    setDropIndicator(indicator ? {
      contentId: indicator.contentId,
      position: indicator.position
    } : null);
  };

  // Update newContent when currentContentType changes
  useEffect(() => {
    setNewContent({category: "hero", contentType: currentContentType});
  }, [currentContentType]);

  // Return JSX
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-950 to-gray-900 min-h-screen select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] font-sans">
      <header className="text-center mb-8 md:mb-10 relative">
        {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4 mb-1">
          {/* Title line - responsive layout */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wider text-white">
              <span className="inline-block mr-1 md:mr-2 transform translate-y-1">🏛️</span> 
              The 
            </h1>
            {!isSharedView ? (
              <ContentTypeSelector 
                currentContentType={currentContentType}
                onContentTypeChange={switchContentType}
              />
            ) : (
              <span className="text-3xl md:text-5xl font-serif font-bold tracking-wider text-white transform translate-y-1">
                {currentContentType === 'games' && 'Game'}
                {currentContentType === 'movies' && 'Movie'}
                {currentContentType === 'tvshows' && 'TV Show'}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wider text-white">
              Pantheon
            </h1>
          </div>
        </div>
        
        {/* Subtitle */}
        <p className="text-gray-400 text-xs md:text-sm tracking-wide mt-2 italic px-4 md:px-0">
          {currentContentType === 'games' && "Curate your personal collection of gaming greatness"}
          {currentContentType === 'movies' && "Curate your personal collection of cinematic masterpieces"}
          {currentContentType === 'tvshows' && "Curate your personal collection of television excellence"}
        </p>
        
        {/* Data management and share buttons - mobile: below title, desktop: absolute positioned */}
        <div className="mt-4 md:mt-0 md:absolute md:right-0 md:top-0">
          <HeaderControls
            isSharedView={isSharedView}
            onShare={generateShareLink}
            onExport={exportData}
            onImport={importData}
            onOpenHistory={openHistoryModal}
          />
        </div>
        
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
        content={displayContent}
        contentType={currentContentType}
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mx-auto max-w-6xl mb-8 md:mb-12 px-2 md:px-0">
          <AddContentForm
            newContent={newContent}
            content={displayContent}
            contentType={currentContentType}
            onNewContentChange={handleNewContentChange}
            onAdd={add}
            onAutoFill={autoNew}
          />
          
          {/* Steam Games Import Panel - only show for games */}
          {currentContentType === 'games' && (
            <div className="md:col-span-5">
              <SteamGamesImport 
                existingGames={displayContent as Game[]} 
                onGameDragStart={handleSteamGameDragStart} 
              />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Object.entries(CATEGORIES).map(([categoryId]) => (
          <GameCategory
            key={categoryId}
            categoryId={categoryId as CategoryID}
            games={displayContent as Game[]}
            isSharedView={isSharedView}
            editing={editing}
            draft={draft}
            dropIndicator={genericDropIndicator}
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
              setGenericDropIndicator(null);
              onDrop(e, target);
            }}
            onDropOnContent={onDropOnContent}
            onUpdateDeity={updateDeity}
            onToggleDeityEdit={handleToggleDeityEdit}
            setDropIndicator={setGenericDropIndicator}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        ))}
      </div>
      
      {/* Confirmation dialogs */}
      <Confirm
        isOpen={deleteConfirm.isOpen}
        title="Delete Content"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={confirmRemove}
        onCancel={() => deleteConfirm.close()}
      />
      
      <Confirm
        isOpen={resetConfirm.isOpen}
        title="Reset Collection"
        message="Are you sure you want to reset your entire collection? All your current items will be lost."
        onConfirm={confirmStartFresh}
        onCancel={() => resetConfirm.close()}
      />
      
      <Confirm
        isOpen={overrideConfirm.isOpen}
        title="Override Existing Collection"
        message="You already have content in your collection. Using this shared collection will override your existing data. Continue?"
        onConfirm={confirmCreateFromShared}
        onCancel={() => overrideConfirm.close()}
      />
    </div>
  );
} 