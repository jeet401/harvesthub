# AGMARK System - Quick Start Testing Guide

## 🚀 Quick Test in 5 Minutes

### Prerequisites
- ✅ Server running on `http://localhost:3000`
- ✅ MongoDB connected
- ✅ At least 1 farmer and 1 admin account created

### Accounts
```
Farmer: farmer1234@gmail.com / farmer123
Admin:  admin@harvesthub.com / admin123
```

---

## Test Flow

### Step 1: Farmer Adds Product with Certificate (2 mins)

1. **Login as Farmer**
   ```
   Email: farmer1234@gmail.com
   Password: farmer123
   ```

2. **Navigate to Products**
   - URL: `http://localhost:5173/farmer/products`
   - Click "Add New Product" button

3. **Fill Product Details**
   ```
   Title: Premium Organic Rice
   Description: High quality basmati rice with AGMARK certification
   Price: 150
   Stock: 100
   Unit: kg
   Category: (Select any - e.g., Grains)
   Location: Punjab, India
   Harvest Date: (Yesterday's date)
   Expiry Date: (3 months from now)
   ```

4. **Add AGMARK Certificate**
   - ✅ Check "I have AGMARK Certificate"
   - Certificate Number: `AGMARK-2024-TEST001`
   - Grade: Select `A+`
   - Upload File: Choose any PDF file < 2MB
   - Verify preview shows file name

5. **Submit**
   - Click "Add Product"
   - ✅ Success message: "Product added successfully! Your AGMARK certificate will be verified by admin."
   - Product appears in list with "Pending Verification" badge

---

### Step 2: Admin Views Pending Verification (1 min)

1. **Logout and Login as Admin**
   ```
   Email: admin@harvesthub.com
   Password: admin123
   ```

2. **Check Dashboard**
   - URL: `http://localhost:5173/admin/dashboard`
   - ✅ Verify 5th stat card shows: "AGMARK Verifications: 1 Pending"
   - Card has yellow color and Award icon

3. **Click AGMARK Card**
   - Redirects to: `http://localhost:5173/admin/products?tab=agmark`
   - ✅ Opens directly on "Pending AGMARK Verifications" tab

---

### Step 3: Admin Verifies Certificate (1 min)

1. **Review Product Card**
   - ✅ Left side shows: Product image, title, description, seller, location, dates
   - ✅ Right side shows: Certificate number, grade, document link

2. **View Certificate**
   - Click "View Certificate" link
   - ✅ Certificate opens in new tab

3. **Verify Certificate**
   - Click green "Verify Certificate" button
   - Modal appears with confirmation
   - ✅ Shows: "This will mark the certificate as verified and automatically approve the product with AGMARK grade: A+"
   - Click "Verify" button

4. **Confirm Success**
   - ✅ Alert: "AGMARK certificate verified successfully!"
   - ✅ Product removed from pending list
   - ✅ Tab count updates to "(0)"
   - ✅ Dashboard count updates to "0"

---

### Step 4: Verify Product Status (1 min)

1. **Check All Products Tab**
   - Click "All Products" tab
   - Find the verified product
   - ✅ Status shows "Active" (green badge)
   - ✅ AGMARK column shows green Award icon with "A+"

2. **Check Farmer's View**
   - Logout admin
   - Login as farmer
   - Navigate to products
   - ✅ Product shows "Active" status
   - ✅ AGMARK certified badge visible

3. **Check Database** (Optional)
   ```javascript
   // In MongoDB shell or Compass
   db.products.findOne({ title: "Premium Organic Rice" })
   
   // Should show:
   {
     agmarkCertified: true,
     agmarkGrade: "A+",
     agmarkVerificationStatus: "verified",
     agmarkVerifiedBy: ObjectId("admin_id"),
     agmarkVerifiedAt: ISODate("2024-11-02..."),
     status: "active"
   }
   ```

---

## Alternative Test: Rejection Flow (2 mins)

### Add Another Product with Certificate
1. As farmer, add another product with certificate
2. Certificate Number: `AGMARK-2024-TEST002`
3. Grade: `A`

### Admin Rejects Certificate
1. Login as admin
2. Navigate to Pending AGMARK tab
3. Click red "Reject" button
4. Enter reason:
   ```
   Certificate image is not clear. Please upload a higher resolution scan.
   ```
5. Click "Reject"
6. ✅ Success alert: "AGMARK certificate rejected successfully!"
7. ✅ Product removed from pending list

### Verify Rejection
1. Check "All Products" tab
2. Product shows "Pending" status (not AGMARK certified)
3. Check database:
   ```javascript
   {
     agmarkCertified: false,
     agmarkVerificationStatus: "rejected",
     agmarkRejectionReason: "Certificate image is not clear...",
     agmarkVerifiedBy: ObjectId("admin_id"),
     status: "pending"
   }
   ```

---

## Quick Validation Checklist

### ✅ Farmer Side
- [ ] Certificate checkbox works
- [ ] File upload validates type (PDF/JPEG/PNG)
- [ ] File upload validates size (< 2MB)
- [ ] Certificate number required when checkbox checked
- [ ] Grade selector works
- [ ] Preview shows file name
- [ ] Success message mentions verification
- [ ] Product appears with "Pending" badge

### ✅ Admin Dashboard
- [ ] 5th stat card exists
- [ ] Shows "AGMARK Verifications"
- [ ] Count is accurate
- [ ] Card is clickable
- [ ] Clicking opens ProductManagement with AGMARK tab

### ✅ Admin ProductManagement
- [ ] Tab system works
- [ ] Tab shows correct count
- [ ] Pending products display correctly
- [ ] Certificate details visible
- [ ] "View Certificate" link works
- [ ] Download button works
- [ ] Verify button works
- [ ] Reject button requires reason
- [ ] Modal cancel works
- [ ] Count updates after action
- [ ] Product removed from pending list

### ✅ Database
- [ ] All AGMARK fields save correctly
- [ ] Verification status updates
- [ ] Admin ID stored
- [ ] Timestamp recorded
- [ ] Product status auto-updates on verify

---

## Quick Test Commands

### Start Server
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm run dev
```

### Check MongoDB
```bash
mongosh
use farmbyte
db.products.find({ agmarkVerificationStatus: "pending" }).pretty()
```

### Test API (cURL)
```bash
# Get pending verifications
curl http://localhost:3000/api/admin/products/agmark/pending \
  --cookie "token=YOUR_ADMIN_TOKEN"

# Verify certificate
curl -X PATCH http://localhost:3000/api/admin/products/PRODUCT_ID/agmark \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_ADMIN_TOKEN" \
  -d '{"action":"verify"}'
```

---

## Troubleshooting

### Issue: "AGMARK Verifications" card not showing
**Fix**: Check `/api/admin/analytics/stats` response includes `pendingAGMARK` field

### Issue: Pending tab shows 0 products
**Fix**: Check product has `agmarkVerificationStatus: "pending"` in database

### Issue: Certificate not uploading
**Fix**: 
1. Check file size < 2MB
2. Check file type is PDF/JPEG/PNG
3. Check console for errors

### Issue: Verify button does nothing
**Fix**:
1. Check browser console for errors
2. Verify admin token is valid
3. Check network tab for API response

### Issue: Count not updating
**Fix**: Refresh page or check if fetch is called after action

---

## Expected Timings

| Action | Time |
|--------|------|
| Farmer adds product with certificate | 1-2 minutes |
| Admin views pending verifications | 15 seconds |
| Admin verifies certificate | 30 seconds |
| Admin rejects certificate | 45 seconds |
| Database updates | Instant |
| Count updates | Instant |

---

## Success Indicators

### ✅ Everything Works If:
1. Farmer can upload certificate
2. Product appears in admin pending tab
3. Admin can verify/reject
4. Product status updates correctly
5. AGMARK badge shows on verified products
6. Dashboard count is accurate
7. No console errors

### ❌ Need to Debug If:
1. Certificate upload fails
2. Pending tab is empty
3. Verify/Reject buttons don't work
4. Counts don't match
5. Console shows errors
6. Database fields not updating

---

## Next Steps After Testing

1. ✅ **If everything works**: System is ready for production
2. 🐛 **If issues found**: Check troubleshooting section or review implementation docs
3. 📝 **Document findings**: Note any edge cases or improvements needed
4. 🚀 **Deploy**: Move to staging environment for broader testing

---

**Quick Start Version**: 1.0.0
**Last Updated**: November 2, 2024
**Estimated Test Time**: 5 minutes for basic flow, 10 minutes for comprehensive testing
