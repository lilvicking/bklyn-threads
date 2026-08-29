import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-widest text-amber">NEW PRODUCT</h1>
        <p className="mt-1 text-sm text-silver-gray">Create a listing. Images &amp; variants are optional at first.</p>
      </header>
      <ProductForm mode="create" />
    </div>
  );
}