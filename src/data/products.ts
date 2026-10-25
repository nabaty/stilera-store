
export type ProductCategory =
  | "t-shirts"
  | "tops"
  | "bottoms"
  | "accessories";

export type ProductFilter =
  | "all"
  | ProductCategory
  | "new-arrivals";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  graphic: string;
  description: string;
  materialCare: string;
  isNewArrival?: boolean;
  galleryImages: string[];
};

export function filterProducts(
  items: Product[],
  filter: ProductFilter,
  query: string,
): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((product) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "new-arrivals"
        ? product.isNewArrival === true
        : product.category === filter);

    const matchesQuery =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.graphic.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.materialCare.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });
}
