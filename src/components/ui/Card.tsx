import { CATEGORY_COLORS } from "../../data/categories";
import { CategoryID } from "../../types";

// Card component
export const Card = ({ children, category = "other", ...p }: any) => {
  return (
    <div {...p} className={`rounded-xl border border-slate-800/50 bg-slate-900/70 shadow-lg backdrop-blur-sm backdrop-filter 
    hover:shadow-xl transition duration-300 flex flex-col h-full relative overflow-hidden group ${p.className || ""}`}>
      <div className={`absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-800/60 opacity-80 group-hover:opacity-90 transition-opacity duration-300`}></div>
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};

// CardHeader component
export const CardHeader = ({ children, category = "other" }: any) => {
  const colors = CATEGORY_COLORS[category as CategoryID];
  return (
    <div className={`flex items-center gap-3 p-5 pb-3 border-b ${colors.border} bg-gradient-to-r ${colors.gradient}`}>
      {children}
    </div>
  );
};

// CardTitle component
export const CardTitle = ({ children }: any) => {
  return <h2 className={`text-xl font-serif font-bold leading-tight tracking-wide text-white`}>{children}</h2>;
};

// CardContent component
export const CardContent = ({ children, ...p }: any) => (
  <div {...p} className="p-5 pt-4 grow flex flex-col gap-3">{children}</div>
); 