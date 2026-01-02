"use client";

import type { Contact } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useContactStream } from "@/app/hooks/use-contact-stream";
import { SyncButton } from "./sync-button";

interface ContactListProps {
  initialContacts: Contact[];
  lastSyncedAt?: Date | null;
  searchQuery?: string;
}

export function ContactList({ initialContacts, lastSyncedAt, searchQuery }: ContactListProps) {
  const streamContacts = useContactStream({ initialContacts });
  const [searchContacts, setSearchContacts] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchContacts([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`/api/crm/contacts?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (response.ok) {
          setSearchContacts(data.contacts || []);
        } else {
          setSearchContacts([]);
        }
      } catch (error) {
        setSearchContacts([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // Use search results when searching, otherwise use stream contacts
  const contacts = searchQuery && searchQuery.trim() !== "" ? searchContacts : streamContacts;

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
      ) : contacts.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed">
          <p className="text-muted-foreground">No contacts found.</p>
          <p className="text-muted-foreground text-sm">
            {searchQuery && searchQuery.trim() !== ""
              ? "Try a different search term."
              : "Sync with Notion to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Link
              className="cursor-pointer rounded-2xl border bg-card p-5 transition-colors hover:bg-accent"
              href={`/dashboard/crm/contacts/${contact.id}`}
              key={contact.id}
            >
              <div className="mb-3 border-b pb-3">
                <h3 className="truncate font-semibold text-lg">{contact.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Email</span>
                  <span className="truncate">{contact.email || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Phone</span>
                  <span>{contact.phone || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Company</span>
                  <span className="truncate">{contact.company || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">Role</span>
                  <span className="truncate">{contact.role || "-"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
