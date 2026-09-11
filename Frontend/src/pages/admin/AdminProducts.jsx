import { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../services/endpoints";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "../../features/restaurant/services/restaurantApi";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  available: "true",
};

export default function AdminProductsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240&h=160&fit=crop&auto=format";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  async function refreshData() {
    try {
      setLoading(true);
      const [productsData, categoriesData, ] = await Promise.all([
        getProducts({ page: 1, limit: 100, order: "desc" }),
        getCategories({ page: 1, limit: 100, order: "desc" }),
      ]);

      setProducts(productsData.result || []);
      setCategories(categoriesData.result || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [categories]);



  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const categoryName = categoryMap.get(product.category) || "";
      const matchesSearch = !term || `${product.name} ${categoryName}`.toLowerCase().includes(term);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && product.available) ||
        (availabilityFilter === "unavailable" && !product.available);

      return matchesSearch && matchesAvailability;
    });
  }, [products, searchTerm, categoryMap, availabilityFilter]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function beginEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category: typeof product.category === "object" ? product.category?._id || "" : product.category || "",
      available: product.available ? "true" : "false",
    });
    setImageFile(null);
  }

  function getCategoryName(product) {
    if (product.category && typeof product.category === "object") {
      return product.category.name || "Uncategorized";
    }

    return categoryMap.get(product.category) || "Uncategorized";
  }
  

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setImageFile(null);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.category) {
      toast?.warning("Category is required");
      return;
    }

  

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("description", form.description);
    payload.append("price", Number(form.price));
    payload.append("stock", Number(form.stock));
    payload.append("category", form.category);
    payload.append("available", form.available);

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        toast?.success("Product updated");
      } else {
        await createProduct(payload);
        toast?.success("Product created");
      }

      resetForm();
      await refreshData();
    } catch (err) {
      toast?.error(err.message);
    }
  }

  async function handleDelete(productId) {
    try {
      await deleteProduct(productId);
      toast?.success("Product deleted");
      await refreshData();
    } catch (err) {
      toast?.error(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-5xl px-4 bg-zinc-950">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
        
        {/* Left Form: Add / Edit Product */}
        <article className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Menu Catalog</span>
            <h1 className="text-2xl font-bold text-white font-serif">{editingId ? "Edit Dish Listing" : "Add New Dish"}</h1>
            <p className="mt-1 text-xs text-zinc-400">Configure prices, availability, stock, and dish photo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Dish Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Truffle Ribeye Steak"
                required
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Dish ingredients, flavor notes, preparation details..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Dish Photo Image</label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-300 outline-none focus:border-amber-500/50"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                {editingId ? "Select a new image file only if you want to replace current photo" : "Upload high quality food photo"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Price ($)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={form.price}
                  onChange={handleChange}
                  placeholder="24.99"
                  required
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Stock Qty</label>
                <input
                  name="stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="50"
                  required
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-amber-500/50"
              >
                <option value="" className="bg-zinc-900">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id} className="bg-zinc-900">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Availability Status</label>
              <select
                name="available"
                value={form.available}
                onChange={handleChange}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-amber-500/50"
              >
                <option value="true" className="bg-zinc-900">Available to Order</option>
                <option value="false" className="bg-zinc-900">Not Available (Sold Out)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 hover:brightness-110 transition"
              >
                {editingId ? "Update Dish" : "Save Dish"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white"
              >
                Reset Form
              </button>
            </div>
          </form>
        </article>

        {/* Right Listing: Current Products */}
        <article className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Live Inventory</span>
              <h2 className="text-xl font-bold text-white font-serif">Menu Items ({filteredProducts.length})</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search dish..."
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
              />
              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 outline-none"
              >
                <option value="all" className="bg-zinc-900">All State</option>
                <option value="available" className="bg-zinc-900">Available</option>
                <option value="unavailable" className="bg-zinc-900">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=600&fit=crop&auto=format";
                      }}
                      className="h-16 w-16 rounded-xl object-cover border border-zinc-800"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base">{product.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{product.description || "No description"}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold">
                        <span className="text-amber-500 uppercase tracking-wider">{getCategoryName(product)}</span>
                        <span className="text-zinc-600">•</span>
                        <span className={product.available ? "text-emerald-400" : "text-rose-400"}>
                          {product.available ? "Available" : "Sold Out"}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400">Stock: {product.stock ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-black text-amber-400">${Number(product.price || 0).toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => beginEdit(product)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-bold text-amber-400 hover:bg-zinc-800 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                No dish products match the search query.
              </div>
            )}
          </div>
        </article>

      </section>
    </div>
  );
}

