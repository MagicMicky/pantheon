/**
 * URL manipulation utilities for the Multi-Content Pantheon
 */

import { ContentType } from '../types';

/**
 * Removes sharing-related parameters from the URL and updates browser history
 */
export function removeShareParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('shared');
  url.searchParams.delete('title');
  url.searchParams.delete('type');
  window.history.pushState({}, '', url.toString());
}

/**
 * Creates a share URL with the encoded data, content type, and optional title
 */
export function createShareUrl(encodedData: string, contentType: ContentType, title?: string): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('shared');
  url.searchParams.delete('title');
  url.searchParams.delete('type');
  url.searchParams.set('shared', encodedData);
  url.searchParams.set('type', contentType);
  if (title) {
    url.searchParams.set('title', encodeURIComponent(title));
  }
  return url.toString();
}

/**
 * Gets the current URL parameters for sharing
 */
export function getShareParams(): { 
  sharedData: string | null; 
  sharedTitle: string | null; 
  contentType: ContentType | null;
} {
  const url = new URL(window.location.href);
  const sharedData = url.searchParams.get('shared');
  const sharedTitleParam = url.searchParams.get('title');
  const sharedTitle = sharedTitleParam ? decodeURIComponent(sharedTitleParam) : null;
  const contentType = url.searchParams.get('type') as ContentType | null;
  
  return { sharedData, sharedTitle, contentType };
} 