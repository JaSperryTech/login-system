const CURRENT_VERSION = "1.0"; // Define the current version of the storage structure

export const loginSystem = (() => {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  // Function to update user data structure if necessary
  const updateUserStorage = () => {
    if (users.length === 0) return; // No users to update

    users = users.map((user) => {
      // Check for version and add default values if needed
      if (!user.version || user.version !== CURRENT_VERSION) {
        user.gameData = user.gameData || []; // Ensure gameData exists
        user.version = CURRENT_VERSION; // Set the current version
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(users)); // Update local storage
  };

  // Function to check if the dashboard HTML exists
  const checkDashboardExists = async () => {
    try {
      const response = await fetch("dashboard.html");
      return response.ok; // Returns true if the file exists
    } catch (error) {
      console.error("Error checking for dashboard.html:", error);
      return false; // Return false if there was an error (e.g., file not found)
    }
  };

  // Check if user is logged in
  const checkSession = () => {
    return currentUser !== null;
  };

  // Register a new user
  const registerUser = (username, password) => {
    if (users.find((user) => user.username === username)) {
      return { success: false, message: "Username already exists." };
    }
    // Initialize gameData as an empty array and set version
    users.push({ username, password, gameData: [], version: CURRENT_VERSION });
    localStorage.setItem("users", JSON.stringify(users));
    return { success: true, message: "User registered successfully!" };
  };

  // Login the user
  const loginUser = (username, password) => {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      return { success: true, message: "Login successful!" };
    }
    return { success: false, message: "Invalid username or password." };
  };

  // Logout the user
  const logoutUser = () => {
    localStorage.removeItem("currentUser");
    currentUser = null;
    redirectToLogin();
  };

  // Redirect to the login form
  const redirectToLogin = () => {
    if (document.getElementById("dashboardContainer")) {
      document.getElementById("dashboardContainer").remove();
    }
    createLoginForm();
  };

  // Create the login form
  const createLoginForm = () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="form-container">
        <h2>Login</h2>
        <input type="text" id="loginUsername" placeholder="Username">
        <input type="password" id="loginPassword" placeholder="Password">
        <button id="loginBtn">Login</button>
        <p id="loginMessage" class="message"></p>
        <h3>Don't have an account? <a href="#" id="showSignup">Signup</a></h3>
      </div>
    `;
    document.body.appendChild(container);

    const loginBtn = document.getElementById("loginBtn");
    const showSignup = document.getElementById("showSignup");

    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const result = loginUser(username, password);
      document.getElementById("loginMessage").textContent = result.message;
      if (result.success) {
        loadDashboardOrCreate(); // Load or create the dashboard
      }
    });

    showSignup.addEventListener("click", () => {
      createSignupForm(); // Show the signup form
    });
  };

  // Create the signup form
  const createSignupForm = () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="form-container">
        <h2>Signup</h2>
        <input type="text" id="signupUsername" placeholder="Username">
        <input type="password" id="signupPassword" placeholder="Password">
        <button id="signupBtn">Signup</button>
        <p id="signupMessage" class="message"></p>
        <h3>Already have an account? <a href="#" id="showLogin">Login</a></h3>
      </div>
    `;
    document.body.appendChild(container);

    const signupBtn = document.getElementById("signupBtn");
    const showLogin = document.getElementById("showLogin");

    signupBtn.addEventListener("click", () => {
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const result = registerUser(username, password);
      document.getElementById("signupMessage").textContent = result.message;
      if (result.success) {
        loadDashboardOrCreate(); // Load or create the dashboard
      }
    });

    showLogin.addEventListener("click", () => {
      redirectToLogin(); // Show the login form
    });
  };

  // Function to load the dashboard from dashboard.html or create a new one
  const loadDashboardOrCreate = async () => {
    const dashboardExists = await checkDashboardExists();
    if (dashboardExists) {
      // Load and display dashboard.html content
      const response = await fetch("dashboard.html");
      const html = await response.text();

      // Replace body content with loaded HTML
      document.body.innerHTML = html;

      // Initialize the dashboard immediately after loading the HTML
      initDashboard();
    } else {
      // Create the dashboard dynamically if it doesn't exist
      createDashboard();
    }
  };

  // Function to initialize the dashboard
  const initDashboard = () => {
    console.log("Dashboard initialized for user:", currentUser.username);

    // Ensure the logout button exists before adding the event listener
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        logoutUser(); // Call logout function
      });
    } else {
      console.error("Logout button not found in the dashboard.");
    }
  };

  // Create the dashboard dynamically
  const createDashboard = () => {
    const container = document.createElement("div");
    container.id = "dashboardContainer";
    container.innerHTML = `
      <div class="dashboard">
        <h1>Welcome, ${currentUser.username}!</h1>
        <p>This is your dashboard.</p>
        <p>Your Game Data: <pre>${JSON.stringify(
          currentUser.gameData,
          null,
          2
        )}</pre></p>
        <button id="logoutBtn">Logout</button>
      </div>
    `;
    document.body.innerHTML = ""; // Clear existing content
    document.body.appendChild(container);

    // Initialize the logout button event listener
    initDashboard();
  };

  // Start the module by checking if the user is logged in and updating the storage
  updateUserStorage(); // Ensure the storage structure is updated
  if (checkSession()) {
    loadDashboardOrCreate(); // If logged in, load the dashboard
  } else {
    createLoginForm(); // Show login form if not logged in
  }

  // Public API
  return {
    checkSession,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser: () => currentUser, // Function to access the current user
    updateGameData: (newData) => {
      if (currentUser) {
        currentUser.gameData.push(newData);
        localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Update current user in localStorage
      }
    },
  };
})();
