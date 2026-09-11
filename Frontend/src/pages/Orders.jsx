import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { useAuth } from "../features/auth/hooks/useAuth";
import { createOrder, getOrders, getProducts, updateOrder } from "../features/restaurant/services/restaurantApi";
import { clearCart, getCartTotals, readCart, removeCartItem, syncCartWithInventory, updateCartItem } from "../utils/cart";
import { useToast } from "../context/ToastContext";

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function OrdersPage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadOrders(page = currentPage, status = statusFilter) {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = { page, limit: 6, order: "desc" };
      if (status !== "all") {
        params.status = status;
      }

      const data = await getOrders(params);
      const ownOrders = (data.result || []).filter((order) => {
        if (isAdmin) return true;
        const orderUserId = order?.user && typeof order.user === "object" ? order.user?._id : order?.user;
        return !user?._id || String(orderUserId) === String(user._id);
      });

      setOrders(ownOrders);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function syncInventory() {
      try {
        const data = await getProducts({ page: 1, limit: 100, order: "desc" });
        if (!mounted) {
          return;
        }

        setInventory(data.result || []);
        setCart(syncCartWithInventory(readCart(), data.result || []));
      } catch {
        if (mounted) {
          setCart(readCart());
        }
      }
    }

    syncInventory();
    loadOrders(1, statusFilter);

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(1, statusFilter);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (inventory.length > 0) {
      setCart((currentCart) => syncCartWithInventory(currentCart, inventory));
    }
  }, [inventory]);

  const totals = useMemo(() => getCartTotals(cart), [cart]);

  const orderItemCount = useMemo(() => {
    return orders.reduce((count, order) => {
      return count + (order.items || []).length;
    }, 0);
  }, [orders]);

  function getStatusStyles(status) {
    switch (status) {
      case "processing":
        return "border-amber-500/40 bg-amber-500/10 text-amber-400";
      case "delivered":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
      case "cancelled":
        return "border-rose-500/40 bg-rose-500/10 text-rose-400";
      default:
        return "border-sky-500/40 bg-sky-500/10 text-sky-400";
    }
  }

  function renderOrderUser(order) {
    const orderUser = order?.user;

    if (orderUser && typeof orderUser === "object") {
      return orderUser.username || orderUser.email || "Customer";
    }

    if (typeof orderUser === "string" && orderUser.length > 0) {
      return `Customer #${orderUser.slice(-6)}`;
    }

    return "Customer";
  }

  function renderOrderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Product";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div
          key={`${order._id}-${index}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3"
        >
          <div>
            <p className="font-bold text-white text-sm">{productName}</p>
            <p className="text-xs text-zinc-400">
              Qty {item.quantity} · ${unitPrice.toFixed(2)} each
            </p>
          </div>
          <p className="text-sm font-black text-amber-400">${(unitPrice * item.quantity).toFixed(2)}</p>
        </div>
      );
    });
  }

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      toast?.warning("Please login first");
      return;
    }

    if (cart.length === 0) {
      toast?.info("Cart is empty");
      return;
    }

    try {
      setSubmitting(true);
      const syncedCart = syncCartWithInventory(cart, inventory);
      if (syncedCart.length === 0) {
        toast?.warning("Your cart has no available items");
        return;
      }

      await createOrder({
        items: syncedCart.map((item) => ({ product: item.productId, quantity: item.quantity })),
      });

      clearCart();
      setCart([]);
      toast?.success("Order placed successfully! 🍽️");
      await loadOrders(currentPage, statusFilter);
    } catch (err) {
      setError(err);
      toast?.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOrderUpdate(orderId, status) {
    try {
      setSubmitting(true);
      await updateOrder(orderId, { status });
      toast?.success(isAdmin ? "Order status updated" : "Order cancelled");
      await loadOrders(currentPage, statusFilter);
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16 text-zinc-100">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 text-2xl font-bold mb-4">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Sign In Required</h1>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Please log in to your Savoria account to manage your live cart and view previous order history.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-zinc-950 hover:brightness-110 transition shadow-lg shadow-amber-500/20"
          >
            Go To Sign In Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 sm:px-6 sm:py-16 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto max-w-7xl">
        
        {/* Header Stats */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Live Order Desk
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl">
                Cart & Order Management
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Review your current order cart on the left, and track previous active orders on the right.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Cart Items</p>
                <p className="mt-1 text-2xl font-black text-white">{totals.itemsCount}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Orders Tracked</p>
                <p className="mt-1 text-2xl font-black text-white">{orders.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Total Items</p>
                <p className="mt-1 text-2xl font-black text-white">{orderItemCount}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Cart Subtotal</p>
                <p className="mt-1 text-2xl font-black text-amber-400">${totals.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Checkout & Order History */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          
          {/* Checkout Column */}
          <article id="checkout" className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Step 1</span>
                  <h2 className="text-2xl font-bold text-white font-serif">Checkout Cart</h2>
                </div>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                  ${totals.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">${Number(item.price).toFixed(2)} each</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCart(removeCartItem(item.productId))}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold uppercase text-zinc-500">Qty:</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            setCart(updateCartItem(item.productId, Number(event.target.value || 1)))
                          }
                          className="w-20 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-white outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <span className="text-sm font-bold text-amber-400">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                    <p className="text-sm font-medium">Your cart is currently empty</p>
                    <Link to="/menu" className="mt-3 inline-block rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition">
                      Browse Menu Dishes
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Grand Total</span>
                <span className="text-3xl font-black text-amber-400">${totals.totalAmount.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 transition enabled:hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Processing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </article>

          {/* History Column */}
          <article id="history" className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Track Record</span>
                <h2 className="text-2xl font-bold text-white font-serif">Order History</h2>
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-amber-500/50"
              >
                <option value="all" className="bg-zinc-900">All Statuses</option>
                {statusList.map((status) => (
                  <option key={status} value={status} className="bg-zinc-900">
                    {status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="mt-6">
                <Error message={error.message} />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <article key={order._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-zinc-900">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          Order #{order._id?.slice(-8)}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">{renderOrderUser(order)}</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent Order"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">{renderOrderItems(order)}</div>

                    <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Total Amount</span>
                        <p className="text-2xl font-black text-amber-400">${Number(order.totalAmount || 0).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <select
                            value={order.status}
                            onChange={(event) => handleOrderUpdate(order._id, event.target.value)}
                            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-amber-400 outline-none"
                          >
                            {statusList.map((status) => (
                              <option key={status} value={status} className="bg-zinc-900">
                                {status.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          order.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleOrderUpdate(order._id, "cancelled")}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                            >
                              Cancel Order
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                ))}

                {orders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                    No orders matching status criteria.
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => loadOrders(currentPage - 1, statusFilter)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-amber-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => loadOrders(currentPage + 1, statusFilter)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </article>

        </div>
      </section>
    </div>
  );
}

