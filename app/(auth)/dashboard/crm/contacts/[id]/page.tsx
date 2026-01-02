import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

function ContactField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </div>
        <div className="text-sm font-medium break-words">
          {value || "Not provided"}
        </div>
      </div>
    </div>
  );
}

function MetadataField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
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
    <main className="flex-1 p-4 md:p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/crm/contacts">
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {contact.name}
              </h1>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl">
            Edit
          </Button>
        </div>

        {/* Contact Information Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContactField icon={Mail} label="Email" value={contact.email} />
            <ContactField icon={Phone} label="Phone" value={contact.phone} />
          </CardContent>
        </Card>

        {/* Work Information Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Work Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContactField
              icon={Building2}
              label="Company"
              value={contact.company}
            />
            <ContactField icon={Briefcase} label="Role" value={contact.role} />
          </CardContent>
        </Card>

        {/* Metadata Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataField
              icon={Calendar}
              label="Created At"
              value={new Date(contact.createdAt).toLocaleString()}
            />
            <MetadataField
              icon={Clock}
              label="Updated At"
              value={new Date(contact.updatedAt).toLocaleString()}
            />
            {contact.lastSyncedAt && (
              <MetadataField
                icon={Clock}
                label="Last Synced"
                value={new Date(contact.lastSyncedAt).toLocaleString()}
              />
            )}
            {contact.notionId && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-muted p-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Notion ID
                  </div>
                  <div className="text-sm font-medium font-mono break-all">
                    {contact.notionId}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
