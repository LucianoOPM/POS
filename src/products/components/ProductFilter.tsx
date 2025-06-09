interface ProductFilterProps {
  status: boolean;
  setStatus: (status: boolean) => void;
}

export const ProductFilter = ({ status, setStatus }: ProductFilterProps) => {
  return (
    <form class="max-w-sm mx-auto">
      <label
        for="countries"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Select an option
      </label>
      <select
        id="countries"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        defaultValue={status ? "1" : "2"}
        onChange={(e) => setStatus(e.currentTarget.value === "1")}
      >
        <option value="1">Activos</option>
        <option value="2">Inactivos</option>
      </select>
    </form>
  );
};
