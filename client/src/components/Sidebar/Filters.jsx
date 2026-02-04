import React from 'react';

export default function Filters({ filters, setFilters, availableTypes = [] }) {
  function toggleType(type) {
    const next = new Set(filters.event_type || []);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setFilters({ ...filters, event_type: Array.from(next) });
  }

  return (
    <div className="filters-root">
      <section className="filter-block">
        <h4>Type</h4>
        <div className="filter-list">
          {availableTypes.length === 0 && <div className="muted">No types</div>}
          {availableTypes.map((t) => (
            <label key={t} className="filter-item">
              <input type="checkbox" checked={(filters.event_type || []).includes(t)} onChange={() => toggleType(t)} />
              <span className="label">{t}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="filter-block">
        <h4>Date</h4>
        <div className="filter-date-row">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            aria-label="start date"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            aria-label="end date"
          />
        </div>
      </section>

      <section className="filter-block">
        <h4>Price</h4>
        <label className="filter-item">
          <input
            type="radio"
            name="is_free"
            checked={filters.is_free === null}
            onChange={() => setFilters({ ...filters, is_free: null })}
          />
          <span className="label">All</span>
        </label>
        <label className="filter-item">
          <input
            type="radio"
            name="is_free"
            checked={filters.is_free === true}
            onChange={() => setFilters({ ...filters, is_free: true })}
          />
          <span className="label">Free only</span>
        </label>
        <label className="filter-item">
          <input
            type="radio"
            name="is_free"
            checked={filters.is_free === false}
            onChange={() => setFilters({ ...filters, is_free: false })}
          />
          <span className="label">Paid only</span>
        </label>
      </section>

      <section className="filter-block">
        <h4>Sort</h4>
        <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
          <option value="soonest">Soonest</option>
          <option value="popular">Most popular</option>
          <option value="newest">Newest</option>
        </select>
      </section>

      <style jsx>{`
        .filters-root { display: flex; flex-direction: column; gap: 12px; }
        .filter-block h4 { margin: 0 0 8px 0; font-size: 0.95rem; }
        .filter-list { display: flex; flex-direction: column; gap: 6px; }
        .filter-item { display:flex; gap:8px; align-items:center; }
        .filter-date-row { display:flex; gap:8px; }
        input[type="date"] { padding:6px; }
      `}</style>
    </div>
  );
}
