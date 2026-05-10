import React from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";

const pageSize = 6;

export default function ExpertListPage() {
  const [experts, setExperts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExperts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/experts", {
        params: {
          page,
          limit: pageSize,
          search: search || undefined,
          category: category || undefined
        }
      });
      setExperts(response.data.data);
      setMeta(response.data.meta);
      setCategories(response.data.categories || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    loadExperts();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Live expert booking</p>
          <h1>Find the right expert session</h1>
        </div>
      </div>

      <form className="toolbar" onSubmit={handleSearchSubmit}>
        <label>
          <span>Search by name</span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search experts"
          />
        </label>
        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Search
        </button>
      </form>

      {loading ? <LoadingState label="Loading experts" /> : null}
      {error ? <ErrorState message={error} onRetry={loadExperts} /> : null}

      {!loading && !error && experts.length === 0 ? (
        <EmptyState title="No experts found" message="Try a different search or category." />
      ) : null}

      {!loading && !error && experts.length > 0 ? (
        <>
          <div className="expert-grid">
            {experts.map((expert) => (
              <article className="expert-card" key={expert._id}>
                <div>
                  <p className="category">{expert.category}</p>
                  <h2>{expert.name}</h2>
                  <p>{expert.bio}</p>
                </div>
                <div className="expert-meta">
                  <span>
                    <BriefcaseBusiness size={16} />
                    {expert.experience} years
                  </span>
                  <span>
                    <Star size={16} />
                    {expert.rating.toFixed(1)}
                  </span>
                </div>
                <Link className="button button-secondary" to={`/experts/${expert._id}`}>
                  View slots
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination" aria-label="Pagination">
            <button
              className="icon-button"
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              aria-label="Previous page"
              title="Previous page"
            >
              <ArrowLeft size={18} />
            </button>
            <span>
              Page {meta.page} of {meta.totalPages} · {meta.total} experts
            </span>
            <button
              className="icon-button"
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setPage((current) => Math.min(current + 1, meta.totalPages))
              }
              aria-label="Next page"
              title="Next page"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
