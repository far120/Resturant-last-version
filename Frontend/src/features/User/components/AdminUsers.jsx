import { useEffect, useState } from "react";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  activateUser,
  changeUserRole,
  deleteUser,
  getUsers,
} from "../services/userApi";
import { FiUsers, FiSearch, FiShield, FiUserCheck, FiTrash2, FiRefreshCw } from "react-icons/fi";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [actionLoadingUserId, setActionLoadingUserId] = useState("");
  const [dataInput, setDataInput] = useState({
    email: "",
    username: "",
    role: "",
    isActive: "",
  });

  const [usernameValue, setUsernameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [roleValue, setRoleValue] = useState("");
  const [statusValue, setStatusValue] = useState("");

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers({
        page,
        limit: 8,
        order: "desc",
        email: dataInput.email || undefined,
        username: dataInput.username || undefined,
        role: dataInput.role || roleValue || undefined,
        isActive: dataInput.isActive || statusValue || undefined,
      });
      setUsers(data?.result || []);
      setPage(data?.page || 1);
      setTotalPages(data?.totalPages || 1);
      setTotalResults(data?.totalResults || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page, dataInput, statusValue, roleValue]);

  async function handleRoleChange(targetUser) {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    setActionLoadingUserId(targetUser._id);

    try {
      await changeUserRole(targetUser._id, nextRole);
      setUsers((prev) =>
        prev.map((item) =>
          item._id === targetUser._id ? { ...item, role: nextRole } : item
        )
      );
      toast.success(`Role updated to ${nextRole}`);
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setActionLoadingUserId("");
    }
  }

  async function handleActivationToggle(targetUser) {
    setActionLoadingUserId(targetUser._id);
    try {
      await activateUser(targetUser._id);
      setUsers((prev) =>
        prev.map((item) =>
          item._id === targetUser._id ? { ...item, isActive: !item.isActive } : item
        )
      );
      toast.success(
        targetUser.isActive ? "User deactivated" : "User activated"
      );
    } catch (err) {
      toast.error(err.message || "Failed to activate/deactivate user");
    } finally {
      setActionLoadingUserId("");
    }
  }

  async function handleDelete(targetUser) {
    const confirmed = window.confirm(
      `Delete user ${targetUser.username || targetUser.email}?`
    );

    if (!confirmed) {
      return;
    }
    setActionLoadingUserId(targetUser._id);
    try {
      await deleteUser(targetUser._id);
      setUsers((prev) => prev.filter((item) => item._id !== targetUser._id));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setActionLoadingUserId("");
    }
  }

  async function handleApplyFilter(e) {
    e.preventDefault();
    setDataInput({
      email: emailValue.trim(),
      username: usernameValue.trim(),
      role: roleValue,
      isActive: statusValue,
    });
    setPage(1);
  }

  async function handleClearFilter() {
    setUsernameValue("");
    setEmailValue("");
    setRoleValue("");
    setStatusValue("");
    setDataInput({ email: "", username: "", role: "", isActive: "" });
    setPage(1);
  }

  if (loading && users.length === 0) {
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
                <FiUsers className="text-xs" />
                Access Control & Accounts
              </span>
              <h1 className="mt-2 text-3xl font-extrabold text-white font-serif tracking-tight sm:text-4xl">
                User Management Directory
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Total registered user accounts: <span className="font-bold text-amber-400">{totalResults}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:border-amber-500/50 hover:text-white transition"
            >
              <FiRefreshCw />
              Refresh Users
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
          <form onSubmit={handleApplyFilter} className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-400">Username</label>
                <input
                  type="text"
                  value={usernameValue}
                  onChange={(event) => setUsernameValue(event.target.value)}
                  placeholder="Filter by username"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(event) => setEmailValue(event.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-400">Role</label>
                <select
                  value={roleValue}
                  onChange={(event) => setRoleValue(event.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
                >
                  <option value="" className="bg-zinc-900">All Roles</option>
                  <option value="user" className="bg-zinc-900">User / Customer</option>
                  <option value="admin" className="bg-zinc-900">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-400">Status</label>
                <select
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
                >
                  <option value="" className="bg-zinc-900">All Statuses</option>
                  <option value="true" className="bg-zinc-900">Active</option>
                  <option value="false" className="bg-zinc-900">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition active:scale-95"
              >
                <FiSearch />
                Search
              </button>

              <button
                type="button"
                onClick={handleClearFilter}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Table Container */}
        {error ? (
          <Error message={error.message} />
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="border-b border-zinc-800 bg-zinc-950 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((item) => {
                    const isCurrentUser = item._id === currentUser?._id;
                    const actionBusy = actionLoadingUserId === item._id;

                    return (
                      <tr key={item._id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-black">
                              {item.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span>{item.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">{item.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              item.role === "admin"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              item.isActive
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.isActive ? "bg-emerald-400" : "bg-rose-400"
                              }`}
                            />
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRoleChange(item)}
                              disabled={actionBusy || isCurrentUser}
                              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-40"
                            >
                              {item.role === "admin" ? "Demote" : "Make Admin"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleActivationToggle(item)}
                              disabled={actionBusy || isCurrentUser}
                              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition disabled:opacity-40"
                            >
                              {item.isActive ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={actionBusy || isCurrentUser}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No users matching criteria.
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
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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