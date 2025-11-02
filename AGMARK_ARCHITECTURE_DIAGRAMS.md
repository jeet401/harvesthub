# AGMARK System Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AGMARK CERTIFICATION SYSTEM                  │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────┐         ┌────────────────────┐         ┌──────────────────┐
│                   │         │                    │         │                  │
│  FARMER INTERFACE │────────▶│  BACKEND API       │◀────────│  ADMIN INTERFACE │
│                   │         │                    │         │                  │
└───────────────────┘         └────────────────────┘         └──────────────────┘
         │                             │                              │
         │                             │                              │
         ▼                             ▼                              ▼
┌──────────────────┐         ┌────────────────────┐         ┌─────────────────┐
│ AddProduct.jsx   │         │   Product Model    │         │ ProductMgmt.jsx │
│                  │         │                    │         │                 │
│ • Certificate    │         │ • agmarkCertified  │         │ • Pending Tab   │
│   checkbox       │         │ • agmarkGrade      │         │ • Verify/Reject │
│ • File upload    │         │ • agmarkStatus     │         │ • Preview cert  │
│ • Validation     │         │ • certificateUrl   │         │ • Download      │
└──────────────────┘         └────────────────────┘         └─────────────────┘
                                      │
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │   MongoDB Database  │
                            │                     │
                            │  Products Collection│
                            └─────────────────────┘
```

## Data Flow Diagram

### Flow 1: Farmer Uploads Certificate

```
┌─────────┐
│ Farmer  │
│ Login   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Add New Product │
└────┬────────────┘
     │
     ▼
┌──────────────────────────┐
│ Fill Product Details     │
│ • Title, Price, Stock    │
│ • Category, Location     │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Check AGMARK Certificate │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Upload Certificate       │
│ • Certificate Number     │
│ • Grade (A+, A, B, C)    │
│ • PDF/Image File         │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Validate File            │
│ • Type: PDF/JPEG/PNG     │
│ • Size: < 2MB            │
│ • Number: Required       │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Convert to Base64        │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ POST /api/products       │
│                          │
│ Body:                    │
│ • Product details        │
│ • agmarkCertificateUrl   │
│ • agmarkCertNumber       │
│ • agmarkGrade            │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Save to Database         │
│                          │
│ Status:                  │
│ • status: "pending"      │
│ • agmarkVerificationStatus│
│   : "pending"            │
│ • agmarkCertified: false │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Success Message          │
│ "Certificate will be     │
│ verified by admin"       │
└──────────────────────────┘
```

### Flow 2: Admin Verifies Certificate

```
┌─────────┐
│ Admin   │
│ Login   │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Admin Dashboard     │
│                     │
│ Stats:              │
│ • AGMARK Pending: X │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Click AGMARK Card   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Product Management          │
│ Tab: Pending AGMARK Verif.  │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ GET /api/admin/products/    │
│     agmark/pending          │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Display Pending Products    │
│                             │
│ For Each Product:           │
│ • Product info              │
│ • Certificate details       │
│ • View/Download buttons     │
│ • Verify/Reject buttons     │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Admin Reviews Certificate   │
│ • Views PDF/image           │
│ • Checks authenticity       │
│ • Validates grade           │
└────┬────────────────────────┘
     │
     ├─────────────────┬───────────────────┐
     │                 │                   │
     ▼                 ▼                   ▼
┌──────────┐    ┌──────────┐      ┌──────────────┐
│ VERIFY   │    │ REJECT   │      │   CANCEL     │
└────┬─────┘    └────┬─────┘      └──────────────┘
     │               │
     ▼               ▼
┌─────────┐    ┌──────────────────┐
│ Confirm │    │ Enter Reason     │
└────┬────┘    └────┬─────────────┘
     │               │
     ▼               ▼
┌──────────────────────────────┐
│ PATCH /api/admin/products/   │
│       :id/agmark             │
│                              │
│ Body: { action, reason }     │
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Update Database              │
│                              │
│ IF VERIFY:                   │
│ • agmarkVerificationStatus:  │
│   "verified"                 │
│ • agmarkCertified: true      │
│ • status: "active"           │
│ • agmarkVerifiedBy: admin_id │
│ • agmarkVerifiedAt: now()    │
│                              │
│ IF REJECT:                   │
│ • agmarkVerificationStatus:  │
│   "rejected"                 │
│ • agmarkCertified: false     │
│ • agmarkRejectionReason: ... │
│ • agmarkVerifiedBy: admin_id │
│ • agmarkVerifiedAt: now()    │
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Remove from Pending List     │
│ Update Dashboard Count       │
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Success Alert                │
│ "Certificate verified/       │
│  rejected successfully"      │
└──────────────────────────────┘
```

### Flow 3: Product Display to Buyer

```
┌─────────────────────┐
│ Buyer Views Product │
└────┬────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Check Product Status        │
└────┬────────────────────────┘
     │
     ├──────────────────┬───────────────────┐
     │                  │                   │
     ▼                  ▼                   ▼
┌─────────────┐  ┌─────────────┐  ┌───────────────┐
│ Certified   │  │ Pending     │  │ Rejected/None │
│ (verified)  │  │ (pending)   │  │               │
└─────┬───────┘  └─────┬───────┘  └───────┬───────┘
      │                │                  │
      ▼                ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌───────────────┐
│ Show Badge  │  │ Show Badge  │  │ No Badge      │
│ ✓ AGMARK    │  │ ⏳ Pending  │  │               │
│ Grade: A+   │  │ Verification│  │               │
│ (Green)     │  │ (Yellow)    │  │               │
└─────────────┘  └─────────────┘  └───────────────┘
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────┐         ┌──────────────────────┐          │
│  │ AdminDashboard    │────────▶│ ProductManagement    │          │
│  │                   │         │                      │          │
│  │ • Stats display   │  Click  │ • All Products tab   │          │
│  │ • AGMARK count    │  card   │ • AGMARK tab         │          │
│  │ • Link to mgmt    │         │ • Verification UI    │          │
│  └───────────────────┘         └──────────────────────┘          │
│                                                                   │
│  ┌───────────────────┐                                            │
│  │ AddProduct        │                                            │
│  │                   │                                            │
│  │ • Certificate UI  │                                            │
│  │ • File upload     │                                            │
│  │ • Validation      │                                            │
│  └───────────────────┘                                            │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                      BACKEND API ROUTES                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/admin/analytics/stats                                 │  │
│  │ • Returns: { products: { pendingAGMARK: X } }              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/admin/products/agmark/pending                         │  │
│  │ • Returns: { products: [...] }                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/admin/products/:id/agmark                             │  │
│  │ • Body: { action, rejectionReason }                        │  │
│  │ • Returns: { product: {...} }                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/products                                              │  │
│  │ • Body: { ...product, agmark fields }                      │  │
│  │ • Returns: { product: {...} }                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ MongoDB Operations
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                      DATABASE LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Products Collection                                        │  │
│  │                                                            │  │
│  │ {                                                          │  │
│  │   _id: ObjectId,                                           │  │
│  │   title: String,                                           │  │
│  │   status: String,                                          │  │
│  │   agmarkCertified: Boolean,                                │  │
│  │   agmarkGrade: String,                                     │  │
│  │   agmarkCertificateUrl: String,                            │  │
│  │   agmarkCertificateNumber: String,                         │  │
│  │   agmarkVerificationStatus: String,  // pending/verified/  │  │
│  │   agmarkVerifiedBy: ObjectId,        // rejected           │  │
│  │   agmarkVerifiedAt: Date,                                  │  │
│  │   agmarkRejectionReason: String                            │  │
│  │ }                                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## State Machine Diagram

```
                    ┌──────────────────────────┐
                    │   Product Created        │
                    │   (With Certificate)     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   agmarkVerificationStatus│
                    │   = "pending"            │
                    │                          │
                    │   Product visible in:    │
                    │   • Farmer dashboard     │
                    │   • Admin pending tab    │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
   ┌──────────────────────┐          ┌──────────────────────┐
   │   ADMIN VERIFIES     │          │   ADMIN REJECTS      │
   └──────────┬───────────┘          └──────────┬───────────┘
              │                                  │
              ▼                                  ▼
   ┌──────────────────────┐          ┌──────────────────────┐
   │ agmarkVerification   │          │ agmarkVerification   │
   │ Status = "verified"  │          │ Status = "rejected"  │
   │                      │          │                      │
   │ agmarkCertified =    │          │ agmarkCertified =    │
   │ true                 │          │ false                │
   │                      │          │                      │
   │ status = "active"    │          │ status = "pending"   │
   │                      │          │                      │
   │ Product visible:     │          │ Product visible:     │
   │ • Buyers (with badge)│          │ • Farmer dashboard   │
   │ • Farmer dashboard   │          │ • Admin all products │
   │ • Admin all products │          │                      │
   └──────────────────────┘          └──────────────────────┘
```

## Security Flow Diagram

```
┌──────────────────┐
│   HTTP Request   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ JWT Token Check  │
└────────┬─────────┘
         │
         ├─────────No Token─────────┐
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│ Has Valid Token? │      │ 401 Unauthorized │
└────────┬─────────┘      └──────────────────┘
         │
         ├────Yes────┐
         │           │
         ▼           ▼
┌──────────────┐   ┌──────────────────┐
│ Extract User │   │ Invalid Token    │
│ from Token   │   │ 401 Unauthorized │
└──────┬───────┘   └──────────────────┘
       │
       ▼
┌──────────────────┐
│ Check User Role  │
└────────┬─────────┘
         │
         ├──────Admin?──────┐
         │                  │
         ▼                  ▼
   ┌──────────┐      ┌──────────────┐
   │   Yes    │      │  403 Forbidden│
   └────┬─────┘      └──────────────┘
        │
        ▼
┌──────────────────────┐
│ adminRequired        │
│ Middleware Passed    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Execute AGMARK       │
│ Verification Logic   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Update Product       │
│ in Database          │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Return Success       │
│ Response             │
└──────────────────────┘
```

## File Upload Flow

```
┌────────────────────┐
│ User Selects File  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Validate File Type │
│ PDF/JPEG/PNG       │
└─────────┬──────────┘
          │
          ├──Invalid──┐
          │           │
          ▼           ▼
┌────────────────┐  ┌─────────────┐
│ Validate Size  │  │ Show Error  │
│ < 2MB          │  └─────────────┘
└─────────┬──────┘
          │
          ├──Too Large──┐
          │             │
          ▼             ▼
┌────────────────────┐  ┌─────────────┐
│ Read File as       │  │ Show Error  │
│ ArrayBuffer        │  └─────────────┘
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Convert to Base64  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Add MIME Prefix    │
│ data:type;base64,  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Store in State     │
│ (certificateUrl)   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Show Preview       │
│ File name display  │
└────────────────────┘
```

---

**Document Version**: 1.0.0
**Last Updated**: November 2, 2024
**Purpose**: Visual reference for AGMARK system architecture
