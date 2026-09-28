import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SettingsForm from "@/components/SettingsForm";
import SettingsPanel from "@/components/SettingsPanel";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "@/lib/settings-store";

describe("SettingsForm", () => {
  it("rejects a non-Kenyan phone with an associated error", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SettingsForm initialSettings={DEFAULT_SETTINGS} onSave={onSave} />);

    await user.type(screen.getByLabelText("Shop name"), "Amina Yard");
    await user.type(screen.getByLabelText("Contact phone"), "123");
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    const phone = screen.getByLabelText("Contact phone");
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(phone.getAttribute("aria-describedby")).toContain("contactPhone-error");
    expect(phone).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves valid settings and announces success", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(() => true);
    render(<SettingsForm initialSettings={DEFAULT_SETTINGS} onSave={onSave} />);

    await user.type(screen.getByLabelText("Shop name"), "  Amina Yard ");
    await user.type(screen.getByLabelText("Contact phone"), "+254712345678");
    await user.selectOptions(screen.getByLabelText("Currency"), "USD");
    await user.click(screen.getByLabelText("Accepting orders"));
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    expect(onSave).toHaveBeenCalledWith({
      shopName: "Amina Yard",
      contactPhone: "+254712345678",
      contactEmail: "",
      defaultCurrency: "USD",
      acceptingOrders: false,
      bio: "",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Settings saved");
  });

  it("persists to backyard-vendor-settings through SettingsPanel", async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    await user.type(screen.getByLabelText("Shop name"), "Amina Yard");
    await user.type(screen.getByLabelText("Contact phone"), "0712345678");
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    const stored = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    expect(stored.shopName).toBe("Amina Yard");
    expect(stored.contactPhone).toBe("0712345678");
  });
});
