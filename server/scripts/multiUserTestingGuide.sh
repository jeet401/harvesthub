#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🧪 Multi-User Testing Guide for HarvestHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'EOF'
## 🎯 Goal
Test Farmer, Buyer, and Admin simultaneously without confusion/interference

## ⚠️ The Problem
**HTTP Cookies are ALWAYS shared across tabs in the same browser!**
This is how web browsers work - you cannot have different cookies in different tabs of the same browser.

When you login as Admin in Tab 2, it WILL overwrite the Farmer's cookie in Tab 1.

## ✅ Solution: Use Different Browser Contexts

### Method 1: Multiple Browsers (RECOMMENDED)
┌─────────────────────────────────────────────────────┐
│ Browser 1: Chrome (Normal)     → Farmer            │
│ Browser 2: Chrome (Incognito)  → Buyer             │
│ Browser 3: Safari/Firefox      → Admin             │
└─────────────────────────────────────────────────────┘

### Method 2: Chrome Profiles
1. Click Chrome profile icon (top right)
2. Click "Add" → Create "Farmer Profile"
3. Click "Add" → Create "Buyer Profile"  
4. Click "Add" → Create "Admin Profile"
5. Open each profile in separate window

### Method 3: Browser Containers (Firefox)
1. Install "Multi-Account Containers" extension
2. Create containers: Farmer, Buyer, Admin
3. Open each in different container tab

## 🧪 Testing Steps

### Step 1: Open 3 Browser Windows
```
Window 1 (Chrome Normal):
  URL: http://localhost:5173
  Login: farmer1234@gmail.com / farmer123
  
Window 2 (Chrome Incognito):
  URL: http://localhost:5173
  Login: buyer1234@gmail.com / buyer123
  
Window 3 (Safari/Firefox):
  URL: http://localhost:5173
  Login: admin@harvesthub.com / admin123
```

### Step 2: Verify Each Dashboard
```
✅ Window 1: Farmer Dashboard
   - Should see farmer navbar
   - Should see farmer products (3 products)
   - Should NOT see admin/buyer content

✅ Window 2: Buyer Dashboard  
   - Should see buyer navbar
   - Should see all products (5 products)
   - Should see cart icon

✅ Window 3: Admin Dashboard
   - Should see admin navbar
   - Should see admin statistics
   - Should see manage users/products/orders
```

### Step 3: Test Interactions
```
Test 1: Add Product (Farmer)
  - Window 1: Add new product
  - Window 1: Should see new product immediately
  - Window 2: Refresh → Should see new product in buyer products
  - Window 3: Refresh → Should see new product in admin panel

Test 2: Place Order (Buyer)
  - Window 2: Add product to cart
  - Window 2: Place order
  - Window 1: Refresh → Should see order in farmer orders
  - Window 3: Refresh → Should see order in admin orders

Test 3: Update Order Status (Admin)
  - Window 3: Change order status to "Shipped"
  - Window 1: Refresh → Should see updated status
  - Window 2: Refresh → Should see updated status
```

## 🔬 Backend API Testing (Simultaneous)

You can test APIs simultaneously using curl:

```bash
# Terminal 1: Farmer Session
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c farmer_session.txt

curl -s -b farmer_session.txt \
  "http://localhost:3000/api/products/my-products" | jq

# Terminal 2: Buyer Session
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1234@gmail.com","password":"buyer123"}' \
  -c buyer_session.txt

curl -s -b buyer_session.txt \
  "http://localhost:3000/api/products" | jq

# Terminal 3: Admin Session
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@harvesthub.com","password":"admin123"}' \
  -c admin_session.txt

curl -s -b admin_session.txt \
  "http://localhost:3000/api/admin/analytics/stats" | jq
```

## 📊 Expected Results

### Isolation Test
```
Action: Login as Admin in Browser 2
Result: 
  ✅ Browser 1 (Farmer): Still shows farmer
  ✅ Browser 2 (Admin): Shows admin
  ✅ Browser 3 (Buyer): Still shows buyer
```

### Data Sync Test
```
Action: Farmer adds product in Browser 1
Result:
  ✅ Browser 1: Product appears immediately
  ✅ Browser 2: Product appears after refresh (buyer view)
  ✅ Browser 3: Product appears after refresh (admin panel)
```

## ❌ What WON'T Work

❌ Same browser, different tabs → Cookies will overwrite
❌ Same incognito window, different tabs → Cookies will overwrite
❌ Same browser profile, different windows → Cookies will overwrite

## ✅ What WILL Work

✅ Different browsers (Chrome, Safari, Firefox)
✅ Different Chrome profiles
✅ Different incognito windows
✅ Firefox Multi-Account Containers

## 🎯 Quick Start Commands

Open 3 terminals and run:

```bash
# Terminal 1: Test Farmer
open -na "Google Chrome" --args --new-window "http://localhost:5173"

# Terminal 2: Test Buyer  
open -na "Google Chrome" --args --incognito "http://localhost:5173"

# Terminal 3: Test Admin
open -na "Safari" "http://localhost:5173"
```

## 📝 Credentials Reference

| Role   | Email                      | Password    |
|--------|----------------------------|-------------|
| Farmer | farmer1234@gmail.com       | farmer123   |
| Buyer  | buyer1234@gmail.com        | buyer123    |
| Admin  | admin@harvesthub.com       | admin123    |
| Admin  | admin1234@gmail.com        | admin123    |

## 🔍 Troubleshooting

### Issue: "Still seeing wrong user after login"
Solution: Make sure you're using different browser contexts

### Issue: "Session keeps switching"
Solution: You're using same browser/profile - switch to different browser

### Issue: "Data not syncing"
Solution: Click refresh/hard refresh (Cmd+Shift+R)

---

✅ Your application ALREADY works correctly!
✅ The "confusion" is just how web browsers handle cookies
✅ Use different browser contexts to test properly

Happy Testing! 🎉
EOF
