export interface NotionFieldMapping {
  nameProperty: string;
  emailProperty: string;
  phoneProperty: string;
  companyProperty: string;
  roleProperty: string;
}

export interface NotionIntegrationConfig {
  databaseId: string;
  fieldMapping: NotionFieldMapping;
}

export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, { type: string }>;
}
