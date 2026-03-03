export interface Invoice {
  id: number;
  date: string;
  amount: number;
  client: string;
  category: string;
  description: string;
  file_path?: string;
}

export interface Stats {
  total: number;
  total_services: number;
  total_commercial: number;
  limits: {
    limit_service: number;
    limit_commercial: number;
  };
}

export type DocType = 'Contract' | 'Business Plan' | 'Financial Report' | 'Invoice Template';
