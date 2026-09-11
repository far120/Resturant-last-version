import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiClock, FiGrid, FiList, FiPackage, FiShield, FiShoppingBag, FiUsers } from "react-icons/fi";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../auth/hooks/useAuth";

export default function AdminDashboard() {
  const { isAdmin, isManager } = useAuth();
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 sm:py-16 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto w-full max-w-7xl">
        
        {/* Title Header */}
        <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                <FiGrid />
                <span>Executive Command Hub</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl">
                Savoria Administration Panel
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Manage restaurant operations, products, active kitchen orders, staff accounts, and system logs.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">System Mode</span>
              <span className="text-sm font-bold text-amber-400">
                {isAdmin ? "Full Administrator" : isManager ? "Operations Manager" : "Standard User"}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Quick Access Cards */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-white font-serif">Operating Rooms</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {isAdmin && (
                <Link
                  to="/admin/dashboard/products"
                  className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 text-2xl font-bold">
                      <FiPackage />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Commerce
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition">
                    Products & Orders Hub
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Manage food menu listings, category taxonomies, stock inventories, and customer order statuses.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                    <span>Open Commerce Hub</span>
                    <FiArrowRight />
                  </div>
                </Link>
              )}

              {isManager && (
                <Link
                  to="/admin/dashboard/users"
                  className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 text-2xl font-bold">
                      <FiUsers />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Operations
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition">
                    People & Logs Hub
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Inspect user registration accounts, manager privileges, and system audit log activity.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
                    <span>Open People Hub</span>
                    <FiArrowRight />
                  </div>
                </Link>
              )}
            </div>

            {/* Direct Shortcuts */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">
                Direct Management Links
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/products"
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-amber-500/40 hover:bg-zinc-900"
                    >
                      <FiShoppingBag className="text-xl text-amber-400 mb-2" />
                      <p className="text-xs font-bold text-white">Food Dishes</p>
                      <p className="text-[10px] text-zinc-500">Edit menu catalog</p>
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-amber-500/40 hover:bg-zinc-900"
                    >
                      <FiList className="text-xl text-sky-400 mb-2" />
                      <p className="text-xs font-bold text-white">Live Orders</p>
                      <p className="text-[10px] text-zinc-500">Kitchen order pipeline</p>
                    </Link>
                  </>
                )}
                {isManager && (
                  <>
                    <Link
                      to="/admin/users"
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-amber-500/40 hover:bg-zinc-900"
                    >
                      <FiUsers className="text-xl text-emerald-400 mb-2" />
                      <p className="text-xs font-bold text-white">User Accounts</p>
                      <p className="text-[10px] text-zinc-500">Roles & permissions</p>
                    </Link>
                    <Link
                      to="/admin/logs"
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-amber-500/40 hover:bg-zinc-900"
                    >
                      <FiClock className="text-xl text-purple-400 mb-2" />
                      <p className="text-xs font-bold text-white">Audit Logs</p>
                      <p className="text-[10px] text-zinc-500">Security history</p>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Status Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 block mb-2">
                System Posture
              </span>
              <h3 className="text-lg font-bold text-white font-serif mb-4">Operations Overview</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950">
                  <FiBarChart2 className="text-2xl text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Optimized Navigation</p>
                    <p className="text-[11px] text-zinc-400">Streamlined controls for mobile and desktop viewports.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950">
                  <FiShield className="text-2xl text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Protected Routes</p>
                    <p className="text-[11px] text-zinc-400">Role-gated security ensures strict administrative access.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

