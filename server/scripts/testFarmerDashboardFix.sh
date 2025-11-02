#!/bin/bash

echo "🧪 Testing Farmer Dashboard Product Display Fix"
echo "================================================"
echo ""

# Step 1: Check current products in database
echo "Step 1: Current Products in Database"
echo "-------------------------------------"
cd /Users/yogeshvora/Desktop/trials/server
PRODUCT_COUNT=$(node -e "
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/farmbyte');
  const products = await Product.find({ sellerId: '6907133ecc1d7fa44153fd13' });
  console.log(products.length);
  await mongoose.connection.close();
})();
" 2>/dev/null)

echo "Farmer's products in database: $PRODUCT_COUNT"
echo ""

# Step 2: Test API endpoint
echo "Step 2: Testing API Endpoint"
echo "-----------------------------"
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/farmer_fix_test.txt > /dev/null

PRODUCTS_RESPONSE=$(curl -s -b /tmp/farmer_fix_test.txt \
  "http://localhost:3000/api/products/my-products")

API_PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq '.products | length')
echo "Products returned by API: $API_PRODUCT_COUNT"

if [ "$PRODUCT_COUNT" = "$API_PRODUCT_COUNT" ]; then
  echo "✅ API is returning correct number of products"
else
  echo "❌ Mismatch between database ($PRODUCT_COUNT) and API ($API_PRODUCT_COUNT)"
fi

echo ""

# Step 3: Show products
echo "Step 3: Products Details"
echo "------------------------"
echo "$PRODUCTS_RESPONSE" | jq '.products[] | {title, stock, price}'

echo ""
echo "================================================"
echo ""
echo "✅ Code Changes Made:"
echo ""
echo "1. FarmerDashboard.jsx:"
echo "   - Added user dependency to useEffect"
echo "   - Added window focus listener to auto-refresh"
echo "   - Added console.log for debugging"
echo ""
echo "2. AddProduct.jsx:"
echo "   - Removed 1-second delay before navigation"
echo "   - Navigate immediately after product creation"
echo ""
echo "================================================"
echo ""
echo "📋 User Instructions:"
echo ""
echo "1. Logout completely from the app"
echo "2. Clear browser cookies and localStorage"
echo "3. Login with:"
echo "   Email: farmer1234@gmail.com"
echo "   Password: farmer123"
echo "4. Go to Farmer Dashboard"
echo "5. Should see all $PRODUCT_COUNT products"
echo "6. Add a new product"
echo "7. After redirect, all products (including new) should appear"
echo "8. If not, click the purple 'Refresh' button"
echo ""
echo "🐛 If Still Not Working:"
echo ""
echo "Open browser DevTools (F12) and check:"
echo "- Console tab: Look for 'Fetching farmer data...'"
echo "- Console tab: Look for 'Fetched farmer products from database:'"
echo "- Network tab: Check /api/products/my-products response"
echo ""

# Cleanup
rm -f /tmp/farmer_fix_test.txt

echo "✅ Test Complete!"
