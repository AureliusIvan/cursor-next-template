"use client";

import { ContactForm } from "@/components/crm/contact-form";
import { ContactList } from "@/components/crm/contact-list";
import Search from "@/components/search";
import { Contact } from "@prisma/client";

interface ContactsPageClientProps {
  initialContacts: Contact[];
  lastSyncedAt?: Date | null;
}

export function ContactsPageClient({ initialContacts, lastSyncedAt }: ContactsPageClientProps) {
  const applicationId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_CONTACTS_INDEX || "contacts";

  const hasAlgoliaConfig = applicationId && apiKey;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 p-8 shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ffffff]">
        <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-black dark:border-white">
          <h1 className="text-4xl font-black uppercase tracking-tight text-black dark:text-white">Contacts</h1>
          <ContactForm />
        </div>
        {hasAlgoliaConfig ? (
          <div className="mb-6">
            <Search
              applicationId={applicationId}
              apiKey={apiKey}
              indexName={indexName}
              placeholder="Search contacts..."
              attributes={{
                primaryText: "name",
                secondaryText: "email",
                tertiaryText: "company",
              }}
              urlGenerator={(hit) => {
                // Generate URL from contact ID in Algolia index
                // The index should have an 'id' field matching the contact ID
                const contactId = hit.id || hit.objectID;
                if (contactId) {
                  return `/dashboard/crm/contacts/${contactId}`;
                }
                return undefined;
              }}
              openResultsInNewTab={false}
            />
          </div>
        ) : (
          <div className="mb-6 border-3 border-black dark:border-white bg-white dark:bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
            <p className="text-sm font-medium text-black dark:text-white">
              Algolia search is not configured. Please set NEXT_PUBLIC_ALGOLIA_APPLICATION_ID and NEXT_PUBLIC_ALGOLIA_API_KEY environment variables.
            </p>
          </div>
        )}
        <ContactList
          initialContacts={initialContacts}
          lastSyncedAt={lastSyncedAt}
        />
      </div>
    </div>
  );
}
