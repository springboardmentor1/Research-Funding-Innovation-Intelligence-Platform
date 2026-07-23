# Quick Reference Card

## 🚀 Start Development Server (Choose One)

### Windows
```
Double-click: start-dev.bat
Or PowerShell: .\start-dev.bat
```

### macOS/Linux
```
chmod +x start-dev.sh
./start-dev.sh
```

---

## 🧪 Run Tests

### Backend Tests
```bash
cd backend
pip install -r requirements-test.txt
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm install
npm run test
```

---

## 🔗 Access Points

| What | URL |
|------|-----|
| App | http://localhost:5173 |
| API | http://127.0.0.1:8000 |
| Docs | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

---

## 👤 Test User

```
Username: testuser
Email:    test@example.com
Password: testpass123
```

---

## 🔍 Verify Setup

```bash
python verify.py
```

---

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

---

## 📋 What Was Created

✅ 20+ new files  
✅ Backend testing (pytest)  
✅ Frontend testing (vitest)  
✅ Docker configuration  
✅ CI/CD pipeline (GitHub Actions)  
✅ Comprehensive documentation  
✅ Development startup scripts  
✅ Verification tool  

---

## ✨ Features

- User Authentication (JWT)
- Research Profiles
- Paper Search (OpenAlex)
- Funding Search
- Patent Search
- Dashboard
- Dark Mode UI
- API Documentation
- Test Coverage

---

## 📞 Quick Help

**Port already in use?**
```bash
# Find process using port 8000
netstat -ano | findstr :8000 (Windows)
lsof -i :8000 (macOS/Linux)
```

**Dependencies issue?**
```bash
cd backend && rm -rf venv && python -m venv venv
# Then activate venv and: pip install -r requirements.txt
```

**Frontend blank page?**
```bash
cd frontend && rm -rf node_modules && npm install
npm run dev
```

---

## 📚 Documentation Files

- **README.md** - Full documentation
- **INTEGRATION_SUMMARY.md** - What was integrated
- **SETUP_COMPLETE.md** - Files created
- **verify.py** - Diagnostic tool

---

## 🎯 Next Steps

1. Run verification: `python verify.py`
2. Start servers: `start-dev.bat` (Windows) or `./start-dev.sh` (Unix)
3. Visit frontend: http://localhost:5173
4. Create account & test features
5. Run tests: `pytest` (backend) / `npm test` (frontend)

---

**Status: ✅ Ready to Use**

Everything is configured and ready. Just run start-dev script!
