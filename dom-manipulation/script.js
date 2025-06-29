// Initial Quotes Array
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "Don’t let yesterday take up too much of today.", category: "motivation" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Populate initial categories in dropdown
function populateCategories() {
  const categories = new Set(quotes.map(q => q.category));
  categorySelect.innerHTML = `<option value="all">All</option>`; // reset
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat[0].toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option);
  });
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}"`;
}

// Add a new quote dynamically
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });

  // Update categories if it's a new one
  populateCategories();

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initialize categories on load
populateCategories();
