"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  NotionDatabase,
  NotionFieldMapping,
  NotionIntegrationConfig,
} from "@/lib/types/notion-integration";

interface NotionIntegrationProps {
  isConnected: boolean;
  initialConfig?: NotionIntegrationConfig | null;
}

export function NotionIntegration({
  isConnected: initialIsConnected,
  initialConfig,
}: NotionIntegrationProps) {
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState(
    initialConfig?.databaseId || "",
  );
  const [fieldMapping, setFieldMapping] = useState<NotionFieldMapping>(
    initialConfig?.fieldMapping || {
      nameProperty: "",
      emailProperty: "",
      phoneProperty: "",
      companyProperty: "",
      roleProperty: "",
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] =
    useState<NotionDatabase | null>(null);

  const fetchDatabases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/integrations/notion/databases");
      if (!response.ok) {
        throw new Error("Failed to fetch databases");
      }
      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchDatabases();
    }
  }, [isConnected, fetchDatabases]);

  useEffect(() => {
    if (selectedDatabaseId && databases.length > 0) {
      const db = databases.find((d) => d.id === selectedDatabaseId);
      setSelectedDatabase(db || null);
    }
  }, [selectedDatabaseId, databases]);

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      setError("Notion OAuth is not configured");
      return;
    }

    const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("owner", "user");
    authUrl.searchParams.set("redirect_uri", redirectUri);

    window.location.href = authUrl.toString();
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Notion?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/integrations/notion/config", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      setIsConnected(false);
      setDatabases([]);
      setSelectedDatabaseId("");
      setFieldMapping({
        nameProperty: "",
        emailProperty: "",
        phoneProperty: "",
        companyProperty: "",
        roleProperty: "",
      });
      setSuccess("Successfully disconnected from Notion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedDatabaseId) {
      setError("Please select a database");
      return;
    }

    if (
      !fieldMapping.nameProperty ||
      !fieldMapping.emailProperty ||
      !fieldMapping.phoneProperty
    ) {
      setError("Please map at least Name, Email, and Phone properties");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/integrations/notion/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseId: selectedDatabaseId,
          fieldMapping,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      setSuccess("Configuration saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getPropertyOptions = () => {
    if (!selectedDatabase?.properties) {
      return [];
    }
    return Object.keys(selectedDatabase.properties);
  };

  if (!isConnected) {
    return (
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Notion</h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect your Notion workspace to sync contacts
            </p>
          </div>
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl">N</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <button
          type="button"
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Connect to Notion"}
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Notion</h2>
          <p className="text-sm text-green-600 mt-1">✓ Connected</p>
        </div>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={loading}
          className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Database Selection */}
        <div>
          <label htmlFor="database" className="block text-sm font-medium mb-2">
            Select Database
          </label>
          <select
            id="database"
            value={selectedDatabaseId}
            onChange={(e) => setSelectedDatabaseId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          >
            <option value="">-- Select a database --</option>
            {databases.map((db) => (
              <option key={db.id} value={db.id}>
                {db.title}
              </option>
            ))}
          </select>
        </div>

        {/* Field Mapping */}
        {selectedDatabaseId && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Field Mapping</h3>
            <p className="text-xs text-gray-600">
              Map Notion properties to contact fields
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nameProperty"
                  className="block text-xs font-medium mb-1"
                >
                  Name Property *
                </label>
                <select
                  id="nameProperty"
                  value={fieldMapping.nameProperty}
                  onChange={(e) =>
                    setFieldMapping({
                      ...fieldMapping,
                      nameProperty: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  {getPropertyOptions().map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="emailProperty"
                  className="block text-xs font-medium mb-1"
                >
                  Email Property *
                </label>
                <select
                  id="emailProperty"
                  value={fieldMapping.emailProperty}
                  onChange={(e) =>
                    setFieldMapping({
                      ...fieldMapping,
                      emailProperty: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  {getPropertyOptions().map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="phoneProperty"
                  className="block text-xs font-medium mb-1"
                >
                  Phone Property *
                </label>
                <select
                  id="phoneProperty"
                  value={fieldMapping.phoneProperty}
                  onChange={(e) =>
                    setFieldMapping({
                      ...fieldMapping,
                      phoneProperty: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  {getPropertyOptions().map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="companyProperty"
                  className="block text-xs font-medium mb-1"
                >
                  Company Property
                </label>
                <select
                  id="companyProperty"
                  value={fieldMapping.companyProperty}
                  onChange={(e) =>
                    setFieldMapping({
                      ...fieldMapping,
                      companyProperty: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  {getPropertyOptions().map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="roleProperty"
                  className="block text-xs font-medium mb-1"
                >
                  Role Property
                </label>
                <select
                  id="roleProperty"
                  value={fieldMapping.roleProperty}
                  onChange={(e) =>
                    setFieldMapping({
                      ...fieldMapping,
                      roleProperty: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  {getPropertyOptions().map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {selectedDatabaseId && (
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={loading}
            className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        )}
      </div>
    </div>
  );
}
