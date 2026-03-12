# Pre-Deployment Verification Script
# Run this before deploying to Render

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  GrievX Pre-Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Function to check file exists
function Test-FileExists {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "[OK] $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] $Description - MISSING!" -ForegroundColor Red
        $script:errors++
        return $false
    }
}

# Function to check folder exists
function Test-FolderExists {
    param($Path, $Description)
    if (Test-Path $Path -PathType Container) {
        Write-Host "[OK] $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] $Description - MISSING!" -ForegroundColor Red
        $script:errors++
        return $false
    }
}

# Function to check command exists
function Test-Command {
    param($Command, $Description)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        $version = & $Command --version 2>&1
        Write-Host "[OK] $Description - $version" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] $Description - NOT INSTALLED!" -ForegroundColor Red
        $script:errors++
        return $false
    }
}

Write-Host "Checking Project Structure..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

# Check main folders
Test-FolderExists "backend" "Backend folder"
Test-FolderExists "frontend" "Frontend folder"
Test-FolderExists "ml-service" "ML Service folder"
Test-FolderExists "docs" "Documentation folder"

Write-Host "`nChecking Backend Files..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Test-FileExists "backend\package.json" "Backend package.json"
Test-FileExists "backend\server.js" "Backend server.js"
Test-FileExists "backend\.env.example" "Backend .env.example"
Test-FileExists "backend\src\config\db.js" "Database config"
Test-FileExists "backend\src\routes\authRoutes.js" "Auth routes"
Test-FileExists "backend\src\routes\complaintRoutes.js" "Complaint routes"
Test-FileExists "backend\src\routes\mlRoutes.js" "ML routes"

Write-Host "`nChecking ML Service Files..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Test-FileExists "ml-service\requirements.txt" "ML requirements.txt"
Test-FileExists "ml-service\app\main.py" "ML main.py"
Test-FileExists "ml-service\app\config.py" "ML config.py"
Test-FileExists "ml-service\app\routes\text_routes.py" "Text classification routes"
Test-FileExists "ml-service\app\routes\image_routes.py" "Image classification routes"

Write-Host "`nChecking Frontend Files..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Test-FileExists "frontend\package.json" "Frontend package.json"
Test-FileExists "frontend\index.html" "Frontend index.html"
Test-FileExists "frontend\vite.config.js" "Vite config"
Test-FileExists "frontend\.env.example" "Frontend .env.example"
Test-FileExists "frontend\src\main.jsx" "Frontend main.jsx"
Test-FileExists "frontend\src\App.jsx" "Frontend App.jsx"
Test-FileExists "frontend\src\pages\HomePage.jsx" "HomePage component"
Test-FileExists "frontend\src\components\common\HelpChatbot.jsx" "HelpChatbot component"

Write-Host "`nChecking Documentation..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Test-FileExists "docs\RENDER_DEPLOYMENT_GUIDE.md" "Render Deployment Guide"
Test-FileExists "docs\DEPLOYMENT_CHECKLIST.md" "Deployment Checklist"
Test-FileExists "docs\RENDER_QUICK_REFERENCE.md" "Quick Reference Card"
Test-FileExists "README.md" "Project README"

Write-Host "`nChecking Development Tools..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Test-Command "node" "Node.js"
Test-Command "npm" "npm"
Test-Command "python" "Python"
Test-Command "pip" "pip"
Test-Command "git" "Git"

Write-Host "`nChecking Git Repository..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "[OK] Git repository initialized" -ForegroundColor Green
    
    # Check if there are uncommitted changes
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        Write-Host "[WARN] Uncommitted changes detected" -ForegroundColor Yellow
        Write-Host "       Run 'git add .' then 'git commit' before deploying" -ForegroundColor Yellow
        $script:warnings++
    } else {
        Write-Host "[OK] No uncommitted changes" -ForegroundColor Green
    }
    
    # Check if remote is configured
    $gitRemote = git remote -v 2>&1
    if ($gitRemote -match "origin") {
        Write-Host "[OK] Git remote configured" -ForegroundColor Green
    } else {
        Write-Host "[WARN] No Git remote configured" -ForegroundColor Yellow
        Write-Host "       Add remote with: git remote add origin <your-repo-url>" -ForegroundColor Yellow
        $script:warnings++
    }
} else {
    Write-Host "[FAIL] Git repository not initialized!" -ForegroundColor Red
    Write-Host "       Run: git init" -ForegroundColor Yellow
    $script:errors++
}

Write-Host "`nChecking for Sensitive Files..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

# Check if .env files exist (should not be committed)
$envFiles = @("backend\.env", "frontend\.env", "ml-service\.env", ".env")
$foundEnv = $false
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        if (-not $foundEnv) {
            Write-Host "[WARN] Found .env files (should not be committed to Git):" -ForegroundColor Yellow
            $foundEnv = $true
        }
        Write-Host "       - $file" -ForegroundColor Yellow
    }
}
if (-not $foundEnv) {
    Write-Host "[OK] No .env files found (good for deployment)" -ForegroundColor Green
}

# Check .gitignore
if (Test-Path ".gitignore") {
    Write-Host "[OK] .gitignore exists" -ForegroundColor Green
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\\.env") {
        Write-Host "[OK] .gitignore includes .env files" -ForegroundColor Green
    } else {
        Write-Host "[WARN] .gitignore does not exclude .env files" -ForegroundColor Yellow
        $script:warnings++
    }
} else {
    Write-Host "[WARN] No .gitignore file" -ForegroundColor Yellow
    $script:warnings++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verification Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "[SUCCESS] All checks passed! Ready to deploy!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "1. Read: docs\RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor White
    Write-Host "2. Push code to GitHub" -ForegroundColor White
    Write-Host "3. Create MongoDB Atlas database" -ForegroundColor White
    Write-Host "4. Deploy to Render" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "[WARNING] $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "`nYou can proceed, but review warnings above." -ForegroundColor Yellow
} else {
    Write-Host "[ERROR] $errors error(s) and $warnings warning(s) found" -ForegroundColor Red
    Write-Host "`nPlease fix errors before deploying!" -ForegroundColor Red
}

Write-Host "`n"
