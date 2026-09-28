"use client";

import { useRef, useState } from "react";
import FormField, { inputClass } from "@/components/FormField";
import DraftFromNotes from "@/components/DraftFromNotes";
import {
  AVAILABILITY_OPTIONS,
  PRODUCT_LIMITS,
  validateProduct,
} from "@/lib/product-validation";

const FIELD_ORDER = ["name", "description", "price", "availability"];

const EMPTY_VALUES = {
  name: "",
  description: "",
  price: "",
  availability: "in_stock",
};

function toFormValues(product) {
  if (!product) return EMPTY_VALUES;
  return {
    name: product.name ?? "",
    description: product.description ?? "",
    price: product.price == null ? "" : String(product.price),
    availability: product.availability ?? "in_stock",
  };
}

/**
 * Create/edit form for one product. `onSubmit` receives validated values and
 * returns true when they were saved.
 */
export default function ProductForm({
  product,
  currency = "KES",
  submitLabel = "Save product",
  onSubmit,
  showDraft = true,
}) {
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState({});
  const [draftWarnings, setDraftWarnings] = useState([]);
  const [saveError, setSaveError] = useState("");
  const formRef = useRef(null);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function applyDraft(draftValues, warnings) {
    setValues({ ...EMPTY_VALUES, ...draftValues });
    setErrors({});
    setDraftWarnings(warnings);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaveError("");
    const result = validateProduct(values);
    setErrors(result.errors);

    if (!result.valid) {
      const first = FIELD_ORDER.find((field) => result.errors[field]);
      formRef.current?.querySelector(`#${first}`)?.focus();
      return;
    }

    const saved = onSubmit(result.values);
    if (saved === false) {
      setSaveError(
        "Your browser blocked saving (storage may be full or disabled). Nothing was lost from this form.",
      );
    }
  }

  return (
    <div className="space-y-6">
      {showDraft ? <DraftFromNotes currency={currency} onDraft={applyDraft} /> : null}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        {draftWarnings.length > 0 ? (
          <div className="rounded-xl border border-accent bg-accent-soft px-4 py-3 text-sm text-foreground">
            <p className="font-semibold">Check before saving:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {draftWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <FormField id="name" label="Product name" error={errors.name}>
          {(props) => (
            <input
              {...props}
              type="text"
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              maxLength={PRODUCT_LIMITS.nameMax}
              autoComplete="off"
              className={inputClass}
            />
          )}
        </FormField>

        <FormField
          id="description"
          label="Description"
          optional
          hint={`${values.description.trim().length}/${PRODUCT_LIMITS.descriptionMax} characters`}
          error={errors.description}
        >
          {(props) => (
            <textarea
              {...props}
              rows={4}
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              className={inputClass}
            />
          )}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="price"
            label={`Price (${currency})`}
            hint="Numbers only, e.g. 50 or 1,200"
            error={errors.price}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                inputMode="decimal"
                value={values.price}
                onChange={(event) => update("price", event.target.value)}
                className={inputClass}
              />
            )}
          </FormField>

          <FormField id="availability" label="Availability" error={errors.availability}>
            {(props) => (
              <select
                {...props}
                value={values.availability}
                onChange={(event) => update("availability", event.target.value)}
                className={inputClass}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        {saveError ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {saveError}
          </p>
        ) : null}

        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
