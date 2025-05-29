import { useState, useCallback } from 'react';
import { Game } from '../types';
import { encodeGameData } from '../utils/helpers';
import { createShareUrl } from '../utils/urlHelpers';

interface CompressionStats {
  original: number;
  compressed: number;
  ratio: number;
}

interface UseShareFeatureReturn {
  shareUrl: string;
  showShareModal: boolean;
  sharedTitle: string;
  compressionStats: CompressionStats;
  setSharedTitle: (title: string) => void;
  generateShareLink: () => void;
  copyToClipboard: () => void;
  closeShareModal: () => void;
  updateShareUrl: (games: Game[], title: string) => void;
}

export function useShareFeature(games: Game[]): UseShareFeatureReturn {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharedTitle, setSharedTitle] = useState<string>('');
  const [compressionStats, setCompressionStats] = useState<CompressionStats>({
    original: 0,
    compressed: 0,
    ratio: 0
  });

  const updateShareUrl = useCallback((gamesList: Game[], title: string) => {
    const encodedData = encodeGameData(gamesList);
    const url = createShareUrl(encodedData, title);
    setShareUrl(url);
    
    // Return the encoded data for compression stats calculation
    return encodedData;
  }, []);

  const generateShareLink = useCallback(() => {
    // Get both compressed and uncompressed sizes for comparison
    const rawData = JSON.stringify(games);
    const rawBase64 = btoa(encodeURIComponent(rawData));
    
    const encodedData = updateShareUrl(games, sharedTitle);
    
    // Calculate compression stats
    const compressionRatio = Math.round((1 - (encodedData.length / rawBase64.length)) * 100);
    setCompressionStats({
      original: rawBase64.length,
      compressed: encodedData.length,
      ratio: compressionRatio
    });
    
    setShowShareModal(true);
  }, [games, sharedTitle, updateShareUrl]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
  }, [shareUrl]);

  const closeShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  return {
    shareUrl,
    showShareModal,
    sharedTitle,
    compressionStats,
    setSharedTitle,
    generateShareLink,
    copyToClipboard,
    closeShareModal,
    updateShareUrl
  };
} 