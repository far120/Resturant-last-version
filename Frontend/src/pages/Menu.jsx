import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiFilter, FiShoppingCart, FiSearch } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { getCategories, getProducts } from "../features/restaurant/services/restaurantApi";
import { addToCart, getCartItemQuantity, getCartTotals, readCart, syncCartWithInventory } from "../utils/cart";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/endpoints";

const priceRanges = [
  { value: "all", label: "All prices" },
  { value: "under-10", label: "Under $10" },
  { value: "10-25", label: "$10 - $25" },
  { value: "25-50", label: "$25 - $50" },
  { value: "50-plus", label: "$50+" },
];

export default function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const toast = useToast();

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=600&fit=crop&auto=format";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ page: 1, limit: 100, order: "desc" }),
          getCategories({ page: 1, limit: 100, order: "desc" }),
        ]);
        if (!mounted) {
          return;
        }

        const nextProducts = Array.isArray(productsData?.result)
          ? productsData.result
          : Array.isArray(productsData)
          ? productsData
          : [];

        const nextCategories = Array.isArray(categoriesData?.result)
          ? categoriesData.result
          : Array.isArray(categoriesData)
          ? categoriesData
          : [];

        setProducts(nextProducts);
        setCategories(nextCategories);
        setCartItems(syncCartWithInventory(readCart(), nextProducts));
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(categories)) {
      categories.forEach((category) => {
        if (category && category._id) {
          map.set(category._id, category.name);
        }
      });
    }
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const term = search.trim().toLowerCase();
    const hasCustomMin = customMinPrice !== "" && Number.isFinite(Number(customMinPrice));
    const hasCustomMax = customMaxPrice !== "" && Number.isFinite(Number(customMaxPrice));

    return products.filter((product) => {
      if (!product) return false;
      const categoryName = (product.category && typeof product.category === "object" ? product.category.name : categoryMap.get(product.category)) || "";
      const candidate = `${product.name || ""} ${product.description || ""} ${categoryName}`.toLowerCase();
      const matchesSearch = !term || candidate.includes(term);

      const productCategoryId = product.category && typeof product.category === "object" ? product.category._id : product.category;
      const matchesCategory = selectedCategory === "all" || String(productCategoryId) === String(selectedCategory);

      const price = Number(product.price || 0);
      const matchesPresetPrice =
        selectedPriceRange === "all" ||
        (selectedPriceRange === "under-10" && price < 10) ||
        (selectedPriceRange === "10-25" && price >= 10 && price < 25) ||
        (selectedPriceRange === "25-50" && price >= 25 && price < 50) ||
        (selectedPriceRange === "50-plus" && price >= 50);

      const matchesCustomMin = !hasCustomMin || price >= Number(customMinPrice);
      const matchesCustomMax = !hasCustomMax || price <= Number(customMaxPrice);
      const matchesPrice = matchesPresetPrice && matchesCustomMin && matchesCustomMax;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [
    categoryMap,
    products,
    search,
    selectedCategory,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
  ]);

  const cartTotals = useMemo(() => getCartTotals(cartItems), [cartItems]);

  function getCategoryName(product) {
    if (product.category && typeof product.category === "object") {
      return product.category.name || "Uncategorized";
    }

    return categoryMap.get(product.category) || "Uncategorized";
  }

  function handleAdd(product) {
    const existingQuantity = getCartItemQuantity(cartItems, product._id);
    const stock = Number(product.stock || 0);

    if (!product.available || stock <= 0) {
      toast?.warning("This product is not available right now");
      return;
    }

    if (existingQuantity >= stock) {
      toast?.warning("You already reached the available stock");
      return;
    }

    const nextCart = addToCart(product, 1);
    setCartItems(syncCartWithInventory(nextCart, products));
    toast?.success("Added to order cart");
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setCustomMinPrice("");
    setCustomMaxPrice("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 sm:py-16 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto max-w-7xl">
        
        {/* Header & Filter Card */}
        <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                <span>Gourmet Selections</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl lg:text-5xl">
                Explore Our Culinary Menu
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Discover artisan dishes crafted daily. Filter by category or search your favorite ingredients.
              </p>
            </div>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
            >
              <FiShoppingCart className="text-lg" />
              <span>Cart Summary ({cartTotals.itemsCount})</span>
              <span className="ml-1 rounded-lg bg-zinc-950/20 px-2 py-0.5 text-xs text-zinc-950">
                ${Number(cartTotals?.subtotal || cartTotals?.totalAmount || 0).toFixed(2)}
              </span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300 focus-within:border-amber-500/50 transition">
              <FiSearch className="text-amber-400 text-lg" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dishes by name or description..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 outline-none focus:border-amber-500/50 transition"
            >
              <option value="all" className="bg-zinc-900">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id} className="bg-zinc-900">
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriceRange}
              onChange={(event) => setSelectedPriceRange(event.target.value)}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 outline-none focus:border-amber-500/50 transition"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-zinc-900">
                  {range.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:text-white hover:border-zinc-700"
            >
              Reset Filters
            </button>
          </div>

          {/* Custom Price Range Row */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={customMinPrice}
              onChange={(event) => setCustomMinPrice(event.target.value)}
              placeholder="Min price ($)"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={customMaxPrice}
              onChange={(event) => setCustomMaxPrice(event.target.value)}
              placeholder="Max price ($)"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50"
            />
          </div>

          {/* Applied Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
            <FiFilter className="text-amber-400" />
            <span className="uppercase tracking-wider">Active:</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-amber-400">
              {selectedCategory === "all" ? "All Categories" : "Category Filtered"}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-amber-400">
              {priceRanges.find((range) => range.value === selectedPriceRange)?.label}
            </span>
            {(customMinPrice || customMaxPrice) && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-amber-400">
                ${customMinPrice || 0} - ${customMaxPrice || "∞"}
              </span>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const inCartQty = getCartItemQuantity(cartItems, product._id);
            const stock = Number(product.stock || 0);
            const isSoldOut = !product.available || stock <= 0;
            const isMaxInCart = inCartQty >= stock;

            return (
              <article
                key={product._id}
                className="group flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl transition hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5"
              >
                <div>
                  <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl bg-zinc-950">
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=600&fit=crop&auto=format";
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                          isSoldOut
                            ? "bg-rose-500/90 text-white"
                            : "bg-emerald-500/90 text-white"
                        }`}
                      >
                        {isSoldOut ? "Sold Out" : "Available"}
                      </span>
                    </div>
                    {inCartQty > 0 && (
                      <span className="absolute top-3 right-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-500 px-2 text-xs font-black text-zinc-950 shadow-lg">
                        {inCartQty} in cart
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      {getCategoryName(product)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">
                      Stock: {stock}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition mb-2">
                    {product.name}
                  </h2>

                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[2.5rem] line-clamp-2">
                    {product.description || "Freshly prepared gourmet selection made with premium ingredients."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-2xl font-black text-amber-400">
                      ${Number(product.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    disabled={isSoldOut || isMaxInCart}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-zinc-950 transition enabled:hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiShoppingCart className="text-base" />
                    <span>
                      {isSoldOut
                        ? "Sold Out"
                        : isMaxInCart
                          ? "Max in Cart"
                          : "Add to Order"}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <p className="text-lg font-bold text-zinc-300">No dishes found</p>
              <p className="text-xs text-zinc-500 mt-1">Try adjusting your search criteria or resetting filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-zinc-700"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

