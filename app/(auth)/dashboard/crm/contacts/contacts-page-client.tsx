"use client";

import type { Contact } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { useState } from "react";
import { ContactForm } from "@/components/crm/contact-form";
import { ContactList } from "@/components/crm/contact-list";
import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactsPageClientProps {
  initialContacts: Contact[];
  lastSyncedAt?: Date | null;
}

export function ContactsPageClient({
  initialContacts,
  lastSyncedAt,
}: ContactsPageClientProps) {
  const [activeTab, setActiveTab] = useState("contacts");
  const applicationId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
  const indexName =
    process.env.NEXT_PUBLIC_ALGOLIA_CONTACTS_INDEX || "contacts";

  const hasAlgoliaConfig = applicationId && apiKey;

  return (
    <Tabs
      defaultValue="contacts"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 rounded-2xl p-1">
          <TabsTrigger value="contacts" className="rounded-xl">
            Contacts
          </TabsTrigger>
          <TabsTrigger value="companies" className="rounded-xl">
            Companies
          </TabsTrigger>
        </TabsList>
        <div className="hidden gap-2 md:flex">
          <Button variant="outline" className="rounded-2xl">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <ContactForm />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="contacts" className="mt-0">
            <div className="rounded-3xl border border-dashed bg-background p-6">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Contacts</h1>
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
                <div className="mb-6 rounded-2xl border border-dashed bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Algolia search is not configured. Please set
                    NEXT_PUBLIC_ALGOLIA_APPLICATION_ID and
                    NEXT_PUBLIC_ALGOLIA_API_KEY environment variables.
                  </p>
                </div>
              )}
              <ContactList
                initialContacts={initialContacts}
                lastSyncedAt={lastSyncedAt}
              />
            </div>
          </TabsContent>
          <TabsContent value="companies" className="mt-0">
            <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
              <p className="text-muted-foreground">
                Companies content will go here
              </p>
            </div>
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}
