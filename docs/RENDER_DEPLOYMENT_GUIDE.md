# GrievX - Complete Render Deployment Guide

## 🎯 Overview

This guide walks you through deploying all three services of the GrievX Smart Civic System to Render:
1. **Backend API** (Node.js/Express) → Web Service
2. **ML Service** (Python/FastAPI) → Web Service  
3. **Frontend** (React/Vite) → Static Site

**Total Cost**: FREE tier available for all services!

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] GitHub account (to host your code)
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] MongoDB Atlas account (free tier at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- [ ] Your code pushed to a GitHub repository

---

## 🗂️ Step 0: Prepare Your Repository

### Push Code to GitHub

```bash
cd "e:\My Programs\smart-civic-system"
git init
git add .
git commit -m "Initial commit - GrievX deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-civic-system.git
git push -u origin main
```

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create Database Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **FREE** tier (M0 Sandbox)
5. Choose cloud provider (AWS recommended) and region (closest to you)
6. Name cluster: `grievx-cluster`
7. Click **"Create Cluster"**

### 1.2 Create Database User

1. In Security → Database Access
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `grievx-admin`
5. Auto-generate a secure password (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### 1.3 Whitelist IP Addresses

1. In Security → Network Access
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is required for Render's dynamic IPs
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy the connection string, looks like:
   ```
   mongodb+srv://grievx-admin:<password>@grievx-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `/smart-civic`
   ```
   mongodb+srv://grievx-admin:YOUR_PASSWORD@grievx-cluster.xxxxx.mongodb.net/smart-civic?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING** - you'll need it soon!

---

## 🚀 Step 2: Deploy ML Service (First!)

**Why first?** Backend needs the ML service URL.

### 2.1 Create ML Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `smart-civic-system` repository

### 2.2 Configure ML Service

**Basic Settings:**
- **Name**: `grievx-ml-service`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `ml-service`
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install --upgrade pip && pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

**Advanced Settings:**
- **Instance Type**: FREE (512 MB RAM, shared CPU)
  - ⚠️ Note: Free tier may be slow for ML inference. Consider upgrading if needed.

**Environment Variables:**
Click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `ENVIRONMENT` | `production` |
| `LOG_LEVEL` | `info` |

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build and deployment
3. Once deployed, copy the service URL (e.g., `https://grievx-ml-service.onrender.com`)
4. Test it: Open `https://grievx-ml-service.onrender.com/docs` (should see FastAPI docs)

**⚠️ SAVE THIS URL** - you need it for the backend!

---

## 🔧 Step 3: Deploy Backend API

### 3.1 Create Backend Service on Render

1. Click **"New +"** → **"Web Service"**
2. Select `smart-civic-system` repository

### 3.2 Configure Backend Service

**Basic Settings:**
- **Name**: `grievx-backend`
- **Region**: Same as ML service (for lower latency)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install
  ```
- **Start Command**:
  ```bash
  npm start
  ```

**Advanced Settings:**
- **Instance Type**: FREE
- **Health Check Path**: `/api/health` (optional but recommended)

**Environment Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `10000` | Render uses this by default |
| `NODE_ENV` | `production` | |
| `MONGODB_URI` | `mongodb+srv://grievx-admin:YOUR_PASSWORD@...` | From Step 1.4 |
| `JWT_SECRET` | `your-super-secret-jwt-key-min-32-characters-long` | Generate random 32+ char string |
| `JWT_EXPIRY` | `7d` | |
| `ML_SERVICE_URL` | `https://grievx-ml-service.onrender.com` | From Step 2.3 |
| `CORS_ORIGINS` | `https://grievx-frontend.onrender.com` | Will update after frontend deploy |
| `LOG_LEVEL` | `info` | |

**Generate Secure JWT Secret:**
```bash
# In terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Copy the backend URL (e.g., `https://grievx-backend.onrender.com`)
4. Test it: Open `https://grievx-backend.onrender.com/api/health`

**⚠️ SAVE THIS URL** - needed for frontend!

---

## 🎨 Step 4: Deploy Frontend

### 4.1 Create Static Site on Render

1. Click **"New +"** → **"Static Site"**
2. Select `smart-civic-system` repository

### 4.2 Configure Frontend

**Basic Settings:**
- **Name**: `grievx-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: `dist`

**Environment Variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://grievx-backend.onrender.com/api` |

### 4.3 Deploy

1. Click **"Create Static Site"**
2. Wait 3-5 minutes
3. Copy your frontend URL (e.g., `https://grievx-frontend.onrender.com`)

---

## 🔄 Step 5: Update Backend CORS

After frontend is deployed, update backend to allow frontend origin:

1. Go to Render Dashboard → **grievx-backend** service
2. Go to **Environment** tab
3. Edit `CORS_ORIGINS` variable:
   ```
   https://grievx-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## ✅ Step 6: Verification & Testing

### 6.1 Test Each Service

**ML Service:**
- Visit: `https://grievx-ml-service.onrender.com/docs`
- Should see FastAPI Swagger UI

**Backend API:**
- Visit: `https://grievx-backend.onrender.com/api/health`
- Should return: `{"status":"ok","service":"Smart Civic System API"}`

**Frontend:**
- Visit: `https://grievx-frontend.onrender.com`
- Should see GrievX homepage
- Try registering a test user
- Try logging in
- Test filing a complaint

### 6.2 Test Integration

1. **User Registration:**
   - Register new user on frontend
   - Check MongoDB Atlas → Collections → users

2. **ML Classification:**
   - File a complaint with description
   - Check if category is auto-assigned
   - View ML service logs in Render dashboard

3. **Analytics:**
   - Navigate to Analytics section on homepage
   - Verify charts load with real data

---

## 📊 Service URLs Summary

After deployment, save these URLs:

```
Frontend:  https://grievx-frontend.onrender.com
Backend:   https://grievx-backend.onrender.com
ML Service: https://grievx-ml-service.onrender.com
Database:  mongodb+srv://grievx-admin:***@grievx-cluster.xxxxx.mongodb.net/smart-civic
```

---

## ⚠️ Important Notes

### Free Tier Limitations

1. **Cold Starts**: Services spin down after 15 minutes of inactivity
   - First request after idle will take 30-60 seconds
   - Solution: Upgrade to paid tier ($7/month per service) for always-on

2. **Build Minutes**: 500 minutes/month free
   - Usually sufficient for small projects
   - Each deployment uses ~5-10 minutes

3. **Bandwidth**: 100 GB/month free
   - More than enough for most projects

4. **ML Service Performance**: 
   - Free tier has limited CPU/RAM
   - Image classification may be slow (5-10 seconds)
   - Consider upgrading ML service first if performance is critical

### Keeping Services Warm (Optional)

To prevent cold starts, you can ping services periodically:

**Use a free service like [cron-job.org](https://cron-job.org):**
- Ping ML service every 10 minutes: `https://grievx-ml-service.onrender.com/health`
- Ping backend every 10 minutes: `https://grievx-backend.onrender.com/api/health`

---

## 🔐 Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secret (32+ characters)
- [ ] MongoDB user has read/write access only (not admin)
- [ ] CORS_ORIGINS set to your actual frontend URL
- [ ] No sensitive data in environment variables visible in logs
- [ ] HTTPS enabled (automatic on Render)

---

## 🐛 Troubleshooting

### ML Service Issues

**Problem**: "ModuleNotFoundError" during build
- **Solution**: Check `requirements.txt` has all dependencies
- Verify Python version matches (3.11)

**Problem**: Service crashes with "Memory exceeded"
- **Solution**: Free tier has 512MB RAM limit
- Reduce model size or upgrade instance

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- **Solution**: 
  1. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
  2. Verify connection string has correct password
  3. Ensure database name is included in URI

**Problem**: "CORS error" in browser console
- **Solution**: 
  1. Check `CORS_ORIGINS` env variable in backend
  2. Must match exact frontend URL (no trailing slash)
  3. Redeploy backend after changing

### Frontend Issues

**Problem**: "NetworkError" or API calls failing
- **Solution**:
  1. Check `VITE_API_URL` points to correct backend
  2. Must include `/api` at end
  3. Clear browser cache and hard reload (Ctrl+Shift+R)

**Problem**: Build fails with "JavaScript heap out of memory"
- **Solution**: Add to frontend package.json scripts:
  ```json
  "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  ```

---

## 🔄 Updating Your Deployment

### Auto-Deploy from GitHub

Render automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

- Backend and ML service redeploy automatically (~3-5 min)
- Frontend rebuilds automatically (~2-3 min)

### Manual Deploy

In Render Dashboard:
1. Select service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Cost Optimization

### Start Free
- All services on FREE tier: **$0/month**
- Perfect for development, testing, portfolio projects

### Scale When Needed

**If ML inference too slow:**
- Upgrade ML Service to Starter ($7/month)
- 512MB → 2GB RAM

**If cold starts annoying users:**
- Upgrade Backend to Starter ($7/month)
- Always-on, no spin-down

**If building portfolio/production:**
- Keep frontend free (static sites are fast)
- Upgrade backend + ML service: **$14/month total**

---

## 📞 Support

### Render Support
- Documentation: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)
- Status: [status.render.com](https://status.render.com)

### MongoDB Atlas Support  
- Documentation: [docs.mongodb.com](https://docs.mongodb.com)
- University: [university.mongodb.com](https://university.mongodb.com)

---

## 🎉 Congratulations!

Your GrievX Smart Civic System is now live on Render! 🚀

**Next Steps:**
1. Share your frontend URL with users
2. Monitor service health in Render dashboard
3. Check MongoDB Atlas for data growth
4. Consider upgrading services based on usage
5. Set up custom domain (optional, available on paid plans)

---

## 📸 Screenshots Checklist

For documentation or portfolio, capture:
- [ ] Render dashboard showing all 3 services "Live"
- [ ] Frontend homepage
- [ ] User registration/login flow
- [ ] Complaint submission with ML classification
- [ ] Analytics dashboard with charts
- [ ] Admin panel managing complaints
- [ ] MongoDB Atlas showing collections

---

**Need help?** Check Render docs or MongoDB Atlas support!

**Made with ❤️ for civic engagement**
