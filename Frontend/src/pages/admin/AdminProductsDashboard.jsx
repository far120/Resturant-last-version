import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBox, FiClock, FiLayers, FiShoppingBag } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { getCategories, getOrders, getProducts , getstatistics} from "../../features/restaurant/services/restaurantApi";

export default function AdminProductsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, ordersResponse, statisticsResponse] = await Promise.all([
          getProducts({ page: 1, limit: 20, order: "desc" }),
          getCategories({ page: 1, limit: 20, order: "desc" }),
          getOrders({ page: 1, limit: 20, order: "desc" }),
          getstatistics({ page: 1, limit: 20, order: "desc" }),
        ]);
        

        if (mounted) {
          setProductsData(productsResponse);
          setCategoriesData(categoriesResponse);
          setOrdersData(ordersResponse);
          setStatisticsData(statisticsResponse);
        }
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

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const products = productsData?.result || [];
  const orders = ordersData?.result || [];
  const statistics = statisticsData?.data || {};
  const totalRevenue = statistics.totalRevenue || 0;
  
  

  const unavailableCount = useMemo(() => {
    return products.filter((item) => !item.available).length;
  }, [products]);

  const recentProducts = useMemo(() => products.slice(0, 5), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

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
      <section className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Commerce Dashboard
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl">
                Products & Revenue Analytics
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Monitor live food catalog metrics, category health, revenue breakdowns, and order volume.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/admin/products"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition"
              >
                Manage Products
              </Link>
              <Link
                to="/admin/orders"
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                Manage Orders
              </Link>
              <Link
                to="/admin/categories"
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-zinc-800 transition"
              >
                Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FiBox className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Products</p>
            <p className="mt-1 text-3xl font-black text-white">{productsData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FiLayers className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Categories</p>
            <p className="mt-1 text-3xl font-black text-white">{categoriesData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FiClock className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Unavailable Dishes</p>
            <p className="mt-1 text-3xl font-black text-white">{unavailableCount}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FiShoppingBag className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Orders</p>
            <p className="mt-1 text-3xl font-black text-white">{statistics.totalOrdersCount || 0}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              💵
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">All Orders Volume</p>
            <p className="mt-1 text-3xl font-black text-amber-400">${Number(statistics.totalAllOrdersPrice || 0).toFixed(2)}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
              📈
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Revenue</p>
            <p className="mt-1 text-3xl font-black text-emerald-400">${Number(statistics.totalRevenue || 0).toFixed(2)}</p>
          </article>

          {statistics.byStatus?.map((status) => (
            <article
              key={status._id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
                <FiShoppingBag className="text-xl" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total {status._id}</p>
              <p className="mt-1 text-3xl font-black text-white">${Number(status.totalPrice || 0).toFixed(2)}</p>
            </article>
          ))}
        </div>

        {/* Live Activity Feeds */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Catalog Preview</span>
                <h2 className="text-xl font-bold text-white font-serif">Recent Menu Products</h2>
              </div>
              <FiBox className="text-xl text-amber-400" />
            </div>

            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{product.name || "Product"}</p>
                      <p className="text-xs text-amber-400 font-black mt-0.5">${Number(product.price || 0).toFixed(2)}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${product.available ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-rose-500/30 bg-rose-500/10 text-rose-400"}`}>
                      {product.available ? "Available" : "Sold Out"}
                    </span>
                  </div>
                </div>
              ))}

              {recentProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500 text-xs">
                  No products registered yet.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Live Queue</span>
                <h2 className="text-xl font-bold text-white font-serif">Recent Order Activity</h2>
              </div>
              <FiShoppingBag className="text-xl text-sky-400" />
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => {
                const customer = order?.user && typeof order.user === "object"
                  ? order.user.username || order.user.email || "Customer"
                  : "Customer";

                return (
                  <div key={order._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{customer}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {order.items?.length || 0} items • <span className="text-amber-400 font-bold">${Number(order.totalAmount || 0).toFixed(2)}</span>
                        </p>
                      </div>
                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {recentOrders.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500 text-xs">
                  No orders recorded.
                </div>
              )}
            </div>
          </article>

        </div>
      </section>
    </div>
  );
}

