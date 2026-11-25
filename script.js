const $ = id => document.getElementById(id);

// Keep the original display names and trending selections for the first 14 wallpapers.
const wallpaperMetadata = {
  100: { title: "Silver Man", trending: true },
  101: { title: "Lion", trending: true },
  102: { title: "Tiger" },
  103: { title: "Thomas Shelby" },
  104: { title: "Moon" },
  105: { title: "BMW", trending: true },
  106: { title: "Eagle" },
  107: { title: "Silver Tom" },
  108: { title: "Focus" },
  109: { title: "Rose" },
  110: { title: "Silver Man" },
  111: { title: "Galaxy Car" },
  112: { title: "Wolf", trending: true },
  113: { title: "Tom" }
};

let wallpapers = [];
let currentCategory = "All";
let currentPage = "home";
let currentWallpaper = null;
let searchTerm = "";
let favorites = [];

// Resolve every wallpaper from the GitHub Pages project root, not the current page URL.
const wallpaperAssetUrl = path =>
  new URL(`/Noirix/${String(path).replace(/^\/+/, "")}`, window.location.origin).href;

try {
  const saved = JSON.parse(localStorage.getItem("noirixFavorites") || "[]");
  if (Array.isArray(saved)) favorites = saved;
} catch {
  favorites = [];
}

// Logo animation: reveal logo, then open website directly
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    $("mainApp").classList.remove("hidden");
  }, 1450);
});

// Render gallery
function renderWallpapers() {
  const grid = $("wallpaperGrid");
  grid.innerHTML = "";

  const filtered = wallpapers.filter(wallpaper => {
    const categoryMatch =
      currentCategory === "All" ||
      wallpaper.category === currentCategory;

    const searchMatch =
      wallpaper.title.toLowerCase().includes(searchTerm) ||
      wallpaper.category.toLowerCase().includes(searchTerm);

    const favoriteMatch =
      currentPage !== "favorites" ||
      favorites.includes(wallpaper.id);

    const trendingMatch =
      currentPage !== "trending" ||
      wallpaper.trending === true;

    return categoryMatch &&
      searchMatch &&
      favoriteMatch &&
      trendingMatch;
  });

  $("galleryTitle").textContent =
    currentPage === "favorites" ? "Your Favorites" :
    currentPage === "trending" ? "Trending Wallpapers" :
    "Discover Wallpapers";

  $("emptyState").classList.toggle(
    "hidden",
    filtered.length > 0
  );

  filtered.forEach((wallpaper, index) => {
    const card = document.createElement("article");
    card.className = "wallpaper-card";

    const img = document.createElement("img");
    img.src = wallpaperAssetUrl(wallpaper.image);
    img.alt = wallpaper.title;
    img.loading = index < 4 ? "eager" : "lazy";
    img.decoding = "async";
    if (index < 4) img.fetchPriority = "high";

    img.addEventListener("error", () => {
      img.style.opacity = ".25";
    });

    const heart = document.createElement("button");
    heart.className = "card-heart";
    heart.textContent =
      favorites.includes(wallpaper.id) ? "♥" : "♡";

    if (favorites.includes(wallpaper.id)) {
      heart.classList.add("liked");
    }

    heart.setAttribute("aria-label", "Toggle favorite");

    heart.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(wallpaper.id);
    });

    const info = document.createElement("div");
    info.className = "card-info";

    const title = document.createElement("h3");
    title.textContent = wallpaper.title;

    const category = document.createElement("p");
    category.textContent = wallpaper.category;

    info.append(title, category);
    card.append(img, heart, info);

    card.addEventListener("click", () => {
      openWallpaper(wallpaper);
    });

    grid.appendChild(card);
  });
}

// Category buttons
$("categories").addEventListener("click", event => {
  const button = event.target.closest(".category");
  if (!button) return;

  currentCategory = button.dataset.category;
  currentPage = "home";

  document.querySelectorAll(".category").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  setActiveNav("home");
  renderWallpapers();
});

// Search
$("searchInput").addEventListener("input", event => {
  searchTerm = event.target.value.toLowerCase().trim();
  renderWallpapers();
});

$("clearSearch").addEventListener("click", () => {
  $("searchInput").value = "";
  searchTerm = "";
  renderWallpapers();
});

// Favorites
function saveFavorites() {
  localStorage.setItem(
    "noirixFavorites",
    JSON.stringify(favorites)
  );
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  saveFavorites();
  renderWallpapers();

  if (currentWallpaper && currentWallpaper.id === id) {
    updateModalFavorite();
  }
}

function updateModalFavorite() {
  if (!currentWallpaper) return;

  const liked = favorites.includes(currentWallpaper.id);

  $("modalFavorite").textContent = liked ? "♥" : "♡";
  $("modalFavorite").style.color =
    liked ? "#ff5b9d" : "#bd91ff";
}

$("favoritesShortcut").addEventListener("click", () => {
  showPage("favorites");
});

// Wallpaper preview
function openWallpaper(wallpaper) {
  currentWallpaper = wallpaper;

  $("modalImage").decoding = "async";
  $("modalImage").src = wallpaperAssetUrl(wallpaper.image);
  $("modalTitle").textContent = wallpaper.title;
  $("modalCategory").textContent = wallpaper.category;

  updateModalFavorite();
  $("wallpaperModal").classList.remove("hidden");
}

function closeWallpaper() {
  $("wallpaperModal").classList.add("hidden");
  $("modalImage").src = "";
}

$("closeModal").addEventListener("click", closeWallpaper);

$("wallpaperModal").addEventListener("click", event => {
  if (event.target === $("wallpaperModal")) {
    closeWallpaper();
  }
});

$("modalFavorite").addEventListener("click", () => {
  if (currentWallpaper) {
    toggleFavorite(currentWallpaper.id);
  }
});

// Download
$("downloadBtn").addEventListener("click", async () => {
  if (!currentWallpaper) return;

  const button = $("downloadBtn");
  button.disabled = true;
  button.textContent = "PREPARING DOWNLOAD...";

  try {
    const response = await fetch(wallpaperAssetUrl(currentWallpaper.image));

    if (!response.ok) {
      throw new Error("Image download failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download =
      "NOIRIX-" +
      currentWallpaper.title.replace(/[^a-z0-9]/gi, "-") +
      ".jpg";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 3000);

    button.textContent = "DOWNLOAD STARTED ✓";
  } catch (error) {
    button.textContent = "OPENING IMAGE";
    window.open(wallpaperAssetUrl(currentWallpaper.image), "_blank");
  }

  setTimeout(() => {
    button.textContent = "↓ DOWNLOAD WALLPAPER";
    button.disabled = false;
  }, 2000);
});

// Navigation
function setActiveNav(page) {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === page
    );
  });
}

function showPage(page) {
  if (page === "settings") {
    $("settingsModal").classList.remove("hidden");
    return;
  }

  currentPage = page;
  currentCategory = "All";
  searchTerm = "";

  $("searchInput").value = "";

  document.querySelectorAll(".category").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.category === "All"
    );
  });

  setActiveNav(page);
  renderWallpapers();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Navigation
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

// Settings
$("closeSettings").addEventListener("click", () => {
  $("settingsModal").classList.add("hidden");
});

$("settingsModal").addEventListener("click", event => {
  if (event.target === $("settingsModal")) {
    $("settingsModal").classList.add("hidden");
  }
});

// Home logo
$("homeLogo").addEventListener("click", event => {
  event.preventDefault();
  showPage("home");
});

// Keyboard
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeWallpaper();
    $("settingsModal").classList.add("hidden");
  }
});

// Load the complete wallpaper collection from wallpapers.json.
async function loadWallpapers() {
  try {
    const response = await fetch("./wallpapers.json");
    if (!response.ok) throw new Error("Could not load wallpapers.json");

    const collection = await response.json();
    if (!Array.isArray(collection)) throw new Error("Wallpaper collection is invalid");

    wallpapers = collection.map(wallpaper => ({
      ...wallpaper,
      ...(wallpaperMetadata[wallpaper.id] || {})
    }));

    renderWallpapers();
  } catch (error) {
    console.error("NOIRIX wallpaper loading failed:", error);
    wallpapers = [];
    renderWallpapers();
  }
}

loadWallpapers();
