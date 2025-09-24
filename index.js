// Application State
const state = {
  user: null,
  chests: [],
  goals: [],
  investments: [],
  transactions: [],
};

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Navigation System
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

// Handle navigation clicks
document.addEventListener("click", (e) => {
  if (
    e.target.tagName === "A" &&
    e.target.getAttribute("href")?.startsWith("#")
  ) {
    e.preventDefault();
    const target = e.target.getAttribute("href").substring(1);
    if (["landing", "signup", "login", "dashboard"].includes(target)) {
      showScreen(target);
      if (target === "dashboard") {
        loadDashboard();
      }
    }
  }
});

// Local Storage Management
function saveData() {
  localStorage.setItem(
    "blockledger_data",
    JSON.stringify({
      chests: state.chests,
      goals: state.goals,
      investments: state.investments,
      transactions: state.transactions,
    })
  );
}

function loadData() {
  const saved = localStorage.getItem("blockledger_data");
  if (saved) {
    const data = JSON.parse(saved);
    state.chests = data.chests || [];
    state.goals = data.goals || [];
    state.investments = data.investments || [];
    state.transactions = data.transactions || [];
  }
}

// Authentication
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  // Simulate user creation (in real app, this would call an API)
  const user = { id: generateId(), username };
  localStorage.setItem("blockledger_user", JSON.stringify(user));
  state.user = user;

  alert("Account created successfully! Welcome to BlockLedger!");
  showScreen("dashboard");
  loadDashboard();
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  // Simulate authentication (in real app, this would call an API)
  const savedUser = localStorage.getItem("blockledger_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.username === username) {
      state.user = user;
      alert("Welcome back, " + username + "!");
      showScreen("dashboard");
      loadDashboard();
    } else {
      alert("Invalid credentials");
    }
  } else {
    alert("No account found. Please sign up first.");
  }
});

// Dashboard Functions
function calculateNetworth() {
  const chestsTotal = state.chests.reduce(
    (sum, chest) => sum + chest.amount,
    0
  );
  const investmentsTotal = state.investments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  return chestsTotal + investmentsTotal;
}

function updateNetworth() {
  const networth = calculateNetworth();
  document.getElementById("networthAmount").textContent =
    formatCurrency(networth);
}

function renderChests() {
  const container = document.getElementById("chestsGrid");
  container.innerHTML = "";

  if (state.chests.length === 0) {
    container.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; opacity: 0.7; padding: var(--spacing-lg);">No chests yet. Add your first treasure chest to get started!</p>';
    return;
  }

  state.chests.forEach((chest) => {
    const chestEl = document.createElement("div");
    chestEl.className = "chest";
    chestEl.innerHTML = `
                    <div class="chest-name">${chest.name}</div>
                    <div class="chest-amount">${formatCurrency(
                      chest.amount
                    )}</div>
                `;
    container.appendChild(chestEl);
  });
}

function renderGoals() {
  const container = document.getElementById("goalsContainer");
  container.innerHTML = "";

  if (state.goals.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; opacity: 0.7; padding: var(--spacing-lg); font-size: 14px;">No quests yet. Create your first goal!</p>';
    return;
  }

  state.goals.forEach((goal) => {
    const progress = Math.min(100, (goal.current / goal.target) * 100);
    const goalEl = document.createElement("div");
    goalEl.className = "goal";
    goalEl.innerHTML = `
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-bottle">
                        <div class="goal-water" style="height: ${progress}%"></div>
                    </div>
                    <div class="goal-progress">${progress.toFixed(1)}%</div>
                    <div class="goal-amounts">${formatCurrency(
                      goal.current
                    )} / ${formatCurrency(goal.target)}</div>
                `;
    container.appendChild(goalEl);
  });
}

function renderInvestments() {
  const container = document.getElementById("investmentsGrid");
  container.innerHTML = "";

  if (state.investments.length === 0) {
    container.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; opacity: 0.7; padding: var(--spacing-lg); font-size: 14px;">No treasures yet. Start building your investment portfolio!</p>';
    return;
  }

  state.investments.forEach((investment) => {
    const investmentEl = document.createElement("div");
    investmentEl.className = "investment";
    investmentEl.innerHTML = `
                    <div class="investment-name">${investment.name}</div>
                    <div class="investment-amount">${formatCurrency(
                      investment.amount
                    )}</div>
                `;
    container.appendChild(investmentEl);
  });
}

function renderTransactions() {
  const container = document.getElementById("adventureLog");
  container.innerHTML = "";

  if (state.transactions.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; opacity: 0.7; padding: var(--spacing-lg); font-size: 14px;">Your adventure log is empty. Record your first financial quest!</p>';
    return;
  }

  // Show most recent transactions first
  const recentTransactions = [...state.transactions].reverse().slice(0, 20);

  recentTransactions.forEach((transaction) => {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    const icon = transaction.type === "credit" ? "💰" : "🛒";
    const amountClass = transaction.type === "credit" ? "credit" : "debit";
    const amountPrefix = transaction.type === "credit" ? "+" : "-";

    logEntry.innerHTML = `
                    <div class="log-icon">${icon}</div>
                    <div class="log-details">
                        <div class="log-title">${transaction.title}</div>
                        <div class="log-time">${formatDate(
                          new Date(transaction.timestamp)
                        )}</div>
                    </div>
                    <div class="log-amount ${amountClass}">${amountPrefix}${formatCurrency(
      Math.abs(transaction.amount)
    )}</div>
                `;
    container.appendChild(logEntry);
  });
}

function updatePredictions() {
  const insights = [];
  const networth = calculateNetworth();
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(
    (g) => g.current >= g.target
  ).length;

  if (networth === 0) {
    insights.push({
      title: "Start Your Journey",
      text: "Add your first treasure chest to begin tracking your wealth!",
    });
  } else if (state.chests.length > 0 && state.goals.length === 0) {
    insights.push({
      title: "Set Your First Quest",
      text: "You have chests but no goals. Create a quest to give your adventure direction!",
    });
  } else if (state.transactions.length < 5) {
    insights.push({
      title: "Build Your Log",
      text: "Record more transactions to help the Oracle provide better insights",
    });
  } else {
    const recentCredits = state.transactions.filter(
      (t) =>
        t.type === "credit" &&
        new Date(t.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    if (recentCredits > 0) {
      insights.push({
        title: "Income Streak Detected!",
        text: `You've earned gold ${recentCredits} times this month. Keep building your treasure!`,
      });
    }

    if (completedGoals > 0) {
      insights.push({
        title: "Quest Master!",
        text: `You've completed ${completedGoals} of ${totalGoals} quests. Your dedication is paying off!`,
      });
    }
  }

  if (state.investments.length === 0 && networth > 1000) {
    insights.push({
      title: "Investment Opportunity",
      text: "With your growing wealth, consider adding some investment treasures to your portfolio",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "All Systems Green!",
      text: "Your financial kingdom is growing strong. Keep up the excellent work!",
    });
  }

  const container = document.getElementById("predictiveContent");
  container.innerHTML = "";

  insights.forEach((insight) => {
    const insightEl = document.createElement("div");
    insightEl.className = "insight";
    insightEl.innerHTML = `
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-text">${insight.text}</div>
                `;
    container.appendChild(insightEl);
  });
}

function loadDashboard() {
  loadData();
  updateNetworth();
  renderChests();
  renderGoals();
  renderInvestments();
  renderTransactions();
  updatePredictions();
}

// Modal System
function showModal(title, content) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = content;
  document.getElementById("modal").classList.add("show");
}

function hideModal() {
  document.getElementById("modal").classList.remove("show");
}

document.getElementById("modalClose").addEventListener("click", hideModal);
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") hideModal();
});

// Add Chest Modal
document.getElementById("addChest").addEventListener("click", () => {
  showModal(
    "Add Treasure Chest",
    `
                <form id="chestForm">
                    <div class="form-group">
                        <label class="form-label">Chest Name</label>
                        <input type="text" class="form-input" id="chestName" required placeholder="e.g., Main Savings, Checking Account">
                        <small style="opacity: 0.7; font-size: 12px;">Give your chest a memorable name like 'Dragon Hoard' or 'Emergency Fund'</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Starting Amount</label>
                        <input type="number" class="form-input" id="chestAmount" required placeholder="0" step="0.01">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Create Chest</button>
                </form>
            `
  );

  document.getElementById("chestForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("chestName").value;
    const amount = parseFloat(document.getElementById("chestAmount").value);

    state.chests.push({
      id: generateId(),
      name,
      amount,
    });

    saveData();
    loadDashboard();
    hideModal();
  });
});

// Add Goal Modal
document.getElementById("addGoal").addEventListener("click", () => {
  showModal(
    "Create New Quest",
    `
                <form id="goalForm">
                    <div class="form-group">
                        <label class="form-label">Quest Name</label>
                        <input type="text" class="form-input" id="goalName" required placeholder="e.g., Emergency Fund, Vacation Fund">
                        <small style="opacity: 0.7; font-size: 12px;">What treasure are you questing for?</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Target Amount</label>
                        <input type="number" class="form-input" id="goalTarget" required placeholder="1000" step="0.01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Current Progress</label>
                        <input type="number" class="form-input" id="goalCurrent" placeholder="0" step="0.01" value="0">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Start Quest</button>
                </form>
            `
  );

  document.getElementById("goalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("goalName").value;
    const target = parseFloat(document.getElementById("goalTarget").value);
    const current =
      parseFloat(document.getElementById("goalCurrent").value) || 0;

    state.goals.push({
      id: generateId(),
      name,
      target,
      current,
    });

    saveData();
    loadDashboard();
    hideModal();
  });
});

// Add Investment Modal
document.getElementById("addInvestment").addEventListener("click", () => {
  showModal(
    "Add Investment Treasure",
    `
                <form id="investmentForm">
                    <div class="form-group">
                        <label class="form-label">Investment Name</label>
                        <input type="text" class="form-input" id="investmentName" required placeholder="e.g., Apple Stock, Bitcoin, Index Fund">
                        <small style="opacity: 0.7; font-size: 12px;">What treasure are you investing in?</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Current Value</label>
                        <input type="number" class="form-input" id="investmentAmount" required placeholder="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">External Link (Optional)</label>
                        <input type="url" class="form-input" id="investmentLink" placeholder="https://...">
                        <small style="opacity: 0.7; font-size: 12px;">Link to your brokerage or tracking app</small>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Add Treasure</button>
                </form>
            `
  );

  document.getElementById("investmentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("investmentName").value;
    const amount = parseFloat(
      document.getElementById("investmentAmount").value
    );
    const link = document.getElementById("investmentLink").value;

    state.investments.push({
      id: generateId(),
      name,
      amount,
      link: link || null,
    });

    saveData();
    loadDashboard();
    hideModal();
  });
});

// Add Transaction Modal
document.getElementById("addTransaction").addEventListener("click", () => {
  showModal(
    "Log New Quest",
    `
                <form id="transactionForm">
                    <div class="form-group">
                        <label class="form-label">Quest Title</label>
                        <input type="text" class="form-input" id="transactionTitle" required placeholder="e.g., Grocery Shopping, Salary Payment">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount</label>
                        <input type="number" class="form-input" id="transactionAmount" required placeholder="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select class="form-input" id="transactionType" required>
                            <option value="">Select type...</option>
                            <option value="credit">Income (Gold Earned 💰)</option>
                            <option value="debit">Expense (Gold Spent 🛒)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Source</label>
                        <input type="text" class="form-input" id="transactionSource" placeholder="e.g., Main Job, Grocery Store">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Log Quest</button>
                </form>
            `
  );

  document.getElementById("transactionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("transactionTitle").value;
    const amount = parseFloat(
      document.getElementById("transactionAmount").value
    );
    const type = document.getElementById("transactionType").value;
    const source = document.getElementById("transactionSource").value;

    state.transactions.push({
      id: generateId(),
      title,
      amount,
      type,
      source,
      timestamp: new Date().toISOString(),
    });

    saveData();
    loadDashboard();
    hideModal();
  });
});

// Demo Data Functions
document.getElementById("seedData").addEventListener("click", () => {
  if (confirm("This will add demo data to your account. Continue?")) {
    // Add demo chests
    state.chests = [
      { id: generateId(), name: "Dragon Hoard (Checking)", amount: 2500 },
      { id: generateId(), name: "Emerald Vault (Savings)", amount: 8750 },
      { id: generateId(), name: "Pocket Gold", amount: 150 },
    ];

    // Add demo goals
    state.goals = [
      {
        id: generateId(),
        name: "Emergency Quest Fund",
        target: 5000,
        current: 3200,
      },
      {
        id: generateId(),
        name: "Vacation Adventure",
        target: 2000,
        current: 800,
      },
      {
        id: generateId(),
        name: "New Mount (Car)",
        target: 15000,
        current: 4500,
      },
    ];

    // Add demo investments
    state.investments = [
      { id: generateId(), name: "Magic Crystals (AAPL)", amount: 1250 },
      { id: generateId(), name: "Digital Gold (BTC)", amount: 2100 },
      { id: generateId(), name: "Kingdom Bonds (VTI)", amount: 3300 },
    ];

    // Add demo transactions
    const now = Date.now();
    state.transactions = [
      {
        id: generateId(),
        title: "Salary Quest Reward",
        amount: 3500,
        type: "credit",
        source: "Adventure Corp",
        timestamp: new Date(now - 86400000).toISOString(),
      },
      {
        id: generateId(),
        title: "Grocery Supplies",
        amount: 85,
        type: "debit",
        source: "Village Market",
        timestamp: new Date(now - 72000000).toISOString(),
      },
      {
        id: generateId(),
        title: "Potion Refill (Gas)",
        amount: 45,
        type: "debit",
        source: "Fuel Station",
        timestamp: new Date(now - 36000000).toISOString(),
      },
      {
        id: generateId(),
        title: "Side Quest Bonus",
        amount: 150,
        type: "credit",
        source: "Freelance Magic",
        timestamp: new Date(now - 18000000).toISOString(),
      },
      {
        id: generateId(),
        title: "Equipment Upgrade",
        amount: 299,
        type: "debit",
        source: "Tech Merchant",
        timestamp: new Date(now - 7200000).toISOString(),
      },
    ];

    saveData();
    loadDashboard();
    alert("Demo data loaded! Explore your new financial kingdom!");
  }
});

document.getElementById("resetData").addEventListener("click", () => {
  if (confirm("This will delete ALL your data. Are you sure?")) {
    state.chests = [];
    state.goals = [];
    state.investments = [];
    state.transactions = [];
    saveData();
    loadDashboard();
    alert("All data has been reset. Start fresh!");
  }
});

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("blockledger_user");
  if (savedUser) {
    state.user = JSON.parse(savedUser);
  }

  // Load data if we're starting on dashboard
  if (window.location.hash === "#dashboard") {
    showScreen("dashboard");
    loadDashboard();
  }
});

// Handle hash changes for direct navigation
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.substring(1);
  if (["landing", "signup", "login", "dashboard"].includes(hash)) {
    showScreen(hash);
    if (hash === "dashboard") {
      loadDashboard();
    }
  }
});
