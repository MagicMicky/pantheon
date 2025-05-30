// Wikipedia helper functions

// Genre keywords for matching
export const GENRE_KEYWORDS: [RegExp, string][] = [
  [/first‑person shooter|FPS game/i, "FPS"],
  [/action‑adventure/i, "Action‑Adventure"],
  [/role‑?playing|RPG/i, "RPG"],
  [/4x/i, "4X Strategy"],
  [/real‑time strategy|RTS/i, "RTS"],
  [/turn‑based strategy|TBS/i, "TBS"],
  [/massively multiplayer online|MMO/i, "MMO"],
  [/MMORPG|massively multiplayer online role-playing/i, "MMORPG"],
  [/third‑person shooter|TPS/i, "TPS"],
  [/platform(er)?|side-scrolling/i, "Platformer"],
  [/roguelike|rogue-like/i, "Roguelike"],
  [/roguelite|rogue-lite/i, "Roguelite"],
  [/metroidvania/i, "Metroidvania"],
  [/open world|sandbox/i, "Open World"],
  [/survival horror/i, "Survival Horror"],
  [/horror game|psychological horror/i, "Horror"],
  [/visual novel/i, "Visual Novel"],
  [/rhythm game|music game/i, "Rhythm"],
  [/simulation|sim game/i, "Simulation"],
  [/battle royale/i, "Battle Royale"],
  [/card game|collectible card/i, "Card Game"],
  [/board game|tabletop/i, "Board Game"],
  [/puzzle game/i, "Puzzle"],
  [/stealth game/i, "Stealth"],
  [/sports game/i, "Sports"],
  [/racing game/i, "Racing"],
  [/fighting game/i, "Fighting"],
  [/grand strategy/i, "Grand Strategy"],
  [/hack and slash|beat 'em up/i, "Hack and Slash"],
  [/interactive fiction|text adventure/i, "Interactive Fiction"],
  [/tower defense/i, "Tower Defense"],
  [/soulslike|souls-like/i, "Soulslike"]
];

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
 * Get content info from Wikipedia - now supports all content types
 */
export async function wikipediaInfo(t: string): Promise<{ genre?: string | string[]; year?: number; director?: string; runtime?: number; seasons?: number; status?: string }> {
  try {
    const [sum, html] = await Promise.all([
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`),
      fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(t)}`)
    ]);
    
    if (!sum.ok) return {};
    
    const extract = (await sum.json()).extract ?? "";
    let result: any = {};
    
    // Extract year from text
    const yearMatch = extract.match(/(19|20)\d{2}/);
    if (yearMatch) {
      result.year = +yearMatch[0];
    }
    
    // Try to extract from infobox first
    if (html.ok) {
      const htmlContent = await html.text();
      const infoboxData = extractFromInfobox(htmlContent);
      result = { ...result, ...infoboxData };
    }
    
    // If no genre found in infobox, try text-based extraction
    if (!result.genre) {
      for (const [r, l] of GENRE_KEYWORDS) {
        if (r.test(extract)) {
          result.genre = l;
          break;
        }
      }
    }
    
    return result;
  } catch {
    return {};
  }
}

/**
 * Enhanced infobox extraction that handles multiple content types
 */
function extractFromInfobox(html: string): any {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const result: any = {};
    
    for (const tr of doc.querySelectorAll("table.infobox tr")) {
      const th = tr.querySelector("th");
      const td = tr.querySelector("td");
      
      if (!th || !td) continue;
      
      const label = th.textContent?.toLowerCase() || "";
      const value = td.textContent?.trim() || "";
      
      if (label.includes('genre')) {
        // Check if this looks like a movie/TV show (multiple genres) or game (single genre)
        const genres = value.split(/[,•|\/]/).map(g => g.trim()).filter(Boolean);
        if (genres.length > 1) {
          result.genre = genres; // Movies/TV shows get array
        } else {
          result.genre = genres[0] || value; // Games get string
        }
      } else if (label.includes('director')) {
        result.director = value.split(',')[0].trim(); // First director if multiple
      } else if (label.includes('running time') || label.includes('runtime')) {
        const minutes = value.match(/\d+/);
        if (minutes) result.runtime = +minutes[0];
      } else if (label.includes('seasons') || label.includes('no. of seasons')) {
        const seasons = value.match(/\d+/);
        if (seasons) result.seasons = +seasons[0];
      } else if (label.includes('status') || label.includes('original run')) {
        if (value.toLowerCase().includes('present') || value.toLowerCase().includes('ongoing')) {
          result.status = 'ongoing';
        } else if (value.toLowerCase().includes('ended') || value.toLowerCase().includes('concluded')) {
          result.status = 'ended';
        } else if (value.toLowerCase().includes('cancelled')) {
          result.status = 'cancelled';
        }
      }
    }
    
    return result;
    
  } catch {
    return {};
  }
} 