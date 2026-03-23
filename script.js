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

function renderUploadResults(items) {
  if (!cloudinaryUploadResults) return;

  if (!items.length) {
    cloudinaryUploadResults.innerHTML = '<article class="upload-result-empty">Upload a photo and the preview cards will appear here.</article>';
    return;
  }

  cloudinaryUploadResults.innerHTML = items.map((item) => `
    <article class="upload-result-card">
      <img class="upload-result-image" src="${escapeHtml(item.secure_url)}" alt="${escapeHtml(item.original_filename || "Uploaded photo")}">
      <div class="upload-result-copy">
        <span>Uploaded successfully</span>
      </div>
    </article>
  `).join("");
}

function setActiveCloudinaryFolder(folderName = "") {
  if (!cloudinaryActiveFolderLabel) return;
  cloudinaryActiveFolderLabel.textContent = folderName || "darshan-magic/gallery";
}

async function getCloudinaryConfig() {
  const response = await fetch("/api/cloudinary-config", {
    headers: {
      Accept: "application/json"
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.cloudName || !payload.uploadPreset) {
    throw new Error(payload.error || "Missing Cloudinary configuration.");
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
      return;
    }

    cloudinaryExistingFolder.innerHTML = payload.folders
      .map((folder) => `<option value="${escapeHtml(folder)}">${escapeHtml(folder)}</option>`)
      .join("");
  } catch {
    // Keep fallback folder option if listing fails.
  }
}

async function loadCloudinaryFolderImages(folderName) {
  if (!cloudinaryUploadResults) return;

  const normalizedFolder = normalizeCloudinaryFolder(folderName).publicIdPrefix;
  setActiveCloudinaryFolder(normalizedFolder);
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

    renderUploadResults(payload.images);
  } catch (error) {
    cloudinaryUploadResults.innerHTML = `<article class="upload-result-empty">${escapeHtml(error.message || "We could not load this folder right now.")}</article>`;
  }
}

async function uploadSinglePhoto(file, config, folderName) {
  const formData = new FormData();
  const normalizedFolder = normalizeCloudinaryFolder(folderName);
  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);
  formData.append("asset_folder", normalizedFolder.assetFolder);
  formData.append("public_id_prefix", normalizedFolder.publicIdPrefix);
  formData.append("folder", normalizedFolder.publicIdPrefix);

  const trimmedFolder = String(normalizedFolder.publicIdPrefix || "").trim();
  if (trimmedFolder) {
    formData.append("tags", trimmedFolder.toLowerCase().replace(/[^\w/-]+/g, "-"));
  }

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

    if (!files.length) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = "Please select at least one photo.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
      return;
    }

    if (!folderName) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = "Please choose or create a Cloudinary folder.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
      return;
    }

    if (cloudinaryUploadStatus) {
      cloudinaryUploadStatus.textContent = "Uploading photos...";
      cloudinaryUploadStatus.dataset.state = "";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Uploading...";
    }

    try {
      const config = await getCloudinaryConfig();
      const uploaded = [];

      for (const file of files) {
        const result = await uploadSinglePhoto(file, config, folderName);
        uploaded.push(result);
      }

      await loadCloudinaryFolders();
      if (cloudinaryExistingFolder) {
        const matchingOption = Array.from(cloudinaryExistingFolder.options).find((option) => option.value === folderName);
        if (!matchingOption) {
          cloudinaryExistingFolder.innerHTML += `<option value="${escapeHtml(folderName)}">${escapeHtml(folderName)}</option>`;
        }
      }
      cloudinaryUploadForm.reset();
      if (cloudinaryExistingFolder) {
        cloudinaryExistingFolder.value = folderName;
      }
      if (newFolderNameInput) {
        newFolderNameInput.value = "";
      }
      await loadCloudinaryFolderImages(folderName);

      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded successfully to ${folderName}.`;
        cloudinaryUploadStatus.dataset.state = "success";
      }
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

loadCloudinaryFolders().then(() => {
  if (cloudinaryUploadResults) {
    const initialFolder = String(cloudinaryExistingFolder?.value || "darshan-magic/gallery").trim();
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
