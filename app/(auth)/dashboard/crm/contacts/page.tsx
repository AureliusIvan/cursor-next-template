import prisma from "@/lib/prisma";
import { ContactsPageClient } from "./contacts-page-client";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, lastSync] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.syncState.findUnique({
      where: { resourceType: "contacts" },
    }),
  ]);

  return <ContactsPageClient initialContacts={contacts} lastSyncedAt={lastSync?.lastSyncTime} />;
}
