"use client";

import { Contact } from "@prisma/client";
import { SyncButton } from "./sync-button";
import { useContactStream } from "@/app/hooks/use-contact-stream";

interface ContactListProps {
  initialContacts: Contact[];
  lastSyncedAt?: Date | null;
}

export function ContactList({ initialContacts, lastSyncedAt }: ContactListProps) {
  const contacts = useContactStream({ initialContacts });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
        <div className="text-sm text-gray-500">
          Last Synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
        </div>
        <SyncButton />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-700">Name</th>
              <th className="px-6 py-3 font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 font-medium text-gray-700">Phone</th>
              <th className="px-6 py-3 font-medium text-gray-700">Company</th>
              <th className="px-6 py-3 font-medium text-gray-700">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No contacts found. Sync with Notion to get started.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{contact.name}</td>
                  <td className="px-6 py-4 text-gray-500">{contact.email || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">{contact.phone || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">{contact.company || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">{contact.role || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
