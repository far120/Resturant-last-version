import { useEffect, useState } from "react";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { getUserLogs } from "../services/userApi";
import { FiActivity, FiSearch, FiX, FiClock } from "react-icons/fi";

export default function AdminUserLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [emailInput, setEmailInput] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserLogs({
          page,
          limit: 8,
          order: "desc",
          email: emailFilter || undefined,
        });

        setLogs(data?.result || []);
        setPage(data?.page || 1);
        setTotalPages(data?.totalPages || 1);
        setTotalResults(data?.totalResults || 0);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, emailFilter]);

  function handleApplyFilter(e) {
    e.preventDefault();
    setPage(1);
    setEmailFilter(emailInput.trim());
  }

  function handleClearFilter() {
    setEmailInput("");
    setEmailFilter("");
    setPage(1);
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 sm:px-6 sm:py-16 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Banner */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                <FiActivity className="text-xs" />
                Audit Trail & Telemetry
              </span>
              <h1 className="mt-2 text-3xl font-extrabold text-white font-serif tracking-tight sm:text-4xl">
                User Activity Logs
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Total recorded system requests: <span className="font-bold text-amber-400">{totalResults}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
          <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Filter logs by user email address..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition active:scale-95 sm:whitespace-nowrap"
            >
              <FiSearch />
              Search Logs
            </button>

            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-xs font-bold text-zinc-400 hover:text-white transition"
            >
              Clear
            </button>
          </form>

          {emailFilter && (
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
              <span>Active Filter:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-bold text-amber-400">
                {emailFilter}
                <button onClick={handleClearFilter} className="hover:text-white">
                  <FiX />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Logs Table */}
        {error ? (
          <Error message={error.message} />
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="border-b border-zinc-800 bg-zinc-950 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Endpoint URL</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-white text-xs">{log.username || "Guest User"}</p>
                            <p className="text-[11px] text-zinc-500">{log.email || "N/A"}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-300">
                            {log.action || "API Request"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold font-mono ${
                              log.method === "GET"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : log.method === "POST"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : log.method === "PUT"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                                : log.method === "DELETE"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {log.method || "GET"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-[220px] truncate text-xs font-mono text-zinc-400" title={log.url}>
                            {log.url || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              !log.statusCode
                                ? "bg-zinc-800 text-zinc-400"
                                : log.statusCode >= 200 && log.statusCode < 300
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : log.statusCode >= 400 && log.statusCode < 500
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {log.statusCode || 200}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-zinc-400 whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                        No activity logs matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-6 py-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800"
              >
                Previous
              </button>

              <span className="text-xs font-bold text-amber-400">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}