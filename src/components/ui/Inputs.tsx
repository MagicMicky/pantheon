import React from "react";

// Input component
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...p} 
    className={`w-full rounded-md border border-slate-700/50 bg-slate-800/70 text-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-500 transition-all duration-200 backdrop-blur-sm ${p.className??""}`} 
  />
);

// Select component
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    {...p} 
    className={`w-full rounded-md border border-slate-700/50 bg-slate-800/70 text-white px-3 py-2 text-sm transition-all duration-200 backdrop-blur-sm ${p.className??""}`} 
  />
); 