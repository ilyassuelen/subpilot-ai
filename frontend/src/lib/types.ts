export type Contract = {
  id: number;
  title: string;
  provider_name: string;
  provider_email: string | null;
  category: string;
  contract_type: string;
  monthly_cost: number;
  billing_cycle: string;
  currency: string;
  start_date: string;
  end_date: string | null;
  auto_renewal: boolean;
  cancellation_notice_days: number;
  cancellation_deadline: string | null;
  days_until_deadline: number | null;
  urgency_status: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export type ContractCreateRequest = {
  title: string;
  provider_name: string;
  provider_email?: string | null;
  category: string;
  contract_type: string;
  monthly_cost: number;
  billing_cycle: string;
  currency: string;
  start_date: string;
  end_date?: string | null;
  auto_renewal: boolean;
  cancellation_notice_days: number;
  notes?: string | null;
};

export type Reminder = {
  id: number;
  contract_id: number;
  reminder_type: string;
  message: string;
  scheduled_for: string;
  status: string;
  channel: string;
  sent_at: string | null;
  created_at: string;
};

export type ReminderCreateRequest = {
  contract_id: number;
  reminder_type: string;
  message: string;
  scheduled_for: string;
  channel: string;
};

export type Cancellation = {
  id: number;
  contract_id: number;
  language: string;
  customer_name: string | null;
  customer_address: string | null;
  customer_email: string | null;
  customer_number: string | null;
  provider_name: string | null;
  provider_email: string | null;
  provider_address: string | null;
  subject: string;
  generated_message: string;
  final_message: string;
  status: string;
  sent_at: string | null;
  created_at: string;
};

export type ActionLog = {
  id: number;
  entity_type: string;
  entity_id: number;
  action_type: string;
  message: string;
  created_at: string;
};

export type EmailPreview = {
  to: string;
  subject: string;
  body: string;
  mailto_link: string;
};

export type CancellationGenerateRequest = {
  language: string;
  customer_name?: string | null;
  customer_address?: string | null;
  customer_email?: string | null;
  customer_number?: string | null;
  provider_email?: string | null;
  provider_address?: string | null;
};
