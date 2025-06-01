// Wikipedia helper functions

/**
 * Get Wikipedia search suggestions for a query
 */
export async function wikiSuggestions(q: string): Promise<string[]> {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=10&format=json&origin=*`);
    if (!res.ok) return [];
    const d = await res.json() as any;
    return d[1] ?? [];
  } catch {
    return [];
  }
}

/**
 * Enhanced Wikipedia info extraction with multiple API approaches
 */
export async function wikipediaInfo(t: string): Promise<{ genre?: string[]; year?: number; director?: string; runtime?: number; seasons?: number; status?: string }> {
  try {
    // Fetch multiple Wikipedia API endpoints in parallel for better data coverage
    const [summary, html, wikidata] = await Promise.all([
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`).catch(() => null),
      fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(t)}`).catch(() => null),
      // Use Wikipedia API to get Wikidata entity ID for additional structured data
      fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(t)}&prop=pageprops&ppprop=wikibase_item&origin=*`).catch(() => null)
    ]);
    
    let result: any = {};
    let extract = "";
    
    // Extract basic information from summary
    if (summary?.ok) {
      const summaryData = await summary.json();
      extract = summaryData.extract ?? "";
      
      // Enhanced year extraction with multiple patterns
      const yearPatterns = [
        /\b(19|20)\d{2}\b/g,                    // Basic year pattern
        /released in (\d{4})/i,                 // "released in YYYY"
        /premiered (?:on|in) .* (\d{4})/i,      // "premiered on/in ... YYYY"
        /aired from (\d{4})/i,                  // "aired from YYYY"
        /produced in (\d{4})/i,                 // "produced in YYYY"
      ];
      
      for (const pattern of yearPatterns) {
        const matches = extract.match(pattern);
        if (matches) {
          const years = matches.map(m => parseInt(m.match(/\d{4}/)?.[0] || '0')).filter(y => y > 1800);
          if (years.length > 0) {
            result.year = Math.min(...years); // Use earliest year found
            break;
          }
        }
      }
    }
    
    // Enhanced HTML infobox extraction
    if (html?.ok) {
      const htmlContent = await html.text();
      const infoboxData = await extractFromInfoboxEnhanced(htmlContent);
      result = { ...result, ...infoboxData };
    }
    
    // Try Wikidata for additional structured information
    if (wikidata?.ok) {
      const wikidataInfo = await extractFromWikidata(wikidata);
      result = { ...result, ...wikidataInfo };
    }
    
    // Enhanced text-based genre extraction with content type detection
    if (!result.genre) {
      result.genre = extractGenreFromText(extract);
    }
    
    // Enhanced director extraction from text if not found in infobox
    if (!result.director) {
      result.director = extractDirectorFromText(extract);
    }
    
    // Enhanced status extraction for TV shows
    if (!result.status) {
      result.status = extractStatusFromText(extract);
    }
    
    return result;
  } catch (error) {
    console.warn('Wikipedia info extraction failed:', error);
    return {};
  }
}

/**
 * Enhanced infobox extraction with better selectors and fallbacks
 */
async function extractFromInfoboxEnhanced(html: string): Promise<any> {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const result: any = {};
    
    // Try multiple infobox selectors
    const infoboxSelectors = [
      'table.infobox',
      'table[class*="infobox"]',
      '.infobox-table',
      'table.vevent',
      'table.biography'
    ];
    
    let infobox = null;
    for (const selector of infoboxSelectors) {
      infobox = doc.querySelector(selector);
      if (infobox) break;
    }
    
    if (!infobox) return result;
    
    // Enhanced field extraction with multiple label patterns
    const fieldMappings = [
      // Genre fields - expanded for movies
      { 
        patterns: [
          'genre', 'genres', 'genre(s)', 'type', 
          'film genre', 'movie genre', 'genres',
          'category', 'classification', 'style'
        ], 
        key: 'genre', 
        processor: (value: string, element: Element) => processGenreField(value, element) 
      },
      // Director fields
      { patterns: ['director', 'directed by', 'director(s)', 'directors'], key: 'director', processor: processDirectorField },
      // Runtime fields
      { patterns: ['running time', 'runtime', 'length', 'duration'], key: 'runtime', processor: processRuntimeField },
      // Season fields
      { patterns: ['seasons', 'no. of seasons', 'number of seasons', 'season'], key: 'seasons', processor: processNumberField },
      // Status fields - expanded for TV shows
      { 
        patterns: [
          'status', 'original run', 'network', 'aired', 'years active',
          'broadcast', 'transmission', 'ran', 'episodes aired',
          'release', 'original release'
        ], 
        key: 'status', 
        processor: processStatusField 
      },
    ];
    
    const rows = infobox.querySelectorAll('tr');
    for (const row of rows) {
      const th = row.querySelector('th');
      const td = row.querySelector('td');
      
      if (!th || !td) continue;
      
      const label = th.textContent?.toLowerCase().trim() || "";
      const value = td.textContent?.trim() || "";
      
      if (!value) continue;
      
      for (const mapping of fieldMappings) {
        if (mapping.patterns.some(pattern => label.includes(pattern))) {
          const processed = mapping.processor(value, td);
          if (processed !== null) {
            result[mapping.key] = processed;
          }
          break;
        }
      }
    }
    
    return result;
    
  } catch (error) {
    console.warn('Infobox extraction failed:', error);
    return {};
  }
}

/**
 * Extract additional data from Wikidata API response
 */
async function extractFromWikidata(wikidataResponse: Response): Promise<any> {
  try {
    const data = await wikidataResponse.json();
    const pages = data.query?.pages;
    
    if (!pages) return {};
    
    const page = Object.values(pages)[0] as any;
    const wikidataId = page.pageprops?.wikibase_item;
    
    if (!wikidataId) return {};
    
    // Could expand this to fetch from Wikidata API for more structured data
    // For now, just return empty as we're focusing on Wikipedia API
    return {};
    
  } catch (error) {
    console.warn('Wikidata extraction failed:', error);
    return {};
  }
}

/**
 * Enhanced genre extraction from text with content type detection
 */
function extractGenreFromText(text: string): string[] | null {
  if (!text) return null;
  
  const foundGenres: string[] = [];
  
  // Words that are obviously NOT genres (keep minimal and obvious)
  const nonGenreWords = new Set([
    'american', 'british', 'french', 'german', 'italian', 'japanese', 'korean', 'chinese', 'indian',
    'canadian', 'australian', 'spanish', 'russian', 'mexican', 'brazilian', 'swedish', 'norwegian',
    'film', 'movie', 'series', 'show', 'television', 'tv'
  ]);
  
  // Extract genres from common text patterns
  const textGenrePatterns = [
    /is a \d{4} ([^.]+?) film/i,
    /is a ([^.]+?) film(?:\s|,|\.)/i,
    /is an ([^.]+?) film(?:\s|,|\.)/i,
    /\d{4} ([^.]+?) film/i,
    /([^.]+?) film directed by/i,
    /is a ([^.]+?) movie(?:\s|,|\.)/i,
    /\d{4} ([^.]+?) movie/i,
  ];
  
  for (const pattern of textGenrePatterns) {
    const match = text.match(pattern);
    if (match) {
      const genreText = match[1];
      
      // Clean and process the extracted text
      const extractedGenres = genreText
        .split(/\s+and\s+/) // Split on "and"
        .map(g => g.trim())
        .filter(g => g.length > 0 && g.length < 40) // Reasonable length filter
        .map(g => {
          // Remove years and clean up
          const cleanGenre = g.replace(/\b\d{4}\b/g, '').trim();
          
          // Split into words and filter out obvious non-genre words
          const words = cleanGenre.split(/\s+/)
            .filter(word => {
              const lowerWord = word.toLowerCase();
              return !nonGenreWords.has(lowerWord) && 
                     !/^\d{4}$/.test(word) && 
                     word.length > 1;
            });
          
          if (words.length === 0) return '';
          
          // Capitalize each word properly
          return words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        })
        .filter(genre => genre.length > 0);
      
      foundGenres.push(...extractedGenres);
      break; // Stop after first successful pattern match to avoid duplicates
    }
  }
  
  // Minimal fallback using basic keyword detection (only if text extraction found nothing)
  if (foundGenres.length === 0) {
    const basicGenres: [RegExp, string][] = [
      [/space opera/i, "Space Opera"],
      [/science fiction|sci-fi/i, "Sci-Fi"],
      [/action/i, "Action"],
      [/comedy/i, "Comedy"],
      [/drama/i, "Drama"],
      [/horror/i, "Horror"],
      [/thriller/i, "Thriller"],
      [/fantasy/i, "Fantasy"],
      [/romance/i, "Romance"],
    ];
    
    for (const [regex, genre] of basicGenres) {
      if (regex.test(text)) {
        foundGenres.push(genre);
      }
    }
  }
  
  // Remove duplicates and return
  const uniqueGenres = [...new Set(foundGenres)];
  
  return uniqueGenres.length > 0 ? uniqueGenres : null;
}

/**
 * Enhanced director extraction from text
 */
function extractDirectorFromText(text: string): string | null {
  if (!text) return null;
  
  const directorPatterns = [
    /directed by ([^,.\n]+)/i,
    /director ([^,.\n]+)/i,
    /([^,.\n]+) directed/i,
    /filmmaker ([^,.\n]+)/i,
  ];
  
  for (const pattern of directorPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Enhanced TV show status extraction
 */
function extractStatusFromText(text: string): string | null {
  if (!text) return null;
  
  const statusPatterns = [
    // Strong indicators of ended shows
    { pattern: /cancelled|canceled/i, status: 'cancelled' },
    { pattern: /ended|concluded|finished|final season|series finale|final episode/i, status: 'ended' },
    { pattern: /aired from \d{4} to \d{4}/i, status: 'ended' },
    { pattern: /ran from \d{4} to \d{4}/i, status: 'ended' },
    { pattern: /\(\d{4}[-–—]\d{4}\)/i, status: 'ended' }, // (2005-2014) format
    { pattern: /aired between \d{4} and \d{4}/i, status: 'ended' },
    { pattern: /broadcast from \d{4} to \d{4}/i, status: 'ended' },
    { pattern: /original run.*\d{4}[-–—]\d{4}/i, status: 'ended' },
    { pattern: /aired.*\d{4}[-–—]\d{4}/i, status: 'ended' },
    
    // Common patterns for ended shows
    { pattern: /is an? (?:american|british|canadian)? (?:sitcom|comedy|drama|series).*that (?:aired|ran|was broadcast)/i, status: 'ended' },
    { pattern: /was an? (?:american|british|canadian)? (?:sitcom|comedy|drama|series)/i, status: 'ended' },
    { pattern: /that aired on/i, status: 'ended' }, // Often indicates past tense
    
    // Ongoing indicators  
    { pattern: /ongoing|current|present|continues|renewed|upcoming|currently airing|still running/i, status: 'ongoing' },
    { pattern: /\(\d{4}[-–—]present\)/i, status: 'ongoing' }, // (2005-present) format
    { pattern: /\(\d{4}[-–—]\)/i, status: 'ongoing' }, // (2005-) format
    { pattern: /aired from \d{4}(?!\s+to)/i, status: 'ongoing' },
  ];
  
  for (const { pattern, status } of statusPatterns) {
    if (pattern.test(text)) {
      return status;
    }
  }
  
  return null;
}

// Field processors for infobox data
function processGenreField(value: string, element: Element): string[] | null {
  if (!value) return null;
  
  // Try to extract genres from the actual HTML structure first
  let genres: string[] = [];
  
  // Look for individual genre links or elements
  const genreLinks = element.querySelectorAll('a[href*="/wiki/"]');
  if (genreLinks.length > 0) {
    genres = Array.from(genreLinks)
      .map(link => link.textContent?.trim())
      .filter(Boolean)
      .filter(text => text && text.length < 50) // Reasonable genre length
      .map(text => text!) // TypeScript assertion after filter
      .slice(0, 10); // Limit to reasonable number of genres
  }
  
  // If we couldn't extract from HTML structure, fall back to text parsing
  if (genres.length === 0) {
    // Clean up HTML/CSS artifacts and citations
    const cleanValue = value
      .replace(/\[\d+\]/g, '') // Remove citations
      .replace(/\.mw-parser-output[^}]*}/g, '') // Remove CSS rules
      .replace(/\.mw-parser-output[^;]*;/g, '') // Remove CSS properties
      .replace(/\.mw-[^}\s]*[^}]*}/g, '') // Remove any mw- CSS
      .replace(/\{[^}]*\}/g, '') // Remove any remaining CSS blocks
      .replace(/[{}]/g, '') // Remove remaining braces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // If the result looks like CSS or HTML, reject it
    if (cleanValue.includes('mw-parser') || cleanValue.includes('list-style') || 
        cleanValue.includes('margin:') || cleanValue.includes('padding:') ||
        cleanValue.length > 200) {
      return null;
    }
    
    // Try to split genres that are separated by newlines/spaces (Breaking Bad format)
    // "Crime drama Thriller Neo-Western Black comedy Tragedy" 
    if (!/[,•|/&]/.test(cleanValue)) {
      // No obvious delimiters, try splitting on spaces but preserve compound genres
      const words = cleanValue.split(/\s+/);
      
      // Try to identify genre boundaries by looking for capital letters
      const possibleGenres: string[] = [];
      let currentGenre = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // If this word starts with a capital letter and we have a current genre, 
        // it might be the start of a new genre
        if (/^[A-Z]/.test(word) && currentGenre && 
            // But don't split compound adjectives like "Black comedy"
            !['Black', 'Neo', 'Post', 'Pre', 'Anti', 'Non'].includes(currentGenre.split(' ').pop() || '')) {
          possibleGenres.push(currentGenre.trim());
          currentGenre = word;
        } else {
          currentGenre += (currentGenre ? ' ' : '') + word;
        }
      }
      
      // Add the last genre
      if (currentGenre) {
        possibleGenres.push(currentGenre.trim());
      }
      
      if (possibleGenres.length > 1) {
        genres = possibleGenres;
      }
    }
    
    // Try to split concatenated genres by detecting capital letters
    // e.g., "Post-apocalypticDramaThriller" -> ["Post-apocalyptic", "Drama", "Thriller"]
    if (genres.length === 0 && !/[,•|/&\s]/.test(cleanValue) && cleanValue.length > 20) {
      // This looks like concatenated genres without delimiters
      const splitGenres = cleanValue.split(/(?=[A-Z][a-z])/).filter(Boolean);
      if (splitGenres.length > 1) {
        genres = splitGenres.map(g => g.trim()).filter(Boolean);
      }
    }
    
    // If still no luck, split on common delimiters
    if (genres.length === 0) {
      genres = cleanValue.split(/[,•|/&]/).map(g => g.trim()).filter(Boolean);
    }
  }
  
  if (genres.length === 0) return null;
  
  // Clean up each genre
  const cleanedGenres = genres
    .map(genre => {
      // Remove common non-genre suffixes
      return genre.replace(/\s*(film|movie|television|tv|series)$/i, '').trim();
    })
    .filter(genre => genre.length > 1 && genre.length < 50)
    .slice(0, 5); // Limit to 5 genres max
  
  return cleanedGenres.length > 0 ? cleanedGenres : null;
}

function processDirectorField(value: string, _element: Element): string | null {
  if (!value) return null;
  
  // Clean up HTML/CSS artifacts and citations
  const cleanValue = value
    .replace(/\[\d+\]/g, '') // Remove citations
    .replace(/\.mw-parser-output[^}]*}/g, '') // Remove CSS rules
    .replace(/\.mw-parser-output[^;]*;/g, '') // Remove CSS properties
    .replace(/\.mw-[^}\s]*[^}]*}/g, '') // Remove any mw- CSS
    .replace(/\{[^}]*\}/g, '') // Remove any remaining CSS blocks
    .replace(/[{}]/g, '') // Remove remaining braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // If the result looks like CSS, HTML, or is too long, reject it
  if (cleanValue.includes('mw-parser') || cleanValue.includes('list-style') || 
      cleanValue.includes('margin:') || cleanValue.includes('padding:') ||
      cleanValue.includes('.plainlist') || cleanValue.length > 100) {
    return null;
  }
  
  // Get first director and clean up
  const directors = cleanValue.split(/[,&]/).map(d => d.trim()).filter(Boolean);
  
  return directors[0] || null;
}

function processRuntimeField(value: string, _element: Element): number | null {
  // Clean value first
  const cleanValue = value.replace(/\[\d+\]/g, '').trim();
  
  const minutes = cleanValue.match(/(\d+)\s*(?:min|minute)/i);
  if (minutes) return parseInt(minutes[1]);
  
  // Try to extract just numbers if no "min" found
  const numbers = cleanValue.match(/\d+/);
  if (numbers) {
    const num = parseInt(numbers[0]);
    // Reasonable runtime range check
    if (num >= 5 && num <= 600) return num;
  }
  
  return null;
}

function processNumberField(value: string, _element: Element): number | null {
  const cleanValue = value.replace(/\[\d+\]/g, '').trim();
  const numbers = cleanValue.match(/\d+/);
  return numbers ? parseInt(numbers[0]) : null;
}

function processStatusField(value: string, _element: Element): string | null {
  if (!value) return null;
  
  // Clean up HTML/CSS artifacts
  const cleanValue = value
    .replace(/\[\d+\]/g, '') // Remove citations
    .replace(/\.mw-parser-output[^}]*}/g, '') // Remove CSS rules
    .replace(/\.mw-[^}\s]*[^}]*}/g, '') // Remove any mw- CSS
    .replace(/\{[^}]*\}/g, '') // Remove CSS blocks
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // If the result looks like CSS or HTML, reject it
  if (cleanValue.includes('mw-parser') || cleanValue.includes('list-style') || 
      cleanValue.includes('margin:') || cleanValue.length > 200) {
    return null;
  }
  
  const lowerValue = cleanValue.toLowerCase();
  
  // Check for specific "Release" field patterns first
  // Pattern: "date – date" (ended)
  if (/\d{4}[\s\-–—]+\d{4}/.test(cleanValue)) {
    return 'ended';
  }
  
  // Pattern: "date – present" (ongoing)
  if (/present/i.test(cleanValue)) {
    return 'ongoing';
  }
  
  // Pattern: just one date followed by dash (ongoing)  
  if (/\d{4}[\s\-–—]+$/.test(cleanValue)) {
    return 'ongoing';
  }
  
  // Standard status keywords
  if (lowerValue.includes('present') || lowerValue.includes('ongoing') || lowerValue.includes('current')) {
    return 'ongoing';
  }
  if (lowerValue.includes('ended') || lowerValue.includes('concluded')) {
    return 'ended';
  }
  if (lowerValue.includes('cancelled') || lowerValue.includes('canceled')) {
    return 'cancelled';
  }
  
  return null;
} 