let quotes = [];

// ================== LOAD & SAVE ==================

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "Don’t let yesterday take up too much of today.", category: "motivation" }
    ];
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveLastQuote(text) {
  sessionStorage.setItem("lastQuote", text);
}

function loadLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) document.getElementById("quoteDisplay").textContent = `"${last}"`;
}

function saveFilterCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

function loadFilterCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

// ================== UI FUNCTIONS ==================

function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = new Set(quotes.map(q => q.category));
  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat[0].toUpperCase() + cat.slice(1);
    filter.appendChild(option);
  });

  const savedFilter = loadFilterCategory();
  filter.value = savedFilter;
}

function showRandomQuote() {
  const selected = document.getElementById("categoryFilter").value;
  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}"`;
  saveLastQuote(random.text);
}

function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  saveFilterCategory(category);
  showRandomQuote();
}

// ================== ADD QUOTE ==================

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// ================== ADD QUOTE FORM ==================

function createAddQuoteForm() {
  const container = document.getElementById("formContainer");

  const h3 = document.createElement("h3");
  h3.textContent = "Add a New Quote";

  const input1 = document.createElement("input");
  input1.type = "text";
  input1.id = "newQuoteText";
  input1.placeholder = "Enter a new quote";

  const input2 = document.createElement("input");
  input2.type = "text";
  input2.id = "newQuoteCategory";
  input2.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.onclick = addQuote;

  container.append(h3, input1, input2, button);
}

// ================== IMPORT / EXPORT ==================

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw "Invalid format";
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import: " + err);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ================== SERVER SYNC ==================

function fetchServerQuotes() {
  return new Promise(resolve => {
    const serverQuotes = [
      { text: "Only the paranoid survive.", category: "business" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" }
    ];
    setTimeout(() => resolve(serverQuotes), 1000);
  });
}

function syncWithServer() {
  fetchServerQuotes().then(serverData => {
    let added = 0;
    const localTexts = new Set(quotes.map(q => q.text));

    serverData.forEach(serverQuote => {
      if (!localTexts.has(serverQuote.text)) {
        quotes.push(serverQuote);
        added++;
      }
    });

    if (added > 0) {
      saveQuotes();
      populateCategories();
      showSyncMessage(`✅ Synced: ${added} new quote(s) added from server.`);
    } else {
      showSyncMessage(`🔄 Already up to date with server.`);
    }
  });
}

function showSyncMessage(msg) {
  const div = document.getElementById("syncStatus");
  div.textContent = msg;
  setTimeout(() => div.textContent = "", 5000);
}

// ================== INIT ==================

window.onload = function () {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  loadLastQuote();

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
  document.getElementById("syncBtn").addEventListener("click", syncWithServer);

  filterQuotes();
  setInterval(syncWithServer, 15000);
};
