import React from 'react';
import Filters from './Filters';
import './Sidebar.css';

export default function Sidebar({ filters, setFilters, availableTypes = [], totalCount = 0, filteredCount = 0, loading = false }) {
  return (
    <div className="sidebar-root">
      <div className="sidebar-header">
        <h3>Events</h3>
        <div className="sidebar-counter">{loading ? 'Loading...' : `${filteredCount} / ${totalCount}`}</div>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        availableTypes={availableTypes}
      />

      <div className="sidebar-footer">
        <button className="btn-reset" onClick={() => setFilters({ event_type: [], is_free: null, dateFrom: '', dateTo: '', sortBy: 'soonest' })}>Reset filters</button>
      </div>
    </div>
  );
}