import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { FiArrowRight, FiCheckCircle, FiClock, FiHeart, FiShield, FiStar, FiTruck } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";

const CHEF_SPECIALS = [
  {
    id: 1,
    name: "Truffle Ribeye Steak",
    category: "Steaks",
    price: "$34.99",
    rating: 4.9,
    time: "20-25 min",
    tag: "Chef's Signature",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    desc: "Prime 28-day aged ribeye infused with black truffle butter & rosemary glaze.",
  },
  {
    id: 2,
    name: "Artisanal Artisan Pizza",
    category: "Pizza",
    price: "$22.50",
    rating: 4.8,
    time: "15-20 min",
    tag: "Popular",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    desc: "Wood-fired crust topped with San Marzano tomatoes, fresh mozzarella & basil.",
  },
  {
    id: 3,
    name: "Golden Salmon Bowl",
    category: "Seafood",
    price: "$26.00",
    rating: 4.9,
    time: "15-20 min",
    tag: "Healthy Choice",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    desc: "Pan-seared Atlantic salmon over quinoa, avocado & citrus ponzu dressing.",
  },
];

const CATEGORIES = [
  { name: "Steaks & Grills", icon: "🥩", count: "12 Dishes" },
  { name: "Wood-Fired Pizza", icon: "🍕", count: "8 Varieties" },
  { name: "Gourmet Burgers", icon: "🍔", count: "10 Options" },
  { name: "Artisan Pasta", icon: "🍝", count: "9 Recipes" },
  { name: "Sweet Desserts", icon: "🍰", count: "7 Delights" },
  { name: "Craft Beverages", icon: "🍹", count: "15 Drinks" },
];

export default function Home() {
  const { isAuthenticated, isAdmin, isManager } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-900/20 py-16 lg:py-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <FaUtensils className="text-amber-400" />
                <span>Award-Winning Fine Dining Experience</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white font-serif sm:text-6xl lg:text-5xl xl:text-6xl leading-[1.1]">
                Exquisite Gourmet Dishes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">Delivered Fresh</span> To Your Door.
              </h1>

              <p className="max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed mx-auto lg:mx-0">
                Experience masterfully crafted culinary creations prepared by Michelin-trained chefs using locally sourced, organic ingredients.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-zinc-950 shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span>Explore Menu</span>
                  <FiArrowRight className="text-lg" />
                </Link>

                {!isAuthenticated ? (
                  <Link
                    to="/register"
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-7 py-4 text-base font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                  >
                    Join Savoria Club
                  </Link>
                ) : (
                  <Link
                    to="/orders"
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-7 py-4 text-base font-semibold text-amber-400 hover:bg-zinc-800 transition"
                  >
                    View Live Orders
                  </Link>
                )}

                {(isAdmin || isManager) && (
                  <Link
                    to="/admin/dashboard"
                    className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-base font-bold text-amber-400 hover:bg-amber-500/20 transition"
                  >
                    Admin Control Center
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-white font-serif">4.9 ★</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">12,000+ Ratings</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-400 font-serif">25 Min</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Avg. Express Delivery</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white font-serif">100%</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Fresh Ingredients</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-2xl shadow-black">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80"
                  alt="Savoria Signature Dishes"
                  className="h-[380px] w-full rounded-2xl object-cover"
                />
                
                {/* Floating Badge overlay */}
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 backdrop-blur-md shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-bold">
                      🔥
                    </div>
                    <div>
                      <p className="text-xs text-amber-400 uppercase font-bold tracking-wider">Chef's Choice</p>
                      <p className="text-sm font-bold text-white">Truffle Ribeye Steak</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-400">$34.99</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Pills Showcase */}
      <section className="py-16 border-b border-zinc-900 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Explore Culinary Categories</h2>
            <p className="text-3xl font-extrabold text-white font-serif">Curated Menus For Every Palate</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to="/menu"
                className="group flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-center transition hover:-translate-y-1 hover:border-amber-500/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <span className="text-4xl mb-3 transition group-hover:scale-110">{cat.icon}</span>
                <h3 className="text-sm font-bold text-zinc-200 group-hover:text-amber-400 transition">{cat.name}</h3>
                <span className="text-[11px] text-zinc-500 mt-1 font-medium">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Chef Specials Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Handcrafted Excellence</span>
              <h2 className="text-3xl font-extrabold text-white font-serif sm:text-4xl mt-1">Today's Chef Specials</h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>View Full Menu</span>
              <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CHEF_SPECIALS.map((dish) => (
              <article
                key={dish.id}
                className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-xl transition hover:border-amber-500/40 hover:-translate-y-1"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-zinc-950/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                    {dish.tag}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-amber-500/90">{dish.category}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <FiStar className="fill-amber-400 text-amber-400" /> {dish.rating}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">{dish.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">{dish.desc}</p>

                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
                    <span className="text-2xl font-black text-amber-400">{dish.price}</span>
                    <Link
                      to="/menu"
                      className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 border-t border-zinc-900 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <FaUtensils className="text-2xl text-amber-400" />, title: "Master Chefs", desc: "Crafted by top culinary experts with deep passion." },
              { icon: <FiCheckCircle className="text-2xl text-amber-400" />, title: "Organic & Fresh", desc: "Strictly farm-to-table organic quality standard." },
              { icon: <FiTruck className="text-2xl text-amber-400" />, title: "Hot Express Delivery", desc: "Insulated delivery guarantees piping hot meals." },
              { icon: <FiShield className="text-2xl text-amber-400" />, title: "Hygiene Guaranteed", desc: "Sanitized preparation and contact-free options." },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}