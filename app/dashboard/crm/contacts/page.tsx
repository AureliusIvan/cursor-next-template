import prisma from "@/lib/prisma";
import { ContactList } from "@/components/crm/contact-list";
import { ContactForm } from "@/components/crm/contact-form";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50, // Initial limit for performance
  });

  const lastSync = await prisma.syncState.findUnique({
    where: { resourceType: "contacts" },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <ContactForm />
      </div>
      <ContactList 
        initialContacts={contacts} 
        lastSyncedAt={lastSync?.lastSyncTime}
      />
    </div>
  );
}
