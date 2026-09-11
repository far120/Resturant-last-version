import { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { createCategory, getCategories , deleteCategory } from "../../features/restaurant/services/restaurantApi";


export default function AdminCategoriesPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");



  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      toast?.warning("Category name is required");
      return;
    }
    try {
      await createCategory({ name: name.trim() });
      setName("");
      toast?.success("Category created");
      await refreshData();
    } catch (err) {
      toast?.error(err.message);
    }
  }



  async function refreshData() {
    try {
      setLoading(true);
      const data = await getCategories({ page: 1, limit: 100, order: "desc" });
      setCategories(data.result || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );


 async function handleDelete(categoryId) {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) {
      return;
    }
    try{
      await deleteCategory(categoryId);
      setCategories((prevCategories) => prevCategories.filter((c) => c._id !== categoryId));
      toast?.success("Category deleted");
    } catch (err) {
      toast?.error(err.message);
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-5xl px-4 bg-zinc-950">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
        
        {/* Left Form: Add Category */}
        <article className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Taxonomy</span>
            <h1 className="text-2xl font-bold text-white font-serif">Create Category</h1>
            <p className="mt-1 text-xs text-zinc-400">Organize food dishes into menu sections.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-500">Category Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Wood-Fired Pizza"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 hover:brightness-110 transition"
            >
              Add Category
            </button>
          </form>
        </article>

        {/* Right List: Current Categories */}
        <article className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Categories</span>
              <h2 className="text-xl font-bold text-white font-serif">Active Categories ({filteredCategories.length})</h2>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search categories..."
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="mt-6 space-y-3">
            {filteredCategories.map((category) => (
              <div key={category._id} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="font-bold text-white text-sm">{category.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(category._id)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                >
                  Delete
                </button>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                No categories match the filter.
              </div>
            )}
          </div>
        </article>

      </section>
    </div>
  );
}

