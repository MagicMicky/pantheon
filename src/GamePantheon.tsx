import React, { useState, useEffect, useRef, KeyboardEvent, FocusEvent } from "react";
import { 
  Mountain, SunMedium, Star, Music, Sword, Shield, Plus, X, 
  Pen, RefreshCw, Gamepad2, Crosshair, Car, Brain, Trophy, 
  Rocket, Ghost, Users, Building, Dice1, Globe, Map, GripVertical, Moon 
} from "lucide-react";

/**
 * Pantheon v6 ────────────────────────────────────────────────────────────────
 * Fixes & polish
 * • Autocomplete no longer re‑opens right after selecting (tracks last pick &
 *   only fetches while input is focused).
 * • Editing fields behave the same — dropdown only shows while the input has
 *   focus.
 * • Drag‑and‑drop: cards are now proper drop targets (HTML5 text/plain), games
 *   move between tiers smoothly.
 */

// Helper functions
function uid(){return Math.random().toString(36).slice(2,10);}

// ────────────────────────────────────────── Tiny UI shims
const Card = ({ children, ...p }: any) => <div {...p} className={`rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col h-full transition-all duration-200 ${p.className || ""}`} >{children}</div>;
const CardHeader = ({ children }: any) => <div className="flex items-center gap-2 p-4 pb-1 border-b dark:border-slate-700">{children}</div>;
const CardTitle = ({ children }: any) => <h2 className="text-lg font-bold leading-tight dark:text-white">{children}</h2>;
const CardContent = ({ children, ...p }: any) => <div {...p} className="p-3 grow flex flex-col gap-2">{children}</div>;
const Button = ({ children, onClick, className="" }: any) => <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition ${className}`}>{children}</button>;
const IconBtn = ({ children, onClick, title="" }: any) => <button onClick={onClick} title={title} className="p-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{children}</button>;
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`w-full rounded-md border dark:border-slate-600 dark:bg-slate-700 dark:text-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${p.className??""}`} />;
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`w-full rounded-md border dark:border-slate-600 dark:bg-slate-700 dark:text-white px-2 py-1 text-sm ${p.className??""}`} />;

// ────────────────────────────────────────── Types & constants
interface Game { id:string; title:string; genre:string; year:number; category:CategoryID; }
type CategoryID="olympian"|"titan"|"demigod"|"muse"|"hero"|"other";
const CATEGORIES:Record<CategoryID,{name:string;icon:any;blurb:string}>={
  olympian:{name:"Olympian Gods",icon:SunMedium,blurb:"Masterpieces reshaping the medium."},
  titan:{name:"Titans",icon:Mountain,blurb:"Genre‑defining giants."},
  demigod:{name:"Demi‑Gods",icon:Star,blurb:"Hybrids bridging niche & mainstream."},
  muse:{name:"Muses",icon:Music,blurb:"Inventive, artistic experiences."},
  hero:{name:"Heroes",icon:Sword,blurb:"Beloved favourites."},
  other:{name:"Monsters & Curios",icon:Shield,blurb:"Oddities and experiments."},
};
const SAMPLE_GAMES:Game[]=[{id:uid(),title:"The Legend of Zelda: Breath of the Wild",genre:"Action‑Adventure",year:2017,category:"olympian"}];

// Genre icons mapping for game list items
const GENRE_ICON_MAPPING: Array<{keywords: RegExp, icon: any}> = [
  // Action/Combat
  { keywords: /\b(action|fight|beat|hack|slash|shoot|combat)\b/i, icon: Sword },
  
  // Shooters
  { keywords: /\b(fps|shooter|first.person)\b/i, icon: Crosshair },
  
  // Racing/Sports
  { keywords: /\b(rac(e|ing)|driv(e|ing)|car|sport|football|soccer|baseball)\b/i, icon: Car },
  { keywords: /\b(sport|athlet|football|soccer|baseball|basketball|hockey)\b/i, icon: Trophy },
  
  // RPG/Adventure
  { keywords: /\b(rpg|role.?play|dungeon)\b/i, icon: Dice1 },
  { keywords: /\b(adventure|quest|point.and.click)\b/i, icon: Ghost },
  
  // Strategy/Puzzle
  { keywords: /\b(strateg|puzzle|tactics|tower.defense)\b/i, icon: Brain },
  { keywords: /\b(4x|turn.based|mmo|multiplayer.online)\b/i, icon: Globe },
  { keywords: /\b(rts|real.time.strateg)\b/i, icon: Building },
  
  // Simulation
  { keywords: /\b(simulat|management|build|construct|city|farm)\b/i, icon: Rocket },
  
  // Platformer
  { keywords: /\b(platform|side.scroll|jump)\b/i, icon: Gamepad2 },
  
  // Open world
  { keywords: /\b(open.world|sandbox)\b/i, icon: Map },
  
  // Multiplayer
  { keywords: /\b(mmo|multiplayer|online)\b/i, icon: Users },
];

// Helper function to get the appropriate icon for a genre
function getGenreIcon(genre: string) {
  if (!genre) return Gamepad2; // Default icon if no genre
  
  // Try to find a matching genre category
  for (const {keywords, icon} of GENRE_ICON_MAPPING) {
    if (keywords.test(genre)) {
      return icon;
    }
  }
  
  // Default fallback
  return Gamepad2;
}

// ────────────────────────────────────────── Wikipedia helpers (unchanged gist)
const GENRE_KEYWORDS:[RegExp,string][]= [[/first‑person shooter/i,"FPS"],[/action‑adventure/i,"Action‑Adventure"],[/role‑?playing/i,"RPG"],[/4x/i,"4X Strategy"],[/real‑time strategy/i,"RTS"],[/turn‑based strategy/i,"TBS"]];
async function wikiSuggestions(q:string){try{const res=await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=10&format=json&origin=*`);if(!res.ok)return[];const d=await res.json() as any;return d[1]??[]}catch{return[]}}
function extractGenreFromInfobox(html:string){try{const doc=new DOMParser().parseFromString(html,"text/html");for(const tr of doc.querySelectorAll("table.infobox tr")){const th=tr.querySelector("th");if(th&&/Genre/i.test(th.textContent||"")){const td=tr.querySelector("td");if(td)return td.textContent?.split(/•|,|\||\//)[0].trim();}}}catch{} }
async function wikipediaInfo(t:string){try{const [sum,html]=await Promise.all([fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`),fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(t)}`)]);if(!sum.ok)return{};const extract=(await sum.json()).extract??"";let genre;if(html.ok)genre=extractGenreFromInfobox(await html.text());if(!genre){for(const[r,l]of GENRE_KEYWORDS)if(r.test(extract)){genre=l;break}}const y=extract.match(/(19|20)\d{2}/);return{genre,year:y?+y[0]:undefined};}catch{return{}}}

// ────────────────────────────────────────── Autocomplete with focus / picked guard
interface ACProps{value:string;onChange:(v:string)=>void;onSelect:(v:string)=>void;inputClass?:string;}
function Autocomplete({value,onChange,onSelect,inputClass=""}:ACProps){
  const [sugs,setSugs]=useState<string[]>([]);
  const [active,setActive]=useState(-1);
  const [picked,setPicked]=useState<string>("");
  const [focused,setFocused]=useState(false);
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{if(!focused)return;const t=setTimeout(async()=>{if(value.trim().length<3||value===picked)return setSugs([]);setSugs(await wikiSuggestions(value));setActive(-1);},250);return()=>clearTimeout(t);},[value,focused,picked]);

  const close=()=>setSugs([]);
  const handleKey=(e:KeyboardEvent<HTMLInputElement>)=>{if(sugs.length===0)return;if(e.key==="ArrowDown"){e.preventDefault();setActive(i=>(i+1)%sugs.length);}else if(e.key==="ArrowUp"){e.preventDefault();setActive(i=>(i-1+sugs.length)%sugs.length);}else if(e.key==="Enter"&&active>=0){e.preventDefault();choose(sugs[active]);}};
  const choose=(s:string)=>{onSelect(s);setPicked(s);close();};

  const outside=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))close();};
  useEffect(()=>{window.addEventListener("click",outside);return()=>window.removeEventListener("click",outside);},[]);

  return <div className="relative" ref={ref}><Input value={value} onFocus={()=>setFocused(true)} onBlur={(e:FocusEvent)=>setFocused(false)} onChange={e=>onChange(e.target.value)} onKeyDown={handleKey} className={inputClass} placeholder="Title" />{sugs.length>0&&<ul className="absolute left-0 right-0 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md shadow max-h-48 overflow-auto text-sm z-20">{sugs.map((s,i)=><li key={s} className={`px-2 py-1 cursor-pointer ${i===active?"bg-indigo-100 dark:bg-indigo-800":"hover:bg-indigo-50 dark:hover:bg-indigo-900"} dark:text-white`} onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(-1)} onClick={()=>choose(s)}>{s}</li>)}</ul>}</div>;
}

// ────────────────────────────────────────── Main component
export default function GamePantheon(){
 const[games,setGames]=useState<Game[]>(SAMPLE_GAMES);
 const[newGame,setNewGame]=useState<Partial<Game>>({category:"hero"});
 const[editing,setEditing]=useState<string|null>(null);
 const[draft,setDraft]=useState<Partial<Game>>({});
 const[darkMode,setDarkMode]=useState<boolean>(false);
 
 // Load games and theme preference from localStorage on initial render
 useEffect(() => {
   const savedGames = localStorage.getItem('pantheonGames');
   if (savedGames) {
     try {
       setGames(JSON.parse(savedGames));
     } catch (e) {
       console.error("Failed to parse saved games", e);
     }
   }

   // Load theme preference
   const isDark = localStorage.getItem('pantheonDarkMode') === 'true';
   setDarkMode(isDark);
   if (isDark) {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
 }, []);

 // Save games to localStorage whenever they change
 useEffect(() => {
   localStorage.setItem('pantheonGames', JSON.stringify(games));
 }, [games]);

 // Handle dark mode toggle
 const toggleDarkMode = () => {
   const newMode = !darkMode;
   setDarkMode(newMode);
   localStorage.setItem('pantheonDarkMode', String(newMode));
   if (newMode) {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
 };
 
 // CRUD
 const add=()=>{if(!newGame.title||!newGame.genre||!newGame.year)return;setGames([...games,{...(newGame as Game),id:uid()}]);setNewGame({category:"hero"});};
 const del=(id:string)=>setGames(games.filter(g=>g.id!==id));
 const save=(id:string)=>{if(!draft.title||!draft.genre||!draft.year)return;setGames(games.map(g=>g.id===id?{...g,...draft as Game}:g));setEditing(null);};
 // drag
 const onDragStart=(e:React.DragEvent,id:string)=>{e.dataTransfer.setData("text/plain",id);e.dataTransfer.effectAllowed="move";};
 const onDrop=(e:React.DragEvent,target:CategoryID)=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");if(!id)return;setGames(gs=>gs.map(g=>g.id===id?{...g,category:target}:g));};
 const allow=(e:React.DragEvent)=>{
   e.preventDefault();
   e.dataTransfer.dropEffect="move";
   // Add classes to highlight the drop target
   if (e.currentTarget.classList.contains('outline-dashed')) return;
   if (document.documentElement.classList.contains('dark')) {
     e.currentTarget.classList.add('outline-dashed', 'outline-2', 'outline-indigo-500', 'bg-indigo-900/20');
   } else {
     e.currentTarget.classList.add('outline-dashed', 'outline-2', 'outline-indigo-400', 'bg-indigo-50/30');
   }
 };
 // Add a drag leave handler
 const removeDragHighlight=(e:React.DragEvent)=>{
   e.currentTarget.classList.remove(
     'outline-dashed', 'outline-2', 
     'outline-indigo-400', 'outline-indigo-500',
     'bg-indigo-50/30', 'bg-indigo-900/20'
   );
 };
 // autofill
 const autoNew=async()=>{if(!newGame.title)return;setNewGame({...newGame,...await wikipediaInfo(newGame.title)});};
 const autoEdit=async()=>{if(!draft.title)return;setDraft({...draft,...await wikipediaInfo(draft.title)});};

 return <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 min-h-screen select-none">
  <header className="text-center mb-8 relative">
    <h1 className="text-4xl font-extrabold dark:text-white">🎮 The Game Pantheon</h1>
    <div className="absolute right-0 top-2">
      <IconBtn title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} onClick={toggleDarkMode}>
        {darkMode ? <SunMedium className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </IconBtn>
    </div>
  </header>
  {/* Add Form */}
  <div className="mx-auto max-w-2xl bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-10">
   <h2 className="text-lg font-semibold flex items-center gap-1 dark:text-white"><Plus className="w-4 h-4"/>Add Game</h2>
   <div className="grid sm:grid-cols-2 gap-3 mt-2">
     <Autocomplete value={newGame.title??""} onChange={v=>setNewGame({...newGame,title:v})} onSelect={async v=>setNewGame({...newGame,title:v,...await wikipediaInfo(v)})}/>
     <Input placeholder="Genre" value={newGame.genre??""} onChange={e=>setNewGame({...newGame,genre:e.target.value})}/>
     <Input type="number" placeholder="Year" value={newGame.year??""} onChange={e=>setNewGame({...newGame,year:+e.target.value})}/>
     <Select value={newGame.category} onChange={e=>setNewGame({...newGame,category:e.target.value as CategoryID})}>{Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</Select>
   </div>
   <div className="flex justify-between pt-2"><Button onClick={autoNew} className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Auto‑Fill</Button><Button onClick={add}>Add</Button></div>
  </div>

  <div className="grid gap-6" style={{gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))"}}>
   {Object.entries(CATEGORIES).map(([cid,meta])=>{
     const Icon=meta.icon; const list=games.filter(g=>g.category===cid);
     return <Card 
       key={cid} 
       onDragOver={allow} 
       onDragLeave={removeDragHighlight}
       onDrop={(e: React.DragEvent)=>{
         removeDragHighlight(e);
         onDrop(e,cid as CategoryID);
       }}
     >
       <CardHeader><Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/><CardTitle>{meta.name}</CardTitle></CardHeader>
       <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{meta.blurb}</p>
        {list.length?
         <ul className="space-y-0.5 text-sm">
          {list.map(g=>editing!==g.id?
           <li key={g.id} className="flex flex-col gap-1 border-b dark:border-slate-700 last:border-0 py-2 pl-8 relative group" draggable onDragStart={e=>onDragStart(e,g.id)}>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-5 flex justify-center">
              <div className="absolute opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 cursor-grab">
                <GripVertical size={12} />
              </div>
              {React.createElement(getGenreIcon(g.genre), {
                className: "w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:opacity-0"
              })}
            </div>
            <div className="cursor-grab">
              <span className="font-medium pr-1 leading-tight dark:text-white">{g.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">{g.genre} · {g.year}</span>
              <div className="flex gap-1">
                <IconBtn title="Edit" onClick={()=>{setEditing(g.id);setDraft({...g})}}><Pen className="w-3 h-3"/></IconBtn>
                <IconBtn title="Delete" onClick={()=>del(g.id)}><X className="w-3 h-3"/></IconBtn>
              </div>
            </div>
           </li>
           :
           <li key={g.id} className="flex flex-col gap-2 border-b dark:border-slate-700 last:border-0 py-2 pl-8 relative">
            <div className="absolute left-1 top-[calc(1rem+4px)] w-5 flex justify-center">
              {React.createElement(getGenreIcon(draft.genre || ""), {
                className: "w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
              })}
            </div>
            <div>
              <Autocomplete value={draft.title??""} onChange={v=>setDraft({...draft,title:v})} onSelect={async v=>setDraft({...draft,title:v,...await wikipediaInfo(v)})} inputClass="text-xs"/>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Input value={draft.genre??""} onChange={e=>setDraft({...draft,genre:e.target.value})} className="text-xs" placeholder="Genre"/>
              <Input type="number" value={draft.year??""} onChange={e=>setDraft({...draft,year:+e.target.value})} className="text-xs" placeholder="Year"/>
              <Select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as CategoryID})} className="text-xs">{Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</Select>
            </div>
            <div className="flex justify-end gap-2 items-center">
              <IconBtn title="Auto‑Fill" onClick={autoEdit}><RefreshCw className="w-3 h-3"/></IconBtn>
              <Button onClick={()=>save(g.id)} className="bg-green-600 dark:bg-green-700 px-2 py-1 text-xs">Save</Button>
              <Button onClick={()=>setEditing(null)} className="bg-gray-400 dark:bg-gray-600 px-2 py-1 text-xs">Cancel</Button>
            </div>
           </li>)}
         </ul>
        :<p className="italic text-gray-400 dark:text-gray-500">No games</p>}
       </CardContent>
     </Card>})}
  </div>
 </div>;
} 