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
 * Extract genre from Wikipedia infobox
 */
export function extractGenreFromInfobox(html: string): string | undefined {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    for (const tr of doc.querySelectorAll("table.infobox tr")) {
      const th = tr.querySelector("th");
      if (th && /Genre/i.test(th.textContent || "")) {
        const td = tr.querySelector("td");
        if (td) return td.textContent?.split(/•|,|\||\//)[0].trim();
      }
    }
  } catch {}
  return undefined;
}

/**
 * Get game info from Wikipedia
 */
export async function wikipediaInfo(t: string): Promise<{ genre?: string; year?: number }> {
  try {
    const [sum, html] = await Promise.all([
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`),
      fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(t)}`)
    ]);
    
    if (!sum.ok) return {};
    
    const extract = (await sum.json()).extract ?? "";
    let genre;
    
    if (html.ok) 
      genre = extractGenreFromInfobox(await html.text());
      
    if (!genre) {
      for (const [r, l] of GENRE_KEYWORDS) {
        if (r.test(extract)) {
          genre = l;
          break;
        }
      }
    }
    
    const y = extract.match(/(19|20)\d{2}/);
    
    return { 
      genre, 
      year: y ? +y[0] : undefined 
    };
  } catch {
    return {};
  }
} 