# 🎯 Render Deployment - Quick Reference Card

## 📋 What You'll Deploy

| Service | Platform Type | URL Pattern | Cost |
|---------|--------------|-------------|------|
| **ML Service** | Web Service | `grievx-ml-service.onrender.com` | FREE |
| **Backend API** | Web Service | `grievx-backend.onrender.com` | FREE |
| **Frontend** | Static Site | `grievx-frontend.onrender.com` | FREE |
| **Database** | MongoDB Atlas | Connection String | FREE |

---

## 🔢 Deployment Order (CRITICAL!)

```
1. MongoDB Atlas    → Get connection string
2. ML Service       → Get ML service URL  
3. Backend          → Use ML URL + MongoDB
4. Frontend         → Use Backend URL
5. Update Backend   → Update CORS with Frontend URL
```

**Why this order?** Each service needs the URL from the previous one!

---

## ⚙️ Render Configuration Cheat Sheet

### ML Service Settings
```yaml
Name:           grievx-ml-service
Runtime:        Python 3
Root Directory: ml-service
Build Command:  pip install --upgrade pip && pip install -r requirements.txt
Start Command:  uvicorn app.main:app --host 0.0.0.0 --port $PORT
Instance:       FREE (512 MB)

Environment Variables:
  PYTHON_VERSION=3.11.0
  ENVIRONMENT=production
  LOG_LEVEL=info
```

### Backend Settings
```yaml
Name:           grievx-backend
Runtime:        Node
Root Directory: backend
Build Command:  npm install
Start Command:  npm start
Instance:       FREE (512 MB)

Environment Variables:
  PORT=10000
  NODE_ENV=production
  MONGODB_URI=<from-atlas>
  JWT_SECRET=<generate-32-chars>
  JWT_EXPIRY=7d
  ML_SERVICE_URL=https://grievx-ml-service.onrender.com
  CORS_ORIGINS=https://grievx-frontend.onrender.com
  LOG_LEVEL=info
```

### Frontend Settings
```yaml
Name:            grievx-frontend
Root Directory:  frontend
Build Command:   npm install && npm run build
Publish Dir:     dist

Environment Variables:
  VITE_API_URL=https://grievx-backend.onrender.com/api
```

---

## 🗄️ MongoDB Atlas Quick Setup

### 1. Create Cluster
- Go to mongodb.com/cloud/atlas
- "Build a Database" → FREE (M0)
- Name: `grievx-cluster`

### 2. Create User
- Security → Database Access
- Add User: `grievx-admin` with password
- Access: Read/Write to any database

### 3. Whitelist IPs
- Security → Network Access  
- Add IP: `0.0.0.0/0` (Allow from anywhere)

### 4. Get Connection String
```
mongodb+srv://grievx-admin:<password>@grievx-cluster.xxxxx.mongodb.net/smart-civic?retryWrites=true&w=majority
```
Replace `<password>` with actual password!

---

## 🔑 Generate JWT Secret

Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output: `a7f3c2b8e5d9f1a4c6e8d2b7f3a9c1e5d7f2b4a8c3e6d9f1a5c7e2b8d4f6a3c9`

---

## ✅ Testing URLs

After deployment, test these endpoints:

```bash
# ML Service Health
https://grievx-ml-service.onrender.com/docs
→ Should show FastAPI documentation

# Backend Health
https://grievx-backend.onrender.com/api/health
→ Should return: {"status":"ok","service":"Smart Civic System API"}

# Frontend
https://grievx-frontend.onrender.com
→ Should show GrievX homepage
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| ML Service timeout | Wait 60 sec (cold start), then retry |
| Backend can't reach MongoDB | Check IP whitelist: 0.0.0.0/0 |
| CORS error in frontend | Update backend CORS_ORIGINS env var |
| Frontend API calls fail | Verify VITE_API_URL includes `/api` |
| 500 error on ML classify | Check ML service logs in Render |
| Build fails | Check logs for missing dependencies |

---

## 📊 Expected Performance (Free Tier)

| Metric | Performance | Note |
|--------|-------------|------|
| Cold Start | 30-60 seconds | After 15 min idle |
| ML Classification | 5-10 seconds | Image analysis |
| API Response | <500ms | When warm |
| Page Load | 1-2 seconds | Initial load |
| Database Query | <200ms | Simple queries |

---

## 💰 When to Upgrade?

### Keep Free If:
- ✅ Portfolio/demo project
- ✅ Low traffic (<100 users/day)
- ✅ OK with cold starts
- ✅ Not time-sensitive

### Upgrade ML Service First ($7/mo) If:
- ❌ Cold starts annoying
- ❌ Need faster ML inference
- ❌ Multiple concurrent users

### Upgrade Backend ($7/mo) If:
- ❌ Need always-on service
- ❌ High traffic
- ❌ Real-time requirements

**Frontend can stay free** - static sites are fast!

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Full Deployment Guide | `docs/RENDER_DEPLOYMENT_GUIDE.md` |
| Deployment Checklist | `docs/DEPLOYMENT_CHECKLIST.md` |
| Render Docs | [render.com/docs](https://render.com/docs) |
| MongoDB Docs | [docs.mongodb.com](https://docs.mongodb.com) |
| Render Status | [status.render.com](https://status.render.com) |

---

## 🎯 Your Action Plan

### Today (Deployment Day):
1. ☐ Read full guide: `docs/RENDER_DEPLOYMENT_GUIDE.md`
2. ☐ Create MongoDB Atlas database (10 min)
3. ☐ Deploy ML Service (10 min)
4. ☐ Deploy Backend (5 min)
5. ☐ Deploy Frontend (5 min)
6. ☐ Test all features (10 min)
7. ☐ Save all URLs in safe place

### After Deployment:
- Monitor service health daily
- Check MongoDB data growth
- Review Render build minutes usage
- Consider upgrades based on usage

---

## 💡 Pro Tips

1. **Save Everything**: Keep all URLs and passwords in a password manager
2. **Test Incrementally**: Verify each service before moving to next
3. **Check Logs**: Render dashboard logs are your best friend
4. **Cold Starts**: First request will be slow - that's normal!
5. **Auto-Deploy**: Push to GitHub main branch = auto deploy
6. **Environment Variables**: Double-check spelling - typos break everything
7. **MongoDB Atlas**: Always check IP whitelist first for connection issues

---

## 🚀 Ready to Deploy?

**Estimated Total Time**: 40 minutes

**Prerequisites Needed**:
- GitHub account with code pushed
- Render account (free signup)
- MongoDB Atlas account (free signup)

**Start Here**: `docs/RENDER_DEPLOYMENT_GUIDE.md`

---

**Good luck! 🎉 Your GrievX system will be live soon!**
