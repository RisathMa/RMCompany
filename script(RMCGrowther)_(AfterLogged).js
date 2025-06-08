// Global variables
let currentUser = null

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
})

function initializeApp() {
  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    updateAuthButtons()
  }
}

function setupEventListeners() {
  // Campaign form submission
  document.getElementById("campaignForm").addEventListener("submit", handleCampaignSubmit)

  // Auth forms
  document.getElementById("signinForm").addEventListener("submit", handleSignIn)
  document.getElementById("signupForm").addEventListener("submit", handleSignUp)

  // Modal close on outside click
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("authModal")
    if (event.target === modal) {
      closeAuthModal()
    }
  })
}

// Campaign form handling
async function handleCampaignSubmit(e) {
  e.preventDefault()

  const generateBtn = document.getElementById("generateBtn")
  const originalText = generateBtn.innerHTML

  // Show loading state
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'
  generateBtn.disabled = true

  try {
    // Get form data
    const formData = getFormData()

    // Validate form
    if (!validateCampaignForm(formData)) {
      throw new Error("Please fill in all required fields and select at least one task.")
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate unique ID
    const campaignId = generateUniqueId()

    // Save campaign data
    saveCampaignData(campaignId, formData)

    // Generate and display URL
    const unlockUrl = `${window.location.origin}/unlock_AL.html?id=${campaignId}`
    displayGeneratedUrl(unlockUrl)
  } catch (error) {
    alert(error.message)
  } finally {
    // Reset button
    generateBtn.innerHTML = originalText
    generateBtn.disabled = false
  }
}

function getFormData() {
  const tasks = {}
  document.querySelectorAll('input[name="tasks"]:checked').forEach((checkbox) => {
    tasks[checkbox.value] = true
  })

  return {
    channelUrl: document.getElementById("channelUrl").value,
    videoUrl: document.getElementById("videoUrl").value,
    tasks: tasks,
    rewardTitle: document.getElementById("rewardTitle").value,
    rewardDescription: document.getElementById("rewardDescription").value,
    rewardUrl: document.getElementById("rewardUrl").value,
    createdAt: new Date().toISOString(),
    createdBy: currentUser ? currentUser.email : "anonymous",
  }
}

function validateCampaignForm(formData) {
  if (!formData.channelUrl || !formData.rewardTitle || !formData.rewardDescription || !formData.rewardUrl) {
    return false
  }

  if (Object.keys(formData.tasks).length === 0) {
    return false
  }

  return true
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function saveCampaignData(campaignId, formData) {
  // Save to localStorage (in production, this would be saved to a database)
  localStorage.setItem(`campaign_${campaignId}`, JSON.stringify(formData))

  // Also save to campaigns list
  const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
  campaigns.push({
    id: campaignId,
    title: formData.rewardTitle,
    createdAt: formData.createdAt,
    createdBy: formData.createdBy,
  })
  localStorage.setItem("campaigns", JSON.stringify(campaigns))

  // Send email notification if email system is available
  if (typeof emailNotificationSystem !== 'undefined') {
    const campaignData = {
      ...formData,
      id: campaignId
    }
    emailNotificationSystem.sendNewCampaignAlert(campaignData)
  }
}

function displayGeneratedUrl(url) {
  document.getElementById("generatedUrl").value = url
  document.getElementById("generatedUrlCard").style.display = "block"

  // Scroll to the generated URL
  document.getElementById("generatedUrlCard").scrollIntoView({
    behavior: "smooth",
  })
}

function copyToClipboard() {
  const urlInput = document.getElementById("generatedUrl")
  urlInput.select()
  urlInput.setSelectionRange(0, 99999) // For mobile devices

  try {
    document.execCommand("copy")

    // Show success feedback
    const copyBtn = event.target
    const originalText = copyBtn.innerHTML
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!'
    copyBtn.style.background = "#10b981"

    setTimeout(() => {
      copyBtn.innerHTML = originalText
      copyBtn.style.background = ""
    }, 2000)
  } catch (err) {
    alert("Failed to copy URL. Please copy manually.")
  }
}

// Authentication functions
function openAuthModal(tab = "signin") {
  document.getElementById("authModal").style.display = "block"
  switchTab(tab)
}

function closeAuthModal() {
  document.getElementById("authModal").style.display = "none"
}

function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected tab
  document.getElementById(tabName + "Tab").classList.add("active")
  event.target.classList.add("active")
}

async function handleSignIn(e) {
  e.preventDefault()

  const email = document.getElementById("signinEmail").value
  const password = document.getElementById("signinPassword").value

  try {
    // Simulate authentication (in production, this would call your backend)
    await simulateAuth(email, password, "signin")

    currentUser = { email: email, id: generateUniqueId() }
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    updateAuthButtons()
    closeAuthModal()

    alert("Successfully signed in!")
  } catch (error) {
    alert(error.message)
  }
}

async function handleSignUp(e) {
  e.preventDefault()

  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (password !== confirmPassword) {
    alert("Passwords do not match!")
    return
  }

  try {
    // Simulate authentication (in production, this would call your backend)
    await simulateAuth(email, password, "signup")

    currentUser = { email: email, id: generateUniqueId(), createdAt: new Date().toISOString() }
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    // Send email notification if email system is available
    if (typeof emailNotificationSystem !== 'undefined') {
      emailNotificationSystem.sendNewUserAlert(currentUser)
    }

    updateAuthButtons()
    closeAuthModal()

    alert("Account created successfully!")
  } catch (error) {
    alert(error.message)
  }
}

async function simulateAuth(email, password, type) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Basic validation
  if (!email || !password) {
    throw new Error("Please fill in all fields")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  // Check if user already exists (for signup)
  if (type === "signup") {
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    if (existingUsers.find((user) => user.email === email)) {
      throw new Error("User already exists")
    }

    // Save new user
    existingUsers.push({ email, password, id: generateUniqueId() })
    localStorage.setItem("users", JSON.stringify(existingUsers))
  } else {
    // Validate existing user (for signin)
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const user = existingUsers.find((user) => user.email === email && user.password === password)
    if (!user) {
      throw new Error("Invalid email or password")
    }
  }
}

function updateAuthButtons() {
  const authButtons = document.querySelector(".auth-buttons")
  if (currentUser) {
    authButtons.innerHTML = `
            <span>Welcome, ${currentUser.email}</span>
            <button class="btn btn-outline" onclick="signOut()">Sign Out</button>
        `
  } else {
    authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="openAuthModal('signin')">Sign In</button>
            <button class="btn btn-primary" onclick="openAuthModal('signup')">Sign Up</button>
        `
  }
}

function signOut() {
  currentUser = null
  localStorage.removeItem("currentUser")
  updateAuthButtons()
  alert("Successfully signed out!")
}

// Database functions (using localStorage for now)
function saveToDatabase(collection, data) {
  const items = JSON.parse(localStorage.getItem(collection) || "[]")
  items.push(data)
  localStorage.setItem(collection, JSON.stringify(items))
  return data
}

function getFromDatabase(collection, id) {
  const items = JSON.parse(localStorage.getItem(collection) || "[]")
  return items.find((item) => item.id === id)
}

function updateInDatabase(collection, id, updates) {
  const items = JSON.parse(localStorage.getItem(collection) || "[]")
  const index = items.findIndex((item) => item.id === id)
  if (index !== -1) {
    items[index] = { ...items[index], ...updates }
    localStorage.setItem(collection, JSON.stringify(items))
    return items[index]
  }
  return null
}
