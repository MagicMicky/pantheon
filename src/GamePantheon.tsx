import React, { useState, useEffect, useRef, KeyboardEvent, FocusEvent } from "react";
import { Mountain, SunMedium, Star, Music, Sword, Shield, Plus, X, Pen, RefreshCw } from "lucide-react";

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

// ────────────────────────────────────────── Tiny UI shims
const Card = ({ children, ...p }: any) => <div {...p} className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition flex flex-col h-full" >{children}</div>;
const CardHeader = ({ children }: any) => <div className="flex items-center gap-2 p-4 pb-1 border-b">{children}</div>;
const CardTitle = ({ children }: any) => <h2 className="text-lg font-bold leading-tight">{children}</h2>;
const CardContent = ({ children, ...p }: any) => <div {...p} className="p-4 grow flex flex-col gap-3">{children}</div>;
const Button = ({ children, onClick, className="" }: any) => <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition ${className}`}>{children}</button>;
const IconBtn = ({ children, onClick, title="" }: any) => <button onClick={onClick} title={title} className="p-1 text-gray-500 hover:text-indigo-600 transition">{children}</button>;
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${p.className??""}`} />;
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`w-full rounded-md border px-2 py-1 text-sm ${p.className??""}`} />;

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

  return <div className="relative" ref={ref}><Input value={value} onFocus={()=>setFocused(true)} onBlur={(e:FocusEvent)=>setFocused(false)} onChange={e=>onChange(e.target.value)} onKeyDown={handleKey} className={inputClass} placeholder="Title" />{sugs.length>0&&<ul className="absolute left-0 right-0 bg-white border rounded-md shadow max-h-48 overflow-auto text-sm z-20">{sugs.map((s,i)=><li key={s} className={`px-2 py-1 cursor-pointer ${i===active?"bg-indigo-100":"hover:bg-indigo-50"}`} onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(-1)} onClick={()=>choose(s)}>{s}</li>)}</ul>}</div>;
}

// ────────────────────────────────────────── Main component
export default function GamePantheon(){
 const[games,setGames]=useState<Game[]>(SAMPLE_GAMES);
 const[newGame,setNewGame]=useState<Partial<Game>>({category:"hero"});
 const[editing,setEditing]=useState<string|null>(null);
 const[draft,setDraft]=useState<Partial<Game>>({});
 
 // Load games from localStorage on initial render
 useEffect(() => {
   const savedGames = localStorage.getItem('pantheonGames');
   if (savedGames) {
     try {
       setGames(JSON.parse(savedGames));
     } catch (e) {
       console.error("Failed to parse saved games", e);
     }
   }
 }, []);

 // Save games to localStorage whenever they change
 useEffect(() => {
   localStorage.setItem('pantheonGames', JSON.stringify(games));
 }, [games]);
 
 // CRUD
 const add=()=>{if(!newGame.title||!newGame.genre||!newGame.year)return;setGames([...games,{...(newGame as Game),id:uid()}]);setNewGame({category:"hero"});};
 const del=(id:string)=>setGames(games.filter(g=>g.id!==id));
 const save=(id:string)=>{if(!draft.title||!draft.genre||!draft.year)return;setGames(games.map(g=>g.id===id?{...g,...draft as Game}:g));setEditing(null);};
 // drag
 const onDragStart=(e:React.DragEvent,id:string)=>{e.dataTransfer.setData("text/plain",id);e.dataTransfer.effectAllowed="move";};
 const onDrop=(e:React.DragEvent,target:CategoryID)=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");if(!id)return;setGames(gs=>gs.map(g=>g.id===id?{...g,category:target}:g));};
 const allow=(e:React.DragEvent)=>{e.preventDefault();e.dataTransfer.dropEffect="move";};
 // autofill
 const autoNew=async()=>{if(!newGame.title)return;setNewGame({...newGame,...await wikipediaInfo(newGame.title)});};
 const autoEdit=async()=>{if(!draft.title)return;setDraft({...draft,...await wikipediaInfo(draft.title)});};

 return <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen select-none">
  <header className="text-center mb-8"><h1 className="text-4xl font-extrabold">🎮 The Game Pantheon</h1></header>
  {/* Add Form */}
  <div className="mx-auto max-w-2xl bg-white p-4 rounded-xl shadow mb-10">
   <h2 className="text-lg font-semibold flex items-center gap-1"><Plus className="w-4 h-4"/>Add Game</h2>
   <div className="grid sm:grid-cols-2 gap-3 mt-2">
     <Autocomplete value={newGame.title??""} onChange={v=>setNewGame({...newGame,title:v})} onSelect={async v=>setNewGame({...newGame,title:v,...await wikipediaInfo(v)})}/>
     <Input placeholder="Genre" value={newGame.genre??""} onChange={e=>setNewGame({...newGame,genre:e.target.value})}/>
     <Input type="number" placeholder="Year" value={newGame.year??""} onChange={e=>setNewGame({...newGame,year:+e.target.value})}/>
     <Select value={newGame.category} onChange={e=>setNewGame({...newGame,category:e.target.value as CategoryID})}>{Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</Select>
   </div>
   <div className="flex justify-between pt-2"><Button onClick={autoNew} className="bg-gray-200 text-gray-700">Auto‑Fill</Button><Button onClick={add}>Add</Button></div>
  </div>

  <div className="grid gap-6" style={{gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))"}}>
   {Object.entries(CATEGORIES).map(([cid,meta])=>{
     const Icon=meta.icon; const list=games.filter(g=>g.category===cid);
     return <Card key={cid} onDragOver={allow} onDrop={(e: React.DragEvent)=>onDrop(e,cid as CategoryID)}>
       <CardHeader><Icon className="w-6 h-6 text-indigo-600"/><CardTitle>{meta.name}</CardTitle></CardHeader>
       <CardContent>
        <p className="text-sm text-gray-600 mb-2">{meta.blurb}</p>
        {list.length?
         <ul className="space-y-1 text-sm">
          {list.map(g=>editing!==g.id?
           <li key={g.id} className="flex justify-between items-center border-b last:border-0 py-1" draggable onDragStart={e=>onDragStart(e,g.id)}>
            <span className="font-medium truncate mr-1">{g.title}</span>
            <span className="text-gray-500 text-xs">{g.genre} · {g.year}</span>
            <span className="flex gap-1 ml-2"><IconBtn title="Edit" onClick={()=>{setEditing(g.id);setDraft({...g})}}><Pen className="w-4 h-4"/></IconBtn><IconBtn title="Delete" onClick={()=>del(g.id)}><X className="w-4 h-4"/></IconBtn></span>
           </li>
           :
           <li key={g.id} className="flex flex-col gap-1 border-b last:border-0 py-1">
            <div className="grid grid-cols-2 gap-1">
              <Autocomplete value={draft.title??""} onChange={v=>setDraft({...draft,title:v})} onSelect={async v=>setDraft({...draft,title:v,...await wikipediaInfo(v)})} inputClass="text-xs"/>
              <Input value={draft.genre??""} onChange={e=>setDraft({...draft,genre:e.target.value})} className="text-xs"/>
              <Input type="number" value={draft.year??""} onChange={e=>setDraft({...draft,year:+e.target.value})} className="text-xs"/>
              <Select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as CategoryID})} className="text-xs">{Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</Select>
            </div>
            <div className="flex gap-2 items-center pt-1"><IconBtn title="Auto‑Fill" onClick={autoEdit}><RefreshCw className="w-4 h-4"/></IconBtn><Button onClick={()=>save(g.id)} className="bg-green-600 px-2 py-1 text-xs">Save</Button><Button onClick={()=>setEditing(null)} className="bg-gray-400 px-2 py-1 text-xs">Cancel</Button></div>
           </li>)}
         </ul>
        :<p className="italic text-gray-400">No games</p>}
       </CardContent>
     </Card>})}
  </div>
 </div>;
}

function uid(){return Math.random().toString(36).slice(2,10);} 