/* ==========================================================================
   SANJU MARBLE — JAVASCRIPT CONTROLLER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const header = document.getElementById("header");
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const desktopNavLinks = document.querySelectorAll(".desktop-nav .nav-link");
  
  // Catalogue Elements
  const catalogueGrid = document.getElementById("catalogueGrid");
  const searchInput = document.getElementById("catalogueSearch");
  const clearSearchBtn = document.getElementById("clearSearch");
  const sortSelect = document.getElementById("catalogueSort");
  const categoryPills = document.querySelectorAll(".cat-pill");
  const totalBadge = document.getElementById("totalBadge");
  
  // Modal Elements
  const modal = document.getElementById("productModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalPrice = document.getElementById("modalPrice");
  const modalDesc = document.getElementById("modalDesc");
  const modalDetails = document.getElementById("modalDetails");
  const modalWhatsAppBtn = document.getElementById("modalWhatsAppBtn");

  // State
  let products = [];
  let currentCategory = "All";
  let searchQuery = "";
  let currentSort = "default";

  /* --------------------------------------------------------------------------
     1. Navigation & Header Scroll State
     -------------------------------------------------------------------------- */
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    updateActiveNavLink();
  });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });
  });

  // Highlight active nav item on scroll
  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id], footer[id]");
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        desktopNavLinks.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. Load & Render Product Catalogue
     -------------------------------------------------------------------------- */
  fetch("products.json")
    .then(res => {
      if (!res.ok) throw new Error("Could not load products.json");
      return res.json();
    })
    .then(data => {
      products = data;
      if (totalBadge) totalBadge.textContent = products.length;
      renderCatalogue();
    })
    .catch(err => {
      console.error(err);
      if (catalogueGrid) {
        catalogueGrid.innerHTML = `
          <div class="no-results">
            <p>Error loading product catalogue. Please refresh or contact us directly on WhatsApp.</p>
          </div>
        `;
      }
    });

  // Parse numerical price from string like "₹2.25 Lakh" or "₹1,500"
  function parsePrice(str) {
    if (!str) return 0;
    if (str.includes("Lakh")) {
      const num = parseFloat(str.replace(/[^\d.]/g, "")) || 0;
      return num * 100000;
    }
    return parseFloat(str.replace(/[^\d.]/g, "")) || 0;
  }

  // Filter & Sort Logic
  function getFilteredProducts() {
    let list = products.filter(item => {
      const matchesCategory = (currentCategory === "All" || item.category === currentCategory);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
      return matchesCategory && matchesSearch;
    });

    if (currentSort === "low") {
      list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (currentSort === "high") {
      list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (currentSort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  // Render product cards
  function renderCatalogue() {
    if (!catalogueGrid) return;
    const items = getFilteredProducts();

    if (items.length === 0) {
      catalogueGrid.innerHTML = `
        <div class="no-results">
          <h3>No matching marble pieces found</h3>
          <p>Try refining your search keyword or clearing filters.</p>
        </div>
      `;
      return;
    }

    catalogueGrid.innerHTML = items.map(product => {
      const index = products.indexOf(product);
      const waMsg = encodeURIComponent(
        `Hello Sanju Marble, I am interested in ${product.name} (${product.price}). Please share specifications and custom size options.`
      );

      return `
        <article class="product-item-card" data-index="${index}">
          <div class="product-thumb">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
            <span class="product-tag">${escapeHtml(product.tag || product.category)}</span>
          </div>
          <div class="product-body">
            <span class="product-cat">${escapeHtml(product.category)}</span>
            <h3 class="product-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
            <div class="product-price">${escapeHtml(product.price)}</div>
            <div class="product-actions-bar">
              <button class="btn-details" data-action="view" data-index="${index}">View Specs</button>
              <a href="https://wa.me/919828861238?text=${waMsg}" target="_blank" class="btn-wa-quick" title="Enquire on WhatsApp" aria-label="WhatsApp enquiry">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.09 7.4 8.87 7.65C8.65 7.89 8.02 8.48 8.02 9.69C8.02 10.9 8.9 12.06 9.02 12.22C9.15 12.39 10.74 14.85 13.18 15.9C13.76 16.15 14.21 16.3 14.57 16.41C15.15 16.6 15.68 16.57 16.1 16.51C16.57 16.44 17.54 15.92 17.74 15.35C17.94 14.78 17.94 14.29 17.88 14.19C17.82 14.09 17.65 14.03 17.4 13.91C17.15 13.79 15.92 13.18 15.69 13.1C15.46 13.02 15.29 12.98 15.12 13.23C14.95 13.48 14.47 14.05 14.33 14.21C14.19 14.37 14.05 14.39 13.8 14.27C13.55 14.15 12.75 13.89 11.8 13.04C11.06 12.38 10.56 11.57 10.42 11.32C10.28 11.07 10.4 10.94 10.53 10.81C10.64 10.7 10.78 10.52 10.9 10.38C11.02 10.24 11.06 10.14 11.14 9.98C11.22 9.82 11.18 9.68 11.12 9.56C11.06 9.44 10.58 8.27 10.38 7.79C10.18 7.32 9.98 7.38 9.83 7.37C9.69 7.36 9.53 7.34 9.53 7.34Z"/></svg>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Attach card click handlers
    document.querySelectorAll(".product-item-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-wa-quick")) return; // Don't trigger modal if WhatsApp icon clicked
        const idx = parseInt(card.dataset.index, 10);
        openModal(products[idx]);
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. Filters & Search Handlers
     -------------------------------------------------------------------------- */
  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      categoryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.cat;
      renderCatalogue();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? "block" : "none";
      }
      renderCatalogue();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.style.display = "none";
      renderCatalogue();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderCatalogue();
    });
  }

  /* --------------------------------------------------------------------------
     4. Product Detail Modal
     -------------------------------------------------------------------------- */
  function openModal(item) {
    if (!item || !modal) return;
    
    modalImg.src = item.image;
    modalImg.alt = item.name;
    modalTitle.textContent = item.name;
    modalCategory.textContent = item.category;
    modalPrice.textContent = item.price;
    modalDesc.textContent = item.description || "Handcrafted marble piece sculpted by Sanju Marble.";
    
    modalDetails.innerHTML = (item.details || [
      "100% Genuine Makrana / Natural Marble",
      "Handcrafted by generational artisans",
      "Custom sizes, finishes and architectural carving available",
      "Safe wooden crate shipping across India & international"
    ]).map(d => `<li>${escapeHtml(d)}</li>`).join("");

    const waMsg = encodeURIComponent(
      `Hello Sanju Marble, I am interested in ${item.name} (${item.price}). Please share high-resolution photos, dimensions, and delivery timeline.`
    );
    modalWhatsAppBtn.href = `https://wa.me/919828861238?text=${waMsg}`;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeModal();
    }
  });

  /* --------------------------------------------------------------------------
     5. Card & Gallery Interactions
     -------------------------------------------------------------------------- */
  // Clicking "THE LOOK" cards scrolls and filters relevant catalogue section
  document.querySelectorAll(".look-card").forEach((card, idx) => {
    card.addEventListener("click", () => {
      const catMapping = ["Temple & Mandir", "Marble Artefacts", "Tableware", "Marble Accessories"];
      const targetCat = catMapping[idx] || "All";
      
      const targetPill = document.querySelector(`.cat-pill[data-cat="${targetCat}"]`);
      if (targetPill) {
        categoryPills.forEach(p => p.classList.remove("active"));
        targetPill.classList.add("active");
        currentCategory = targetCat;
        renderCatalogue();
      }
      
      const catSection = document.getElementById("catalogue");
      if (catSection) {
        catSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Utility to escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
