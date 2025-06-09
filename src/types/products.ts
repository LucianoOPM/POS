export type Product = {
  id_product: number;
  name: string;
  stock: number;
  max_stock: number;
  is_active: boolean;
  unit_price: number;
  bar_code: string;
  description: string;
};

export type ProductResponse = {
  products: Product[];
  total_pages: number;
  total_items: number;
};
