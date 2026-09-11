import { Link } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import {hasMinLength,  isEmail,  isEqualsToOtherValue,  isNotEmpty} from "../../../utils/validation";
import { register } from "../services/authApi";
import { useInput } from "../../../hooks/useInput.js";
import { useCheckbox } from "../../../hooks/useCheckBox.js";
import Input from "../../../components/ui/Input.jsx";
import Reset from "../../../components/ui/Reset.jsx";
import Submit from "../../../components/ui/Submit.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Register() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const {
    value: usernameValue,
    handleInputChange: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
    hasError: usernameHasError,
    handleReset: handleUsernameReset,
  } = useInput("", (value) => isNotEmpty(value));

  const {
    value: emailValue,
    handleInputChange: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    hasError: emailHasError,
    handleReset: handleEmailReset,
  } = useInput("", (value) => isEmail(value));

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    hasError: passwordHasError,
    handleReset: handlePasswordReset,
  } = useInput("", (value) => hasMinLength(value, 6));

  const {
    value: confirmPasswordValue,
    handleInputChange: handleConfirmPasswordChange,
    handleInputBlur: handleConfirmPasswordBlur,
    hasError: confirmPasswordHasError,
    handleReset: handleConfirmPasswordReset,
  } = useInput("",(value) => hasMinLength(value, 6) && isEqualsToOtherValue(value, passwordValue));

  const {
    value: termsAccepted,
    handleChange: handleTermsChange,
    hasError: termsHasError,
    reset: handleTermsReset,
  } = useCheckbox(false, (value) => value === true);

 // Validation states for enabling submit button
  const isUsernameValid = isNotEmpty(usernameValue);
  const isEmailValid = isEmail(emailValue);
  const isPasswordValid = hasMinLength(passwordValue, 6);
  const isConfirmPasswordValid = hasMinLength(confirmPasswordValue, 6) &&  isEqualsToOtherValue(confirmPasswordValue, passwordValue);
  const canSubmit = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && termsAccepted;
  
  // Validation state for enabling reset button
  const canReset = usernameValue.trim() !== "" || emailValue.trim() !== "" || passwordValue !== "" || confirmPasswordValue !== "" || termsAccepted;

  async function handleSubmit(e) {
    e.preventDefault();
    // Final validation check before submission
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    try {
      const userData = {
        email: emailValue,
        password: passwordValue,
        username: usernameValue,
      };

      await register(userData);
      toast.success("Registration successful ✅");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Registration failed ❌");
    }finally{
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
            className="rounded-xl px-4 py-2.5 text-center text-sm font-bold text-zinc-400 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-center text-sm font-bold text-zinc-950 shadow-md shadow-amber-500/20"
          >
            Register
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white font-serif">
            Join Savoria Club
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create an account to start placing orders and earning gourmet rewards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Username"
            type="text"
            value={usernameValue}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            placeholder="Choose a username"
            className={`w-full rounded-2xl border px-5 py-3 text-sm text-white bg-zinc-950 outline-none transition ${
              usernameHasError
                ? "border-rose-500 bg-rose-500/10"
                : "border-zinc-800 focus:border-amber-500/60"
            }`}
          />

          <Input
            label="Email Address"
            type="email"
            value={emailValue}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="name@example.com"
            className={`w-full rounded-2xl border px-5 py-3 text-sm text-white bg-zinc-950 outline-none transition ${
              emailHasError
                ? "border-rose-500 bg-rose-500/10"
                : "border-zinc-800 focus:border-amber-500/60"
            }`}
          />

          <Input
            label="Password"
            type="password"
            value={passwordValue}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            placeholder="At least 6 characters"
            className={`w-full rounded-2xl border px-5 py-3 text-sm text-white bg-zinc-950 outline-none transition ${
              passwordHasError
                ? "border-rose-500 bg-rose-500/10"
                : "border-zinc-800 focus:border-amber-500/60"
            }`}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPasswordValue}
            onChange={handleConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            placeholder="Retype your password"
            className={`w-full rounded-2xl border px-5 py-3 text-sm text-white bg-zinc-950 outline-none transition ${
              confirmPasswordHasError
                ? "border-rose-500 bg-rose-500/10"
                : "border-zinc-800 focus:border-amber-500/60"
            }`}
            error={confirmPasswordHasError ? "Passwords do not match." : null}
          />

          <div className="pt-2">
            <label className="flex items-center gap-3 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/50"
              />
              I agree to Savoria's terms of service & privacy policy.
            </label>
            {termsHasError && (
              <p className="mt-1 text-xs font-medium text-rose-500">You must accept the terms.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
            <Reset
              title="Reset Form"
              disabled={!canReset || loading}
              onReset={() => {
                handleUsernameReset();
                handleEmailReset();
                handlePasswordReset();
                handleConfirmPasswordReset();
                handleTermsReset();
              }}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:text-white"
            />

            <Submit
              title="Create Account"
              loading={loading}
              disabled={!canSubmit}
              loadingLabel="Creating account..."
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
            />
          </div>
        </form>
      </div>
    </div>
  );
}