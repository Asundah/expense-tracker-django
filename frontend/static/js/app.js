const API_BASE = "http://127.0.0.1:8000/api";

// STATE & DOM ELEMENTS
let token = localStorage.getItem("token");
let currentUsername = localStorage.getItem("username");
let expenseChart = null;

// Screens
const authScreen = document.getElementById("auth-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

// Auth Elements
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const toggleText = document.getElementById("toggle-text");
const toggleLink = document.getElementById("toggle-auth-link");
const authError = document.getElementById("auth-error");
let isLoginMode = true; // Toggle between login and register modes

// Dashboard Elements
const logoutBtn = document.getElementById("logout-btn");
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const expenseError = document.getElementById("expense-error");
const dateInput = document.getElementById("date");

// Initialize date input with today's date
dateInput.valueAsDate = new Date();

// AUTHENTICATION LOGIC

// 1. Toggle between login and register modes
toggleLink.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  authError.textContent = ""; // Clear any previous error messages
  authForm.reset(); // Reset the form fields

  if (isLoginMode) {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = "Register";
  } else {
    authTitle.textContent = "Register";
    authSubmitBtn.textContent = "Sign Up";
    toggleText.textContent = "Already have an account?";
    toggleLink.textContent = "Login";
  }
});

// 2. Handle Login/Register Form Submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const endpoint = isLoginMode ? '/auth/login/' : '/auth/register/';

  console.log("1. Form submitted!");
  console.log("2. Mode:", isLoginMode ? "Login" : "Register");
  console.log("3. Data:", username, password);

  try {
    console.log("4. Sending fetch request...");
    const response = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    console.log("5. Got a response from server. Status:", response.status);
    const data = await response.json();
    console.log("6. Parsed response data:", data);

    if (!response.ok) {
      throw new Error(data.error || data.username || 'Authentication failed.');
    }

    console.log("7. Success! Saving token...");
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    token = data.token;
    currentUsername = data.username;

    console.log("8. Calling showDashboard()...");
    showDashboard();
    console.log("9. showDashboard finished.");

  } catch (err) {
    console.log("ERROR CAUGHT:", err);
    authError.textContent = err.message;
  }
});

// 3. Logout Functionality
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  token = null;
  currentUsername = null;

  authScreen.classList.add("active");
  dashboardScreen.classList.remove("active");
  authForm.reset();
});

// 4. Check if logged in on page load
function checkAuth() {
  if (token) {
    showDashboard();
  } else {
    authScreen.classList.add("active");
    dashboardScreen.classList.remove("active");
  }
}

function showDashboard() {
  authScreen.classList.remove("active");
  dashboardScreen.classList.add("active");
  fetchExpenses();
}

// EXPENSE MANAGEMENT LOGIC

// 5. Add an Expense
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  expenseError.textContent = ""; // Clear any previous error messages

  const expenseData = {
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    note: document.getElementById("note").value,
  };

  try {
    const response = await fetch(`${API_BASE}/expenses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`, // Send the token to prove we are logged in
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      throw new Error("Failed to add expense");
    }

    // Clear the form and refresh the expense list
    expenseForm.reset();
    dateInput.valueAsDate = new Date(); // Reset date to today
    fetchExpenses();
  } catch (err) {
    expenseError.textContent = err.message;
  }
});

// 6. Fetch and Display Expenses
async function fetchExpenses() {
  try {
    const response = await fetch(`${API_BASE}/expenses/`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (response.status === 401) {
      // Token is invalid or expired, log the user out
      logoutBtn.click();
      return;
    }

    const expenses = await response.json();
    renderExpenses(expenses);
    renderChart(expenses);
  } catch (err) {
    console.error(err);
  }
}

function renderExpenses(expenses) {
  expenseList.innerHTML = ""; // Clear the list before rendering

  if (expenses.length === 0) {
    expenseList.innerHTML = "<li>No expenses recorded yet.</li>";
    return;
  }

  expenses.forEach((exp) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <div>
            <strong>${exp.category}</strong>: $${exp.amount} on ${new Date(exp.date).toLocaleDateString()} 
            <small>${exp.date} ${exp.note ? "| " + exp.note : ""}</small>
        </div>
        <button class="delete-btn" onclick="deleteExpense(${exp.id})">X</button>
        `;
    expenseList.appendChild(li);
  });
}

// 7. Delete an Expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        await fetch(`${API_BASE}/expenses/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Token ${token}` }
        });
        fetchExpenses(); // Refresh list
    } catch (err) {
        console.error(err);
    }
}

// 8. Render Expense Chart
function renderChart(expenses) {
    // Calculate total expenses per category
    const totals = {};
    expenses.forEach(exp => {
        totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount);
    });

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    // Destroy previous chart to prevent overlap glitch
    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById('expense-chart').getContext('2d');
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// BOOT
checkAuth();
