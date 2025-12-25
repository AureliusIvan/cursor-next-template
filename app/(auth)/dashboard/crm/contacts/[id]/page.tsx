import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  const contactId = parseInt(id, 10);

  if (Number.isNaN(contactId)) {
    notFound();
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 p-8 shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ffffff]">
        <div className="mb-8 pb-6 border-b-4 border-black dark:border-white">
          <h1 className="text-4xl font-black uppercase tracking-tight text-black dark:text-white">
            {contact.name}
          </h1>
        </div>

        <div className="space-y-6">
          <div className="border-3 border-black dark:border-white bg-white dark:bg-zinc-900 p-5 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">Email</span>
                <span className="font-medium text-black dark:text-zinc-300">
                  {contact.email || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">Phone</span>
                <span className="font-medium text-black dark:text-zinc-300">
                  {contact.phone || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">Company</span>
                <span className="font-medium text-black dark:text-zinc-300">
                  {contact.company || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">Role</span>
                <span className="font-medium text-black dark:text-zinc-300">
                  {contact.role || "-"}
                </span>
              </div>
              {contact.notionId && (
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">
                    Notion ID
                  </span>
                  <span className="font-medium text-black dark:text-zinc-300">{contact.notionId}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">
                  Created At
                </span>
                <span className="font-medium text-black dark:text-zinc-300">
                  {new Date(contact.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">
                  Updated At
                </span>
                <span className="font-medium text-black dark:text-zinc-300">
                  {new Date(contact.updatedAt).toLocaleString()}
                </span>
              </div>
              {contact.lastSyncedAt && (
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-xs mb-2 text-black dark:text-white">
                    Last Synced
                  </span>
                  <span className="font-medium text-black dark:text-zinc-300">
                    {new Date(contact.lastSyncedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
