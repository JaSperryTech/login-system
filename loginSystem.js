export const loginSystem = (() => {
  let characters = JSON.parse(localStorage.getItem('characters')) || [];
  let currentCharacter =
    JSON.parse(localStorage.getItem('currentCharacter')) || null;

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

    localStorage.setItem('users', JSON.stringify(users)); // Update local storage
  };

  // Check if user is logged in
  const checkSession = () => {
    return currentUser !== null;
  };

  // Register a new user
  const registerUser = (username, password) => {
    if (users.find((user) => user.username === username)) {
      return { success: false, message: 'Username already exists.' };
    }
    // Initialize gameData as an empty array and set version
    users.push({ username, password, gameData: [], version: CURRENT_VERSION });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'User registered successfully!' };
  };

  // Login the user
  const loginUser = (username, password) => {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return { success: true, message: 'Login successful!' };
    }
    return { success: false, message: 'Invalid username or password.' };
  };

  // Logout the user
  const logoutUser = () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    redirectToLogin();
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
        localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Update current user in localStorage
      }
    },
  };
})();
