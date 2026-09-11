
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasMinLength, isNotEmpty } from "../../../utils/validation.js";
import { useInput } from "../../../hooks/useInput.js";
import { useToast } from "../../../context/ToastContext.jsx";
import Input from "../../../components/ui/Input.jsx";
import Reset from "../../../components/ui/Reset.jsx";
import Submit from "../../../components/ui/Submit.jsx";
import { useAuth } from "../hooks/useAuth.js";


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const {
    value: emailValue,
    handleInputChange: handleemailChange,
    handleInputBlur: handleemailBlur,
    hasError: emailHasError,
    handleReset: handleemailReset,
  } = useInput("", (value) => isNotEmpty(value));

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    hasError: passwordHasError,
    handleReset: handlePasswordReset,
  } = useInput("", (value) => hasMinLength(value, 6));

  // Validation states for enabling submit button
  const isemailValid = isNotEmpty(emailValue);
  const isPasswordValid = hasMinLength(passwordValue, 6);
  const canSubmit = isemailValid && isPasswordValid;
  const canReset = emailValue.trim() !== "" || passwordValue !== "";
 

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    try {
      await login(emailValue, passwordValue);
      toast.success("Login successful ✅");
      navigate("/profile", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed ❌");
    }finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center px-4 py-12 selection:bg-amber-500 selection:text-zinc-950">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-10">
        
        {/* Toggle Pills */}
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-950 p-1.5 border border-zinc-800">
          <Link
            to="/login"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-center text-sm font-bold text-zinc-950 shadow-md shadow-amber-500/20"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl px-4 py-2.5 text-center text-sm font-bold text-zinc-400 hover:text-white transition"
          >
            Register
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white font-serif">
            Welcome Back to Savoria
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your credentials to access your live orders and member perks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              name="email"
              onBlur={handleemailBlur}
              onChange={handleemailChange}
              value={emailValue}
              placeholder="Enter your email"
              className={`w-full rounded-2xl border px-5 py-3 pr-12 text-sm text-white bg-zinc-950 outline-none transition ${
                emailHasError
                  ? "border-rose-500 bg-rose-500/10"
                  : "border-zinc-800 focus:border-amber-500/60"
              }`}
            />
            <FiMail className="pointer-events-none absolute right-4 top-11 text-lg text-zinc-500" />
          </div>

          <div className="relative">
            <Input
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              value={passwordValue}
              placeholder="Enter your password"
              className={`w-full rounded-2xl border px-5 py-3 pr-12 text-sm text-white bg-zinc-950 outline-none transition ${
                passwordHasError
                  ? "border-rose-500 bg-rose-500/10"
                  : "border-zinc-800 focus:border-amber-500/60"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-11 text-lg text-zinc-500 hover:text-amber-400 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <Reset
              title="Reset Form"
              disabled={!canReset || loading}
              onReset={() => {
                handleemailReset();
                handlePasswordReset();
              }}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:text-white"
            />
            <Submit
              title="Sign In"
              loading={loading}
              disabled={!canSubmit}
              loadingLabel="Signing in..."
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
            />
          </div>
        </form>
      </div>
    </div>
  );
}