import { Database, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface IntegrationStatus {
  name: string;
  description: string;
  icon: typeof Database;
  status: "connected" | "not_configured";
  requiredVars: string[];
}

function checkIntegrationStatus(
  name: string,
  description: string,
  icon: typeof Database,
  requiredVars: string[]
): IntegrationStatus {
  const allConfigured = requiredVars.every(
    (varName) =>
      process.env[varName] &&
      process.env[varName] !== `your-${varName.toLowerCase().replace(/_/g, "-")}`
  );

  return {
    name,
    description,
    icon,
    status: allConfigured ? "connected" : "not_configured",
    requiredVars,
  };
}

function getAIProviderStatus(): IntegrationStatus {
  const provider = process.env.AI_PROVIDER || "openai";
  const requiredVars: string[] = [];

  switch (provider) {
    case "openai":
      requiredVars.push("OPENAI_API_KEY");
      break;
    case "anthropic":
      requiredVars.push("ANTHROPIC_API_KEY");
      break;
    case "google":
    case "gemini":
      requiredVars.push("GOOGLE_GENERATIVE_AI_API_KEY");
      break;
    case "kimi":
      requiredVars.push("KIMI_API_KEY");
      break;
    default:
      requiredVars.push("OPENAI_API_KEY");
      break;
  }

  const allConfigured = requiredVars.every(
    (varName) =>
      process.env[varName] &&
      process.env[varName] !== `your-${varName.toLowerCase().replace(/_/g, "-")}`
  );

  return {
    name: `AI Provider (${provider})`,
    description: "AI chat and tools (OpenAI, Anthropic, Google, Kimi)",
    icon: Sparkles,
    status: allConfigured ? "connected" : "not_configured",
    requiredVars,
  };
}

export default function IntegrationsPage() {
  const integrations: IntegrationStatus[] = [
    checkIntegrationStatus("Notion", "Sync contacts from Notion database", Database, [
      "NOTION_API_KEY",
      "NOTION_DATABASE_ID",
    ]),
    checkIntegrationStatus("Algolia", "Full-text search for contacts", Search, [
      "ALGOLIA_APPLICATION_ID",
      "ALGOLIA_ADMIN_API_KEY",
    ]),
    getAIProviderStatus(),
  ];

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-dashed bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Integrations</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card className="rounded-2xl" key={integration.name}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Badge
                      className={
                        integration.status === "connected"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }
                      variant="outline"
                    >
                      {integration.status === "connected" ? "Connected" : "Not Configured"}
                    </Badge>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-muted-foreground text-sm">Required Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.requiredVars.map((varName) => {
                        const isConfigured =
                          process.env[varName] &&
                          process.env[varName] !==
                            `your-${varName.toLowerCase().replace(/_/g, "-")}`;
                        return (
                          <Badge
                            className={
                              isConfigured
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }
                            key={varName}
                            variant="outline"
                          >
                            {varName}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
