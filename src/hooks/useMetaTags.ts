import { useEffect } from 'react';

/**
 * Sets a meta tag in the document head
 */
function setMetaTag(nameOrProperty: string, content: string, isProperty: boolean = false): void {
  let element = document.querySelector(
    isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`
  );
  
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
}

interface MetaTagsConfig {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
}

/**
 * Hook to manage meta tags for SEO and social sharing
 */
export function useMetaTags(config: MetaTagsConfig): void {
  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = config.title;
    }

    // Set meta tags
    if (config.description) {
      setMetaTag("description", config.description);
    }
    
    // Open Graph tags
    if (config.ogTitle) {
      setMetaTag("og:title", config.ogTitle, true);
    }
    if (config.ogDescription) {
      setMetaTag("og:description", config.ogDescription, true);
    }
    if (config.ogUrl) {
      setMetaTag("og:url", config.ogUrl, true);
    }
    if (config.ogImage) {
      setMetaTag("og:image", config.ogImage, true);
    }
    
    // Twitter tags
    if (config.twitterCard) {
      setMetaTag("twitter:card", config.twitterCard);
    }
    if (config.twitterTitle) {
      setMetaTag("twitter:title", config.twitterTitle);
    }
    if (config.twitterDescription) {
      setMetaTag("twitter:description", config.twitterDescription);
    }
    if (config.twitterImage) {
      setMetaTag("twitter:image", config.twitterImage);
    }
    if (config.twitterImageAlt) {
      setMetaTag("twitter:image:alt", config.twitterImageAlt);
    }
  }, [config]);
}

/**
 * Sets default meta tags for the application
 */
export function setDefaultMetaTags(): void {
  setMetaTag("og:type", "website", true);
  setMetaTag("twitter:card", "summary_large_image");
} 