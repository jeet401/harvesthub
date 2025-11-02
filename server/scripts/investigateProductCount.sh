#!/bin/bash

echo "🔍 Investigating Product Count Issue"
echo "====================================="
echo ""

cd /Users/yogeshvora/Desktop/trials/server

# Check database
echo "1️⃣  Products in MongoDB Database:"
echo "--------------------------------"
DB_COUNT=$(node -e "
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/farmbyte');
  const farmerId = '6907133ecc1d7fa44153fd13';
  const products = await Product.find({ sellerId: farmerId });
  console.log(products.length);
  await mongoose.connection.close();
})();
" 2>/dev/null)

echo "   Total: $DB_COUNT products"
echo ""

# Check API response
echo "2️⃣  Products from API Endpoint:"
echo "------------------------------"
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/check_api.txt > /dev/null

API_RESPONSE=$(curl -s -b /tmp/check_api.txt "http://localhost:3000/api/products/my-products")
API_COUNT=$(echo "$API_RESPONSE" | jq '.products | length')

echo "   Total: $API_COUNT products"
echo ""
echo "   Products:"
echo "$API_RESPONSE" | jq -r '.products[] | "   • \(.title) (₹\(.price), Stock: \(.stock))"'
echo ""

# Check for all products (not just farmer's)
echo "3️⃣  All Products in Database (any seller):"
echo "-----------------------------------------"
ALL_COUNT=$(node -e "
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/farmbyte');
  const products = await Product.find({});
  console.log(products.length);
  await mongoose.connection.close();
})();
" 2>/dev/null)

echo "   Total: $ALL_COUNT products"
echo ""

# Cleanup
rm -f /tmp/check_api.txt

echo "====================================="
echo ""
echo "📊 Summary:"
echo "   Database (farmer's products): $DB_COUNT"
echo "   API response (farmer's products): $API_COUNT"
echo "   Database (all products): $ALL_COUNT"
echo ""

if [ "$DB_COUNT" = "3" ] && [ "$API_COUNT" = "3" ]; then
  echo "✅ Database and API are in sync - showing 3 products"
  echo ""
  echo "❓ Question: Where did you see 5 products?"
  echo "   1. In the frontend UI?"
  echo "   2. In browser console?"
  echo "   3. In localStorage?"
  echo ""
  echo "💡 Possible reasons for seeing 5:"
  echo "   • Browser localStorage has old data"
  echo "   • Browser cache showing old state"
  echo "   • Counting demo/mock products"
  echo ""
  echo "🔧 Solutions:"
  echo "   1. Clear browser localStorage (F12 → Application → Local Storage → Clear)"
  echo "   2. Clear browser cache (Cmd+Shift+Delete)"
  echo "   3. Use Incognito mode"
  echo "   4. Hard refresh (Cmd+Shift+R)"
else
  echo "⚠️  Mismatch detected between database and API"
fi

echo ""
