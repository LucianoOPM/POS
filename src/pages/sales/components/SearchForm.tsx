import { Plus, Search } from "lucide-preact";
import { RefObject } from "preact";
import { Dispatch, StateUpdater } from "preact/hooks";

interface Props {
  handleSearch: (e: Event) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  searchQuery: string;
  setSearchQuery: Dispatch<StateUpdater<string>>;
  lastScanned: number | null;
}

export default function SearchForm({
  handleSearch,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  lastScanned,
}: Props) {
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex gap-4 items-center">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          placeholder="Buscar producto (F3)..."
          className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-primary-500 rounded-lg text-lg outline-none transition-all placeholder:text-gray-400 text-gray-800"
          autoComplete="off"
        />
        {lastScanned && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 flex items-center gap-1 font-bold animate-pulse text-sm">
            <Plus size={16} /> Agregado
          </div>
        )}
      </form>
    </div>
  );
}
