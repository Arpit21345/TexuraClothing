<!-- # TexuraClothing - Simple Admin Access

## 🎯 How to Access Admin Panel

### **From the Website:**
1. Click "Sign In" on the homepage
2. In the login popup, scroll down and click "Login as Admin"
3. This opens the admin panel in a new tab
4. Use admin credentials:
   - Email: `admin@texuraclothing.com`
   - Password: `admin123`

### **Direct Access:**
- Admin panel runs on: `http://localhost:5174` (development)
- For production, update the URL in `LoginPopup.jsx` line 25

## 🛠️ For Deployment

When deploying, update the admin panel URL in:
`frontend/src/components/LoginPopup/LoginPopup.jsx`

Change line 25 from:
```javascript
onClick={() => window.open('http://localhost:5174', '_blank')}
```

To your deployed admin URL:
```javascript
onClick={() => window.open('https://your-admin-domain.com', '_blank')}
```

## ✅ Features

- **Simple Access**: Clean link in login popup
- **Secure**: Opens admin panel with its own login
- **Non-intrusive**: Doesn't interfere with main site design
- **Easy to Update**: Single line change for deployment

---

**Perfect for deployment!** 🚀 -->
