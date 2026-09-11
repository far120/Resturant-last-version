import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiClock, FiShield, FiUserCheck, FiUsers } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { getUserLogs, getUsers } from "../../features/User/services/userApi";

export default function AdminUsersDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [logsData, setLogsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [usersResponse, logsResponse] = await Promise.all([
          getUsers({ page: 1, limit: 20, order: "desc" }),
          getUserLogs({ page: 1, limit: 8, order: "desc" }),
        ]);

        if (mounted) {
          setUsersData(usersResponse);
          setLogsData(logsResponse);
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

  const users = usersData?.result || [];
  const logs = logsData?.result || [];

  
  const managersCount = useMemo(() => {
    return users.filter((item) => item.role === "manager").length;
  }, [users]);
  const adminsCount = useMemo(() => {
    return users.filter((item) => item.role === "admin").length;
  }, [users]);
  const usersCount = useMemo(() => {
    return users.filter((item) => item.role === "user").length;
  }, [users]);

  const activeCount = useMemo(() => {
    return users.filter((item) => item.isActive).length;
  }, [users]);

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
                People & Audit Log Center
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl">
                User Accounts & Activity Log
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Inspect registered customers, role permissions, active sessions, and system audit trail events.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/admin/users"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition"
              >
                User Accounts
              </Link>
              <Link
                to="/admin/logs"
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-zinc-800 transition"
              >
                Security Logs
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FiUsers className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Registered Users</p>
            <p className="mt-1 text-3xl font-black text-white">{usersData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
              <FiActivity className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Accounts</p>
            <p className="mt-1 text-3xl font-black text-emerald-400">{activeCount || 0}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FiClock className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Audit Logs</p>
            <p className="mt-1 text-3xl font-black text-white">{logsData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-bold">
              <FiShield className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Managers</p>
            <p className="mt-1 text-3xl font-black text-white">{managersCount}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 font-bold">
              <FiShield className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Admins</p>
            <p className="mt-1 text-3xl font-black text-white">{adminsCount}</p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 font-bold">
              <FiUserCheck className="text-xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Standard Customers</p>
            <p className="mt-1 text-3xl font-black text-white">{usersCount}</p>
          </article>
        </div>

        {/* User & Log Feeds */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Users Preview</span>
                <h2 className="text-xl font-bold text-white font-serif">Recent User Registrations</h2>
              </div>
              <FiUserCheck className="text-xl text-amber-400" />
            </div>

            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div key={u._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{u.username || u.email || "User"}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{u.email || "No email"}</p>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {u.role || "user"}
                    </span>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500 text-xs">
                  No users found.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Security Stream</span>
                <h2 className="text-xl font-bold text-white font-serif">Latest System Activity</h2>
              </div>
              <FiClock className="text-xl text-sky-400" />
            </div>

            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{log.username || "System user"}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{log.action}</p>
                    </div>
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      {log.method || "ACTION"}
                    </span>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500 text-xs">
                  No activity logged.
                </div>
              )}
            </div>
          </article>

        </div>
      </section>
    </div>
  );
}

