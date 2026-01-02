"use client";

import type { Company } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { CompanyForm } from "@/components/crm/company-form";
import { CompanyList } from "@/components/crm/company-list";
import Search from "@/components/search";
import { Button } from "@/components/ui/button";

interface CompaniesPageClientProps {
  initialCompanies: Company[];
  lastSyncedAt?: Date | null;
}

export function CompaniesPageClient({ initialCompanies, lastSyncedAt }: CompaniesPageClientProps) {
  const applicationId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_COMPANIES_INDEX || "companies";

  const hasAlgoliaConfig = applicationId && apiKey;

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-semibold text-2xl">Companies</h1>
        <div className="hidden gap-2 md:flex">
          <Button className="rounded-2xl" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <CompanyForm />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-3xl border border-dashed bg-background p-6">
            {hasAlgoliaConfig ? (
              <div className="mb-6">
                <Search
                  apiKey={apiKey}
                  applicationId={applicationId}
                  attributes={{
                    primaryText: "name",
                    secondaryText: "industry",
                    tertiaryText: "website",
                  }}
                  indexName={indexName}
                  openResultsInNewTab={false}
                  placeholder="Search companies..."
                  urlGenerator={(hit) => {
                    const companyId = hit.id || hit.objectID;
                    if (companyId) {
                      return `/dashboard/crm/contacts/companies/${companyId}`;
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
            <CompanyList initialCompanies={initialCompanies} lastSyncedAt={lastSyncedAt} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
