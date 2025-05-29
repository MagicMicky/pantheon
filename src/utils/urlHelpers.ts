/**
 * URL manipulation utilities for the Game Pantheon
 */

/**
 * Removes sharing-related parameters from the URL and updates browser history
 */
export function removeShareParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('shared');
  url.searchParams.delete('title');
  window.history.pushState({}, '', url.toString());
}

/**
 * Creates a share URL with the encoded data and optional title
 */
export function createShareUrl(encodedData: string, title?: string): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('shared');
  url.searchParams.delete('title');
  url.searchParams.set('shared', encodedData);
  if (title) {
    url.searchParams.set('title', encodeURIComponent(title));
  }
  return url.toString();
}

/**
 * Gets the current URL parameters for sharing
 */
export function getShareParams(): { sharedData: string | null; sharedTitle: string | null } {
  const url = new URL(window.location.href);
  const sharedData = url.searchParams.get('shared');
  const sharedTitleParam = url.searchParams.get('title');
  const sharedTitle = sharedTitleParam ? decodeURIComponent(sharedTitleParam) : null;
  
  return { sharedData, sharedTitle };
} 