const body = document.body;
const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll("[data-reveal]");
let revealObserver = null;

function registerRevealElement(element) {
  if (!element) return;

  if (revealObserver) {
    revealObserver.observe(element);
    return;
  }

  element.classList.add("is-visible");
}

function syncHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealElements.forEach((element) => {
    registerRevealElement(element);
  });
} else {
  revealElements.forEach((element) => registerRevealElement(element));
}

const countElements = document.querySelectorAll(".count-up");

function animateCount(element) {
  if (!element || element.dataset.animated === "true") return;

  const target = Number(element.dataset.count || "0");
  const duration = 1400;
  const startTime = performance.now();
  element.dataset.animated = "true";

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString("en-AU");
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

if ("IntersectionObserver" in window && countElements.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });

  countElements.forEach((element) => {
    countObserver.observe(element);
  });
} else {
  countElements.forEach((element) => animateCount(element));
}

const testimonialTrack = document.getElementById("testimonial-track");
const testimonialGridList = document.getElementById("testimonial-grid-list");
const galleryGrid = document.getElementById("gallery-grid");
const galleryStack = document.getElementById("gallery-stack");
const bookingForm = document.getElementById("booking-form");
const bookingStatus = document.getElementById("booking-status");
const testimonialForm = document.getElementById("testimonial-form");
const testimonialStatus = document.getElementById("testimonial-status");
const cloudinaryUploadForm = document.getElementById("cloudinary-upload-form");
const cloudinaryUploadStatus = document.getElementById("cloudinary-upload-status");
const cloudinaryUploadResults = document.getElementById("cloudinary-upload-results");
const cloudinaryExistingFolder = document.getElementById("cloudinary-existing-folder");
const cloudinaryActiveFolderLabel = document.getElementById("cloudinary-active-folder");
const cloudinaryFolderList = document.getElementById("cloudinary-folder-list");
const cloudinaryFolderChipList = document.getElementById("cloudinary-folder-chip-list");
const cloudinaryFolderSheetList = document.getElementById("cloudinary-folder-sheet-list");
const cloudinaryDeleteSelectedButton = document.getElementById("cloudinary-delete-selected");
const cloudinaryDeleteSelectedMobileButton = document.getElementById("cloudinary-delete-selected-mobile");
const cloudinaryUploadHereButton = document.getElementById("cloudinary-upload-here");
const cloudinaryRefreshFolderButton = document.getElementById("cloudinary-refresh-folder");
const cloudinaryCreateFolderButton = document.getElementById("cloudinary-create-folder");
const cloudinaryExplorerUploadInput = document.getElementById("cloudinary-explorer-upload");
const cloudinaryFolderBreadcrumbs = document.getElementById("cloudinary-folder-breadcrumbs");
const cloudinaryFolderMeta = document.getElementById("cloudinary-folder-meta");
const cloudinaryFolderSearchInput = document.getElementById("cloudinary-folder-search");
const cloudinaryDropzone = document.getElementById("cloudinary-dropzone");
const cloudinarySelectionBar = document.getElementById("cloudinary-selection-bar");
const cloudinarySelectionCount = document.getElementById("cloudinary-selection-count");
const cloudinarySelectAllButton = document.getElementById("cloudinary-select-all");
const cloudinaryClearSelectionButton = document.getElementById("cloudinary-clear-selection");
const cloudinaryUploadModal = document.getElementById("cloudinary-upload-modal");
const cloudinaryOpenUploadModalButtons = [
  document.getElementById("cloudinary-open-upload-modal"),
  document.getElementById("cloudinary-open-upload-panel")
].filter(Boolean);
const cloudinaryCloseUploadModalButton = document.getElementById("cloudinary-close-upload-modal");
const cloudinaryFolderSheet = document.getElementById("cloudinary-folder-sheet");
const cloudinaryOpenFolderSheetButtons = [
  document.getElementById("cloudinary-toggle-folder-sheet"),
  document.getElementById("cloudinary-toggle-folder-sheet-desktop")
].filter(Boolean);
const cloudinaryCloseFolderSheetButton = document.getElementById("cloudinary-close-folder-sheet");
const CLOUDINARY_FOLDER_STORAGE_KEY = "darshans-magic-active-folder";
let availableCloudinaryFolders = [];
let activeCloudinaryFolder = "darshan-magic/gallery";
let selectedCloudinaryPublicIds = new Set();
let cloudinaryFolderFilter = "";

function setupTestimonialLoop() {
  if (!testimonialTrack) return;

  Array.from(testimonialTrack.querySelectorAll('[aria-hidden="true"]')).forEach((clone) => clone.remove());

  const originals = Array.from(testimonialTrack.children);
  if (!originals.length) return;

  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    testimonialTrack.appendChild(clone);
  });

  testimonialTrack.dataset.loopReady = "true";
}

function createTestimonialCard({ customer_name: customerName, testimonial, event_type: eventType, rating }) {
  const article = document.createElement("article");
  article.className = "testimonial-card";

  const content = document.createElement("div");
  content.className = "testimonial-card-content";

  if (rating) {
    const stars = document.createElement("p");
    stars.className = "testimonial-rating";
    stars.textContent = "\u2605".repeat(rating);
    content.appendChild(stars);
  }

  const copy = document.createElement("p");
  copy.className = "testimonial-copy";
  copy.textContent = testimonial;
  content.appendChild(copy);

  const meta = document.createElement("div");
  meta.className = "testimonial-meta";

  const strong = document.createElement("strong");
  strong.textContent = customerName;
  meta.appendChild(strong);

  if (eventType) {
    const span = document.createElement("span");
    span.className = "testimonial-event";
    span.textContent = eventType;
    meta.appendChild(span);
  }

  content.appendChild(meta);
  article.appendChild(content);

  return article;
}

function createEmptyTestimonialCard(message) {
  return createTestimonialCard({
    customer_name: "Darshan's Magic",
    testimonial: message,
    event_type: "",
    rating: null
  });
}

function createGalleryCard(url, alt, isLarge) {
  const figure = document.createElement("figure");
  figure.className = `gallery-card${isLarge ? " gallery-card-large" : ""}`;
  figure.setAttribute("data-reveal", "");

  const image = document.createElement("img");
  image.src = url;
  image.alt = alt;
  figure.appendChild(image);
  registerRevealElement(figure);

  return figure;
}

function createGalleryStackCard(url, alt) {
  const article = document.createElement("article");
  article.className = "gallery-stack-card";

  const image = document.createElement("img");
  image.src = url;
  image.alt = alt;
  article.appendChild(image);

  return article;
}

function createGalleryEmptyState(message) {
  const figure = document.createElement("figure");
  figure.className = "gallery-card gallery-card-empty";
  figure.textContent = message;
  return figure;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyFolderSegment(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9/_ -]+/g, "")
    .replace(/[ _]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\/+|\/+$/g, "");
}

function normalizeCloudinaryFolder(input = "") {
  const rawValue = String(input || "").trim();
  if (!rawValue) {
    return {
      assetFolder: "darshan-magic/gallery",
      publicIdPrefix: "darshan-magic/gallery"
    };
  }

  if (rawValue.includes("/")) {
    const normalizedPath = rawValue
      .split("/")
      .map((segment) => slugifyFolderSegment(segment))
      .filter(Boolean)
      .join("/");

    return {
      assetFolder: normalizedPath || "darshan-magic/gallery",
      publicIdPrefix: normalizedPath || "darshan-magic/gallery"
    };
  }

  const eventSlug = slugifyFolderSegment(rawValue);
  const normalizedEventPath = eventSlug ? `darshan-magic/events/${eventSlug}` : "darshan-magic/gallery";

  return {
    assetFolder: normalizedEventPath,
    publicIdPrefix: normalizedEventPath
  };
}

function updateDeleteSelectedButton() {
  const count = selectedCloudinaryPublicIds.size;
  if (cloudinaryDeleteSelectedButton) {
    cloudinaryDeleteSelectedButton.disabled = count === 0;
    cloudinaryDeleteSelectedButton.textContent = count ? `Delete Selected (${count})` : "Delete Selected";
  }
  if (cloudinaryDeleteSelectedMobileButton) {
    cloudinaryDeleteSelectedMobileButton.disabled = count === 0;
    cloudinaryDeleteSelectedMobileButton.textContent = count ? `Delete (${count})` : "Delete";
  }
  if (cloudinarySelectionBar) {
    cloudinarySelectionBar.hidden = count === 0;
  }
  if (cloudinarySelectionCount) {
    cloudinarySelectionCount.textContent = `${count} selected`;
  }
}

function setCloudinaryFolderMeta(message = "") {
  if (!cloudinaryFolderMeta) return;
  cloudinaryFolderMeta.textContent = message;
}

function renderCloudinaryBreadcrumbs(folderName = "") {
  if (!cloudinaryFolderBreadcrumbs) return;

  const parts = String(folderName || "").split("/").filter(Boolean);
  if (!parts.length) {
    cloudinaryFolderBreadcrumbs.innerHTML = "";
    return;
  }

  let currentPath = "";
  cloudinaryFolderBreadcrumbs.innerHTML = parts.map((part) => {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    return `<button class="upload-breadcrumb" type="button" data-folder="${escapeHtml(currentPath)}">${escapeHtml(part)}</button>`;
  }).join('<span class="upload-breadcrumb-sep">/</span>');

  Array.from(cloudinaryFolderBreadcrumbs.querySelectorAll("[data-folder]")).forEach((button) => {
    button.addEventListener("click", () => {
      const folder = String(button.getAttribute("data-folder") || "").trim();
      if (folder) {
        loadCloudinaryFolderImages(folder);
      }
    });
  });
}

function openCloudinaryFolderSheet() {
  if (!cloudinaryFolderSheet) return;
  cloudinaryFolderSheet.hidden = false;
  body.classList.add("folder-sheet-open");
}

function closeCloudinaryFolderSheet() {
  if (!cloudinaryFolderSheet) return;
  cloudinaryFolderSheet.hidden = true;
  body.classList.remove("folder-sheet-open");
}

function syncCloudinaryFolderInputs(folderName = "") {
  if (cloudinaryExistingFolder) {
    const matchingOption = Array.from(cloudinaryExistingFolder.options).find((option) => option.value === folderName);
    if (matchingOption) {
      cloudinaryExistingFolder.value = folderName;
    }
  }

  renderCloudinaryBreadcrumbs(folderName);
}

function renderUploadResults(items) {
  if (!cloudinaryUploadResults) return;
  selectedCloudinaryPublicIds = new Set();
  updateDeleteSelectedButton();

  if (!items.length) {
    cloudinaryUploadResults.innerHTML = '<article class="upload-result-empty">This folder is empty. Upload photos into it or choose another folder.</article>';
    return;
  }

  cloudinaryUploadResults.innerHTML = items.map((item) => `
    <article class="upload-result-card" data-public-id="${escapeHtml(item.public_id || "")}">
      <label class="upload-result-select">
        <input class="upload-result-checkbox" type="checkbox" value="${escapeHtml(item.public_id || "")}">
        <span>Select</span>
      </label>
      <img class="upload-result-image" src="${escapeHtml(item.secure_url)}" alt="${escapeHtml(item.original_filename || "Uploaded photo")}">
      <div class="upload-result-copy">
        <span>${escapeHtml(String(item.public_id || "").split("/").pop() || "Uploaded photo")}</span>
      </div>
    </article>
  `).join("");

  Array.from(cloudinaryUploadResults.querySelectorAll(".upload-result-checkbox")).forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const publicId = String(checkbox.value || "").trim();
      const card = checkbox.closest(".upload-result-card");
      if (checkbox.checked) {
        selectedCloudinaryPublicIds.add(publicId);
        card?.setAttribute("data-selected", "true");
      } else {
        selectedCloudinaryPublicIds.delete(publicId);
        card?.removeAttribute("data-selected");
      }
      updateDeleteSelectedButton();
    });
  });
}

function updatePhotoSelectionDom() {
  if (!cloudinaryUploadResults) return;

  Array.from(cloudinaryUploadResults.querySelectorAll(".upload-result-card")).forEach((card) => {
    const publicId = String(card.getAttribute("data-public-id") || "").trim();
    const checkbox = card.querySelector(".upload-result-checkbox");
    const isSelected = selectedCloudinaryPublicIds.has(publicId);

    if (checkbox) {
      checkbox.checked = isSelected;
    }

    if (isSelected) {
      card.setAttribute("data-selected", "true");
    } else {
      card.removeAttribute("data-selected");
    }
  });

  updateDeleteSelectedButton();
}

function setActiveCloudinaryFolder(folderName = "") {
  activeCloudinaryFolder = folderName || "darshan-magic/gallery";

  if (cloudinaryActiveFolderLabel) {
    cloudinaryActiveFolderLabel.textContent = activeCloudinaryFolder;
  }

  syncCloudinaryFolderInputs(activeCloudinaryFolder);
}

function saveActiveCloudinaryFolder(folderName = "") {
  if (!folderName || typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(CLOUDINARY_FOLDER_STORAGE_KEY, folderName);
}

function getSavedCloudinaryFolder() {
  if (typeof window === "undefined" || !window.localStorage) return "";
  return String(window.localStorage.getItem(CLOUDINARY_FOLDER_STORAGE_KEY) || "").trim();
}

function openCloudinaryUploadModal() {
  if (!cloudinaryUploadModal) return;
  cloudinaryUploadModal.hidden = false;
  body.classList.add("upload-modal-open");
  if (cloudinaryExistingFolder) {
    cloudinaryExistingFolder.value = activeCloudinaryFolder;
  }
}

function closeCloudinaryUploadModal() {
  if (!cloudinaryUploadModal) return;
  cloudinaryUploadModal.hidden = true;
  body.classList.remove("upload-modal-open");
}

function renderCloudinaryFolderList(folders = []) {
  const normalizedFilter = cloudinaryFolderFilter.trim().toLowerCase();
  const visibleFolders = normalizedFilter
    ? folders.filter((folder) => folder.toLowerCase().includes(normalizedFilter))
    : folders;

  const listMarkup = visibleFolders.length
    ? visibleFolders.map((folder) => `
      <button class="upload-folder-item${folder === activeCloudinaryFolder ? " is-active" : ""}" type="button" data-folder="${escapeHtml(folder)}">
        <span class="upload-folder-icon">Folder</span>
        <span class="upload-folder-name">${escapeHtml(folder)}</span>
      </button>
    `).join("")
    : '<article class="upload-result-empty">No matching folders.</article>';

  const chipMarkup = visibleFolders.length
    ? visibleFolders.map((folder) => `
      <button class="admin-folder-chip${folder === activeCloudinaryFolder ? " is-active" : ""}" type="button" data-folder="${escapeHtml(folder)}">
        ${escapeHtml(folder.split("/").pop() || folder)}
      </button>
    `).join("")
    : '<article class="upload-result-empty">No matching folders.</article>';

  [cloudinaryFolderList, cloudinaryFolderSheetList].forEach((container) => {
    if (container) {
      container.innerHTML = listMarkup;
    }
  });

  if (cloudinaryFolderChipList) {
    cloudinaryFolderChipList.innerHTML = chipMarkup;
  }

  const bindFolderButtons = (root) => {
    if (!root) return;
    Array.from(root.querySelectorAll("[data-folder]")).forEach((button) => {
      button.addEventListener("click", () => {
        const folder = String(button.getAttribute("data-folder") || "").trim();
        if (folder) {
          loadCloudinaryFolderImages(folder);
          closeCloudinaryFolderSheet();
        }
      });
    });
  };

  bindFolderButtons(cloudinaryFolderList);
  bindFolderButtons(cloudinaryFolderSheetList);
  bindFolderButtons(cloudinaryFolderChipList);
}

function ensureCloudinaryFolderAvailable(folderName = "") {
  const normalizedFolder = normalizeCloudinaryFolder(folderName).publicIdPrefix;
  if (!normalizedFolder) return "";

  const nextFolders = Array.from(new Set([...availableCloudinaryFolders, normalizedFolder])).sort((a, b) => a.localeCompare(b));
  availableCloudinaryFolders = nextFolders;

  if (cloudinaryExistingFolder && !Array.from(cloudinaryExistingFolder.options).some((option) => option.value === normalizedFolder)) {
    cloudinaryExistingFolder.innerHTML += `<option value="${escapeHtml(normalizedFolder)}">${escapeHtml(normalizedFolder)}</option>`;
  }

  renderCloudinaryFolderList(availableCloudinaryFolders);
  return normalizedFolder;
}

function setFolderSearchValue(value = "") {
  cloudinaryFolderFilter = String(value || "");
  if (cloudinaryFolderSearchInput && cloudinaryFolderSearchInput.value !== cloudinaryFolderFilter) {
    cloudinaryFolderSearchInput.value = cloudinaryFolderFilter;
  }
  renderCloudinaryFolderList(availableCloudinaryFolders);
}

async function getCloudinaryConfig() {
  const response = await fetch("/api/cloudinary-config", {
    headers: {
      Accept: "application/json"
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.cloudName || !payload.apiKey) {
    throw new Error(payload.error || "Missing Cloudinary configuration.");
  }

  return payload;
}

async function getCloudinaryUploadSignature(folderName) {
  const normalizedFolder = normalizeCloudinaryFolder(folderName).publicIdPrefix;
  const response = await fetch("/api/cloudinary-sign-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ folderName: normalizedFolder })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.signature || !payload.timestamp || !payload.apiKey || !payload.cloudName) {
    throw new Error(payload.error || "Missing Cloudinary upload signature.");
  }

  return payload;
}

async function loadCloudinaryFolders() {
  if (!cloudinaryExistingFolder) return;

  try {
    const response = await fetch("/api/cloudinary-folders", {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !Array.isArray(payload.folders) || !payload.folders.length) {
      availableCloudinaryFolders = Array.from(cloudinaryExistingFolder.options).map((option) => option.value).filter(Boolean);
      renderCloudinaryFolderList(availableCloudinaryFolders);
      return;
    }

    availableCloudinaryFolders = payload.folders;
    cloudinaryExistingFolder.innerHTML = payload.folders
      .map((folder) => `<option value="${escapeHtml(folder)}">${escapeHtml(folder)}</option>`)
      .join("");
    renderCloudinaryFolderList(availableCloudinaryFolders);
  } catch {
    // Keep fallback folder option if listing fails.
    availableCloudinaryFolders = Array.from(cloudinaryExistingFolder.options).map((option) => option.value);
    renderCloudinaryFolderList(availableCloudinaryFolders);
  }
}

async function loadCloudinaryFolderImages(folderName) {
  if (!cloudinaryUploadResults) return;

  const normalizedFolder = normalizeCloudinaryFolder(folderName).publicIdPrefix;
  setActiveCloudinaryFolder(normalizedFolder);
  saveActiveCloudinaryFolder(normalizedFolder);
  setCloudinaryFolderMeta("Loading folder contents...");
  renderCloudinaryFolderList(availableCloudinaryFolders);
  cloudinaryUploadResults.innerHTML = '<article class="upload-result-empty">Loading folder photos...</article>';

  try {
    const response = await fetch(`/api/cloudinary-folder-images?folder=${encodeURIComponent(normalizedFolder)}`, {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !Array.isArray(payload.images)) {
      throw new Error(payload.error || "We could not load this folder right now.");
    }

    setCloudinaryFolderMeta(`${payload.images.length} photo${payload.images.length === 1 ? "" : "s"} in this folder.`);
    renderUploadResults(payload.images);
    updatePhotoSelectionDom();
  } catch (error) {
    setCloudinaryFolderMeta("We could not load this folder right now.");
    cloudinaryUploadResults.innerHTML = `<article class="upload-result-empty">${escapeHtml(error.message || "We could not load this folder right now.")}</article>`;
  }
}

async function deleteSelectedCloudinaryImages() {
  const publicIds = Array.from(selectedCloudinaryPublicIds);
  if (!publicIds.length) return;

  const response = await fetch("/api/cloudinary-delete-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ publicIds })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "We could not delete the selected photos.");
  }

  return payload;
}

async function handleDeleteSelectedPhotos() {
  if (!selectedCloudinaryPublicIds.size) return;

  const confirmed = typeof window !== "undefined" && window.confirm
    ? window.confirm(`Delete ${selectedCloudinaryPublicIds.size} selected photo${selectedCloudinaryPublicIds.size === 1 ? "" : "s"} from ${activeCloudinaryFolder}?`)
    : true;

  if (!confirmed) return;

  const desktopLabel = cloudinaryDeleteSelectedButton ? cloudinaryDeleteSelectedButton.textContent : "";
  const mobileLabel = cloudinaryDeleteSelectedMobileButton ? cloudinaryDeleteSelectedMobileButton.textContent : "";

  if (cloudinaryDeleteSelectedButton) {
    cloudinaryDeleteSelectedButton.disabled = true;
    cloudinaryDeleteSelectedButton.textContent = "Deleting...";
  }
  if (cloudinaryDeleteSelectedMobileButton) {
    cloudinaryDeleteSelectedMobileButton.disabled = true;
    cloudinaryDeleteSelectedMobileButton.textContent = "Deleting...";
  }

  try {
    await deleteSelectedCloudinaryImages();
    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = "Selected photos deleted successfully.";
      cloudinaryUploadStatus.dataset.state = "success";
    }
    selectedCloudinaryPublicIds = new Set();
    await loadCloudinaryFolderImages(activeCloudinaryFolder);
    await loadCloudinaryFolders();
  } catch (error) {
    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = error.message || "We could not delete the selected photos.";
      cloudinaryUploadStatus.dataset.state = "error";
    }
  } finally {
    if (cloudinaryDeleteSelectedButton) {
      cloudinaryDeleteSelectedButton.textContent = desktopLabel || "Delete Selected";
    }
    if (cloudinaryDeleteSelectedMobileButton) {
      cloudinaryDeleteSelectedMobileButton.textContent = mobileLabel || "Delete";
    }
    updateDeleteSelectedButton();
  }
}

async function uploadSinglePhoto(file, config, folderName) {
  const formData = new FormData();
  const signaturePayload = await getCloudinaryUploadSignature(folderName);
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(signaturePayload.timestamp));
  formData.append("signature", signaturePayload.signature);
  formData.append("asset_folder", signaturePayload.assetFolder);
  formData.append("public_id_prefix", signaturePayload.publicIdPrefix);
  formData.append("tags", signaturePayload.tags);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || "Upload failed.");
  }

  return payload;
}

async function performCloudinaryUpload(files, folderName, options = {}) {
  const uploadFiles = Array.from(files || []);
  const normalizedFolder = ensureCloudinaryFolderAvailable(folderName);

  if (!uploadFiles.length) {
    throw new Error("Please select at least one photo.");
  }

  if (!normalizedFolder) {
    throw new Error("Please choose or create a Cloudinary folder.");
  }

  const config = await getCloudinaryConfig();
  const uploaded = [];

  for (const file of uploadFiles) {
    const result = await uploadSinglePhoto(file, config, normalizedFolder);
    uploaded.push(result);
  }

  await loadCloudinaryFolders();
  if (options.resetForm && cloudinaryUploadForm) {
    cloudinaryUploadForm.reset();
  }
  if (cloudinaryExistingFolder) {
    cloudinaryExistingFolder.value = normalizedFolder;
  }
  await loadCloudinaryFolderImages(normalizedFolder);

  return {
    uploaded,
    folderName: normalizedFolder
  };
}

async function loadTestimonials() {
  if (!testimonialTrack && !testimonialGridList) return;

  try {
    const endpoint = testimonialGridList ? "/api/testimonials?all=true" : "/api/testimonials?limit=12";
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !Array.isArray(payload.testimonials) || !payload.testimonials.length) {
      if (testimonialTrack) {
        testimonialTrack.innerHTML = "";
        testimonialTrack.appendChild(createEmptyTestimonialCard("Approved customer reviews will appear here soon."));
      }
      if (testimonialGridList) {
        testimonialGridList.innerHTML = "";
        testimonialGridList.appendChild(createEmptyTestimonialCard("Approved customer reviews will appear here soon."));
      }
      return;
    }

    if (testimonialTrack) {
      testimonialTrack.innerHTML = "";
      payload.testimonials.forEach((item) => {
        testimonialTrack.appendChild(createTestimonialCard(item));
      });
      setupTestimonialLoop();
    }

    if (testimonialGridList) {
      testimonialGridList.innerHTML = "";
      payload.testimonials.forEach((item) => {
        testimonialGridList.appendChild(createTestimonialCard(item));
      });
    }
  } catch {
    if (testimonialTrack) {
      testimonialTrack.innerHTML = "";
      testimonialTrack.appendChild(createEmptyTestimonialCard("We could not load testimonials right now. Please check back shortly."));
    }
    if (testimonialGridList) {
      testimonialGridList.innerHTML = "";
      testimonialGridList.appendChild(createEmptyTestimonialCard("We could not load testimonials right now. Please check back shortly."));
    }
  }
}

async function loadGalleryImages() {
  if (!galleryGrid && !galleryStack) return;

  try {
    const response = await fetch("/api/gallery-images", {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !Array.isArray(payload.images) || !payload.images.length) {
      if (galleryGrid) {
        galleryGrid.innerHTML = "";
        galleryGrid.appendChild(createGalleryEmptyState("Upload photos in Cloudinary and they will appear here."));
      }
      return;
    }

    const sourceItems = payload.images.slice(0, 6).map((item, index) => ({
      url: item.secure_url,
      alt: `Darshan's Magic performance photo ${index + 1}`
    }));
    const items = [];

    while (items.length < 6 && sourceItems.length) {
      sourceItems.forEach((item) => {
        if (items.length < 6) {
          items.push(item);
        }
      });
    }

    if (galleryGrid) {
      galleryGrid.innerHTML = "";
      items.forEach((item, index) => {
        galleryGrid.appendChild(createGalleryCard(item.url, item.alt, index === 0));
      });
    }

    if (galleryStack) {
      galleryStack.innerHTML = "";
      items.forEach((item) => {
        galleryStack.appendChild(createGalleryStackCard(item.url, item.alt));
      });
    }
  } catch {
    if (galleryGrid) {
      galleryGrid.innerHTML = "";
      galleryGrid.appendChild(createGalleryEmptyState("We could not load Cloudinary photos right now."));
    }
  }
}

if (galleryStack) {
  let stackCards = Array.from(galleryStack.children);
  let autoCycle;
  let touchStartX = 0;
  let touchStartY = 0;

  function randomRotation(index) {
    const preset = [0, -3.5, 2.8, -2, 1.5];
    return preset[index] ?? 0;
  }

  function renderGalleryStack() {
    stackCards = Array.from(galleryStack.children);
    stackCards.forEach((card, index) => {
      const depth = Math.min(index, 3);
      const rotation = randomRotation(index);
      const scale = 1 - depth * 0.04;
      const offsetY = depth * 10;
      const opacity = 1 - depth * 0.14;
      card.style.zIndex = String(100 - index);
      card.style.opacity = String(Math.max(opacity, 0));
      card.style.filter = depth === 0 ? "none" : "saturate(0.92)";
      card.style.transform = `translateY(${offsetY}px) scale(${scale}) rotate(${rotation}deg)`;
      card.dataset.active = index === 0 ? "true" : "false";
    });
  }

  function cycleGalleryStack() {
    if (stackCards.length < 2) return;
    const [first, ...rest] = stackCards;
    stackCards = [...rest, first];
    renderGalleryStack();
  }

  function startGalleryAutoplay() {
    clearInterval(autoCycle);
    autoCycle = setInterval(() => {
      if (window.innerWidth <= 640 && stackCards.length > 1) {
        cycleGalleryStack();
      }
    }, 3200);
  }

  galleryStack.addEventListener("click", (event) => {
    const topCard = stackCards[0];
    if (topCard && topCard.contains(event.target)) {
      cycleGalleryStack();
      startGalleryAutoplay();
    }
  });

  galleryStack.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  galleryStack.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > 45 || Math.abs(deltaY) > 45) {
      cycleGalleryStack();
      startGalleryAutoplay();
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    renderGalleryStack();
    startGalleryAutoplay();
  });

  renderGalleryStack();
  startGalleryAutoplay();
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalButtonLabel = submitButton ? submitButton.textContent : "";
    const formData = new FormData(bookingForm);

    if (bookingStatus) {
      bookingStatus.textContent = "Sending your enquiry...";
      bookingStatus.dataset.state = "";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong.");
      }

      bookingForm.reset();
      window.location.href = "thank-you.html";
    } catch (error) {
      if (bookingStatus) {
        bookingStatus.textContent = error.message || "We could not send your enquiry right now. Please try again.";
        bookingStatus.dataset.state = "error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonLabel;
      }
    }
  });
}

if (testimonialForm) {
  testimonialForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = testimonialForm.querySelector('button[type="submit"]');
    const originalButtonLabel = submitButton ? submitButton.textContent : "";
    const formData = new FormData(testimonialForm);

    if (testimonialStatus) {
      testimonialStatus.textContent = "Sending your testimonial...";
      testimonialStatus.dataset.state = "";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(testimonialForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong.");
      }

      testimonialForm.reset();
      window.location.href = "testimonial-thank-you.html";
    } catch (error) {
      if (testimonialStatus) {
        testimonialStatus.textContent = error.message || "We could not send your testimonial right now. Please try again.";
        testimonialStatus.dataset.state = "error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonLabel;
      }
    }
  });
}

if (cloudinaryUploadForm) {
  cloudinaryUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = cloudinaryUploadForm.querySelector('button[type="submit"]');
    const originalButtonLabel = submitButton ? submitButton.textContent : "";
    const fileInput = cloudinaryUploadForm.querySelector('input[type="file"]');
    const newFolderNameInput = cloudinaryUploadForm.querySelector('input[name="newFolderName"]');
    const files = Array.from(fileInput?.files || []);
    const requestedFolderName = String(newFolderNameInput?.value || "").trim() || String(cloudinaryExistingFolder?.value || "").trim();
    const normalizedFolder = normalizeCloudinaryFolder(requestedFolderName);
    const folderName = normalizedFolder.publicIdPrefix;

    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = "Uploading photos...";
      cloudinaryUploadStatus.dataset.state = "";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Uploading...";
    }

    try {
      const result = await performCloudinaryUpload(files, folderName, { resetForm: true });
      if (newFolderNameInput) {
        newFolderNameInput.value = "";
      }

      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = `${result.uploaded.length} photo${result.uploaded.length === 1 ? "" : "s"} uploaded successfully to ${result.folderName}.`;
        cloudinaryUploadStatus.dataset.state = "success";
      }
      closeCloudinaryUploadModal();
    } catch (error) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = error.message || "We could not upload your photos right now.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonLabel;
      }
    }
  });
}

if (cloudinaryExistingFolder) {
  cloudinaryExistingFolder.addEventListener("change", () => {
    const selectedFolder = String(cloudinaryExistingFolder.value || "").trim();
    if (selectedFolder) {
      loadCloudinaryFolderImages(selectedFolder);
    }
  });
}

if (cloudinaryUploadHereButton && cloudinaryExplorerUploadInput) {
  cloudinaryUploadHereButton.addEventListener("click", () => {
    openCloudinaryUploadModal();
  });
}

if (cloudinaryExplorerUploadInput) {
  cloudinaryExplorerUploadInput.addEventListener("change", async () => {
    const files = Array.from(cloudinaryExplorerUploadInput.files || []);
    if (!files.length) return;

    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = `Uploading photos to ${activeCloudinaryFolder}...`;
      cloudinaryUploadStatus.dataset.state = "";
    }

    if (cloudinaryUploadHereButton) {
      cloudinaryUploadHereButton.disabled = true;
      cloudinaryUploadHereButton.textContent = "Uploading...";
    }

    try {
      const result = await performCloudinaryUpload(files, activeCloudinaryFolder);
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = `${result.uploaded.length} photo${result.uploaded.length === 1 ? "" : "s"} uploaded successfully to ${result.folderName}.`;
        cloudinaryUploadStatus.dataset.state = "success";
      }
    } catch (error) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = error.message || "We could not upload your photos right now.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
    } finally {
      cloudinaryExplorerUploadInput.value = "";
      if (cloudinaryUploadHereButton) {
        cloudinaryUploadHereButton.disabled = false;
        cloudinaryUploadHereButton.textContent = "Upload Here";
      }
    }
  });
}

cloudinaryOpenUploadModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openCloudinaryUploadModal();
  });
});

cloudinaryOpenFolderSheetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openCloudinaryFolderSheet();
  });
});

if (cloudinaryCloseUploadModalButton) {
  cloudinaryCloseUploadModalButton.addEventListener("click", () => {
    closeCloudinaryUploadModal();
  });
}

if (cloudinaryCloseFolderSheetButton) {
  cloudinaryCloseFolderSheetButton.addEventListener("click", () => {
    closeCloudinaryFolderSheet();
  });
}

if (cloudinaryUploadModal) {
  Array.from(cloudinaryUploadModal.querySelectorAll("[data-close-upload-modal]")).forEach((element) => {
    element.addEventListener("click", () => {
      closeCloudinaryUploadModal();
    });
  });
}

if (cloudinaryFolderSheet) {
  Array.from(cloudinaryFolderSheet.querySelectorAll("[data-close-folder-sheet]")).forEach((element) => {
    element.addEventListener("click", () => {
      closeCloudinaryFolderSheet();
    });
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cloudinaryUploadModal && !cloudinaryUploadModal.hidden) {
    closeCloudinaryUploadModal();
  }
  if (event.key === "Escape" && cloudinaryFolderSheet && !cloudinaryFolderSheet.hidden) {
    closeCloudinaryFolderSheet();
  }
});

if (cloudinaryRefreshFolderButton) {
  cloudinaryRefreshFolderButton.addEventListener("click", async () => {
    setCloudinaryFolderMeta("Refreshing folder...");
    try {
      await loadCloudinaryFolders();
      await loadCloudinaryFolderImages(activeCloudinaryFolder);
    } catch (error) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = error.message || "We could not refresh this folder right now.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
    }
  });
}

if (cloudinaryCreateFolderButton) {
  cloudinaryCreateFolderButton.addEventListener("click", () => {
    const folderName = typeof window !== "undefined" && window.prompt
      ? window.prompt("Create a new folder. Enter a name like Birthday Party or a full path.")
      : "";

    const normalizedFolder = ensureCloudinaryFolderAvailable(folderName || "");
    if (!normalizedFolder) return;

    loadCloudinaryFolderImages(normalizedFolder);
    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = `Folder ready: ${normalizedFolder}. Use Upload Here to add photos.`;
      cloudinaryUploadStatus.dataset.state = "success";
    }
  });
}

if (cloudinaryDeleteSelectedButton) {
  cloudinaryDeleteSelectedButton.addEventListener("click", async () => {
    await handleDeleteSelectedPhotos();
  });
}

if (cloudinaryDeleteSelectedMobileButton) {
  cloudinaryDeleteSelectedMobileButton.addEventListener("click", async () => {
    await handleDeleteSelectedPhotos();
  });
}

if (cloudinarySelectAllButton) {
  cloudinarySelectAllButton.addEventListener("click", () => {
    Array.from(cloudinaryUploadResults?.querySelectorAll(".upload-result-card[data-public-id]") || []).forEach((card) => {
      const publicId = String(card.getAttribute("data-public-id") || "").trim();
      if (publicId) {
        selectedCloudinaryPublicIds.add(publicId);
      }
    });
    updatePhotoSelectionDom();
  });
}

if (cloudinaryClearSelectionButton) {
  cloudinaryClearSelectionButton.addEventListener("click", () => {
    selectedCloudinaryPublicIds = new Set();
    updatePhotoSelectionDom();
  });
}

if (cloudinaryFolderSearchInput) {
  cloudinaryFolderSearchInput.addEventListener("input", (event) => {
    setFolderSearchValue(event.target.value || "");
  });
}

if (cloudinaryDropzone && cloudinaryExplorerUploadInput) {
  cloudinaryDropzone.addEventListener("click", () => {
    cloudinaryExplorerUploadInput.click();
  });

  cloudinaryDropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cloudinaryExplorerUploadInput.click();
    }
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    cloudinaryDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      cloudinaryDropzone.setAttribute("data-dragging", "true");
    });
  });

  ["dragleave", "dragend", "drop"].forEach((eventName) => {
    cloudinaryDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      if (eventName !== "drop") {
        cloudinaryDropzone.removeAttribute("data-dragging");
      }
    });
  });

  cloudinaryDropzone.addEventListener("drop", async (event) => {
    cloudinaryDropzone.removeAttribute("data-dragging");
    const files = Array.from(event.dataTransfer?.files || []).filter((file) => String(file.type || "").startsWith("image/"));
    if (!files.length) return;

    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = `Uploading photos to ${activeCloudinaryFolder}...`;
      cloudinaryUploadStatus.dataset.state = "";
    }

    try {
      const result = await performCloudinaryUpload(files, activeCloudinaryFolder);
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = `${result.uploaded.length} photo${result.uploaded.length === 1 ? "" : "s"} uploaded successfully to ${result.folderName}.`;
        cloudinaryUploadStatus.dataset.state = "success";
      }
    } catch (error) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = error.message || "We could not upload your photos right now.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
    }
  });
}

loadCloudinaryFolders().then(() => {
  if (cloudinaryUploadResults) {
    const savedFolder = getSavedCloudinaryFolder();
    if (cloudinaryExistingFolder && savedFolder) {
      const matchingOption = Array.from(cloudinaryExistingFolder.options).find((option) => option.value === savedFolder);
      if (matchingOption) {
        cloudinaryExistingFolder.value = savedFolder;
      }
    }

    const initialFolder = String(cloudinaryExistingFolder?.value || savedFolder || "darshan-magic/gallery").trim();
    loadCloudinaryFolderImages(initialFolder);
  }
});
loadGalleryImages().then(() => {
  if (galleryStack) {
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }
});

loadTestimonials();
