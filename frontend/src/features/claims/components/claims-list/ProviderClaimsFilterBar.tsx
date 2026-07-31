import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLAIM_STATUSES } from '@/config/constants';

interface ProviderClaimsFilterBarProps {
  searchParam: string;
  searchFieldParam: string;
  statusParam: string;
  updateQueryParams: (params: Record<string, string | number | undefined>) => void;
}

export const ProviderClaimsFilterBar: React.FC<ProviderClaimsFilterBarProps> = ({
  searchParam,
  searchFieldParam,
  statusParam,
  updateQueryParams,
}) => {
  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedSearchField, setSelectedSearchField] = useState(searchFieldParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);

  useEffect(() => {
    setSearchInput(searchParam);
    setSelectedSearchField(searchFieldParam);
    setSelectedStatus(statusParam);
  }, [searchParam, searchFieldParam, statusParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({
      search: searchInput.trim(),
      searchField: selectedSearchField,
      status: selectedStatus,
      page: 1,
    });
  };

  return (
    <div className="p-4 border-b border-[var(--border)] shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)] shrink-0">
        Submitted Claims List
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            updateQueryParams({ status: e.target.value, page: 1 });
          }}
          className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
        >
          <option value="ALL">All Statuses</option>
          <option value={CLAIM_STATUSES.SUBMITTED}>Submitted</option>
          <option value={CLAIM_STATUSES.UNDER_REVIEW}>Under Review</option>
          <option value={CLAIM_STATUSES.NEEDS_REVISION}>Needs Revision</option>
          <option value={CLAIM_STATUSES.APPROVED}>Approved</option>
          <option value={CLAIM_STATUSES.PARTIALLY_APPROVED}>Partially Approved</option>
          <option value={CLAIM_STATUSES.PAID}>Paid</option>
          <option value={CLAIM_STATUSES.REJECTED}>Rejected</option>
        </select>

        <select
          value={selectedSearchField}
          onChange={(e) => setSelectedSearchField(e.target.value)}
          className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
        >
          <option value="all">All Fields</option>
          <option value="patientName">Patient Name</option>
          <option value="policyNumber">Policy Number</option>
          <option value="procedureName">Procedure Name</option>
          <option value="procedureCode">Procedure / CPT Code</option>
        </select>

        <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="text-xs">
          Search
        </Button>
        {searchParam && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              setSelectedSearchField('all');
              setSelectedStatus('ALL');
              updateQueryParams({
                search: undefined,
                searchField: undefined,
                status: undefined,
                page: 1,
              });
            }}
            className="text-xs text-gray-500"
          >
            Clear
          </Button>
        )}
      </form>
    </div>
  );
};
