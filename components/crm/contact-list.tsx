"use client";

import { Contact } from "@prisma/client";
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
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
        <div className="text-sm font-bold uppercase text-black dark:text-white">
          Last Synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
        </div>
        <SyncButton />
      </div>

      {isSearching ? (
        <div className="border-3 border-black dark:border-white bg-white dark:bg-zinc-900 p-12 text-center shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
          <p className="text-lg font-bold uppercase text-black dark:text-white">Searching...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="border-3 border-black dark:border-white bg-white dark:bg-zinc-900 p-12 text-center shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
          <p className="text-lg font-bold uppercase text-black dark:text-white">No contacts found.</p>
          <p className="text-sm font-medium mt-2 text-black dark:text-white">
            {searchQuery && searchQuery.trim() !== "" ? "Try a different search term." : "Sync with Notion to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="border-3 border-black dark:border-white bg-white dark:bg-zinc-900 p-5 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#000000] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <div className="border-b-3 border-black dark:border-white pb-3 mb-3">
                <h3 className="text-lg font-black uppercase truncate text-black dark:text-white">{contact.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-xs mb-1 text-black dark:text-white">Email</span>
                  <span className="font-medium truncate text-black dark:text-zinc-300">{contact.email || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-xs mb-1 text-black dark:text-white">Phone</span>
                  <span className="font-medium text-black dark:text-zinc-300">{contact.phone || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-xs mb-1 text-black dark:text-white">Company</span>
                  <span className="font-medium truncate text-black dark:text-zinc-300">{contact.company || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-xs mb-1 text-black dark:text-white">Role</span>
                  <span className="font-medium truncate text-black dark:text-zinc-300">{contact.role || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
