import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/ui/Input";
import Reset from "../../../components/ui/Reset";
import Submit from "../../../components/ui/Submit";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { resetMyPassword } from "../services/userApi";
import { hasMinLength } from "../../../utils/validation";
import { FiLock, FiShield, FiKey } from "react-icons/fi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validCurrent = hasMinLength(currentPassword, 6);
  const validNew = hasMinLength(newPassword, 6);
  const validConfirm = confirmPassword === newPassword && hasMinLength(confirmPassword, 6);
  const canSubmit = validCurrent && validNew && validConfirm;
  const canReset = currentPassword || newPassword || confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);

    try {
      await resetMyPassword({ currentPassword, newPassword });
      toast.success("Password changed successfully. Please login again.");
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur sm:p-10">
        
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
            <FiShield className="text-sm" />
            Security & Authentication
          </span>
        </div>

        <h1 className="mb-2 text-center text-3xl font-extrabold text-white font-serif tracking-tight sm:text-4xl">
          Change Account Password
        </h1>
        <p className="mb-8 text-center text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Enter your current security password and set a new strong password for your Savoria account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Enter current password"
              error={!validCurrent && currentPassword ? "At least 6 characters required" : null}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-amber-500/50"
            />
          </div>

          <div>
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
              error={!validNew && newPassword ? "At least 6 characters required" : null}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-amber-500/50"
            />
          </div>

          <div>
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              error={!validConfirm && confirmPassword ? "Passwords do not match" : null}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-amber-500/50"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Submit
              disabled={!canSubmit || loading}
              loading={loading}
              text="Update Password"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition enabled:hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <Reset
              disabled={!canReset || loading}
              onReset={handleReset}
              text="Clear Form"
              className="w-full sm:w-auto rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-3.5 text-sm font-bold text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-40"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
