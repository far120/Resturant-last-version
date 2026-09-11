import { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { getOrders, updateOrder } from "../../features/restaurant/services/restaurantApi";

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalprice , setTotalPrice] = useState(0);

  async function refreshOrders(page = currentPage, status = statusFilter) {
    try {
      setLoading(true);
      const params = { page, limit: 6, order: "desc" };
      if (status !== "all") {
        params.status = status;
      }

      const data = await getOrders(params);
      setOrders(data.result || []);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshOrders(1, statusFilter);
  }, []);

  useEffect(() => {
    refreshOrders(1, statusFilter);
  }, [statusFilter]);


  async function handleStatusChange(orderId, status) {
    try {
      await updateOrder(orderId, { status });
      toast?.success("Order status updated");
      await refreshOrders(currentPage, statusFilter);
    } catch (err) {
      toast?.error(err.message);
    }
  }

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

  function getOrderCustomer(order) {
    const customer = order?.user;

    if (customer && typeof customer === "object") {
      return {
        name: customer.username || customer.email || "Customer",
        email: customer.email || "No email",
      };
    }

    if (typeof customer === "string" && customer.length > 0) {
      return {
        name: `Customer #${customer.slice(-6)}`,
        email: "User details loaded",
      };
    }

    return {
      name: "Customer",
      email: "Guest User",
    };
  }

  function renderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Item";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div key={`${order._id}-${index}`} className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-white text-sm">{productName}</p>
              <p className="text-xs text-zinc-400">
                Qty {item.quantity} · ${unitPrice.toFixed(2)} each
              </p>
            </div>
            <p className="text-sm font-black text-amber-400">${(unitPrice * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      );
    });
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
      <section className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Kitchen Operations
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl">
                Order Administration Desk
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Update live order processing status, inspect ordered items, and monitor revenue metrics.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-bold text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="all" className="bg-zinc-900">All Order Statuses</option>
              {statusList.map((status) => (
                <option key={status} value={status} className="bg-zinc-900">
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Orders Active</p>
              <p className="mt-1 text-2xl font-black text-white">{orders.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Items Ordered</p>
              <p className="mt-1 text-2xl font-black text-white">
                {orders.reduce((count, order) => count + (order.items || []).length, 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Total Page Value</p>
              <p className="mt-1 text-2xl font-black text-amber-400">
                ${orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {orders.map((order) => {
            const customer = getOrderCustomer(order);

            return (
              <article key={order._id} className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Order #{order._id?.slice(-8)}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-0.5">{customer.name}</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">{customer.email}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent Order"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">{renderItems(order)}</div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Total Price</span>
                    <span className="text-2xl font-black text-amber-400">${Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-zinc-400">Status:</label>
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-bold text-amber-400 outline-none focus:border-amber-500/50"
                    >
                      {statusList.map((status) => (
                        <option key={status} value={status} className="bg-zinc-900">
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
              No orders found matching the filter.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => refreshOrders(currentPage - 1, statusFilter)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition"
          >
            Previous Page
          </button>
          <span className="text-xs font-bold text-amber-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => refreshOrders(currentPage + 1, statusFilter)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition"
          >
            Next Page
          </button>
        </div>
      </section>
    </div>
  );
}

