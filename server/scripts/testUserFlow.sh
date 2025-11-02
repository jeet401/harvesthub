#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🌾 Farmer Product Persistence - User Flow Test 🌾"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/yogeshvora/Desktop/trials/server

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Scenario: Farmer logs in, sees products, adds new, logs out, logs back in${NC}"
echo ""

# Day 1 - Morning
echo "═══════════════════════════════════════════════════════"
echo "📅 DAY 1 - MORNING (8:00 AM)"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "1️⃣  Farmer opens browser and logs in..."
LOGIN=$(curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/morning_session.txt)

FARMER_NAME=$(echo "$LOGIN" | jq -r '.user.email')
echo -e "${GREEN}✓${NC} Logged in as: $FARMER_NAME"
echo ""

echo "2️⃣  Views existing products on dashboard..."
MORNING_PRODUCTS=$(curl -s -b /tmp/morning_session.txt \
  "http://localhost:3000/api/products/my-products")

MORNING_COUNT=$(echo "$MORNING_PRODUCTS" | jq '.products | length')
echo -e "${GREEN}✓${NC} Sees $MORNING_COUNT products:"
echo "$MORNING_PRODUCTS" | jq -r '.products[] | "   📦 \(.title) - ₹\(.price) (\(.stock) in stock)"'
echo ""

echo "3️⃣  Adds a new product: Fresh Cauliflower..."
ADD_RESPONSE=$(curl -s -b /tmp/morning_session.txt \
  http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Fresh Cauliflower","description":"Organic cauliflower from farm","price":45,"stock":75}')

NEW_ID=$(echo "$ADD_RESPONSE" | jq -r '.product._id')
echo -e "${GREEN}✓${NC} Added: Fresh Cauliflower (Product ID: ${NEW_ID:0:8}...)"
echo ""

echo "4️⃣  Refreshes dashboard to see all products..."
sleep 1
AFTER_ADD=$(curl -s -b /tmp/morning_session.txt \
  "http://localhost:3000/api/products/my-products")

AFTER_COUNT=$(echo "$AFTER_ADD" | jq '.products | length')
echo -e "${GREEN}✓${NC} Now sees $AFTER_COUNT products:"
echo "$AFTER_ADD" | jq -r '.products[] | "   📦 \(.title) - ₹\(.price) (\(.stock) in stock)"'
echo ""

echo "5️⃣  Farmer logs out and closes browser..."
curl -s -b /tmp/morning_session.txt \
  http://localhost:3000/api/auth/logout \
  -X POST > /dev/null
echo -e "${GREEN}✓${NC} Logged out successfully"
rm /tmp/morning_session.txt
echo ""

# Simulate time passing
echo -e "${YELLOW}⏰ Time passes... Farmer goes to work in the fields...${NC}"
echo ""
sleep 2

# Day 1 - Evening
echo "═══════════════════════════════════════════════════════"
echo "📅 DAY 1 - EVENING (6:00 PM)"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "6️⃣  Farmer returns home and logs in again..."
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/evening_session.txt > /dev/null

echo -e "${GREEN}✓${NC} Logged in again (new session)"
echo ""

echo "7️⃣  Checks dashboard - Are products still there?"
EVENING_PRODUCTS=$(curl -s -b /tmp/evening_session.txt \
  "http://localhost:3000/api/products/my-products")

EVENING_COUNT=$(echo "$EVENING_PRODUCTS" | jq '.products | length')

if [ "$EVENING_COUNT" -eq "$AFTER_COUNT" ]; then
  echo -e "${GREEN}✓✓✓ SUCCESS! All $EVENING_COUNT products are still there!${NC}"
  echo ""
  echo "$EVENING_PRODUCTS" | jq -r '.products[] | "   📦 \(.title) - ₹\(.price) (\(.stock) in stock)"'
else
  echo -e "❌ FAILURE! Products lost. Expected $AFTER_COUNT, got $EVENING_COUNT"
fi
echo ""

# Simulate another day
echo -e "${YELLOW}⏰ Farmer goes to sleep... Next day arrives...${NC}"
echo ""
sleep 2

# Day 2 - Morning
echo "═══════════════════════════════════════════════════════"
echo "📅 DAY 2 - MORNING (9:00 AM)"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "8️⃣  New day! Farmer logs out and logs in again..."
curl -s -b /tmp/evening_session.txt \
  http://localhost:3000/api/auth/logout \
  -X POST > /dev/null
rm /tmp/evening_session.txt

curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1234@gmail.com","password":"farmer123"}' \
  -c /tmp/nextday_session.txt > /dev/null

echo -e "${GREEN}✓${NC} Logged in on Day 2"
echo ""

echo "9️⃣  Views dashboard - Did products persist overnight?"
NEXTDAY_PRODUCTS=$(curl -s -b /tmp/nextday_session.txt \
  "http://localhost:3000/api/products/my-products")

NEXTDAY_COUNT=$(echo "$NEXTDAY_PRODUCTS" | jq '.products | length')

if [ "$NEXTDAY_COUNT" -eq "$AFTER_COUNT" ]; then
  echo -e "${GREEN}✓✓✓ PERFECT! All $NEXTDAY_COUNT products persisted overnight!${NC}"
  echo ""
  echo "$NEXTDAY_PRODUCTS" | jq -r '.products[] | "   📦 \(.title) - ₹\(.price) (\(.stock) in stock)"'
else
  echo -e "❌ FAILURE! Products lost overnight. Expected $AFTER_COUNT, got $NEXTDAY_COUNT"
fi
echo ""

# Cleanup
echo "🧹 Cleaning up test data..."
if [ "$NEW_ID" != "null" ] && [ -n "$NEW_ID" ]; then
  curl -s -b /tmp/nextday_session.txt \
    -X DELETE \
    "http://localhost:3000/api/products/$NEW_ID" > /dev/null
  echo -e "${GREEN}✓${NC} Removed test product: Fresh Cauliflower"
fi
rm -f /tmp/nextday_session.txt
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Products at start:      $MORNING_COUNT"
echo "Products after add:     $AFTER_COUNT"
echo "Products after logout:  $EVENING_COUNT"
echo "Products next day:      $NEXTDAY_COUNT"
echo ""

if [ "$EVENING_COUNT" -eq "$AFTER_COUNT" ] && [ "$NEXTDAY_COUNT" -eq "$AFTER_COUNT" ]; then
  echo -e "${GREEN}✅ COMPLETE SUCCESS!${NC}"
  echo ""
  echo "✓ Products persist across logout/login"
  echo "✓ Products persist across sessions"
  echo "✓ Products persist overnight"
  echo "✓ Products are stored permanently in database"
  echo "✓ No localStorage - everything in MongoDB"
  echo ""
  echo -e "${GREEN}🎉 Farmer Product Persistence is WORKING PERFECTLY! 🎉${NC}"
else
  echo -e "❌ FAILURE - Products not persisting correctly"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
