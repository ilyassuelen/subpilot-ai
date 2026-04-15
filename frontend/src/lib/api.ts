import type {
  ActionLog,
  Cancellation,
  CancellationGenerateRequest,
  Contract,
  ContractCreateRequest,
  EmailPreview,
  Reminder,
  ReminderCreateRequest,
} from "./types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item?.msg ?? "Validation error")
        .join(", ");
    }

    return JSON.stringify(data);
  } catch {
    return response.statusText || "Unknown error";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorMessage = await parseError(response);
    throw new Error(`API ${response.status}: ${errorMessage}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/* =========================
   Contracts
   ========================= */

export function getContracts(): Promise<Contract[]> {
  return apiFetch<Contract[]>("/contracts/");
}

export function getContractById(contractId: number): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${contractId}`);
}

export function createContract(
  payload: ContractCreateRequest,
): Promise<Contract> {
  return apiFetch<Contract>("/contracts/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   Reminders
   ========================= */

export function getReminders(): Promise<Reminder[]> {
  return apiFetch<Reminder[]>("/reminders/");
}

export function getRemindersByContract(contractId: number): Promise<Reminder[]> {
  return apiFetch<Reminder[]>(`/reminders/contract/${contractId}`);
}

export function createReminder(
  payload: ReminderCreateRequest,
): Promise<Reminder> {
  return apiFetch<Reminder>("/reminders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   Cancellations
   ========================= */

export function getCancellations(): Promise<Cancellation[]> {
  return apiFetch<Cancellation[]>("/cancellations/");
}

export function getCancellationById(
  cancellationId: number,
): Promise<Cancellation> {
  return apiFetch<Cancellation>(`/cancellations/${cancellationId}`);
}

export function generateCancellationDraft(
  contractId: number,
  payload: CancellationGenerateRequest,
): Promise<Cancellation> {
  return apiFetch<Cancellation>(
    `/cancellations/contract/${contractId}/generate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function approveCancellation(
  cancellationId: number,
): Promise<Cancellation> {
  return apiFetch<Cancellation>(`/cancellations/${cancellationId}/approve`, {
    method: "POST",
  });
}

export function markCancellationSent(
  cancellationId: number,
): Promise<Cancellation> {
  return apiFetch<Cancellation>(`/cancellations/${cancellationId}/mark-sent`, {
    method: "POST",
  });
}

export function cancelCancellation(
  cancellationId: number,
): Promise<Cancellation> {
  return apiFetch<Cancellation>(`/cancellations/${cancellationId}/cancel`, {
    method: "POST",
  });
}

export function getCancellationEmailPreview(
  cancellationId: number,
): Promise<EmailPreview> {
  return apiFetch<EmailPreview>(
    `/cancellations/${cancellationId}/email-preview`,
  );
}

/* =========================
   Actions / Activity
   ========================= */

export function getActionLogs(): Promise<ActionLog[]> {
  return apiFetch<ActionLog[]>("/actions/");
}

export function getActionLogsByEntity(
  entityType: string,
  entityId: number,
): Promise<ActionLog[]> {
  return apiFetch<ActionLog[]>(
    `/actions/entity/${entityType}/${entityId}`,
  );
}
