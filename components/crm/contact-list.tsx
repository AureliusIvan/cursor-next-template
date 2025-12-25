"use client";

import { Contact } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SyncButton } from "./sync-button";
import { useContactStream } from "@/app/hooks/use-contact-stream";

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
      <div className="flex justify-between items-center rounded-3xl border border-dashed bg-muted/50 p-4">
        <div className="text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">
            {searchQuery && searchQuery.trim() !== "" ? "Try a different search term." : "Sync with Notion to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/dashboard/crm/contacts/${contact.id}`}
              className="rounded-2xl border bg-card p-5 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="border-b pb-3 mb-3">
                <h3 className="text-lg font-semibold truncate">{contact.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Email</span>
                  <span className="truncate">{contact.email || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Phone</span>
                  <span>{contact.phone || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Company</span>
                  <span className="truncate">{contact.company || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Role</span>
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
