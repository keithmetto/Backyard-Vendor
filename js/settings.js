(() => {
  const STORAGE_KEY = "bv-settings";

  const form = document.getElementById("settingsForm");
  const toast = document.getElementById("statusToast");
  const resetBtn = document.getElementById("resetBtn");
  const juaKaliToggle = document.getElementById("juaKaliVerified");
  const verifyPanel = document.getElementById("verifyPanel");
  const badgePreview = document.getElementById("badgePreview");
  const uploadZone = document.getElementById("uploadZone");
  const idDocument = document.getElementById("idDocument");
  const uploadPreview = document.getElementById("uploadPreview");
  const uploadThumb = document.getElementById("uploadThumb");
  const uploadName = document.getElementById("uploadName");

  const defaults = {
    displayName: "",
    phone: "",
    estate: "",
    email: "",
    bio: "",
    nearRadius: "5",
    kadogoMax: "1000",
    notifyPayments: true,
    notifyInterest: true,
    notifyKadogo: false,
    juaKaliVerified: false,
    idDocumentDataUrl: "",
    idDocumentName: "",
  };

  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function clearFieldErrors() {
    form.querySelectorAll(".field.has-error").forEach((field) => {
      field.classList.remove("has-error");
    });
  }

  function setFieldError(name, hasError) {
    const field = form.querySelector(`[data-field="${name}"]`);
    if (field) field.classList.toggle("has-error", hasError);
  }

  function normalizePhone(value) {
    return value.replace(/[\s()-]/g, "");
  }

  function isValidKenyanPhone(value) {
    const phone = normalizePhone(value);
    return /^(?:\+?254|0)?7\d{8}$/.test(phone);
  }

  function isValidEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function readForm() {
    return {
      displayName: form.displayName.value.trim(),
      phone: form.phone.value.trim(),
      estate: form.estate.value,
      email: form.email.value.trim(),
      bio: form.bio.value.trim(),
      nearRadius: form.nearRadius.value,
      kadogoMax: form.kadogoMax.value,
      notifyPayments: form.notifyPayments.checked,
      notifyInterest: form.notifyInterest.checked,
      notifyKadogo: form.notifyKadogo.checked,
      juaKaliVerified: form.juaKaliVerified.checked,
      idDocumentDataUrl: uploadThumb.dataset.src || "",
      idDocumentName: uploadName.textContent || "",
    };
  }

  function writeForm(settings) {
    form.displayName.value = settings.displayName || "";
    form.phone.value = settings.phone || "";
    form.estate.value = settings.estate || "";
    form.email.value = settings.email || "";
    form.bio.value = settings.bio || "";
    form.nearRadius.value = settings.nearRadius || defaults.nearRadius;
    form.kadogoMax.value = settings.kadogoMax || defaults.kadogoMax;
    form.notifyPayments.checked = Boolean(settings.notifyPayments);
    form.notifyInterest.checked = Boolean(settings.notifyInterest);
    form.notifyKadogo.checked = Boolean(settings.notifyKadogo);
    form.juaKaliVerified.checked = Boolean(settings.juaKaliVerified);

    if (settings.idDocumentDataUrl) {
      setDocumentPreview(settings.idDocumentDataUrl, settings.idDocumentName || "Document photo");
    } else {
      clearDocumentPreview();
    }

    syncVerificationUi();
    clearFieldErrors();
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function validate(settings) {
    clearFieldErrors();

    const errors = {
      displayName: !settings.displayName,
      phone: !isValidKenyanPhone(settings.phone),
      estate: !settings.estate,
      email: !isValidEmail(settings.email),
    };

    Object.entries(errors).forEach(([name, hasError]) => setFieldError(name, hasError));

    if (settings.juaKaliVerified && !settings.idDocumentDataUrl) {
      showToast("Add a document photo to enable Jua Kali Verified.");
      return false;
    }

    return !Object.values(errors).some(Boolean);
  }

  function syncVerificationUi() {
    const enabled = juaKaliToggle.checked;
    verifyPanel.hidden = !enabled;
    badgePreview.classList.toggle("is-visible", enabled && Boolean(uploadThumb.dataset.src));
  }

  function setDocumentPreview(dataUrl, name) {
    uploadThumb.src = dataUrl;
    uploadThumb.dataset.src = dataUrl;
    uploadName.textContent = name;
    uploadPreview.classList.add("is-visible");
    uploadZone.hidden = true;
  }

  function clearDocumentPreview() {
    uploadThumb.removeAttribute("src");
    delete uploadThumb.dataset.src;
    uploadName.textContent = "";
    uploadPreview.classList.remove("is-visible");
    uploadZone.hidden = false;
    idDocument.value = "";
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocumentPreview(String(reader.result), file.name);
      syncVerificationUi();
    };
    reader.readAsDataURL(file);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const settings = readForm();
    if (!validate(settings)) return;
    saveSettings(settings);
    showToast("Settings saved.");
  });

  resetBtn.addEventListener("click", () => {
    writeForm(defaults);
    localStorage.removeItem(STORAGE_KEY);
    showToast("Settings reset.");
  });

  juaKaliToggle.addEventListener("change", () => {
    if (!juaKaliToggle.checked) {
      clearDocumentPreview();
    }
    syncVerificationUi();
  });

  idDocument.addEventListener("change", () => {
    const [file] = idDocument.files || [];
    handleFile(file);
  });

  ["dragenter", "dragover"].forEach((type) => {
    uploadZone.addEventListener(type, (event) => {
      event.preventDefault();
      uploadZone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    uploadZone.addEventListener(type, (event) => {
      event.preventDefault();
      uploadZone.classList.remove("is-dragover");
    });
  });

  uploadZone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer?.files || [];
    handleFile(file);
  });

  writeForm(loadSettings());
})();
