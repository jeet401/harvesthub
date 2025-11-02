#!/bin/bash

echo "🧪 Testing Farmer Product Persistence Flow"
echo "=========================================="
echo ""

cd /Users/yogeshvora/Desktop/trials/server

# Step 1: Login as farmer
echo "Step 1: Farmer Login"
echo "--------------------"
LOGIN_RESPONSE=$(curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/farmer_session.txt)

FARMER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')
FARMER_EMAIL=$(echo "$LOGIN_RESPONSE" | jq -r '.user.email')

echo "✅ Logged in as: $FARMER_EMAIL"
echo "✅ Farmer ID: $FARMER_ID"
echo ""

# Step 2: Get current products
echo "Step 2: Fetch Current Products"
echo "-------------------------------"
PRODUCTS_BEFORE=$(curl -s -b /tmp/farmer_session.txt \
  "http://localhost:3000/api/products/my-products")

PRODUCT_COUNT_BEFORE=$(echo "$PRODUCTS_BEFORE" | jq '.products | length')
echo "✅ Current products in database: $PRODUCT_COUNT_BEFORE"
echo ""

if [ "$PRODUCT_COUNT_BEFORE" -gt 0 ]; then
  echo "Existing products:"
  echo "$PRODUCTS_BEFORE" | jq -r '.products[] | "  - \(.title) (₹\(.price), Stock: \(.stock))"'
  echo ""
fi

# Step 3: Add a new product
echo "Step 3: Add New Product"
echo "-----------------------"
NEW_PRODUCT_TITLE="Test Product $(date +%s)"
ADD_RESPONSE=$(curl -s -b /tmp/farmer_session.txt \
  http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$NEW_PRODUCT_TITLE\",\"description\":\"Test product for persistence check\",\"price\":150,\"stock\":25}")

NEW_PRODUCT_ID=$(echo "$ADD_RESPONSE" | jq -r '.product._id')
echo "✅ Created new product: $NEW_PRODUCT_TITLE"
echo "✅ Product ID: $NEW_PRODUCT_ID"
echo ""

# Step 4: Verify product appears immediately
echo "Step 4: Verify Product Appears Immediately"
echo "-------------------------------------------"
sleep 1
PRODUCTS_AFTER=$(curl -s -b /tmp/farmer_session.txt \
  "http://localhost:3000/api/products/my-products")

PRODUCT_COUNT_AFTER=$(echo "$PRODUCTS_AFTER" | jq '.products | length')
echo "✅ Products after adding: $PRODUCT_COUNT_AFTER"

if [ "$PRODUCT_COUNT_AFTER" -gt "$PRODUCT_COUNT_BEFORE" ]; then
  echo "✅ SUCCESS: New product is visible"
else
  echo "❌ FAILURE: Product count did not increase"
fi
echo ""

# Step 5: Logout
echo "Step 5: Logout"
echo "--------------"
curl -s -b /tmp/farmer_session.txt \
  http://localhost:3000/api/auth/logout \
  -X POST > /dev/null
echo "✅ Logged out"
echo ""

# Step 6: Login again and verify products persist
echo "Step 6: Login Again and Verify Persistence"
echo "-------------------------------------------"
sleep 1
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/farmer_session2.txt > /dev/null

PRODUCTS_AFTER_RELOGIN=$(curl -s -b /tmp/farmer_session2.txt \
  "http://localhost:3000/api/products/my-products")

PRODUCT_COUNT_RELOGIN=$(echo "$PRODUCTS_AFTER_RELOGIN" | jq '.products | length')
echo "✅ Products after re-login: $PRODUCT_COUNT_RELOGIN"

if [ "$PRODUCT_COUNT_RELOGIN" -eq "$PRODUCT_COUNT_AFTER" ]; then
  echo "✅ SUCCESS: All products persisted across logout/login"
else
  echo "❌ FAILURE: Products lost after re-login"
fi
echo ""

echo "All products after re-login:"
echo "$PRODUCTS_AFTER_RELOGIN" | jq -r '.products[] | "  - \(.title) (₹\(.price), Stock: \(.stock))"'
echo ""

# Step 7: Cleanup - delete the test product
echo "Step 7: Cleanup"
echo "---------------"
if [ "$NEW_PRODUCT_ID" != "null" ] && [ -n "$NEW_PRODUCT_ID" ]; then
  curl -s -b /tmp/farmer_session2.txt \
    -X DELETE \
    "http://localhost:3000/api/products/$NEW_PRODUCT_ID" > /dev/null
  echo "✅ Deleted test product: $NEW_PRODUCT_TITLE"
fi

# Cleanup temp files
rm -f /tmp/farmer_session.txt /tmp/farmer_session2.txt

echo ""
echo "=========================================="
echo "✅ Test Complete!"
echo ""
echo "Summary:"
echo "  Before: $PRODUCT_COUNT_BEFORE products"
echo "  After adding: $PRODUCT_COUNT_AFTER products"
echo "  After re-login: $PRODUCT_COUNT_RELOGIN products"
echo ""

if [ "$PRODUCT_COUNT_AFTER" -gt "$PRODUCT_COUNT_BEFORE" ] && [ "$PRODUCT_COUNT_RELOGIN" -eq "$PRODUCT_COUNT_AFTER" ]; then
  echo "✅ Backend persistence is working correctly!"
else
  echo "❌ Backend has issues with persistence"
fi
