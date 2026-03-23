const body = document.body;
const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll("[data-reveal]");

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
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

async function uploadSinglePhoto(file, config, folderName) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);
  formData.append("folder", folderName || "darshan-magic");

  const trimmedFolder = String(folderName || "").trim();
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
      return;
    }

    const items = payload.images.slice(0, 5).map((item, index) => ({
      url: item.secure_url,
      alt: `Darshan's Magic performance photo ${index + 1}`
    }));

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
    // Keep the gallery empty if Cloudinary images cannot be loaded.
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
    const folderNameInput = cloudinaryUploadForm.querySelector('input[name="folderName"]');
    const files = Array.from(fileInput?.files || []);
    const folderName = String(folderNameInput?.value || "").trim();

    if (!files.length) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = "Please select at least one photo.";
        cloudinaryUploadStatus.dataset.state = "error";
      }
      return;
    }

    if (!folderName) {
      if (cloudinaryUploadStatus) {
        cloudinaryUploadStatus.textContent = "Please enter a Cloudinary folder.";
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

      renderUploadResults(uploaded);
      cloudinaryUploadForm.reset();
      if (folderNameInput) {
        folderNameInput.value = "darshan-magic/gallery";
      }

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

loadGalleryImages().then(() => {
  if (galleryStack) {
    const resizeEvent = new Event("resize");
    window.dispatchEvent(resizeEvent);
  }
});

loadTestimonials();
