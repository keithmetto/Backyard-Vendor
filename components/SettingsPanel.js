"use client";

import SettingsForm from "@/components/SettingsForm";
import { useSettings } from "@/lib/use-stored-value";

export default function SettingsPanel() {
  const { settings, ready, saveSettings } = useSettings();

  if (!ready) {
    return <p className="text-muted">Loading settings…</p>;
  }

  return <SettingsForm initialSettings={settings} onSave={saveSettings} />;
}
