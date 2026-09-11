import { useEffect, useMemo, useState } from "react";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { FiEdit2, FiMessageSquare, FiStar, FiTrash2, FiUserCheck } from "react-icons/fi";
import {
  createReview,
  deleteReview,
  getProducts,
  getReviews,
  updateReview,
} from "../features/restaurant/services/restaurantApi";

export default function ReviewsPage() {
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadProducts() {
    const data = await getProducts({ page: 1, limit: 100, order: "desc" });
    const list = data.result || [];
    setProducts(list);

    if (list.length > 0 && !selectedProduct) {
      setSelectedProduct(list[0]._id);
    }
  }

  async function loadReviews(productId) {
    const data = await getReviews(productId ? { productId } : {});
    setReviews(data.reviews || []);
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        await loadProducts();
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    let mounted = true;

    async function syncReviews() {
      try {
        await loadReviews(selectedProduct);
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      }
    }

    syncReviews();

    return () => {
      mounted = false;
    };
  }, [selectedProduct]);

  const myUserId = user?._id || user?.id;

  const selectedProductName = useMemo(() => {
    return products.find((item) => item._id === selectedProduct)?.name || "Selected Dish";
  }, [products, selectedProduct]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      toast?.warning("Please log in to submit a review");
      return;
    }

    if (!selectedProduct) {
      toast?.warning("Please choose a dish first");
      return;
    }

    try {
      if (editingId) {
        await updateReview(editingId, { rating, comment });
        toast?.success("Review updated successfully ⭐");
      } else {
        await createReview({
          productId: selectedProduct,
          rating,
          comment,
        });
        toast?.success("Thank you! Review published ⭐");
      }

      setEditingId(null);
      setRating(5);
      setComment("");
      await loadReviews(selectedProduct);
    } catch (err) {
      toast?.error(err.message);
    }
  }

  function handleEdit(review) {
    setEditingId(review._id);
    setRating(review.rating || 5);
    setComment(review.comment || "");
  }

  async function handleDelete(reviewId) {
    try {
      await deleteReview(reviewId);
      toast?.success("Review removed");
      await loadReviews(selectedProduct);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans px-4 py-10 sm:py-16 selection:bg-amber-500 selection:text-zinc-950">
      <section className="mx-auto max-w-7xl">
        
        {/* Page Title */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
            <span>Guest Feedback & Reviews</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white font-serif sm:text-5xl">
            Culinary Ratings & Reviews
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl mx-auto">
            Read verified guest reviews or leave your rating for dishes on our menu.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Form: Select Dish & Write Review */}
          <article className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
            <h2 className="text-xl font-bold text-white font-serif mb-2">
              {editingId ? "Edit Your Review" : "Write a Dish Review"}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Share your dining feedback to help our chefs continuously elevate taste.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-500">
                  Select Dish
                </label>
                <select
                  value={selectedProduct}
                  onChange={(event) => {
                    setSelectedProduct(event.target.value);
                    setEditingId(null);
                  }}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-500/50"
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id} className="bg-zinc-900">
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-500">
                  Star Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition hover:scale-125 ${
                        star <= rating ? "text-amber-400" : "text-zinc-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-bold text-amber-400">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-500">
                  Your Review & Taste Notes
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Tell us about flavor, texture, presentation, or delivery speed..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/20 hover:brightness-110 transition"
              >
                {editingId ? "Update Review" : "Publish Review"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setRating(5);
                    setComment("");
                  }}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-2.5 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </article>

          {/* Right Feed: Reviews list */}
          <article className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Dish Reviews</span>
                <h2 className="text-xl font-bold text-white font-serif">{selectedProductName}</h2>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                {reviews.length} Review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {reviews.map((review) => {
                const reviewUserId = review?.user?._id || review?.user?.id;
                const canManage = myUserId && reviewUserId === myUserId;

                return (
                  <div key={review._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm">
                          <FiUserCheck />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">
                            {review?.user?.username || review?.user?.email || "Verified Guest"}
                          </p>
                          <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < (review.rating || 5) ? "text-amber-400" : "text-zinc-700"}>
                                ★
                              </span>
                            ))}
                            <span className="ml-1 text-zinc-400 font-medium">({review.rating}/5)</span>
                          </div>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(review)}
                            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition"
                            title="Edit Review"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review._id)}
                            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                            title="Delete Review"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-4 text-xs text-zinc-300 leading-relaxed pl-1">
                      "{review.comment || "No written comment provided."}"
                    </p>
                  </div>
                );
              })}

              {reviews.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                  <FiMessageSquare className="mx-auto text-3xl mb-2 text-zinc-700" />
                  <p className="text-sm font-medium">No reviews published yet for this dish.</p>
                  <p className="text-xs text-zinc-600 mt-1">Be the first guest to share your rating!</p>
                </div>
              )}
            </div>
          </article>

        </div>
      </section>
    </div>
  );
}

