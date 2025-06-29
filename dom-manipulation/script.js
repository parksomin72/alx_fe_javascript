let quotes = [];

/* ========= PERSISTENCE ========= */

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  quotes = saved ? JSON.parse(saved) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "motivation" },
    { text: "Life is what happens when you're busy making other plans.",     category: "life"       },
    { text: "Don’t let yesterday take up too much of today.",                category: "motivation" }
  ];
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

function saveFilterCategory(cat) {
  localStorage.setItem("selectedCategory", cat);
}
function loadFilterCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

/* ========= UI HELPERS ========= */

function populateCategories() {
  const sel = document.getElementById("categoryFilter");
  sel.innerHTML = `<option value="all">All Categories</option>`;
  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat[0].toUpperCase() + cat.slice(1);
    sel.appendChild(opt);
  });
  sel.value = loadFilterCategory();
}

function showRandomQuote() {
  const cat = document.getElementById("categoryFilter").value;
  const pool = cat === "all" ? quotes : quotes.filter(q => q.category === cat);
  const box  = document.getElementById("quoteDisplay");

  if (!pool.length) { box.textContent = "No quotes available for this category."; return; }

  const { text } = pool[Math.floor(Math.random() * pool.length)];
  box.textContent = `"${text}"`;
  saveLastQuote(text);
}

function filterQuotes() {
  const cat = document.getElementById("categoryFilter").value;
  saveFilterCategory(cat);
  showRandomQuote();
}

/* ========= ADD QUOTE ========= */

function addQuote() {
  const txt = document.getElementById("newQuoteText").value.trim();
  const cat = document.getElementById("newQuoteCategory").value.trim().toLowerCase();
  if (!txt || !cat) return alert("Please enter both quote and category.");

  quotes.push({ text: txt, category: cat });
  saveQuotes(); populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

function createAddQuoteForm() {
  const c = document.getElementById("formContainer");
  c.innerHTML = "";               // ensure empty if re‑called
  c.insertAdjacentHTML("beforeend", `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote">
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category">
    <button id="addQuoteBtn">Add Quote</button>
  `);
  document.getElementById("addQuoteBtn").onclick = addQuote;
}

/* ========= IMPORT / EXPORT ========= */

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes,null,2)], { type:"application/json" });
  const url  = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href:url, download:"quotes.json" });
  a.click(); URL.revokeObjectURL(url);
}

function importFromJsonFile(e) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw "Invalid format";
      quotes.push(...data);
      saveQuotes(); populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) { alert("Failed to import: " + err); }
  };
  reader.readAsText(e.target.files[0]);
}

/* ========= SERVER SYNC ========= */

function fetchQuotesFromServer() {
  /* In a real app you’d `return fetch("/api/quotes").then(r=>r.json())`   *
   * Here we simulate a remote source with 1‑second latency.              */
  return new Promise(res => setTimeout(() => res([
    { text: "Only the paranoid survive.",                        category:"business"    },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category:"programming" }
  ]), 1000));
}

function showSyncMessage(msg) {
  const s = document.getElementById("syncStatus");
  s.textContent = msg; clearTimeout(showSyncMessage.t);
  showSyncMessage.t = setTimeout(()=>s.textContent="", 5000);
}

function syncWithServer() {
  fetchQuotesFromServer().then(serverQuotes => {
    const localTexts = new Set(quotes.map(q => q.text));
    let added = 0;
    serverQuotes.forEach(q => { if (!localTexts.has(q.text)) { quotes.push(q); added++; } });
    if (added) {
      saveQuotes(); populateCategories();
      showSyncMessage(`✅ Synced: ${added} new quote(s) from server.`);
    } else showSyncMessage("🔄 Already up to date with server.");
  });
}

/* ========= INIT ========= */

window.onload = () => {
  loadQuotes(); createAddQuoteForm(); populateCategories(); loadLastQuote();

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("newQuote").addEventListener("click",    showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click",exportQuotes);
  document.getElementById("syncBtn").addEventListener("click",     syncWithServer);

  filterQuotes();                      // initial quote
  setInterval(syncWithServer, 15000);  // auto‑sync every 15 s
};
