import React, { useState, useEffect } from 'react';
import { Filter, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLAIM_STATUSES } from '@/config/constants';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: CLAIM_STATUSES.SUBMITTED, label: 'Submitted' },
  { id: CLAIM_STATUSES.UNDER_REVIEW, label: 'Under Review' },
  { id: CLAIM_STATUSES.APPROVED, label: 'Approved' },
  { id: CLAIM_STATUSES.PARTIALLY_APPROVED, label: 'Partially Approved' },
  { id: CLAIM_STATUSES.REJECTED, label: 'Rejected' },
  { id: CLAIM_STATUSES.NEEDS_REVISION, label: 'Needs Revision' },
  { id: CLAIM_STATUSES.PAID, label: 'Paid' },
];

const CLAIM_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'patientName', label: 'Patient Name' },
  { id: 'policyNumber', label: 'Policy Number' },
  { id: 'procedureName', label: 'Procedure Name' },
  { id: 'procedureCode', label: 'Procedure / CPT Code' },
];

interface AdminClaimsFilterBarProps {
  statusParam: string;
  searchParam: string;
  searchFieldParam: string;
  flaggedOnlyParam: boolean;
  updateQueryParams: (params: Record<string, string | number | boolean | undefined>) => void;
}

export const AdminClaimsFilterBar: React.FC<AdminClaimsFilterBarProps> = ({
  statusParam,
  searchParam,
  searchFieldParam,
  flaggedOnlyParam,
  updateQueryParams,
}) => {
  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedSearchField, setSelectedSearchField] = useState(searchFieldParam);

  useEffect(() => {
    setSearchInput(searchParam);
    setSelectedSearchField(searchFieldParam);
  }, [searchParam, searchFieldParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({
      search: searchInput.trim(),
      searchField: selectedSearchField,
      page: 1,
    });
  };

  return (
    <div className="shrink-0 bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Status Dropdown Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          <Filter className="w-4 h-4 text-[var(--brand-500)]" />
          <span>Filter Status:</span>
        </div>

        <select
          value={statusParam}
          onChange={(e) => updateQueryParams({ status: e.target.value, page: 1 })}
          className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search & Flagged Filter Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
        {/* Search Field Dropdown Selector */}
        <select
          value={selectedSearchField}
          onChange={(e) => setSelectedSearchField(e.target.value)}
          className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
        >
          {CLAIM_SEARCH_FIELDS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Unified Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter search term..."
            className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white w-56"
          />
        </div>

        <Button type="submit" size="sm" variant="outline" className="text-xs">
          Search
        </Button>

        {(searchParam || statusParam !== 'ALL') && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              setSelectedSearchField('all');
              updateQueryParams({
                search: undefined,
                searchField: undefined,
                status: 'ALL',
                page: 1,
              });
            }}
            className="text-xs text-gray-500"
          >
            Clear
          </Button>
        )}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Flagged Toggle */}
        <button
          type="button"
          onClick={() => updateQueryParams({ flaggedOnly: !flaggedOnlyParam, page: 1 })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            flaggedOnlyParam
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${flaggedOnlyParam ? 'text-red-600' : ''}`} />
          Flagged Only
        </button>
      </form>
    </div>
  );
};
