import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

function CompanyField({
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

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (Number.isNaN(companyId)) {
    notFound();
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/crm/contacts/companies">
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {company.name}
              </h1>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl">
            Edit
          </Button>
        </div>

        {/* Company Information Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CompanyField
              icon={Building2}
              label="Industry"
              value={company.industry}
            />
            <CompanyField
              icon={Globe}
              label="Website"
              value={company.website}
            />
            <CompanyField icon={Phone} label="Phone" value={company.phone} />
            <CompanyField
              icon={MapPin}
              label="Address"
              value={company.address}
            />
            <CompanyField icon={Users} label="Size" value={company.size} />
          </CardContent>
        </Card>

        {/* Description Card */}
        {company.description && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {company.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metadata Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataField
              icon={Calendar}
              label="Created At"
              value={new Date(company.createdAt).toLocaleString()}
            />
            <MetadataField
              icon={Clock}
              label="Updated At"
              value={new Date(company.updatedAt).toLocaleString()}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
