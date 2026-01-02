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

export function ContactsPageClient({ initialContacts, lastSyncedAt }: ContactsPageClientProps) {
  const [activeTab, setActiveTab] = useState("contacts");
  const applicationId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_CONTACTS_INDEX || "contacts";

  const hasAlgoliaConfig = applicationId && apiKey;

  return (
    <Tabs className="w-full" defaultValue="contacts" onValueChange={setActiveTab} value={activeTab}>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 rounded-2xl p-1">
          <TabsTrigger className="rounded-xl" value="contacts">
            Contacts
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="companies">
            Companies
          </TabsTrigger>
        </TabsList>
        <div className="hidden gap-2 md:flex">
          <Button className="rounded-2xl" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <ContactForm />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 10 }}
          key={activeTab}
          transition={{ duration: 0.2 }}
        >
          <TabsContent className="mt-0" value="contacts">
            <div className="rounded-3xl border border-dashed bg-background p-6">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="font-semibold text-2xl">Contacts</h1>
              </div>
              {hasAlgoliaConfig ? (
                <div className="mb-6">
                  <Search
                    apiKey={apiKey}
                    applicationId={applicationId}
                    attributes={{
                      primaryText: "name",
                      secondaryText: "email",
                      tertiaryText: "company",
                    }}
                    indexName={indexName}
                    openResultsInNewTab={false}
                    placeholder="Search contacts..."
                    urlGenerator={(hit) => {
                      const contactId = hit.id || hit.objectID;
                      if (contactId) {
                        return `/dashboard/crm/contacts/${contactId}`;
                      }
                      return undefined;
                    }}
                  />
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-dashed bg-muted/50 p-4">
                  <p className="text-muted-foreground text-sm">
                    Algolia search is not configured. Please set NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
                    and NEXT_PUBLIC_ALGOLIA_API_KEY environment variables.
                  </p>
                </div>
              )}
              <ContactList initialContacts={initialContacts} lastSyncedAt={lastSyncedAt} />
            </div>
          </TabsContent>
          <TabsContent className="mt-0" value="companies">
            <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
              <p className="text-muted-foreground">Companies content will go here</p>
            </div>
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}
