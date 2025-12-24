import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NotionIntegration } from "@/app/components/integrations/notion-integration";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { NotionIntegrationConfig } from "@/lib/types/notion-integration";

export default async function IntegrationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Get user's Notion connection status
  const notionAccount = await prisma.account.findFirst({
    where: {
      userId: Number(session.user.id),
      providerId: "notion",
    },
  });

  const isConnected = !!notionAccount?.accessToken;
  let config: NotionIntegrationConfig | null = null;

  if (notionAccount?.scope) {
    try {
      const parsedScope = JSON.parse(notionAccount.scope as string);
      if (parsedScope.databaseId && parsedScope.fieldMapping) {
        config = {
          databaseId: parsedScope.databaseId,
          fieldMapping: parsedScope.fieldMapping,
        };
      }
    } catch (e) {
      console.error("Failed to parse Notion config:", e);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Integrations</h1>
      <div className="max-w-2xl">
        <NotionIntegration isConnected={isConnected} initialConfig={config} />
      </div>
    </div>
  );
}
