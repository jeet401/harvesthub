# AGMARK Certificate Verification System - Testing Guide

## Overview
Complete end-to-end testing guide for the AGMARK certificate verification system implemented across farmer and admin interfaces.

## System Components

### 1. Database Layer
- **Product Model**: Extended with 13 new fields for AGMARK certification
- **Key Fields**: 
  - `agmarkCertified` (Boolean)
  - `agmarkGrade` (String: A+, A, B, C)
  - `agmarkCertificateUrl` (String: base64 or URL)
  - `agmarkCertificateNumber` (String)
  - `agmarkVerificationStatus` (String: pending, verified, rejected)
  - `agmarkVerifiedBy` (ObjectId: Admin who verified)
  - `agmarkVerifiedAt` (Date)
  - `agmarkRejectionReason` (String)

### 2. Backend API Endpoints
- **GET** `/api/admin/products/agmark/pending` - Get pending AGMARK verifications
- **PATCH** `/api/admin/products/:productId/agmark` - Verify or reject certificate
- **POST** `/api/products` - Create product with optional AGMARK certificate

### 3. Frontend Components

#### Farmer Side
- **AddProduct.jsx**: Certificate upload form with validation
- **Features**:
  - Certificate checkbox toggle
  - Certificate number input (required if checked)
  - Grade selector (A+, A, B, C)
  - File upload (PDF/JPEG/PNG, max 2MB)
  - Certificate preview
  - Helper text about verification process

#### Admin Side
- **ProductManagement.jsx**: 
  - Tab-based interface (All Products | Pending AGMARK Verifications)
  - Certificate preview and download
  - Verify/Reject modals with reason input
  - Real-time count updates
- **AdminDashboard.jsx**: 
  - AGMARK pending count card (5th stat card)
  - Click-through to verification tab

## Testing Scenarios

### Scenario 1: Farmer Adds Product WITHOUT AGMARK Certificate

#### Steps:
1. Login as farmer: `farmer1234@gmail.com` / `farmer123`
2. Navigate to `/farmer/products`
3. Click "Add New Product"
4. Fill product details:
   - Title: "Organic Wheat"
   - Description: "Premium quality wheat"
   - Price: 50
   - Stock: 100
   - Unit: "kg"
   - Category: Select any
   - Location: "Punjab, India"
   - Harvest Date: Yesterday's date
   - Image: Upload product image
5. **DO NOT** check "I have AGMARK Certificate"
6. Click "Add Product"

#### Expected Results:
- ✅ Success message: "Product added successfully to database!"
- ✅ Product appears in farmer's product list
- ✅ Product status: "pending" (awaiting admin approval)
- ✅ AGMARK fields in database: all null/false
- ✅ Product shows "Pending" badge in farmer's list

---

### Scenario 2: Farmer Adds Product WITH AGMARK Certificate

#### Steps:
1. Login as farmer: `farmer1234@gmail.com` / `farmer123`
2. Navigate to `/farmer/products`
3. Click "Add New Product"
4. Fill product details:
   - Title: "Premium Basmati Rice"
   - Description: "AGMARK certified premium basmati"
   - Price: 120
   - Stock: 50
   - Unit: "kg"
   - Category: Select "Grains"
   - Location: "Haryana, India"
   - Harvest Date: Yesterday's date
   - Image: Upload product image
5. ✅ **Check** "I have AGMARK Certificate"
6. Certificate section appears
7. Fill certificate details:
   - Certificate Number: "AGMARK-2024-001234"
   - Grade: Select "A+" from dropdown
8. Upload certificate:
   - Click "Upload Certificate"
   - Select a PDF file (< 2MB)
   - Verify file name shows in preview
9. Click "Add Product"

#### Expected Results:
- ✅ Success message: "Product added successfully! Your AGMARK certificate will be verified by admin."
- ✅ Product appears in farmer's product list with "Pending Verification" badge
- ✅ Product status: "pending"
- ✅ Database fields populated:
  - `agmarkCertificateUrl`: base64 string
  - `agmarkCertificateNumber`: "AGMARK-2024-001234"
  - `agmarkGrade`: "A+"
  - `agmarkVerificationStatus`: "pending"
  - `agmarkCertified`: false
- ✅ Product visible in admin's "Pending AGMARK Verifications" tab

---

### Scenario 3: Farmer Attempts Invalid Certificate Upload

#### Steps:
1. Follow Scenario 2 steps 1-6
2. Fill certificate number and grade
3. Try uploading invalid files:

#### Test Cases:
**Test 3a: File too large (> 2MB)**
- Upload a 3MB PDF
- Expected: Error message "Certificate file size must be less than 2MB"

**Test 3b: Invalid file type**
- Upload a .txt or .docx file
- Expected: Error message "Invalid file type. Please upload PDF, JPEG, or PNG files only"

**Test 3c: Missing certificate number**
- Check AGMARK checkbox
- Select grade
- Upload valid certificate
- Leave certificate number empty
- Click "Add Product"
- Expected: Form validation error "Certificate number is required"

---

### Scenario 4: Admin Views Pending AGMARK Verifications

#### Steps:
1. Login as admin: `admin@harvesthub.com` / `admin123`
2. Navigate to `/admin/dashboard`
3. Observe dashboard stats:
   - ✅ 5th stat card shows "AGMARK Verifications: X Pending"
   - ✅ Card is clickable with yellow badge
4. Click on AGMARK stat card (or navigate to `/admin/products`)
5. Click "Pending AGMARK Verifications" tab

#### Expected Results:
- ✅ Tab shows count: "Pending AGMARK Verifications (X)"
- ✅ All products with `agmarkVerificationStatus: 'pending'` displayed
- ✅ Each card shows:
  - Product image and details
  - Seller email
  - Location, harvest/expiry dates
  - Certificate number (large, monospaced font)
  - Requested grade
  - "View Certificate" link (opens in new tab)
  - Download button
  - "Verify Certificate" button (green)
  - "Reject" button (red)

---

### Scenario 5: Admin Verifies AGMARK Certificate

#### Steps:
1. Follow Scenario 4 to view pending verifications
2. Select a product with pending certificate
3. Review certificate:
   - Click "View Certificate" link
   - Verify certificate authenticity in new tab
4. Click "Verify Certificate" button (green)
5. Modal appears with:
   - Product name
   - Certificate number
   - Green success message: "This will mark the certificate as verified and automatically approve the product with AGMARK grade: A+"
6. Click "Verify" button

#### Expected Results:
- ✅ Success alert: "AGMARK certificate verified successfully!"
- ✅ Product removed from pending list
- ✅ Database updated:
  - `agmarkVerificationStatus`: "verified"
  - `agmarkCertified`: true
  - `agmarkGrade`: "A+" (farmer's requested grade)
  - `status`: "active" (auto-approved)
  - `agmarkVerifiedBy`: Admin's user ID
  - `agmarkVerifiedAt`: Current timestamp
- ✅ Product appears in "All Products" tab with:
  - Green AGMARK badge with grade
  - "Active" status
- ✅ Farmer sees product with "Active" + AGMARK certified badge
- ✅ Dashboard stat decrements "Pending AGMARK"
- ✅ Product visible to buyers with AGMARK badge

---

### Scenario 6: Admin Rejects AGMARK Certificate

#### Steps:
1. Follow Scenario 4 to view pending verifications
2. Select a product with pending certificate
3. Click "Reject" button (red)
4. Modal appears requesting rejection reason
5. Enter reason in textarea:
   - Example: "Certificate image is not clear. Grade mentioned does not match product quality standards. Please resubmit with clearer documentation."
6. Click "Reject" button

#### Expected Results:
- ✅ Success alert: "AGMARK certificate rejected successfully!"
- ✅ Product removed from pending list
- ✅ Database updated:
  - `agmarkVerificationStatus`: "rejected"
  - `agmarkCertified`: false
  - `agmarkRejectionReason`: (reason text)
  - `agmarkVerifiedBy`: Admin's user ID
  - `agmarkVerifiedAt`: Current timestamp
  - `status`: remains "pending" (needs manual approval or certificate resubmission)
- ✅ Product appears in "All Products" tab with:
  - "Pending" status (not AGMARK certified)
  - No AGMARK badge
- ✅ Farmer sees product with "Pending" status
- ✅ Dashboard stat decrements "Pending AGMARK"
- ✅ TODO: Farmer should see rejection reason (future enhancement)

---

### Scenario 7: Admin Cancels Verification Action

#### Steps:
1. Follow Scenario 4 to view pending verifications
2. Click either "Verify" or "Reject" button
3. Modal opens
4. Click "Cancel" button

#### Expected Results:
- ✅ Modal closes
- ✅ No changes to database
- ✅ Product remains in pending list
- ✅ No alerts shown

---

### Scenario 8: Multiple Pending Verifications

#### Steps:
1. As farmer, add 3 products with AGMARK certificates:
   - Product 1: Rice, Grade A+, Certificate AGMARK-2024-001
   - Product 2: Wheat, Grade A, Certificate AGMARK-2024-002
   - Product 3: Pulses, Grade B, Certificate AGMARK-2024-003
2. Login as admin
3. Navigate to Pending AGMARK tab

#### Expected Results:
- ✅ All 3 products visible in list
- ✅ Tab count shows "(3)"
- ✅ Dashboard stat shows "3"
- ✅ Each product card displays correctly
- ✅ Can verify/reject products independently
- ✅ Count updates after each action

---

### Scenario 9: Tab Navigation and State Persistence

#### Steps:
1. Login as admin
2. Navigate to `/admin/products`
3. Default tab: "All Products"
4. Click "Pending AGMARK Verifications" tab
5. Verify a product
6. Check active tab after action
7. Navigate away to dashboard
8. Click AGMARK stat card
9. Check which tab opens

#### Expected Results:
- ✅ Default tab is "All Products"
- ✅ Clicking AGMARK tab switches correctly
- ✅ After verification, stays on AGMARK tab
- ✅ Clicking dashboard stat card opens directly to AGMARK tab (`?tab=agmark`)
- ✅ Tab count updates immediately after verification/rejection

---

### Scenario 10: Certificate Download Functionality

#### Steps:
1. Login as admin
2. View pending AGMARK verification
3. Click download button (download icon)

#### Expected Results:
- ✅ File downloads as `AGMARK_{certificateNumber}.pdf`
- ✅ File opens correctly
- ✅ Base64 decoded properly
- ✅ No browser errors

---

### Scenario 11: Empty States

#### Test 11a: No Pending Verifications
- Navigate to Pending AGMARK tab when no products pending
- Expected: Empty state card with:
  - Award icon (gray)
  - "No Pending Verifications" heading
  - "All AGMARK certificates have been verified." message

#### Test 11b: No Products at All
- All Products tab with no products
- Expected: Standard empty products table

---

### Scenario 12: Permission Testing

#### Steps:
1. Logout admin
2. Login as farmer
3. Try accessing: `/admin/products`

#### Expected Results:
- ✅ Redirected to `/farmer/dashboard`
- ✅ Cannot access admin routes
- ✅ API calls to admin endpoints return 403 Forbidden

---

## API Testing Commands

### Get Pending AGMARK Products
```bash
curl -X GET http://localhost:3000/api/admin/products/agmark/pending \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_ADMIN_TOKEN"
```

### Verify Certificate
```bash
curl -X PATCH http://localhost:3000/api/admin/products/{productId}/agmark \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_ADMIN_TOKEN" \
  -d '{
    "action": "verify"
  }'
```

### Reject Certificate
```bash
curl -X PATCH http://localhost:3000/api/admin/products/{productId}/agmark \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_ADMIN_TOKEN" \
  -d '{
    "action": "reject",
    "rejectionReason": "Certificate is not clear or authentic"
  }'
```

### Create Product with Certificate
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_FARMER_TOKEN" \
  -d '{
    "title": "Test Product",
    "description": "Test Description",
    "price": 100,
    "stock": 50,
    "unit": "kg",
    "category": "CATEGORY_ID",
    "location": "Test Location",
    "harvestDate": "2024-11-01",
    "agmarkCertificateUrl": "data:application/pdf;base64,JVBERi0x...",
    "agmarkCertificateNumber": "AGMARK-2024-TEST",
    "agmarkGrade": "A+"
  }'
```

---

## Database Verification Queries

### Check Product AGMARK Status
```javascript
db.products.find({
  agmarkVerificationStatus: "pending"
}).pretty()
```

### Count Pending Verifications
```javascript
db.products.count({
  agmarkVerificationStatus: "pending"
})
```

### Find Verified Products
```javascript
db.products.find({
  agmarkCertified: true
}).pretty()
```

### Check Verification History
```javascript
db.products.find({
  agmarkVerifiedAt: { $exists: true }
}).pretty()
```

---

## Known Issues / Future Enhancements

### Current Limitations:
1. ❌ Farmer cannot see rejection reason (needs notification system)
2. ❌ Farmer cannot resubmit certificate after rejection
3. ❌ No email notification for verification status
4. ❌ Certificate preview doesn't work for base64 PDFs in some browsers
5. ❌ No audit log for verification actions

### Planned Enhancements:
1. ✅ Add notification system for farmers
2. ✅ Certificate resubmission flow
3. ✅ Email notifications
4. ✅ Better PDF preview (PDF.js integration)
5. ✅ Verification audit log
6. ✅ Bulk verify/reject actions
7. ✅ Certificate expiry tracking
8. ✅ AGMARK certificate templates
9. ✅ Buyer filter for AGMARK products

---

## Success Criteria

### For Complete AGMARK System:
- ✅ Farmer can upload certificate during product creation
- ✅ Certificate upload validates file type and size
- ✅ Admin sees all pending verifications in dedicated tab
- ✅ Admin can view certificate document
- ✅ Admin can verify with single click
- ✅ Admin can reject with reason
- ✅ Product auto-approves on certificate verification
- ✅ Dashboard shows pending count
- ✅ Real-time count updates
- ✅ Cross-tab state management
- ✅ Proper permission checks
- ✅ All database fields populate correctly
- ✅ No console errors

---

## Testing Checklist

### Pre-Testing Setup:
- [ ] Server running on port 3000
- [ ] MongoDB connected
- [ ] At least 1 farmer account exists
- [ ] At least 1 admin account exists
- [ ] At least 1 product category exists
- [ ] Test certificate files prepared (PDF < 2MB)

### Farmer Side:
- [ ] Product creation without certificate works
- [ ] Product creation with certificate works
- [ ] File upload validation works
- [ ] Certificate preview displays
- [ ] Form resets after submission
- [ ] Correct success messages shown
- [ ] Products appear in farmer's list

### Admin Side:
- [ ] Dashboard shows AGMARK count
- [ ] Pending tab shows correct products
- [ ] Certificate details display correctly
- [ ] View certificate link works
- [ ] Download certificate works
- [ ] Verify action works
- [ ] Reject action with reason works
- [ ] Modal cancel works
- [ ] Count updates after actions
- [ ] Tab navigation works
- [ ] Query parameter tab switch works

### Database:
- [ ] All AGMARK fields save correctly
- [ ] Verification status updates
- [ ] Admin ID stored in verifiedBy
- [ ] Timestamp recorded
- [ ] Product status auto-updates on verify
- [ ] Rejection reason saves

### Integration:
- [ ] Cross-role testing (farmer ↔ admin)
- [ ] Multi-browser testing
- [ ] Mobile responsive testing
- [ ] Network error handling
- [ ] Concurrent verification handling

---

## Test Data Examples

### Sample Certificate Numbers:
- AGMARK-2024-000001
- AGMARK-PB-2024-123456
- AGMARK-HR-2024-789012
- AGMARK-UP-2024-345678

### Sample Rejection Reasons:
- "Certificate image is not clear. Please upload a higher resolution image."
- "Grade mentioned does not match the product quality. Please verify."
- "Certificate number could not be verified in AGMARK database."
- "Certificate has expired. Please submit current certification."
- "Product description does not match certificate details."

---

## Troubleshooting

### Issue: Products not showing in pending tab
**Solution**: Check `agmarkVerificationStatus` is exactly "pending" (lowercase)

### Issue: Certificate download not working
**Solution**: Ensure base64 string has correct prefix (`data:application/pdf;base64,`)

### Issue: Dashboard count not updating
**Solution**: Check `/api/admin/analytics/stats` includes `pendingAGMARK` field

### Issue: Verification action fails
**Solution**: Check admin authentication, Product ID validity, and action parameter

### Issue: File upload fails
**Solution**: Check file size < 2MB, file type is PDF/JPEG/PNG

---

## Contact & Support
For issues or questions about AGMARK system implementation, contact the development team.

**Last Updated**: November 2, 2024
**Version**: 1.0.0
