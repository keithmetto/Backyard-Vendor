"use client";

import { useRef, useState } from "react";
import FormField, { inputClass } from "@/components/FormField";
import { CURRENCIES, validateSettings } from "@/lib/settings-validation";

const FIELD_ORDER = ["shopName", "contactPhone", "contactEmail", "defaultCurrency", "bio"];

/**
 * Vendor settings form (ported from the Week 2 drill). `onSave` persists the
 * validated values and returns false if the browser refused the write.
 */
export default function SettingsForm({ initialSettings, onSave }) {
  const [values, setValues] = useState(initialSettings);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const formRef = useRef(null);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaveError("");
    setStatus("");
    const result = validateSettings(values);
    setErrors(result.errors);

    if (!result.valid) {
      const first = FIELD_ORDER.find((field) => result.errors[field]);
      formRef.current?.querySelector(`#${first}`)?.focus();
      return;
    }

    if (onSave(result.values) === false) {
      setSaveError("Your browser blocked saving (storage may be full or disabled).");
      return;
    }
    setValues(result.values);
    setStatus("Settings saved");
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField id="shopName" label="Shop name" error={errors.shopName}>
        {(props) => (
          <input
            {...props}
            type="text"
            value={values.shopName}
            onChange={(event) => update("shopName", event.target.value)}
            maxLength={60}
            autoComplete="organization"
            className={inputClass}
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="contactPhone"
          label="Contact phone"
          hint="07XXXXXXXX or +2547XXXXXXXX"
          error={errors.contactPhone}
        >
          {(props) => (
            <input
              {...props}
              type="tel"
              value={values.contactPhone}
              onChange={(event) => update("contactPhone", event.target.value)}
              autoComplete="tel"
              className={inputClass}
            />
          )}
        </FormField>

        <FormField id="contactEmail" label="Contact email" optional error={errors.contactEmail}>
          {(props) => (
            <input
              {...props}
              type="email"
              value={values.contactEmail}
              onChange={(event) => update("contactEmail", event.target.value)}
              autoComplete="email"
              className={inputClass}
            />
          )}
        </FormField>
      </div>

      <FormField id="defaultCurrency" label="Currency" error={errors.defaultCurrency}>
        {(props) => (
          <select
            {...props}
            value={values.defaultCurrency}
            onChange={(event) => update("defaultCurrency", event.target.value)}
            className={`${inputClass} sm:max-w-xs`}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="flex items-center gap-3">
        <input
          id="acceptingOrders"
          name="acceptingOrders"
          type="checkbox"
          checked={values.acceptingOrders}
          onChange={(event) => update("acceptingOrders", event.target.checked)}
          className="h-5 w-5 accent-[var(--brand)]"
        />
        <label htmlFor="acceptingOrders" className="text-sm font-semibold text-foreground">
          Accepting orders
        </label>
      </div>

      <FormField
        id="bio"
        label="Short bio"
        optional
        hint={`${values.bio.length}/200 characters`}
        error={errors.bio}
      >
        {(props) => (
          <textarea
            {...props}
            rows={3}
            value={values.bio}
            onChange={(event) => update("bio", event.target.value)}
            className={inputClass}
          />
        )}
      </FormField>

      {saveError ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {saveError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Save settings
        </button>
        <p role="status" aria-live="polite" className="text-sm font-medium text-brand">
          {status}
        </p>
      </div>
    </form>
  );
}
