import React from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useExpertStore } from "../store/expertStore.js";

export default function ExpertListPage() {
  const experts = useExpertStore((state) => state.experts);
  const categories = useExpertStore((state) => state.categories);
  const meta = useExpertStore((state) => state.meta);
  const query = useExpertStore((state) => state.listQuery);
  const loading = useExpertStore((state) => state.listLoading);
  const error = useExpertStore((state) => state.listError);
  const fetchExperts = useExpertStore((state) => state.fetchExperts);
  const [draftSearch, setDraftSearch] = useState(query.search);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    fetchExperts({ search: draftSearch, page: 1 });
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
            value={draftSearch}
            onChange={(event) => {
              setDraftSearch(event.target.value);
            }}
            placeholder="Search experts"
          />
        </label>
        <label>
          <span>Category</span>
          <select
            value={query.category}
            onChange={(event) => {
              fetchExperts({ category: event.target.value, page: 1 });
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
      {error ? <ErrorState message={error} onRetry={() => fetchExperts()} /> : null}

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
              onClick={() => fetchExperts({ page: Math.max(query.page - 1, 1) })}
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
              onClick={() => fetchExperts({ page: Math.min(query.page + 1, meta.totalPages) })}
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
