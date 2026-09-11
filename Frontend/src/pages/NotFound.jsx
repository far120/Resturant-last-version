import { FiAlertTriangle, FiHome, FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur sm:p-12">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-rose-400">
          <FiAlertTriangle className="text-sm" />
          Page Not Found
        </span>
        <h1 className="mb-2 text-7xl font-black text-amber-500 font-serif tracking-tight sm:text-8xl">404</h1>
        <h2 className="mb-3 text-2xl font-bold text-white font-serif sm:text-3xl">Lost In The Kitchen?</h2>
        <p className="mb-8 max-w-md text-sm text-zinc-400 leading-relaxed">
          The dish or page you are looking for has been moved, removed, or is currently off the chef's menu.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
          >
            <FiHome />
            Return To Home
          </Link>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-8 py-3.5 text-sm font-bold text-zinc-300 transition hover:border-amber-500/50 hover:text-white"
          >
            <FiLogIn />
            Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}