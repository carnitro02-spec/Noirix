const $ = id => document.getElementById(id);

// 14 original local wallpapers
const newWallpapers = [
  { id: 100, title: "Silver Man", category: "Dark", image: "dark/3b958df9-8590-4be2-b6f7-0534d01235f8.png", trending: true },
  { id: 101, title: "Lion", category: "Dark", image: "dark/5fe3b060-00cd-45aa-8dbc-fb4ff36832a1.webp", trending: true },
  { id: 102, title: "Tiger", category: "Dark", image: "dark/80ce2949-9d2f-4357-968c-b007bba3e2af.webp" },
  { id: 103, title: "Thomas Shelby", category: "Dark", image: "dark/97dfc192-98b6-4d7e-916b-de304b15652f.webp" },
  { id: 104, title: "Moon", category: "Dark", image: "dark/a0d68f78-0f26-4b96-819b-04d5132f43b6.webp" },
  { id: 105, title: "BMW", category: "Dark", image: "dark/a228801b-61ea-4c32-9bf0-1f6747248f8c.webp", trending: true },
  { id: 106, title: "Eagle", category: "Dark", image: "dark/a779fbbe-607e-450f-a208-09f9b8335e0f.webp" },
  { id: 107, title: "Silver Tom", category: "Dark", image: "dark/b935c3fd-c63c-4437-b34a-addecc942ec5.webp" },
  { id: 108, title: "Focus", category: "Dark", image: "dark/be732b6b-7853-483d-a337-5ce98ccb23f2.webp" },
  { id: 109, title: "Rose", category: "Dark", image: "dark/c84713fb-1d58-4e56-ad14-5d29230ad240.webp" },
  { id: 110, title: "Silver Man", category: "Dark", image: "dark/Chrome Noir Gentleman.png" },
  { id: 111, title: "Galaxy Car", category: "Dark", image: "dark/f203693d-7a75-4dba-9fde-fb2e0460331c.webp" },
  { id: 112, title: "Wolf", category: "Dark", image: "dark/Gemini_Generated_Image_t9bcq9t9bcq9t9bc.jpg", trending: true },
  { id: 113, title: "Tom", category: "Dark", image: "dark/Gemini_Generated_Image_y51bwty51bwty51b.jpg" }
];

let wallpapers = [...newWallpapers];
let currentCategory = "All";
let currentPage = "home";
let currentWallpaper = null;
let searchTerm = "";
let favorites = [];

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

  $("wallpaperCount").textContent =
    filtered.length + " WALLPAPERS";

  $("emptyState").classList.toggle(
    "hidden",
    filtered.length > 0
  );

  filtered.forEach(wallpaper => {
    const card = document.createElement("article");
    card.className = "wallpaper-card";

    const img = document.createElement("img");
    img.src = wallpaper.image;
    img.alt = wallpaper.title;
    img.loading = "lazy";

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

  $("modalImage").src = wallpaper.image;
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
    const response = await fetch(currentWallpaper.image);

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
    window.open(currentWallpaper.image, "_blank");
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

// Initial loading
renderWallpapers();
