interface Props {
  categories: {
    id: string;
    name: string;
  }[];
  setActiveCategory: (id: string) => void;
  activeCategory: string;
}
export default function CategoriesTags({ categories, setActiveCategory, activeCategory }: Props) {
  return (
    <div className="px-4 py-3 bg-white border-b border-gray-200 flex gap-2 overflow-x-auto no-scrollbar shadow-sm z-10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors border ${
            activeCategory === cat.id
              ? "bg-secondary-500 text-white border-secondary-500 shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
