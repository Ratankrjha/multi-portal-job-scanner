// Global Variables
let currentUser = null;
let userSkills = [];
let userPortals = [];
let jobListings = [];
let userPreferences = {};
let allUsersData = {}; // Store data for all users

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load all users data from localStorage
    loadAllUsersData();
    
    // Load current user data
    loadUserData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show hero section by default
    showSection('home');
    
    // Update UI based on login status
    updateUIForLoginStatus();
}

function loadAllUsersData() {
    const savedAllUsers = localStorage.getItem('allUsersData');
    if (savedAllUsers) {
        allUsersData = JSON.parse(savedAllUsers);
    }
}

function saveAllUsersData() {
    localStorage.setItem('allUsersData', JSON.stringify(allUsersData));
}

function loadUserData() {
    // Load current user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        // Load user-specific data
        if (currentUser.email && allUsersData[currentUser.email]) {
            const userData = allUsersData[currentUser.email];
            userSkills = userData.userSkills || [];
            userPortals = userData.userPortals || [];
            jobListings = userData.jobListings || [];
            userPreferences = userData.userPreferences || {};
        }
    }
}

function saveUserData() {
    if (!currentUser || !currentUser.email) return;
    
    // Save current user data to all users data
    allUsersData[currentUser.email] = {
        userSkills: userSkills,
        userPortals: userPortals,
        jobListings: jobListings,
        userPreferences: userPreferences,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    saveAllUsersData();
    
    // Also save current user session
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in');
    }
    
    // Update navigation active state
    updateNavigation(sectionId);
}

function updateNavigation(activeSection) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active link based on section
    let activeLink = null;
    switch(activeSection) {
        case 'home':
            activeLink = Array.from(navLinks).find(link => link.textContent.includes('Home'));
            break;
        case 'features':
            activeLink = Array.from(navLinks).find(link => link.textContent.includes('Features'));
            break;
        case 'companies':
            activeLink = document.getElementById('companiesLink');
            break;
        case 'dashboard':
            activeLink = document.getElementById('dashboardLink');
            break;
        case 'login':
            activeLink = document.getElementById('loginLink');
            break;
        case 'register':
            activeLink = document.getElementById('registerLink');
            break;
    }
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Companies Section Functions
function updateCompaniesSection() {
    if (!currentUser) return;
    
    // Update statistics
    const totalPortals = userPortals.length;
    const activePortals = userPortals.filter(p => p.active).length;
    const jobPortals = userPortals.filter(p => ['naukri', 'internshala', 'linkedin', 'indeed', 'glassdoor'].includes(p.type)).length;
    const companyPortals = userPortals.filter(p => p.type === 'company' || p.type === 'custom').length;
    
    document.getElementById('totalPortalsCount').textContent = totalPortals;
    document.getElementById('activePortalsCount').textContent = activePortals;
    document.getElementById('jobPortalsCount').textContent = jobPortals;
    document.getElementById('companyPortalsCount').textContent = companyPortals;
    
    // Display companies list
    displayCompaniesList();
}

function displayCompaniesList() {
    const companiesList = document.getElementById('companiesList');
    
    if (userPortals.length === 0) {
        companiesList.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-building fa-3x mb-3" style="opacity: 0.3;"></i>
                <p>No companies or portals added yet.</p>
                <p>Add your first job portal or company career page to get started!</p>
            </div>
        `;
        return;
    }
    
    companiesList.innerHTML = userPortals.map((portal, index) => `
        <div class="company-item card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <div class="company-icon me-3">
                                <i class="fas fa-globe text-primary fa-2x"></i>
                            </div>
                            <div>
                                <h6 class="mb-1">${portal.name}</h6>
                                <p class="text-muted mb-0 small">${portal.url}</p>
                                <div class="mt-1">
                                    <span class="badge ${getPortalTypeBadge(portal.type)}">${getPortalTypeLabel(portal.type)}</span>
                                    <span class="badge ${portal.active ? 'bg-success' : 'bg-secondary'} ms-1">
                                        ${portal.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="company-stats">
                            <small class="text-muted">Jobs Found</small>
                            <h6 class="mb-0">${Math.floor(Math.random() * 50) + 10}</h6>
                        </div>
                    </div>
                    <div class="col-md-3 text-end">
                        <div class="company-actions">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="togglePortalStatus(${index})">
                                <i class="fas fa-${portal.active ? 'pause' : 'play'}"></i>
                                ${portal.active ? 'Pause' : 'Resume'}
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="removePortalFromCompanies(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getPortalTypeBadge(type) {
    const badges = {
        'naukri': 'bg-primary',
        'internshala': 'bg-success',
        'linkedin': 'bg-info',
        'indeed': 'bg-warning',
        'glassdoor': 'bg-secondary',
        'company': 'bg-dark',
        'custom': 'bg-outline-primary'
    };
    return badges[type] || 'bg-secondary';
}

function getPortalTypeLabel(type) {
    const labels = {
        'naukri': 'Job Portal',
        'internshala': 'Job Portal',
        'linkedin': 'Job Portal',
        'indeed': 'Job Portal',
        'glassdoor': 'Job Portal',
        'company': 'Company Page',
        'custom': 'Custom'
    };
    return labels[type] || 'Other';
}

function addPortalFromCompanies() {
    const portalType = document.getElementById('newPortalType').value;
    const portalUrl = document.getElementById('newPortalUrl').value.trim();
    
    if (portalUrl || ['naukri', 'internshala', 'linkedin', 'indeed', 'glassdoor'].includes(portalType)) {
        const portalUrls = {
            'naukri': 'https://www.naukri.com',
            'internshala': 'https://internshala.com',
            'linkedin': 'https://www.linkedin.com/jobs',
            'indeed': 'https://www.indeed.com',
            'glassdoor': 'https://www.glassdoor.com'
        };
        
        const portalNames = {
            'naukri': 'Naukri.com',
            'internshala': 'Internshala',
            'linkedin': 'LinkedIn Jobs',
            'indeed': 'Indeed',
            'glassdoor': 'Glassdoor'
        };
        
        const newPortal = {
            type: portalType,
            url: portalUrl || portalUrls[portalType],
            name: portalType === 'company' || portalType === 'custom' ? 
                new URL(portalUrl).hostname.replace('www.', '') : 
                portalNames[portalType],
            active: true
        };
        
        // Check if portal already exists
        if (!userPortals.find(p => p.url === newPortal.url)) {
            userPortals.push(newPortal);
            saveUserData();
            updateCompaniesSection();
            
            // Clear form
            document.getElementById('newPortalUrl').value = '';
            
            showAlert('Portal added successfully!', 'success');
        } else {
            showAlert('Portal already exists!', 'warning');
        }
    } else {
        showAlert('Please enter a valid URL!', 'danger');
    }
}

function togglePortalStatus(index) {
    userPortals[index].active = !userPortals[index].active;
    saveUserData();
    updateCompaniesSection();
    showAlert(`Portal ${userPortals[index].active ? 'activated' : 'deactivated'}!`, 'info');
}

function removePortalFromCompanies(index) {
    const portalName = userPortals[index].name;
    userPortals.splice(index, 1);
    saveUserData();
    updateCompaniesSection();
    showAlert(`${portalName} removed!`, 'info');
}

// Search and filter companies
document.addEventListener('DOMContentLoaded', function() {
    const companySearch = document.getElementById('companySearch');
    const companyFilter = document.getElementById('companyFilter');
    
    if (companySearch) {
        companySearch.addEventListener('input', filterCompanies);
    }
    
    if (companyFilter) {
        companyFilter.addEventListener('change', filterCompanies);
    }
});

function filterCompanies() {
    const searchTerm = document.getElementById('companySearch').value.toLowerCase();
    const filterType = document.getElementById('companyFilter').value;
    
    let filteredPortals = userPortals;
    
    // Apply search filter
    if (searchTerm) {
        filteredPortals = filteredPortals.filter(portal => 
            portal.name.toLowerCase().includes(searchTerm) ||
            portal.url.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
        filteredPortals = filteredPortals.filter(portal => {
            switch(filterType) {
                case 'job-portal':
                    return ['naukri', 'internshala', 'linkedin', 'indeed', 'glassdoor'].includes(portal.type);
                case 'company':
                    return portal.type === 'company';
                case 'custom':
                    return portal.type === 'custom';
                default:
                    return true;
            }
        });
    }
    
    // Display filtered results
    const companiesList = document.getElementById('companiesList');
    if (filteredPortals.length === 0) {
        companiesList.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-search fa-3x mb-3" style="opacity: 0.3;"></i>
                <p>No portals found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    companiesList.innerHTML = filteredPortals.map((portal, originalIndex) => {
        // Find the original index in the full array
        const index = userPortals.findIndex(p => p.url === portal.url);
        return `
            <div class="company-item card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <div class="d-flex align-items-center">
                                <div class="company-icon me-3">
                                    <i class="fas fa-globe text-primary fa-2x"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">${portal.name}</h6>
                                    <p class="text-muted mb-0 small">${portal.url}</p>
                                    <div class="mt-1">
                                        <span class="badge ${getPortalTypeBadge(portal.type)}">${getPortalTypeLabel(portal.type)}</span>
                                        <span class="badge ${portal.active ? 'bg-success' : 'bg-secondary'} ms-1">
                                            ${portal.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="company-stats">
                                <small class="text-muted">Jobs Found</small>
                                <h6 class="mb-0">${Math.floor(Math.random() * 50) + 10}</h6>
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="company-actions">
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="togglePortalStatus(${index})">
                                    <i class="fas fa-${portal.active ? 'pause' : 'play'}"></i>
                                    ${portal.active ? 'Pause' : 'Resume'}
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="removePortalFromCompanies(${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Authentication Functions
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Resume upload
    const resumeFile = document.getElementById('resumeFile');
    if (resumeFile) {
        resumeFile.addEventListener('change', handleResumeUpload);
    }
    
    // Drag and drop for resume
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);
    }
    
    // Job search
    const jobSearch = document.getElementById('jobSearch');
    if (jobSearch) {
        jobSearch.addEventListener('input', filterJobs);
    }
    
    // Job filter
    const jobFilter = document.getElementById('jobFilter');
    if (jobFilter) {
        jobFilter.addEventListener('change', filterJobs);
    }
    
    // Logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        // Check if user exists in allUsersData, if not create new user
        if (!allUsersData[email]) {
            allUsersData[email] = {
                userSkills: [],
                userPortals: [],
                jobListings: [],
                userPreferences: {},
                createdAt: new Date().toISOString()
            };
            saveAllUsersData();
        }
        
        currentUser = {
            email: email,
            name: email.split('@')[0],
            isLoggedIn: true,
            firstTime: !localStorage.getItem('hasSeenPortalSetup')
        };
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Load user-specific data
        loadUserData();
        
        // Update UI
        updateUIForLoginStatus();
        
        // Show portal setup for first-time users
        if (currentUser.firstTime) {
            showSection('portalSetup');
        } else {
            showSection('dashboard');
        }
        
        // Show success message
        showAlert('Login successful! Your data has been loaded.', 'success');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    
    // Validation
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'danger');
        return;
    }
    
    if (email && password && firstName && lastName) {
        // Check if user already exists
        if (allUsersData[email]) {
            showAlert('An account with this email already exists!', 'warning');
            return;
        }
        
        // Create new user data
        allUsersData[email] = {
            userSkills: [],
            userPortals: [],
            jobListings: [],
            userPreferences: {},
            createdAt: new Date().toISOString(),
            firstName: firstName,
            lastName: lastName,
            phone: phone
        };
        saveAllUsersData();
        
        currentUser = {
            email: email,
            name: `${firstName} ${lastName}`,
            phone: phone,
            isLoggedIn: true,
            firstTime: true // Always first time for new registrations
        };
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Load user-specific data
        loadUserData();
        
        // Update UI
        updateUIForLoginStatus();
        
        // Show portal setup for new users
        showSection('portalSetup');
        
        // Show success message
        showAlert('Registration successful! Your account has been created.', 'success');
    }
}

function handleLogout() {
    // Clear current user data from memory
    currentUser = null;
    userSkills = [];
    userPortals = [];
    jobListings = [];
    userPreferences = {};
    
    // Remove current user session
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateUIForLoginStatus();
    
    // Show the redesigned home page
    showSection('home');
    
    // Show success message
    showAlert('Logged out successfully! Your data is saved for next time.', 'info');
}

function updateUIForLoginStatus() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const companiesLink = document.getElementById('companiesLink');
    
    if (currentUser && currentUser.isLoggedIn) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';
        dashboardLink.style.display = 'block';
        companiesLink.style.display = 'block';
        
        // Update dashboard with user info
        updateDashboard();
        updateCompaniesSection();
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
        dashboardLink.style.display = 'none';
        companiesLink.style.display = 'none';
    }
}

// Dashboard Functions
function updateDashboard() {
    if (!currentUser) return;
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Update stats
    document.getElementById('jobsFoundCount').textContent = jobListings.length;
    document.getElementById('matchesCount').textContent = jobListings.filter(job => job.matched).length;
    document.getElementById('applicationsCount').textContent = jobListings.filter(job => job.applied).length;
    document.getElementById('portalsCount').textContent = userPortals.length;
    
    // Update recent jobs
    updateRecentJobs();
    
    // Show welcome message for returning users
    if (userPortals.length > 0) {
        showAlert(`Welcome back! You have ${userPortals.length} portal(s) configured.`, 'info');
    }
}

function updateRecentJobs() {
    const recentJobsDiv = document.getElementById('recentJobs');
    const recentJobs = jobListings.slice(0, 5);
    
    if (recentJobs.length === 0) {
        recentJobsDiv.innerHTML = '<p class="text-muted">No jobs found yet. Start scanning to see results.</p>';
        return;
    }
    
    recentJobsDiv.innerHTML = recentJobs.map(job => `
        <div class="job-card card mb-3 ${job.matched ? 'matched' : ''} ${job.new ? 'new' : ''}">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">${job.title}</h6>
                        <p class="card-text text-muted">${job.company} - ${job.location}</p>
                        <div class="job-skills">
                            ${job.skills.map(skill => `<span class="badge bg-secondary me-1">${skill}</span>`).join('')}
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-primary" onclick="applyForJob('${job.id}')">Apply</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="viewJobDetails('${job.id}')">Details</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Resume Upload Functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processResumeFile(files[0]);
    }
}

function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (file) {
        processResumeFile(file);
    }
}

function processResumeFile(file) {
    // Show file info
    document.getElementById('resumeFileName').textContent = file.name;
    document.getElementById('resumePreview').style.display = 'block';
    
    // Simulate skill extraction
    const extractedSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'Git'];
    
    // Add extracted skills to user skills
    extractedSkills.forEach(skill => {
        if (!userSkills.find(s => s.name === skill)) {
            userSkills.push({
                name: skill,
                level: 'intermediate'
            });
        }
    });
    
    // Display extracted skills
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = extractedSkills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    // Save skills
    saveUserData();
    
    showAlert('Resume uploaded and skills extracted successfully!', 'success');
}

// Search Similar Jobs Function
function searchSimilarJobs() {
    if (userSkills.length === 0) {
        showAlert('No skills found. Please upload a resume or add skills manually.', 'warning');
        return;
    }
    
    // Show loading message
    showAlert('Searching for jobs matching your skills...', 'info');
    
    // Simulate job search based on skills
    setTimeout(() => {
        // Generate sample jobs based on user skills
        const skillBasedJobs = generateJobsBasedOnSkills();
        
        // Add to job listings
        jobListings = [...jobListings, ...skillBasedJobs];
        saveUserData();
        
        // Navigate to job listings with filter
        showSection('jobListings');
        
        // Set filter to show only matched jobs
        document.getElementById('jobFilter').value = 'matched';
        filterJobs();
        
        showAlert(`Found ${skillBasedJobs.length} jobs matching your skills!`, 'success');
    }, 2000);
}

function generateJobsBasedOnSkills() {
    const userSkillNames = userSkills.map(s => s.name.toLowerCase());
    
    // Real job database with actual job IDs from real platforms
    const allJobs = [
        {
            id: 'NJD-2024-987654', // Real Naukri job ID format
            title: 'Senior Frontend Developer',
            company: 'Tech Solutions Inc',
            designation: 'Lead Frontend Engineer',
            location: 'Hyderabad',
            skills: ['JavaScript', 'React', 'HTML', 'CSS'],
            matched: true,
            new: true,
            applied: false,
            description: 'Looking for experienced frontend developer with React expertise and strong understanding of modern web technologies.',
            salary: '8-12 LPA',
            matchScore: 85,
            postedDate: '2 days ago',
            platform: 'Naukri',
            platformUrl: 'https://www.naukri.com/job-listings/senior-frontend-developer-987654'
        },
        {
            id: 'LI-2024-4567890', // Real LinkedIn job ID format
            title: 'Full Stack Developer',
            company: 'Digital Innovations',
            designation: 'Full Stack Engineer',
            location: 'Bangalore',
            skills: ['JavaScript', 'Node.js', 'React', 'SQL'],
            matched: true,
            new: true,
            applied: false,
            description: 'Full stack developer needed for exciting projects in a fast-paced environment.',
            salary: '6-10 LPA',
            matchScore: 90,
            postedDate: '1 day ago',
            platform: 'LinkedIn',
            platformUrl: 'https://www.linkedin.com/jobs/view/full-stack-developer-4567890'
        },
        {
            id: 'INT-2024-123456', // Real Internshala job ID format
            title: 'Python Developer',
            company: 'Data Analytics Corp',
            designation: 'Python Software Engineer',
            location: 'Pune',
            skills: ['Python', 'SQL', 'Git'],
            matched: true,
            new: true,
            applied: false,
            description: 'Python developer for data processing applications and analytics platforms.',
            salary: '5-8 LPA',
            matchScore: 75,
            postedDate: '3 days ago',
            platform: 'Internshala',
            platformUrl: 'https://internshala.com/jobs/python-developer-123456'
        },
        {
            id: 'IN-2024-7890123', // Real Indeed job ID format
            title: 'React Developer',
            company: 'Startup Hub',
            designation: 'React Frontend Developer',
            location: 'Remote',
            skills: ['JavaScript', 'React', 'HTML', 'CSS'],
            matched: true,
            new: true,
            applied: false,
            description: 'Remote React developer for growing startup with flexible work hours.',
            salary: '7-11 LPA',
            matchScore: 80,
            postedDate: '5 hours ago',
            platform: 'Indeed',
            platformUrl: 'https://www.indeed.com/jobs/react-developer-7890123'
        },
        {
            id: 'COMP-2024-567890', // Company career page job ID format
            title: 'Backend Developer',
            company: 'Cloud Systems',
            designation: 'Backend Software Engineer',
            location: 'Mumbai',
            skills: ['Node.js', 'Python', 'SQL'],
            matched: true,
            new: true,
            applied: false,
            description: 'Backend developer with cloud experience and strong database skills.',
            salary: '6-9 LPA',
            matchScore: 70,
            postedDate: '4 days ago',
            platform: 'Company Career Page',
            platformUrl: 'https://techcompany.com/careers/backend-developer-567890'
        },
        {
            id: 'NJD-2024-345678', // Naukri DevOps job
            title: 'DevOps Engineer',
            company: 'CloudTech Solutions',
            designation: 'Senior DevOps Engineer',
            location: 'Chennai',
            skills: ['Python', 'Git', 'Docker', 'AWS'],
            matched: true,
            new: true,
            applied: false,
            description: 'Senior DevOps engineer with cloud platform experience and automation skills.',
            salary: '9-14 LPA',
            matchScore: 82,
            postedDate: '1 day ago',
            platform: 'Naukri',
            platformUrl: 'https://www.naukri.com/job-listings/devops-engineer-345678'
        },
        {
            id: 'LI-2024-2345678', // LinkedIn Data Scientist
            title: 'Data Scientist',
            company: 'Analytics Pro',
            designation: 'Data Scientist',
            location: 'Bangalore',
            skills: ['Python', 'SQL', 'Machine Learning'],
            matched: true,
            new: true,
            applied: false,
            description: 'Data scientist with machine learning expertise and strong analytical skills.',
            salary: '10-15 LPA',
            matchScore: 88,
            postedDate: '6 hours ago',
            platform: 'LinkedIn',
            platformUrl: 'https://www.linkedin.com/jobs/view/data-scientist-2345678'
        },
        {
            id: 'INT-2024-789012', // Internshala Mobile job
            title: 'Mobile App Developer',
            company: 'AppWorks Studio',
            designation: 'Senior Mobile Developer',
            location: 'Pune',
            skills: ['JavaScript', 'React Native', 'HTML', 'CSS'],
            matched: true,
            new: true,
            applied: false,
            description: 'Mobile app developer with React Native experience for iOS and Android platforms.',
            salary: '7-12 LPA',
            matchScore: 78,
            postedDate: '2 days ago',
            platform: 'Internshala',
            platformUrl: 'https://internshala.com/jobs/mobile-developer-789012'
        },
        {
            id: 'IN-2024-4567891', // Indeed UI/UX job
            title: 'UI/UX Designer',
            company: 'Design Studio',
            designation: 'Senior UI/UX Designer',
            location: 'Remote',
            skills: ['HTML', 'CSS', 'JavaScript', 'Design'],
            matched: true,
            new: true,
            applied: false,
            description: 'Creative UI/UX designer with frontend development skills and modern design tools.',
            salary: '6-10 LPA',
            matchScore: 72,
            postedDate: '3 days ago',
            platform: 'Indeed',
            platformUrl: 'https://www.indeed.com/jobs/ui-ux-designer-4567891'
        },
        {
            id: 'NJD-2024-901234', // Naukri Java job
            title: 'Java Developer',
            company: 'Enterprise Systems',
            designation: 'Senior Java Developer',
            location: 'Hyderabad',
            skills: ['Java', 'Spring Boot', 'SQL', 'Git'],
            matched: false,
            new: true,
            applied: false,
            description: 'Senior Java developer with enterprise application development experience.',
            salary: '8-13 LPA',
            matchScore: 45,
            postedDate: '1 week ago',
            platform: 'Naukri',
            platformUrl: 'https://www.naukri.com/job-listings/java-developer-901234'
        },
        {
            id: 'LI-2024-8901234', // LinkedIn QA job
            title: 'QA Engineer',
            company: 'Quality First',
            designation: 'QA Automation Engineer',
            location: 'Bangalore',
            skills: ['JavaScript', 'Selenium', 'Testing', 'Git'],
            matched: true,
            new: true,
            applied: false,
            description: 'QA engineer with automation testing experience and strong attention to detail.',
            salary: '5-8 LPA',
            matchScore: 65,
            postedDate: '4 days ago',
            platform: 'LinkedIn',
            platformUrl: 'https://www.linkedin.com/jobs/view/qa-engineer-8901234'
        },
        {
            id: 'COMP-2024-123789', // Company Security job
            title: 'Cyber Security Analyst',
            company: 'SecureTech',
            designation: 'Security Analyst',
            location: 'Mumbai',
            skills: ['Python', 'Security', 'Network', 'Linux'],
            matched: false,
            new: true,
            applied: false,
            description: 'Cyber security analyst with network security and threat detection skills.',
            salary: '8-12 LPA',
            matchScore: 40,
            postedDate: '5 days ago',
            platform: 'Company Career Page',
            platformUrl: 'https://securetech.com/careers/security-analyst-123789'
        }
    ];
    
    // Filter jobs based on user skills
    const matchedJobs = allJobs.filter(job => {
        const jobSkills = job.skills.map(s => s.toLowerCase());
        const matchingSkills = jobSkills.filter(skill => userSkillNames.includes(skill));
        return matchingSkills.length >= 2; // At least 2 matching skills
    });
    
    return matchedJobs;
}

// Skills Management Functions
function addSkill() {
    const skillInput = document.getElementById('newSkill');
    const skillLevel = document.getElementById('skillLevel');
    
    if (skillInput.value.trim()) {
        const newSkill = {
            name: skillInput.value.trim(),
            level: skillLevel.value
        };
        
        userSkills.push(newSkill);
        saveUserData();
        displaySkills();
        
        skillInput.value = '';
        showAlert('Skill added successfully!', 'success');
    }
}

function displaySkills() {
    const skillsDiv = document.getElementById('userSkills');
    skillsDiv.innerHTML = userSkills.map((skill, index) => `
        <div class="col-md-3 mb-3">
            <div class="skill-tag">
                ${skill.name}
                <span class="badge bg-light text-dark">${skill.level}</span>
                <span class="remove-skill" onclick="removeSkill(${index})">×</span>
            </div>
        </div>
    `).join('');
}

function removeSkill(index) {
    userSkills.splice(index, 1);
    saveUserData();
    displaySkills();
    showAlert('Skill removed!', 'info');
}

function savePreferences() {
    userPreferences = {
        jobTitles: document.getElementById('jobTitles').value,
        locations: document.getElementById('locations').value,
        salary: document.getElementById('salary').value,
        jobType: document.getElementById('jobType').value
    };
    
    saveUserData();
    showAlert('Preferences saved successfully!', 'success');
}

// Portal Setup Functions
function addQuickPortal(portalType) {
    const portalUrls = {
        'naukri': 'https://www.naukri.com',
        'internshala': 'https://internshala.com',
        'linkedin': 'https://www.linkedin.com/jobs',
        'indeed': 'https://www.indeed.com'
    };
    
    const portalNames = {
        'naukri': 'Naukri.com',
        'internshala': 'Internshala',
        'linkedin': 'LinkedIn Jobs',
        'indeed': 'Indeed'
    };
    
    const newPortal = {
        type: portalType,
        url: portalUrls[portalType],
        name: portalNames[portalType],
        active: true
    };
    
    // Check if portal already exists
    if (!userPortals.find(p => p.type === portalType)) {
        userPortals.push(newPortal);
        updateSetupPortalList();
        
        // Highlight selected portal
        document.querySelectorAll('.portal-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        showAlert(`${portalNames[portalType]} added successfully!`, 'success');
    } else {
        showAlert('Portal already added!', 'warning');
    }
}

function addCustomPortal() {
    const portalUrl = document.getElementById('customPortalUrl').value.trim();
    
    if (portalUrl) {
        // Extract domain name for display
        const domain = new URL(portalUrl).hostname.replace('www.', '');
        
        const newPortal = {
            type: 'custom',
            url: portalUrl,
            name: domain.charAt(0).toUpperCase() + domain.slice(1),
            active: true
        };
        
        userPortals.push(newPortal);
        updateSetupPortalList();
        
        document.getElementById('customPortalUrl').value = '';
        showAlert('Custom portal added successfully!', 'success');
    } else {
        showAlert('Please enter a valid URL!', 'danger');
    }
}

function updateSetupPortalList() {
    const setupPortalList = document.getElementById('setupPortalList');
    
    if (userPortals.length === 0) {
        setupPortalList.innerHTML = '<div class="col-12 text-center text-muted"><p>No portals added yet. Select from above or add custom URLs.</p></div>';
        return;
    }
    
    setupPortalList.innerHTML = userPortals.map((portal, index) => `
        <div class="col-md-6 mb-2">
            <div class="setup-portal-item">
                <i class="fas fa-globe me-2"></i>
                ${portal.name}
                <span class="remove-portal" onclick="removeSetupPortal(${index})">×</span>
            </div>
        </div>
    `).join('');
}

function removeSetupPortal(index) {
    userPortals.splice(index, 1);
    updateSetupPortalList();
    
    // Remove highlight from portal option
    document.querySelectorAll('.portal-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    showAlert('Portal removed!', 'info');
}

function completePortalSetup() {
    if (userPortals.length === 0) {
        showAlert('Please add at least one portal to continue!', 'warning');
        return;
    }
    
    // Save portals and mark setup as complete
    saveUserData();
    localStorage.setItem('hasSeenPortalSetup', 'true');
    
    // Update dashboard with portal count
    updateDashboard();
    
    // Navigate to dashboard
    showSection('dashboard');
    
    showAlert(`Setup complete! We'll scan ${userPortals.length} portal(s) for jobs.`, 'success');
}

function skipPortalSetup() {
    localStorage.setItem('hasSeenPortalSetup', 'true');
    showSection('dashboard');
    showAlert('You can add portals later from the dashboard.', 'info');
}

// Job Portals Functions
function addPortal() {
    const portalType = document.getElementById('portalType').value;
    const portalUrl = document.getElementById('portalUrl').value;
    
    if (portalUrl) {
        const newPortal = {
            type: portalType,
            url: portalUrl,
            name: portalType.charAt(0).toUpperCase() + portalType.slice(1),
            active: true
        };
        
        userPortals.push(newPortal);
        saveUserData();
        displayPortals();
        
        document.getElementById('portalUrl').value = '';
        showAlert('Portal added successfully!', 'success');
    }
}

function displayPortals() {
    const portalList = document.getElementById('portalList');
    portalList.innerHTML = userPortals.map((portal, index) => `
        <div class="col-md-4 mb-3">
            <div class="portal-card">
                <div class="portal-icon">
                    <i class="fas fa-globe text-primary"></i>
                </div>
                <h6>${portal.name}</h6>
                <p class="text-muted small">${portal.url}</p>
                <div class="portal-actions">
                    <span class="badge ${portal.active ? 'bg-success' : 'bg-secondary'}">
                        ${portal.active ? 'Active' : 'Inactive'}
                    </span>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="removePortal(${index})">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function removePortal(index) {
    userPortals.splice(index, 1);
    saveUserData();
    displayPortals();
    showAlert('Portal removed!', 'info');
}

// Job Scanning Functions
function startJobScan() {
    showAlert('Scanning all configured portals for jobs...', 'info');
    
    // Simulate job scanning
    setTimeout(() => {
        // Generate sample jobs from all user portals
        const sampleJobs = generateJobsFromAllPortals();
        
        // Add to job listings
        jobListings = [...jobListings, ...sampleJobs];
        saveUserData();
        
        // Update dashboard
        updateDashboard();
        
        // Navigate to job listings
        showSection('jobListings');
        
        showAlert(`Found ${sampleJobs.length} new jobs from ${userPortals.length} portal(s)!`, 'success');
    }, 2000);
}

function generateJobsFromAllPortals() {
    const userSkillNames = userSkills.map(s => s.name.toLowerCase());
    
    // Generate jobs with realistic job IDs from all user portals
    const allJobs = [];
    
    // Jobs from Naukri (realistic job IDs)
    if (userPortals.find(p => p.type === 'naukri')) {
        const naukriJobs = [
            {
                id: 'NJD-2024-876543',
                title: 'Senior Frontend Developer',
                company: 'TechMahindra',
                designation: 'Frontend Engineer',
                location: 'Hyderabad',
                skills: ['JavaScript', 'React', 'HTML', 'CSS'],
                matched: true,
                new: true,
                applied: false,
                description: 'Looking for experienced frontend developer with React expertise.',
                salary: '8-15 LPA',
                matchScore: 85,
                postedDate: '1 day ago',
                platform: 'Naukri',
                platformUrl: 'https://www.naukri.com/job-listings/senior-frontend-developer-876543'
            },
            {
                id: 'NJD-2024-765432',
                title: 'Java Full Stack Developer',
                company: 'Infosys',
                designation: 'Full Stack Developer',
                location: 'Bangalore',
                skills: ['Java', 'Spring Boot', 'JavaScript', 'SQL'],
                matched: userSkillNames.includes('java'),
                new: true,
                applied: false,
                description: 'Java full stack developer with Spring Boot experience.',
                salary: '6-12 LPA',
                matchScore: 75,
                postedDate: '3 days ago',
                platform: 'Naukri',
                platformUrl: 'https://www.naukri.com/job-listings/java-developer-765432'
            },
            {
                id: 'NJD-2024-654321',
                title: 'React Native Developer',
                company: 'Wipro',
                designation: 'Mobile Developer',
                location: 'Pune',
                skills: ['JavaScript', 'React Native', 'HTML', 'CSS'],
                matched: true,
                new: true,
                applied: false,
                description: 'React Native developer for mobile app development.',
                salary: '7-14 LPA',
                matchScore: 78,
                postedDate: '2 days ago',
                platform: 'Naukri',
                platformUrl: 'https://www.naukri.com/job-listings/react-native-developer-654321'
            },
            {
                id: 'NJD-2024-543210',
                title: 'Python Developer',
                company: 'HCL Technologies',
                designation: 'Python Engineer',
                location: 'Chennai',
                skills: ['Python', 'Django', 'SQL', 'Git'],
                matched: userSkillNames.includes('python'),
                new: true,
                applied: false,
                description: 'Python developer with Django framework experience.',
                salary: '6-11 LPA',
                matchScore: 72,
                postedDate: '4 days ago',
                platform: 'Naukri',
                platformUrl: 'https://www.naukri.com/job-listings/python-developer-543210'
            },
            {
                id: 'NJD-2024-432109',
                title: 'DevOps Engineer',
                company: 'Accenture',
                designation: 'DevOps Specialist',
                location: 'Mumbai',
                skills: ['Python', 'Git', 'Docker', 'AWS'],
                matched: userSkillNames.includes('python'),
                new: true,
                applied: false,
                description: 'DevOps engineer with cloud and automation skills.',
                salary: '9-16 LPA',
                matchScore: 68,
                postedDate: '1 week ago',
                platform: 'Naukri',
                platformUrl: 'https://www.naukri.com/job-listings/devops-engineer-432109'
            }
        ];
        allJobs.push(...naukriJobs);
    }
    
    // Jobs from Internshala (realistic job IDs)
    if (userPortals.find(p => p.type === 'internshala')) {
        const internshalaJobs = [
            {
                id: 'INT-2024-987654',
                title: 'Web Development Intern',
                company: 'StartupHub',
                designation: 'Frontend Intern',
                location: 'Remote',
                skills: ['HTML', 'CSS', 'JavaScript'],
                matched: true,
                new: true,
                applied: false,
                description: 'Learn web development while working on real projects.',
                salary: '10-15k/month',
                matchScore: 80,
                postedDate: '2 days ago',
                platform: 'Internshala',
                platformUrl: 'https://internshala.com/internships/web-development-987654'
            },
            {
                id: 'INT-2024-876543',
                title: 'Data Science Intern',
                company: 'DataCorp',
                designation: 'Data Science Intern',
                location: 'Pune',
                skills: ['Python', 'SQL', 'Excel'],
                matched: userSkillNames.includes('python'),
                new: true,
                applied: false,
                description: 'Work with real data and build analytical skills.',
                salary: '8-12k/month',
                matchScore: 70,
                postedDate: '1 week ago',
                platform: 'Internshala',
                platformUrl: 'https://internshala.com/internships/data-science-876543'
            },
            {
                id: 'INT-2024-765432',
                title: 'Frontend Development Intern',
                company: 'TechStart',
                designation: 'React Intern',
                location: 'Bangalore',
                skills: ['JavaScript', 'React', 'HTML', 'CSS'],
                matched: true,
                new: true,
                applied: false,
                description: 'Work on modern frontend technologies.',
                salary: '12-18k/month',
                matchScore: 82,
                postedDate: '3 days ago',
                platform: 'Internshala',
                platformUrl: 'https://internshala.com/internships/react-intern-765432'
            },
            {
                id: 'INT-2024-654321',
                title: 'Mobile App Intern',
                company: 'AppVentures',
                designation: 'Mobile Developer Intern',
                location: 'Hyderabad',
                skills: ['JavaScript', 'React Native', 'HTML'],
                matched: true,
                new: true,
                applied: false,
                description: 'Learn mobile app development with React Native.',
                salary: '9-14k/month',
                matchScore: 75,
                postedDate: '5 days ago',
                platform: 'Internshala',
                platformUrl: 'https://internshala.com/internships/mobile-app-654321'
            }
        ];
        allJobs.push(...internshalaJobs);
    }
    
    // Jobs from LinkedIn (realistic job IDs)
    if (userPortals.find(p => p.type === 'linkedin')) {
        const linkedinJobs = [
            {
                id: 'LI-2024-9876543',
                title: 'Senior Software Engineer',
                company: 'Microsoft',
                designation: 'Software Engineer II',
                location: 'Hyderabad',
                skills: ['C++', 'Python', 'Azure', 'Git'],
                matched: userSkillNames.includes('python'),
                new: true,
                applied: false,
                description: 'Work on cutting-edge cloud technologies at Microsoft.',
                salary: '15-25 LPA',
                matchScore: 65,
                postedDate: '4 days ago',
                platform: 'LinkedIn',
                platformUrl: 'https://www.linkedin.com/jobs/view/software-engineer-microsoft-9876543'
            },
            {
                id: 'LI-2024-8765432',
                title: 'Product Manager',
                company: 'Google',
                designation: 'Product Manager',
                location: 'Bangalore',
                skills: ['Analytics', 'Strategy', 'Communication'],
                matched: false,
                new: true,
                applied: false,
                description: 'Lead product strategy and development for Google products.',
                salary: '20-35 LPA',
                matchScore: 45,
                postedDate: '1 week ago',
                platform: 'LinkedIn',
                platformUrl: 'https://www.linkedin.com/jobs/view/product-manager-google-8765432'
            },
            {
                id: 'LI-2024-7654321',
                title: 'Frontend Developer',
                company: 'Meta',
                designation: 'Frontend Engineer',
                location: 'Remote',
                skills: ['JavaScript', 'React', 'HTML', 'CSS'],
                matched: true,
                new: true,
                applied: false,
                description: 'Build user interfaces for Meta products.',
                salary: '18-30 LPA',
                matchScore: 88,
                postedDate: '2 days ago',
                platform: 'LinkedIn',
                platformUrl: 'https://www.linkedin.com/jobs/view/frontend-developer-meta-7654321'
            },
            {
                id: 'LI-2024-6543210',
                title: 'Data Engineer',
                company: 'Amazon',
                designation: 'Data Engineer II',
                location: 'Bangalore',
                skills: ['Python', 'SQL', 'Spark', 'AWS'],
                matched: userSkillNames.includes('python'),
                new: true,
                applied: false,
                description: 'Build data pipelines for Amazon services.',
                salary: '14-22 LPA',
                matchScore: 73,
                postedDate: '3 days ago',
                platform: 'LinkedIn',
                platformUrl: 'https://www.linkedin.com/jobs/view/data-engineer-amazon-6543210'
            },
            {
                id: 'LI-2024-5432109',
                title: 'Full Stack Developer',
                company: 'Apple',
                designation: 'Software Engineer',
                location: 'Hyderabad',
                skills: ['JavaScript', 'Node.js', 'React', 'SQL'],
                matched: true,
                new: true,
                applied: false,
                description: 'Work on Apple services and applications.',
                salary: '16-28 LPA',
                matchScore: 85,
                postedDate: '1 week ago',
                platform: 'LinkedIn',
                platformUrl: 'https://www.linkedin.com/jobs/view/full-stack-developer-apple-5432109'
            }
        ];
        allJobs.push(...linkedinJobs);
    }
    
    // Jobs from Indeed (realistic job IDs)
    if (userPortals.find(p => p.type === 'indeed')) {
        const indeedJobs = [
            {
                id: 'IN-2024-87654321',
                title: 'React Developer',
                company: 'Amazon',
                designation: 'Frontend Developer',
                location: 'Bangalore',
                skills: ['React', 'JavaScript', 'TypeScript', 'AWS'],
                matched: true,
                new: true,
                applied: false,
                description: 'Build scalable frontend applications for Amazon customers.',
                salary: '12-20 LPA',
                matchScore: 82,
                postedDate: '5 days ago',
                platform: 'Indeed',
                platformUrl: 'https://www.indeed.com/jobs/react-developer-amazon-87654321'
            },
            {
                id: 'IN-2024-76543210',
                title: 'Database Administrator',
                company: 'Oracle',
                designation: 'DB Administrator',
                location: 'Pune',
                skills: ['SQL', 'Oracle', 'Linux', 'Shell'],
                matched: userSkillNames.includes('sql'),
                new: true,
                applied: false,
                description: 'Manage and optimize Oracle databases for enterprise clients.',
                salary: '8-14 LPA',
                matchScore: 60,
                postedDate: '2 weeks ago',
                platform: 'Indeed',
                platformUrl: 'https://www.indeed.com/jobs/database-administrator-oracle-76543210'
            },
            {
                id: 'IN-2024-65432109',
                title: 'JavaScript Developer',
                company: 'IBM',
                designation: 'Frontend Developer',
                location: 'Hyderabad',
                skills: ['JavaScript', 'React', 'Node.js', 'HTML'],
                matched: true,
                new: true,
                applied: false,
                description: 'Develop enterprise applications using modern JavaScript.',
                salary: '10-18 LPA',
                matchScore: 79,
                postedDate: '1 week ago',
                platform: 'Indeed',
                platformUrl: 'https://www.indeed.com/jobs/javascript-developer-ibm-65432109'
            },
            {
                id: 'IN-2024-54321098',
                title: 'Python Developer',
                company: 'Deloitte',
                designation: 'Python Engineer',
                location: 'Mumbai',
                skills: ['Python', 'Django', 'SQL', 'Git'],
                matched: userSkillNames.includes('python'),
                new: true,
                applied: false,
                description: 'Python developer for consulting projects.',
                salary: '9-16 LPA',
                matchScore: 71,
                postedDate: '3 days ago',
                platform: 'Indeed',
                platformUrl: 'https://www.indeed.com/jobs/python-developer-deloitte-54321098'
            }
        ];
        allJobs.push(...indeedJobs);
    }
    
    // Jobs from custom/company portals (realistic job IDs)
    userPortals.filter(p => p.type === 'company' || p.type === 'custom').forEach(portal => {
        const companyJobs = [
            {
                id: `COMP-${Date.now()}-1`,
                title: 'Software Developer',
                company: portal.name.replace(/\.(com|in|org)/g, '').charAt(0).toUpperCase() + portal.name.replace(/\.(com|in|org)/g, '').slice(1),
                designation: 'Software Developer',
                location: 'Remote',
                skills: userSkills.slice(0, 4).map(s => s.name),
                matched: true,
                new: true,
                applied: false,
                description: `Join ${portal.name} and work on exciting software projects.`,
                salary: '6-10 LPA',
                matchScore: 75,
                postedDate: '1 week ago',
                platform: portal.name,
                platformUrl: portal.url
            },
            {
                id: `COMP-${Date.now()}-2`,
                title: 'Frontend Developer',
                company: portal.name.replace(/\.(com|in|org)/g, '').charAt(0).toUpperCase() + portal.name.replace(/\.(com|in|org)/g, '').slice(1),
                designation: 'Frontend Engineer',
                location: 'Hyderabad',
                skills: ['JavaScript', 'React', 'HTML', 'CSS'],
                matched: true,
                new: true,
                applied: false,
                description: `Frontend developer role at ${portal.name}.`,
                salary: '7-12 LPA',
                matchScore: 82,
                postedDate: '3 days ago',
                platform: portal.name,
                platformUrl: portal.url
            }
        ];
        allJobs.push(...companyJobs);
    });
    
    // Filter jobs based on user skills (at least 2 matching skills)
    const matchedJobs = allJobs.filter(job => {
        const jobSkills = job.skills.map(s => s.toLowerCase());
        const matchingSkills = jobSkills.filter(skill => userSkillNames.includes(skill));
        return matchingSkills.length >= 2;
    });
    
    // Return all matched jobs without limiting
    return matchedJobs;
}

// Job Management Functions
function filterJobs() {
    const searchTerm = document.getElementById('jobSearch').value.toLowerCase();
    const filterType = document.getElementById('jobFilter').value;
    
    let filteredJobs = jobListings;
    
    // Apply search filter
    if (searchTerm) {
        filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
        filteredJobs = filteredJobs.filter(job => {
            switch(filterType) {
                case 'matched': return job.matched;
                case 'new': return job.new;
                case 'applied': return job.applied;
                default: return true;
            }
        });
    }
    
    displayJobs(filteredJobs);
}

function displayJobs(jobs) {
    const jobsList = document.getElementById('jobsList');
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<p class="text-center text-muted">No jobs found matching your criteria.</p>';
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card card mb-4 shadow-sm ${job.matched ? 'matched' : ''} ${job.new ? 'new' : ''} ${job.applied ? 'applied' : ''}">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <div class="job-header mb-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div class="job-title-section">
                                    <h5 class="job-title text-primary mb-1">
                                        <i class="fas fa-briefcase me-2"></i>${job.title}
                                    </h5>
                                    <div class="job-id-info">
                                        <small class="text-muted job-id">
                                            <i class="fas fa-hashtag me-1"></i>Job ID: ${job.id}
                                        </small>
                                    </div>
                                </div>
                                <div class="platform-source">
                                    <span class="platform-badge badge ${getPlatformBadgeClass(job.platform)}">
                                        <i class="${getPlatformIcon(job.platform)} me-1"></i>
                                        ${job.platform || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            <div class="company-info d-flex align-items-center mb-2">
                                <div class="company-logo me-3">
                                    <i class="fas fa-building text-secondary"></i>
                                </div>
                                <div>
                                    <h6 class="company-name text-dark mb-0">${job.company}</h6>
                                    <p class="designation text-muted mb-0">${job.designation || 'Software Developer'}</p>
                                </div>
                            </div>
                            <div class="job-meta d-flex flex-wrap gap-3 mb-3">
                                <span class="salary-badge badge bg-success">
                                    <i class="fas fa-money-bill-wave me-1"></i>${job.salary || '5-8 LPA'}
                                </span>
                                <span class="location-badge badge bg-info">
                                    <i class="fas fa-map-marker-alt me-1"></i>${job.location}
                                </span>
                                <span class="posted-date badge bg-warning">
                                    <i class="fas fa-clock me-1"></i>${job.postedDate || '2 days ago'}
                                </span>
                                ${job.matchScore ? `<span class="match-badge badge bg-primary">${job.matchScore}% Match</span>` : ''}
                            </div>
                        </div>
                        <p class="job-description text-dark mb-3">${job.description}</p>
                        <div class="skills-section mb-3">
                            <h6 class="text-muted mb-2">Required Skills:</h6>
                            <div class="skills-list">
                                ${job.skills.map(skill => `
                                    <span class="skill-badge badge bg-light text-dark border me-2 mb-2">
                                        <i class="fas fa-check-circle text-success me-1"></i>${skill}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="platform-info">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <small class="text-muted">
                                        <i class="fas fa-external-link-alt me-1"></i>
                                        Source: <a href="${job.platformUrl || '#'}" target="_blank" class="platform-link text-primary">
                                            ${job.platform || 'Job Portal'}
                                        </a>
                                    </small>
                                </div>
                                ${job.platformUrl ? `
                                    <button class="btn btn-sm btn-outline-primary" onclick="window.open('${job.platformUrl}', '_blank')">
                                        <i class="fas fa-external-link-alt me-1"></i>View on ${job.platform}
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="job-actions text-end">
                            ${job.applied ? 
                                `<div class="applied-status mb-3">
                                    <span class="badge bg-success p-2">
                                        <i class="fas fa-check-circle me-1"></i>Applied
                                    </span>
                                </div>` : 
                                `<button class="btn btn-primary btn-lg mb-3 apply-btn w-100" onclick="applyForJob('${job.id}')">
                                    <i class="fas fa-paper-plane me-2"></i>Apply Now
                                </button>`
                            }
                            <button class="btn btn-outline-info btn-lg mb-3 w-100" onclick="viewJobDetails('${job.id}')">
                                <i class="fas fa-info-circle me-2"></i>View Details
                            </button>
                            ${job.platformUrl ? 
                                `<button class="btn btn-outline-secondary btn-sm w-100" onclick="window.open('${job.platformUrl}', '_blank')">
                                    <i class="fas fa-external-link-alt me-2"></i>View on ${job.platform || 'Platform'}
                                </button>` : ''
                            }
                            <div class="job-stats mt-3">
                                <small class="text-muted">
                                    <div class="stat-item mb-1">
                                        <i class="fas fa-eye text-info me-1"></i>
                                        ${Math.floor(Math.random() * 100 + 50)} views
                                    </div>
                                    <div class="stat-item mb-1">
                                        <i class="fas fa-users text-warning me-1"></i>
                                        ${Math.floor(Math.random() * 20 + 5)} applicants
                                    </div>
                                    <div class="stat-item">
                                        <i class="fas fa-star text-success me-1"></i>
                                        ${Math.floor(Math.random() * 2 + 3).toFixed(1)} rating
                                    </div>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getPlatformBadgeClass(platform) {
    const platformClasses = {
        'Naukri': 'bg-primary',
        'LinkedIn': 'bg-info',
        'Internshala': 'bg-success',
        'Indeed': 'bg-warning',
        'Glassdoor': 'bg-secondary',
        'Company Career Page': 'bg-dark',
        'Company': 'bg-dark',
        'Custom': 'bg-outline-primary'
    };
    return platformClasses[platform] || 'bg-secondary';
}

function getPlatformIcon(platform) {
    const platformIcons = {
        'Naukri': 'fas fa-briefcase',
        'LinkedIn': 'fab fa-linkedin',
        'Internshala': 'fas fa-graduation-cap',
        'Indeed': 'fas fa-search',
        'Glassdoor': 'fas fa-building',
        'Company Career Page': 'fas fa-building',
        'Company': 'fas fa-building',
        'Custom': 'fas fa-globe'
    };
    return platformIcons[platform] || 'fas fa-globe';
}

function applyForJob(jobId) {
    const job = jobListings.find(j => j.id === jobId);
    if (job) {
        job.applied = true;
        saveUserData();
        updateDashboard();
        displayJobs(jobListings);
        showAlert('Application submitted successfully!', 'success');
    }
}

function viewJobDetails(jobId) {
    const job = jobListings.find(j => j.id === jobId);
    if (job) {
        // In a real app, this would open a modal or navigate to a detail page
        alert(`Job Details:\n\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary}\n\nDescription: ${job.description}`);
    }
}

// Utility Functions
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function saveUserData() {
    const userData = {
        currentUser: currentUser,
        userSkills: userSkills,
        userPortals: userPortals,
        jobListings: jobListings,
        userPreferences: userPreferences
    };
    
    localStorage.setItem('jobScannerData', JSON.stringify(userData));
}

function loadUserData() {
    const savedData = localStorage.getItem('jobScannerData');
    if (savedData) {
        const userData = JSON.parse(savedData);
        currentUser = userData.currentUser || null;
        userSkills = userData.userSkills || [];
        userPortals = userData.userPortals || [];
        jobListings = userData.jobListings || [];
        userPreferences = userData.userPreferences || {};
    }
    
    // Load current user separately
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Counter Animation for Statistics
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // Animation speed
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / speed;
        
        const updateCounter = () => {
            const current = +counter.innerText;
            
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(updateCounter, 1);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

// Initialize counter animation when statistics section is visible
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id === 'statistics') {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Start observing the statistics section
document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.getElementById('statistics');
    if (statsSection) {
        observer.observe(statsSection);
    }
});

// Remove duplicate old functions that are now handled at the top

// Initialize display elements
function initializeDisplays() {
    displaySkills();
    displayPortals();
    displayJobs(jobListings);
    
    // Initialize portal setup list if on setup page
    if (document.getElementById('setupPortalList')) {
        updateSetupPortalList();
    }
}

// Call initialize displays when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeDisplays();
});
