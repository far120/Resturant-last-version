import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile } from "../services/userApi.js";
import Spinner from "../../../components/ui/Spinner.jsx";
import Error from "../../../components/ui/Erorr.jsx";
import { useInput } from "../../../hooks/useInput.js";
import { useToast } from "../../../context/ToastContext";
import { isEmail,isNotEmpty } from "../../../utils/validation";
import Input from "../../../components/ui/Input.jsx";
import Reset from "../../../components/ui/Reset.jsx";
import Submit from "../../../components/ui/Submit.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({ username: "", email: "" });

  const toast = useToast();

  // inputs
  const {
    value: usernameValue,
    handleInputChange: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
    hasError: usernameHasError,
  } = useInput("", (value) => isNotEmpty(value));

  const {
    value: emailValue,
    handleInputChange: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    hasError: emailHasError,
  } = useInput("", (value) => isEmail(value));


// Validation states for enabling submit button
  const isUsernameValid = isNotEmpty(usernameValue);
  const isEmailValid = isEmail(emailValue);
  const hasChanges =
    usernameValue.trim() !== initialValues.username ||
    emailValue.trim() !== initialValues.email;
  const canSubmit = isUsernameValid && isEmailValid && hasChanges;
  
  // Validation state for enabling reset button
  const canReset = hasChanges;

  function syncFormValues(profileData) {
    const username = profileData?.username || "";
    const email = profileData?.email || "";
    handleUsernameChange({ target: { value: username } });
    handleEmailChange({ target: { value: email } });
    setInitialValues({ username, email });
  }


  // fetch profile
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = user || (await getProfile());
        syncFormValues(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (usernameHasError || emailHasError) return;
    setSaving(true);
    try {
      const profileData = {
        username: usernameValue.trim(),
        email: emailValue.trim(),
      };
      const updatedData = await updateProfile(profileData);
      setUser(updatedData);
      syncFormValues(updatedData);
      toast.success("Profile updated successfully ✅");
    } catch (error) {
      toast.error(error.message || "Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16 text-zinc-100">
        <div className="mx-auto flex flex-col items-center rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl">
          <Spinner size="lg" />
          <p className="mt-4 text-sm font-bold text-amber-400">
            Fetching account profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) return <Error message={error.message} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center px-4 py-12 selection:bg-amber-500 selection:text-zinc-950">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-10">
        
        {/* Profile Card Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-zinc-950 text-2xl font-black shadow-lg shadow-amber-500/20">
            {initialValues.username ? initialValues.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-white font-serif">{initialValues.username || "Member Profile"}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{initialValues.email}</p>
            <span className="mt-2 inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
              {user?.role ? user.role.toUpperCase() : "GUEST MEMBER"}
            </span>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-extrabold text-white font-serif text-center sm:text-left">
          Account Settings
        </h2>
        <p className="mb-6 text-xs text-zinc-400 text-center sm:text-left">
          Update your public display name or email address associated with your Savoria account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Display Username"
            type="text"
            value={usernameValue}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            error={usernameHasError && "Invalid username"}
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
            error={emailHasError && "Invalid email address"}
            className={`w-full rounded-2xl border px-5 py-3 text-sm text-white bg-zinc-950 outline-none transition ${
              emailHasError
                ? "border-rose-500 bg-rose-500/10"
                : "border-zinc-800 focus:border-amber-500/60"
            }`}
          />

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <Reset
              title="Discard Changes"
              disabled={!canReset || loading || saving}
              onReset={() => {
                handleUsernameChange({ target: { value: initialValues.username } });
                handleEmailChange({ target: { value: initialValues.email } });
              }}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:text-white"
            />

            <Submit
              title="Save Profile"
              loading={saving}
              disabled={!canSubmit || loading}
              loadingLabel="Updating profile..."
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
            />
          </div>
        </form>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Security</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Keep your account safe by updating your password periodically.
          </p>

          <Link
            to="/reset-password"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-zinc-800 transition"
          >
            Change Password
          </Link>
        </section>
      </div>
    </div>
  );
}