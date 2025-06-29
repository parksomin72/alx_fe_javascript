let quotes = [];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem("quotes");
  quotes = data ? JSON.parse(data) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "life" },
    { text: "Don’t let yesterday take up too much of today.", category: "motivation" }
  ];
}

function populateCategories() {
  const sel = document.getElementById("categoryFilter");
  sel.innerHTML = `<option value="all">All Categories</option>`;
  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat[0].toUpperCase() + cat.slice(1);
    sel.appendChild(opt);
  });
  const saved = localStorage.getItem("selectedCategory") || "all";
  sel.value = saved;
}

function showRandomQuote() {
  const filter = document.getElementById("categoryFilter").value;
  const pool = filter === "all" ? quotes : quotes.filter(q => q.category === filter);
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = pool[Math.floor(Math.random() * pool.length)];
  quoteDisplay.textContent = `"${random.text}"`;
  sessionStorage.setItem("lastQuote", random.text);
}

function filterQuotes() {
  const value = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", value);
  showRandomQuote();
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const cat = document.getElementById("newQuoteCategory").value.trim().toLowerCase();
  if (!text || !cat) return alert("Both fields required!");

  const newQuote = { text, category: cat };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");

  // Post to mock API
  postQuoteToServer(newQuote);
}

function createAddQuoteForm() {
  const c = document.getElementById("formContainer");
  c.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote">
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category">
    <button onclick="addQuote()">Add Quote</button>
  `;
}

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
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw "Invalid format";
      quotes.push(...data);
      saveQuotes();
      populateCategories();
      alert("Imported successfully!");
    } catch (err) {
      alert("Failed to import: " + err);
    }
  };
  reader.readAsText(event.target.files[0]);
}

function showSyncMessage(msg, color = "green") {
  const div = document.getElementById("syncStatus");
  div.textContent = msg;
  div.style.color = color;
  setTimeout(() => div.textContent = "", 4000);
}

// ✅ Fetch data from mock API
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    return data.slice(0, 5).map(p => ({
      text: p.title,
      category: "server"
    }));
  } catch (err) {
    showSyncMessage("❌ Failed to fetch from server", "red");
    return [];
  }
}

// ✅ Post new quotes to mock API
async function postQuoteToServer(quote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    });
    const data = await res.json();
    console.log("📤 Posted to server:", data);
  } catch (err) {
    console.error("❌ Failed to post quote to server");
  }
}

// ✅ Full sync with conflict resolution
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let added = 0;
  const localTexts = new Set(quotes.map(q => q.text));

  serverQuotes.forEach(serverQuote => {
    if (!localTexts.has(serverQuote.text)) {
      quotes.push(serverQuote);
      added++;
    }
  });

  if (added > 0) {
    saveQuotes();
    populateCategories();
    showSyncMessage(`✅ Synced ${added} new quote(s) from server.`);
  } else {
    showSyncMessage("🔄 Already up to date with server.");
  }
}

// ✅ Init everything
window.onload = () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
  document.getElementById("syncBtn").addEventListener("click", syncQuotes);

  const last = sessionStorage.getItem("lastQuote");
  if (last) document.getElementById("quoteDisplay").textContent = `"${last}"`;

  filterQuotes(); // Show one at start

  // ✅ Periodic Sync every 15 seconds
  setInterval(syncQuotes, 15000);
};
