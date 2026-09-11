import { FaFacebookF, FaInstagram, FaTwitter, FaUtensils } from "react-icons/fa";
import { FiArrowUpRight, FiClock, FiMapPin, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-amber-900/30 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Brand & Mission */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 shadow-md shadow-amber-500/20">
              <FaUtensils className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white font-serif flex items-center gap-1">
                SAVORIA <span className="text-amber-500 text-[10px] font-sans tracking-widest font-bold">• KITCHEN</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase text-amber-400/80 font-medium">
                Gourmet Dining & Delivery
              </span>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-zinc-400">
            Crafting memorable culinary experiences with fresh organic ingredients, master craftsmanship, and swift table-side or doorstep delivery.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Quick Navigation
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" className="inline-flex items-center gap-1.5 hover:text-amber-400 transition">
                <span>Home Page</span> <FiArrowUpRight className="text-xs text-amber-500" />
              </Link>
            </li>
            <li>
              <Link to="/menu" className="inline-flex items-center gap-1.5 hover:text-amber-400 transition">
                <span>Browse Menu</span> <FiArrowUpRight className="text-xs text-amber-500" />
              </Link>
            </li>
            <li>
              <Link to="/orders" className="inline-flex items-center gap-1.5 hover:text-amber-400 transition">
                <span>Your Orders & Cart</span> <FiArrowUpRight className="text-xs text-amber-500" />
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="inline-flex items-center gap-1.5 hover:text-amber-400 transition">
                <span>Guest Reviews</span> <FiArrowUpRight className="text-xs text-amber-500" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Contact & Location
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <FiMapPin className="text-amber-400 text-base shrink-0 mt-0.5" />
              <span>124 Gourmet Boulevard, Culinary District, CA 90210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <FiPhone className="text-amber-400 text-base shrink-0" />
              <span>+1 (800) 555-SAVOR</span>
            </li>
            <li className="flex items-center gap-2.5">
              <FiClock className="text-amber-400 text-base shrink-0" />
              <span>Daily: 11:00 AM - 11:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Newsletter / Reservation */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-amber-500 pl-2">
            Reserve & Special Offers
          </h3>
          <p className="text-sm text-zinc-400">
            Subscribe for chef updates, seasonal tasting menus, and secret discounts.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500/50"
            />
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-zinc-950 hover:brightness-110 shrink-0"
            >
              Join
            </button>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="border-t border-zinc-900 text-center text-xs py-5 text-zinc-500">
        © {new Date().getFullYear()} Savoria Kitchen & Dining. All rights reserved. Built with excellence.
      </div>
    </footer>
  );
}
