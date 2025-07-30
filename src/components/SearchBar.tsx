import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export default function SearchBar({ searchTerm, onSearchChange, placeholder = "Search models..." }: SearchBarProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   hover:border-gray-300 dark:hover:border-gray-600
                   transition-all duration-200 ease-in-out
                   shadow-sm hover:shadow-md focus:shadow-lg"
        placeholder={placeholder}
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      )}
    </div>
  );
}