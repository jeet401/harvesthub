#!/bin/bash

echo "🔍 Farmer Dashboard Products Troubleshooting"
echo "=============================================="
echo ""

# Test farmer login and products
echo "1. Testing Farmer Login"
echo "-----------------------"
LOGIN_RESPONSE=$(curl -s -c /tmp/farmer_test.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  "http://localhost:3000/api/auth/login")

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Test my-products endpoint
echo "2. Testing My Products Endpoint"
echo "--------------------------------"
PRODUCTS_RESPONSE=$(curl -s -b /tmp/farmer_test.txt \
  "http://localhost:3000/api/products/my-products")

PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq '.products | length')
echo "Number of products returned: $PRODUCT_COUNT"
echo ""

if [ "$PRODUCT_COUNT" -gt 0 ]; then
  echo "✅ Products found in API response!"
  echo ""
  echo "Products:"
  echo "$PRODUCTS_RESPONSE" | jq '.products[] | {title, price, stock, status, categoryName: .categoryId.name}'
else
  echo "❌ No products returned from API!"
fi

echo ""
echo "=============================================="
echo ""
echo "📋 Troubleshooting Steps for Frontend:"
echo ""
echo "1. Login Credentials:"
echo "   Email: farmer1234@gmail.com"
echo "   Password: farmer123"
echo ""
echo "2. Clear Browser Data:"
echo "   - Open browser DevTools (F12)"
echo "   - Go to Application/Storage tab"
echo "   - Clear all cookies for localhost:5173"
echo "   - Clear localStorage"
echo ""
echo "3. Hard Refresh:"
echo "   - Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""
echo "4. Check Browser Console:"
echo "   - Open DevTools Console tab"
echo "   - Look for 'Fetched farmer products from database:'"
echo "   - Should show array with $PRODUCT_COUNT products"
echo ""
echo "5. Click Refresh Button:"
echo "   - In Farmer Dashboard, click the purple 'Refresh' button"
echo "   - This will manually reload products from API"
echo ""
echo "6. Check Network Tab:"
echo "   - Open DevTools Network tab"
echo "   - Filter by 'my-products'"
echo "   - Should see 200 OK response with products array"
echo ""

# Cleanup
rm -f /tmp/farmer_test.txt

echo "✅ API Test Complete!"
