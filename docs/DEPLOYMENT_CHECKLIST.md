# 🚀 GrievX Deployment Checklist

## Pre-Deployment Preparation

### ✅ Code Ready
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Backend API responds correctly
- [ ] ML service classifies correctly
- [ ] All environment variables documented

### ✅ Accounts Setup
- [ ] GitHub account created
- [ ] Render account created (render.com)
- [ ] MongoDB Atlas account created
- [ ] Code pushed to GitHub repository

### ✅ Database Ready
- [ ] MongoDB Atlas cluster created (free tier)
- [ ] Database user created with password saved
- [ ] Network access set to 0.0.0.0/0 (Allow from anywhere)
- [ ] Connection string copied and saved

---

## Deployment Order (Important!)

### 1️⃣ ML Service First
- [ ] Deploy ML service on Render
- [ ] Verify deployment: `/docs` endpoint works
- [ ] Save ML service URL

### 2️⃣ Backend Second
- [ ] Deploy backend with ML_SERVICE_URL
- [ ] Set MongoDB connection string
- [ ] Generate and set JWT_SECRET
- [ ] Set CORS_ORIGINS (temporary placeholder)
- [ ] Verify: `/api/health` endpoint works
- [ ] Save backend URL

### 3️⃣ Frontend Third
- [ ] Deploy frontend with VITE_API_URL
- [ ] Verify homepage loads
- [ ] Save frontend URL

### 4️⃣ Update Backend CORS
- [ ] Update CORS_ORIGINS with actual frontend URL
- [ ] Wait for automatic redeploy

---

## Environment Variables Reference

### ML Service (grievx-ml-service)
```
PYTHON_VERSION=3.11.0
ENVIRONMENT=production
LOG_LEVEL=info
```

### Backend (grievx-backend)
```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://grievx-admin:PASSWORD@cluster.mongodb.net/smart-civic?retryWrites=true&w=majority
JWT_SECRET=<generate-random-32-chars>
JWT_EXPIRY=7d
ML_SERVICE_URL=https://grievx-ml-service.onrender.com
CORS_ORIGINS=https://grievx-frontend.onrender.com
LOG_LEVEL=info
```

### Frontend (grievx-frontend)
```
VITE_API_URL=https://grievx-backend.onrender.com/api
```

---

## Generate JWT Secret

Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use online generator: [RandomKeygen.com](https://randomkeygen.com/)

---

## Post-Deployment Testing

### Service Health Checks
- [ ] ML Service: `https://grievx-ml-service.onrender.com/docs`
- [ ] Backend: `https://grievx-backend.onrender.com/api/health`
- [ ] Frontend: `https://grievx-frontend.onrender.com`

### Feature Testing
- [ ] User registration works
- [ ] User login works
- [ ] File complaint with image upload
- [ ] ML auto-classification working
- [ ] View my complaints
- [ ] Admin login works
- [ ] Admin can manage complaints
- [ ] Analytics dashboard loads
- [ ] Map shows complaint locations
- [ ] Help chatbot works

### Data Verification
- [ ] Check MongoDB Atlas → Database → Collections
- [ ] Verify users collection has data
- [ ] Verify complaints collection has data
- [ ] Check ML service logs for classification requests

---

## Common First-Time Issues

### Issue: ML Service slow/timeout
**Cause**: Free tier cold start (15 min idle = spin down)
**Solution**: Wait 30-60 seconds on first request

### Issue: Backend can't connect to MongoDB
**Cause**: IP not whitelisted or wrong connection string
**Solution**: 
- MongoDB Atlas → Network Access → Add 0.0.0.0/0
- Verify connection string has password and database name

### Issue: Frontend shows CORS error
**Cause**: CORS_ORIGINS not set correctly
**Solution**: Update backend env var to exact frontend URL, no trailing slash

### Issue: Images not uploading
**Cause**: Render file system is ephemeral
**Solution**: Images stored in MongoDB as base64 (already implemented)

---

## Render Service Configuration Quick Reference

| Service | Type | Root Dir | Build Command | Start Command |
|---------|------|----------|---------------|---------------|
| ML | Web Service | `ml-service` | `pip install --upgrade pip && pip install -r requirements.txt` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Backend | Web Service | `backend` | `npm install` | `npm start` |
| Frontend | Static Site | `frontend` | `npm install && npm run build` | - |

---

## Monitoring

### Check Service Status
1. Go to Render Dashboard
2. Each service shows:
   - 🟢 Live (green) = Running
   - 🟡 Building = Deploying
   - 🔴 Failed = Error (check logs)

### View Logs
1. Click on a service
2. Go to "Logs" tab
3. Check for errors

### MongoDB Data
1. MongoDB Atlas → Database → Browse Collections
2. See real-time data from your app

---

## Estimated Timeline

- MongoDB Setup: **10 minutes**
- ML Service Deploy: **10 minutes**
- Backend Deploy: **5 minutes**
- Frontend Deploy: **5 minutes**
- Testing: **10 minutes**

**Total: ~40 minutes** ⏱️

---

## URLs to Save

After deployment, save these to a safe place:

```
📱 Frontend: https://grievx-frontend.onrender.com
🔧 Backend:  https://grievx-backend.onrender.com
🤖 ML Service: https://grievx-ml-service.onrender.com
💾 Database: mongodb+srv://grievx-admin:***@cluster.mongodb.net/smart-civic

🔑 Admin Test Credentials (create after deploy):
   Email: admin@test.com
   Password: <set this after deploy>
```

---

## Free Tier Limits (What to Expect)

✅ **Pros:**
- Completely free
- Auto-deploy from GitHub
- HTTPS included
- Good for portfolio/demo

⚠️ **Limitations:**
- Services sleep after 15 min idle
- First request after idle: 30-60 seconds
- 512 MB RAM per service
- ML inference may be slow (5-10 sec)

💡 **Recommendation:**
- Start free
- Monitor usage
- Upgrade ML service first if needed ($7/mo)

---

## Need Help?

1. **Read full guide**: `docs/RENDER_DEPLOYMENT_GUIDE.md`
2. **Check Render docs**: [render.com/docs](https://render.com/docs)
3. **MongoDB docs**: [docs.mongodb.com](https://docs.mongodb.com)
4. **Check service logs** in Render dashboard

---

## Ready? Let's Deploy! 🚀

Start with: `docs/RENDER_DEPLOYMENT_GUIDE.md`

**First time deploying?** Follow the guide step-by-step, don't skip steps!
