import { useState, useEffect } from "react";
import { FiLogOut, FiMenu, FiX, FiShoppingCart, FiUser, FiGrid, FiStar } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { readCart, getCartTotals } from "../../utils/cart";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, isAdmin, isManager, user, logout } = useAuth();
  const location = useLocation();

  const userName = user?.username || "Guest";

  useEffect(() => {
    function updateCartCount() {
      const cart = readCart();
      const totals = getCartTotals(cart);
      setCartCount(totals.itemsCount);
    }

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const linkStyle = (path) =>
    `relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-all duration-200 rounded-xl ${
      isActive(path)
        ? "text-amber-400 bg-amber-500/10 shadow-sm"
        : "text-zinc-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/30 bg-zinc-950/90 backdrop-blur-md text-white shadow-xl shadow-black/20">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Restaurant Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <FaUtensils className="text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white font-serif flex items-center gap-1">
                SAVORIA <span className="text-amber-500 text-xs font-sans tracking-widest font-bold">• KITCHEN</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-amber-400/80 font-medium">
                Gourmet Dining & Delivery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            <li>
              <Link to="/" className={linkStyle("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className={linkStyle("/menu")}>
                <FaUtensils className="text-amber-400" />
                Menu
              </Link>
            </li>
            <li>
              <Link to="/reviews" className={linkStyle("/reviews")}>
                <FiStar className="text-amber-400" />
                Reviews
              </Link>
            </li>

            {isAuthenticated && (
              <li>
                <Link to="/orders" className={linkStyle("/orders")}>
                  <div className="relative flex items-center gap-1.5">
                    <FiShoppingCart className="text-amber-400" />
                    <span>Orders</span>
                    {cartCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-1 text-[11px] font-bold text-white shadow-md">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )}
          </ul>

          {/* User & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {(isAdmin || isManager) && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 transition"
                  >
                    <FiGrid />
                    Admin Hub
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 hover:border-amber-500/50 transition group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs">
                    <FiUser />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition">
                      {userName}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                      {isAdmin ? "Admin" : isManager ? "Manager" : "Customer"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && cartCount > 0 && (
              <Link
                to="/orders"
                className="relative p-2 text-amber-400 bg-amber-500/10 rounded-xl"
              >
                <FiShoppingCart className="text-xl" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">
                  {cartCount}
                </span>
              </Link>
            )}
            <button
              type="button"
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/80 py-4 space-y-2 animate-fadeIn">
            <Link
              to="/"
              className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                isActive("/") ? "bg-amber-500/10 text-amber-400" : "text-zinc-300"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                isActive("/menu") ? "bg-amber-500/10 text-amber-400" : "text-zinc-300"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/reviews"
              className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                isActive("/reviews") ? "bg-amber-500/10 text-amber-400" : "text-zinc-300"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reviews
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isActive("/orders") ? "bg-amber-500/10 text-amber-400" : "text-zinc-300"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders & Cart ({cartCount})
              </Link>
            )}

            {!isAuthenticated ? (
              <div className="pt-2 space-y-2 border-t border-zinc-800">
                <Link
                  to="/login"
                  className="block w-full text-center rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-zinc-950"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="pt-2 space-y-2 border-t border-zinc-800">
                <Link
                  to="/profile"
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile ({userName})
                </Link>
                {(isAdmin || isManager) && (
                  <Link
                    to="/admin/dashboard"
                    className="block rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Hub
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
