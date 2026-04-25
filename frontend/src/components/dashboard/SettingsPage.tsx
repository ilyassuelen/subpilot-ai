import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Globe,
  Shield,
  BrainCircuit,
  Mail,
  Database,
  Trash2,
  Download,
  Pencil,
  Save,
  X,
} from "lucide-react";

import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/useNotificationSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser, useUpdateCurrentUser } from "@/hooks/useAuth";

export function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  const { data: user, isLoading } = useCurrentUser();
  const updateUserMutation = useUpdateCurrentUser();

  const {
    data: notificationSettings,
    isLoading: loadingNotificationSettings,
  } = useNotificationSettings();

  const updateNotificationSettingsMutation = useUpdateNotificationSettings();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [telegramChatId, setTelegramChatId] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setAddress(user.address);
    }
  }, [user]);

  useEffect(() => {
    if (notificationSettings) {
      setTelegramChatId(notificationSettings.telegram_chat_id ?? "");
    }
  }, [notificationSettings]);

  const handleCancelEdit = () => {
    if (!user) return;

    setFullName(user.full_name);
    setEmail(user.email);
    setAddress(user.address);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    await updateUserMutation.mutateAsync({
      full_name: fullName.trim(),
      email: email.trim(),
      address: address.trim(),
    });

    setIsEditingProfile(false);
  };

  const updateNotificationField = async (
    updates: Partial<{
      email_notifications: boolean;
      push_notifications: boolean;
      weekly_digest: boolean;
      telegram_notifications: boolean;
      telegram_chat_id: string | null;
    }>,
  ) => {
    if (!notificationSettings) return;

    await updateNotificationSettingsMutation.mutateAsync({
      email_notifications:
        updates.email_notifications ??
        notificationSettings.email_notifications,
      push_notifications:
        updates.push_notifications ??
        notificationSettings.push_notifications,
      weekly_digest:
        updates.weekly_digest ?? notificationSettings.weekly_digest,
      telegram_notifications:
        updates.telegram_notifications ??
        notificationSettings.telegram_notifications,
      telegram_chat_id:
        updates.telegram_chat_id !== undefined
          ? updates.telegram_chat_id
          : notificationSettings.telegram_chat_id,
    });
  };

  if (!mounted || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6">No user data found.</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-bold">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, preferences, and integrations.
        </p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-[var(--font-display)] font-bold">Profile</h2>
          </div>

          {!isEditingProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updateUserMutation.isPending}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              <Button
                variant="hero"
                size="sm"
                onClick={handleSaveProfile}
                disabled={updateUserMutation.isPending}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input
              className="h-9 rounded-xl"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              readOnly={!isEditingProfile}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input
              className="h-9 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!isEditingProfile}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Address</Label>
            <Input
              className="h-9 rounded-xl"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              readOnly={!isEditingProfile}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Phone</Label>
            <Input
              placeholder="+49 123 456 7890"
              className="h-9 rounded-xl"
              readOnly
            />
          </div>
        </div>

        {updateUserMutation.error && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {updateUserMutation.error.message}
          </div>
        )}

        {updateUserMutation.isSuccess && !isEditingProfile && (
          <div className="mt-4 rounded-xl bg-success/10 p-3 text-sm text-success">
            Profile updated successfully.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            Notification Preferences
          </h2>
        </div>

        {loadingNotificationSettings || !notificationSettings ? (
          <p className="text-sm text-muted-foreground">
            Loading notification preferences...
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">In-app notifications</div>
                <div className="text-xs text-muted-foreground">
                  Show deadline reminders and updates inside the app.
                </div>
              </div>
              <Switch
                checked={notificationSettings.push_notifications}
                disabled={updateNotificationSettingsMutation.isPending}
                onCheckedChange={(checked) =>
                  updateNotificationField({ push_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Email notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive renewal and deadline reminders via email.
                </div>
              </div>
              <Switch
                checked={notificationSettings.email_notifications}
                disabled={updateNotificationSettingsMutation.isPending}
                onCheckedChange={(checked) =>
                  updateNotificationField({ email_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Telegram notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive important reminders through Telegram.
                </div>
              </div>
              <Switch
                checked={notificationSettings.telegram_notifications}
                disabled={updateNotificationSettingsMutation.isPending}
                onCheckedChange={(checked) =>
                  updateNotificationField({ telegram_notifications: checked })
                }
              />
            </div>

            {notificationSettings.telegram_notifications && (
              <div className="space-y-2 rounded-xl border border-border/50 bg-muted/30 p-3">
                <Label className="text-xs">Telegram Chat ID</Label>
                <Input
                  className="h-9 rounded-xl"
                  placeholder="e.g. 123456789"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  onBlur={() =>
                    updateNotificationField({
                      telegram_chat_id: telegramChatId.trim() || null,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  You can add your Telegram Chat ID after connecting the bot.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Weekly digest</div>
                <div className="text-xs text-muted-foreground">
                  Get a weekly summary of your subscription status.
                </div>
              </div>
              <Switch
                checked={notificationSettings.weekly_digest}
                disabled={updateNotificationSettingsMutation.isPending}
                onCheckedChange={(checked) =>
                  updateNotificationField({ weekly_digest: checked })
                }
              />
            </div>

            {updateNotificationSettingsMutation.error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {updateNotificationSettingsMutation.error.message}
              </div>
            )}

            {updateNotificationSettingsMutation.isSuccess && (
              <div className="rounded-xl bg-success/10 p-3 text-sm text-success">
                Notification preferences updated.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            Language Preferences
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Default Language</Label>
            <select className="h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
              <option>English</option>
              <option>German</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Default Cancellation Language</Label>
            <select className="h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
              <option>Same as interface</option>
              <option>English</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            Privacy & Security
          </h2>
        </div>

        <div className="space-y-4">
          {[
            [
              "Two-factor authentication",
              "Add an extra layer of security to your account.",
              false,
            ],
            [
              "Anonymous analytics sharing",
              "Help improve SubPilot with anonymous product usage data.",
              true,
            ],
          ].map(([title, description, defaultChecked]) => (
            <div
              key={title as string}
              className="flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium">{title as string}</div>
                <div className="text-xs text-muted-foreground">
                  {description as string}
                </div>
              </div>
              <Switch defaultChecked={defaultChecked as boolean} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            AI Settings
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">AI Generation Mode</Label>
            <select className="h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
              <option>Standard (faster)</option>
              <option>Enhanced (more detailed)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Auto-generate reminders</div>
              <div className="text-xs text-muted-foreground">
                Automatically create reminders when adding contracts.
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            Future Integrations
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              name: "Gmail",
              description: "Auto-detect subscriptions from your inbox.",
              status: "Coming Soon",
            },
            {
              name: "Outlook",
              description: "Connect your Microsoft email for scanning.",
              status: "Coming Soon",
            },
            {
              name: "Apple Mail",
              description: "Import subscription data from Apple Mail.",
              status: "Planned",
            },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/40 p-3"
            >
              <div>
                <div className="text-sm font-medium">{integration.name}</div>
                <div className="text-xs text-muted-foreground">
                  {integration.description}
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {integration.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            Data Management
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export All Data
          </Button>

          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
