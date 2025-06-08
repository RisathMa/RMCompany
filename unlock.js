// Global variables
let campaignData = null
let completedTasks = {}
let campaignId = null

// Initialize the unlock page
document.addEventListener("DOMContentLoaded", () => {
  initializeUnlockPage()
  setupAuthEventListeners()
})

function initializeUnlockPage() {
  // Get campaign ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  campaignId = urlParams.get("id")

  if (!campaignId) {
    showNotFound()
    return
  }

  // Load campaign data
  loadCampaignData()
}

function loadCampaignData() {
  // Get campaign data from localStorage (in production, this would be from a database)
  const data = localStorage.getItem(`campaign_${campaignId}`)

  if (!data) {
    showNotFound()
    return
  }

  try {
    campaignData = JSON.parse(data)
    displayCampaignData()
    setupTaskEventListeners()
  } catch (error) {
    console.error("Error loading campaign data:", error)
    showNotFound()
  }
}

function displayCampaignData() {
  // Update reward title in header
  document.getElementById("rewardTitle").textContent = campaignData.rewardTitle

  // Update reward card
  document.getElementById("rewardCardTitle").textContent = "Complete all tasks to unlock your reward"
  document.getElementById("rewardCardDescription").textContent = campaignData.rewardDescription

  // Generate tasks list
  generateTasksList()
}

function generateTasksList() {
  const tasksList = document.getElementById("tasksList")
  tasksList.innerHTML = ""

  const taskConfig = {
    subscribe: {
      icon: "fas fa-users",
      title: "Subscribe to Channel",
      description: "Subscribe to get updates",
      url: campaignData.channelUrl,
    },
    like: {
      icon: "fas fa-heart",
      title: "Like Video",
      description: "Show your support",
      url: campaignData.videoUrl,
    },
    watch: {
      icon: "fas fa-eye",
      title: "Watch Video",
      description: "Watch the full video",
      url: campaignData.videoUrl,
    },
  }

  Object.keys(campaignData.tasks).forEach((taskType) => {
    if (campaignData.tasks[taskType]) {
      const config = taskConfig[taskType]
      const taskElement = createTaskElement(taskType, config)
      tasksList.appendChild(taskElement)
    }
  })
}

function createTaskElement(taskType, config) {
  const taskDiv = document.createElement("div")
  taskDiv.className = "task-item"
  taskDiv.id = `task-${taskType}`

  const isCompleted = completedTasks[taskType]
  if (isCompleted) {
    taskDiv.classList.add("completed")
  }

  taskDiv.innerHTML = `
        <div class="task-info">
            <i class="${config.icon}"></i>
            <div class="task-details">
                <h3>${config.title}</h3>
                <p>${config.description}</p>
            </div>
        </div>
        <div class="task-status">
            ${
              isCompleted
                ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Completed</span>'
                : `<button class="btn btn-primary" onclick="completeTask('${taskType}', '${config.url}')">
                    <i class="fas fa-external-link-alt"></i> ${config.title.split(" ")[0]}
                </button>`
            }
        </div>
    `

  return taskDiv
}

function completeTask(taskType, url) {
  if (!url) {
    alert("URL not provided for this task")
    return
  }

  // Open YouTube URL in new tab
  window.open(url, "_blank")

  // Show loading state
  const taskElement = document.getElementById(`task-${taskType}`)
  const button = taskElement.querySelector("button")
  const originalText = button.innerHTML

  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...'
  button.disabled = true

  // Simulate task completion verification (3 seconds)
  setTimeout(() => {
    markTaskCompleted(taskType)
  }, 3000)
}

function markTaskCompleted(taskType) {
  completedTasks[taskType] = true

  // Update task element
  const taskElement = document.getElementById(`task-${taskType}`)
  taskElement.classList.add("completed")

  const statusDiv = taskElement.querySelector(".task-status")
  statusDiv.innerHTML = '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Completed</span>'

  // Save progress
  saveTaskProgress()

  // Check if all tasks are completed
  checkAllTasksCompleted()
}

function checkAllTasksCompleted() {
  const requiredTasks = Object.keys(campaignData.tasks).filter((task) => campaignData.tasks[task])
  const completedTasksList = Object.keys(completedTasks).filter((task) => completedTasks[task])

  if (requiredTasks.length === completedTasksList.length) {
    showRewardUnlocked()
  }
}

function showRewardUnlocked() {
  const rewardCard = document.getElementById("rewardCard")
  rewardCard.classList.add("success")

  document.getElementById("rewardCardTitle").innerHTML = "Congratulations! 🎉"
  document.getElementById("rewardCardDescription").textContent =
    `You've completed all tasks. Here's your reward: ${campaignData.rewardDescription}`

  const claimBtn = document.getElementById("claimRewardBtn")
  claimBtn.style.display = "block"
  claimBtn.onclick = () => claimReward()

  // Scroll to reward
  rewardCard.scrollIntoView({ behavior: "smooth" })

  // Show celebration animation (optional)
  showCelebration()
}

function claimReward() {
  if (campaignData.rewardUrl) {
    window.open(campaignData.rewardUrl, "_blank")

    // Track reward claim
    trackRewardClaim()
  } else {
    alert("Reward URL not available")
  }
}

function showCelebration() {
  // Simple celebration effect
  const celebration = document.createElement("div")
  celebration.innerHTML = "🎉"
  celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 100px;
        z-index: 1000;
        animation: celebrate 2s ease-out forwards;
        pointer-events: none;
    `

  // Add celebration animation
  const style = document.createElement("style")
  style.textContent = `
        @keyframes celebrate {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
    `
  document.head.appendChild(style)
  document.body.appendChild(celebration)

  setTimeout(() => {
    document.body.removeChild(celebration)
    document.head.removeChild(style)
  }, 2000)
}

function saveTaskProgress() {
  // Save progress to localStorage
  localStorage.setItem(`progress_${campaignId}`, JSON.stringify(completedTasks))
}

function loadTaskProgress() {
  // Load saved progress
  const saved = localStorage.getItem(`progress_${campaignId}`)
  if (saved) {
    completedTasks = JSON.parse(saved)
  }
}

function trackRewardClaim() {
  // Track analytics (in production, this would send to analytics service)
  const analytics = JSON.parse(localStorage.getItem("analytics") || "[]")
  analytics.push({
    type: "reward_claimed",
    campaignId: campaignId,
    timestamp: new Date().toISOString(),
    rewardTitle: campaignData.rewardTitle,
  })
  localStorage.setItem("analytics", JSON.stringify(analytics))
}

function showNotFound() {
  document.querySelector(".unlock-page .container").innerHTML = `
        <div class="not-found">
            <h2>Campaign Not Found</h2>
            <p>This unlock URL may be invalid or expired.</p>
            <a href="index.html" class="btn btn-primary">Go Back Home</a>
        </div>
    `
}

function setupTaskEventListeners() {
  // Load any saved progress
  loadTaskProgress()

  // Update display based on saved progress
  Object.keys(completedTasks).forEach((taskType) => {
    if (completedTasks[taskType]) {
      markTaskCompleted(taskType)
    }
  })
}

// Auth functions (shared with main script)
function setupAuthEventListeners() {
  // Auth forms
  const signinForm = document.getElementById("signinForm")
  const signupForm = document.getElementById("signupForm")

  if (signinForm) {
    signinForm.addEventListener("submit", handleSignIn)
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignUp)
  }

  // Modal close on outside click
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("authModal")
    if (event.target === modal) {
      closeAuthModal()
    }
  })

  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    updateAuthButtons()
  }
}

// Shared auth functions
function openAuthModal(tab = "signin") {
  document.getElementById("authModal").style.display = "block"
  switchTab(tab)
}

function closeAuthModal() {
  document.getElementById("authModal").style.display = "none"
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  document.getElementById(tabName + "Tab").classList.add("active")
  event.target.classList.add("active")
}

async function handleSignIn(e) {
  e.preventDefault()

  const email = document.getElementById("signinEmail").value
  const password = document.getElementById("signinPassword").value

  try {
    await simulateAuth(email, password, "signin")

    const currentUser = { email: email, id: generateUniqueId() }
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
    await simulateAuth(email, password, "signup")

    const currentUser = { email: email, id: generateUniqueId() }
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    updateAuthButtons()
    closeAuthModal()

    alert("Account created successfully!")
  } catch (error) {
    alert(error.message)
  }
}

async function simulateAuth(email, password, type) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!email || !password) {
    throw new Error("Please fill in all fields")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  if (type === "signup") {
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    if (existingUsers.find((user) => user.email === email)) {
      throw new Error("User already exists")
    }

    existingUsers.push({ email, password, id: generateUniqueId() })
    localStorage.setItem("users", JSON.stringify(existingUsers))
  } else {
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const user = existingUsers.find((user) => user.email === email && user.password === password)
    if (!user) {
      throw new Error("Invalid email or password")
    }
  }
}

function updateAuthButtons() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
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
  localStorage.removeItem("currentUser")
  updateAuthButtons()
  alert("Successfully signed out!")
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
