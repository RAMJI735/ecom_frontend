import ProductsView from "@views/products";

export const metadata = {
  title: "Product Catalog | ElectroCare",
  description: "Manage electrical and technical products catalog, inventory, and SKU codes",
};

export default function ProductsPage() {
  return <ProductsView />;
}
