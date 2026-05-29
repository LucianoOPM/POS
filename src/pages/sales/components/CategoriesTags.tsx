import { Button } from "@/components/ui/button";

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
        <Button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          variant={activeCategory === cat.id ? "default" : "outline"}
          className={`rounded-full h-auto py-1.5 px-4 whitespace-nowrap text-sm font-medium ${
            activeCategory === cat.id
              ? "bg-secondary-500 text-white border-secondary-500 hover:bg-secondary-600 shadow-md"
              : "text-gray-600 border-gray-200"
          }`}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
}
