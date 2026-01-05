import { Database, Globe, Search, User } from "lucide-react";

import type { ToolConfig } from "./types";

export const defaultTools: ToolConfig[] = [
  {
    id: "searchContacts",
    name: "CRM Search",
    description: "Search contacts by name, email, or company",
    icon: Search,
    enabled: true,
  },
  {
    id: "listContacts",
    name: "List Contacts",
    description: "List all contacts with pagination",
    icon: Database,
    enabled: true,
  },
  {
    id: "getContact",
    name: "Contact Details",
    description: "Get detailed information about a contact",
    icon: User,
    enabled: true,
  },
  {
    id: "queryNotionDatabase",
    name: "Notion Query",
    description: "Query Notion database directly",
    icon: Database,
    enabled: true,
  },
  {
    id: "webSearch",
    name: "Web Search",
    description: "Search the web, scrape pages, and extract data",
    icon: Globe,
    enabled: true,
  },
];

export const suggestions = [
  "Explain quantum computing",
  "Write a haiku about coding",
  "Help me debug my code",
  "What are design patterns?",
];
