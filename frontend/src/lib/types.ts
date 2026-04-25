export type ContractType =
  | "subscription"
  | "contract"
  | "internet_contract"
  | "mobile_contract"
  | "insurance";

export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";

export type ContractStatus = "active" | "cancelled";

export type Contract = {
  id: number;
  title: string;
  provider_name: string;
  provider_email: string | null;
  category: string;
  contract_type: ContractType;
  monthly_cost: number;
  billing_cycle: BillingCycle;
  currency: string;
  start_date: string;
  end_date: string | null;
  auto_renewal: boolean;
  cancellation_notice_days: number;
  cancellation_deadline: string | null;
  days_until_deadline: number | null;
  urgency_status: string;
  status: ContractStatus;
  notes: string | null;
  created_at: string;
};

export type ContractCreateRequest = {
  title: string;
  provider_name: string;
  provider_email?: string | null;
  category: string;
  contract_type: ContractType;
  monthly_cost: number;
  billing_cycle: BillingCycle;
  currency: string;
  start_date: string;
  end_date?: string | null;
  auto_renewal: boolean;
  cancellation_notice_days: number;
  status: ContractStatus;
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

export type ReminderGenerateResponse = {
  generated_count: number;
  reminders: Reminder[];
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

/* =========================
   Auth / Users
   ========================= */

export type RegisterRequest = {
  full_name: string;
  email: string;
  password: string;
  address: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: number;
  full_name: string;
  email: string;
  address: string;
  created_at: string;
};

export type UserUpdateRequest = {
  full_name: string;
  email: string;
  address: string;
};

export type NotificationSettings = {
  id: number;
  user_id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  telegram_notifications: boolean;
  telegram_chat_id: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationSettingsUpdateRequest = {
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  telegram_notifications: boolean;
  telegram_chat_id?: string | null;
};
