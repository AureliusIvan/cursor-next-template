"use client";

import type { Company } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompanyStream } from "@/app/hooks/use-company-stream";
import { SyncButton } from "./sync-button";

interface CompanyListProps {
  initialCompanies: Company[];
  lastSyncedAt?: Date | null;
  searchQuery?: string;
}

export function CompanyList({ initialCompanies, lastSyncedAt, searchQuery }: CompanyListProps) {
  const streamCompanies = useCompanyStream({ initialCompanies });
  const [searchCompanies, setSearchCompanies] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchCompanies([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(
          `/api/crm/companies?search=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        if (response.ok) {
          setSearchCompanies(data.companies || []);
        } else {
          setSearchCompanies([]);
        }
      } catch (error) {
        setSearchCompanies([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // Use search results when searching, otherwise use stream companies
  const companies = searchQuery && searchQuery.trim() !== "" ? searchCompanies : streamCompanies;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-dashed bg-muted/50 p-4">
        <div className="text-muted-foreground text-sm">
          Last Synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
        </div>
        <SyncButton />
      </div>

      {isSearching ? (
        <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed">
          <p className="text-muted-foreground">No companies found.</p>
          <p className="text-muted-foreground text-sm">
            {searchQuery && searchQuery.trim() !== ""
              ? "Try a different search term."
              : "Add a company to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              className="cursor-pointer rounded-2xl border bg-card p-5 transition-colors hover:bg-accent"
              href={`/dashboard/crm/contacts/companies/${company.id}`}
              key={company.id}
            >
              <div className="mb-3 border-b pb-3">
                <h3 className="truncate font-semibold text-lg">{company.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Industry</span>
                  <span className="truncate">{company.industry || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Website</span>
                  <span className="truncate">{company.website || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Phone</span>
                  <span>{company.phone || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Size</span>
                  <span className="truncate">{company.size || "-"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
