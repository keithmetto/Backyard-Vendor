import { validateSettings } from "./settings-validation.js";

const STORAGE_KEY = "backyard-vendor-settings";

const FIELD_IDS = [
  "shopName",
  "contactPhone",
  "contactEmail",
  "defaultCurrency",
  "acceptingOrders",
  "bio",
];

const form = document.getElementById("settings-form");
const saveStatus = document.getElementById("save-status");

/**
 * @returns {HTMLElement|null}
 */
function getControl(id) {
  return document.getElementById(id);
}

/**
 * @returns {HTMLElement|null}
 */
function getErrorEl(id) {
  return document.getElementById(`${id}-error`);
}

function clearFieldError(id) {
  const control = getControl(id);
  const errorEl = getErrorEl(id);
  if (!control || !errorEl) return;

  control.removeAttribute("aria-invalid");
  control.removeAttribute("aria-describedby");
  errorEl.textContent = "";
  errorEl.hidden = true;
}

function clearAllErrors() {
  for (const id of FIELD_IDS) {
    clearFieldError(id);
  }
}

/**
 * @param {string} id
 * @param {string} message
 */
function showFieldError(id, message) {
  const control = getControl(id);
  const errorEl = getErrorEl(id);
  if (!control || !errorEl) return;

  errorEl.textContent = message;
  errorEl.hidden = false;
  control.setAttribute("aria-invalid", "true");
  control.setAttribute("aria-describedby", `${id}-error`);
}

/**
 * @param {Record<string, string>} errors
 */
function showErrors(errors) {
  clearAllErrors();
  for (const [id, message] of Object.entries(errors)) {
    showFieldError(id, message);
  }
}

function readFormValues() {
  return {
    shopName: getControl("shopName").value,
    contactPhone: getControl("contactPhone").value,
    contactEmail: getControl("contactEmail").value,
    defaultCurrency: getControl("defaultCurrency").value,
    acceptingOrders: getControl("acceptingOrders").checked,
    bio: getControl("bio").value,
  };
}

/**
 * @param {object} settings
 */
function populateForm(settings) {
  getControl("shopName").value = settings.shopName ?? "";
  getControl("contactPhone").value = settings.contactPhone ?? "";
  getControl("contactEmail").value = settings.contactEmail ?? "";
  getControl("defaultCurrency").value = settings.defaultCurrency ?? "KES";
  getControl("acceptingOrders").checked =
    settings.acceptingOrders === undefined ? true : Boolean(settings.acceptingOrders);
  getControl("bio").value = settings.bio ?? "";
}

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      populateForm({
        shopName: "",
        contactPhone: "",
        contactEmail: "",
        defaultCurrency: "KES",
        acceptingOrders: true,
        bio: "",
      });
      return;
    }
    const parsed = JSON.parse(raw);
    populateForm(parsed);
  } catch {
    populateForm({
      shopName: "",
      contactPhone: "",
      contactEmail: "",
      defaultCurrency: "KES",
      acceptingOrders: true,
      bio: "",
    });
  }
}

/**
 * @param {object} values
 */
function persistSettings(values) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function announceSaved() {
  saveStatus.textContent = "";
  // Force re-announcement if saving again
  requestAnimationFrame(() => {
    saveStatus.textContent = "Settings saved";
  });
}

function clearSaveStatus() {
  saveStatus.textContent = "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearSaveStatus();

  const result = validateSettings(readFormValues());

  if (!result.valid) {
    showErrors(result.errors);
    const firstInvalid = FIELD_IDS.find((id) => result.errors[id]);
    if (firstInvalid) {
      getControl(firstInvalid).focus();
    }
    return;
  }

  clearAllErrors();
  persistSettings(result.values);
  populateForm(result.values);
  announceSaved();
});

loadSavedSettings();
