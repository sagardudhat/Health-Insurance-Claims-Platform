import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewerQueueFilterBarProps {
  searchParam: string;
  searchFieldParam: string;
  updateQueryParams: (params: Record<string, string | number | undefined>) => void;
}

export const ReviewerQueueFilterBar: React.FC<ReviewerQueueFilterBarProps> = ({
  searchParam,
  searchFieldParam,
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
    updateQueryParams({ search: searchInput.trim(), searchField: selectedSearchField, page: 1 });
  };

  return (
    <div className="p-4 border-b border-[var(--border)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Pending Review Queue</h2>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
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

        <div className="relative min-w-[200px]">
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
              updateQueryParams({ search: undefined, searchField: undefined, page: 1 });
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
