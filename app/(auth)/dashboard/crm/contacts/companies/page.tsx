import prisma from "@/lib/prisma";
import { CompaniesPageClient } from "./companies-page-client";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const [companies, lastSync] = await Promise.all([
    prisma.company.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.syncState.findUnique({
      where: { resourceType: "companies" },
    }),
  ]);

  return (
    <main className="flex-1 p-4 md:p-6">
      <CompaniesPageClient
        initialCompanies={companies}
        lastSyncedAt={lastSync?.lastSyncTime}
      />
    </main>
  );
}
