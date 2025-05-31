
// Regular button component
export const Button = ({ children, onClick, className="" }: any) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 text-sm font-medium rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow ${className}`}
  >
    {children}
  </button>
);

// Icon button component
export const IconBtn = ({ children, onClick, title="" }: any) => (
  <button 
    onClick={onClick} 
    title={title} 
    className="p-1.5 text-gray-400 hover:text-white transition-colors duration-200"
  >
    {children}
  </button>
); 