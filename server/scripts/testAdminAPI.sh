#!/bin/bash

echo "🧪 Testing Admin API Endpoints"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Login as admin
echo "Test 1: Admin Login"
echo "-------------------"
LOGIN_RESPONSE=$(curl -s -c /tmp/admin_test_cookies.txt -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@harvesthub.com","password":"admin123"}' \
  "$BASE_URL/api/auth/login")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Login successful"
  echo "$BODY" | jq '.'
else
  echo "❌ Login failed (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi

echo ""

# Test 2: Get Admin Stats
echo "Test 2: Get Admin Stats"
echo "-----------------------"
STATS_RESPONSE=$(curl -s -b /tmp/admin_test_cookies.txt -w "\n%{http_code}" \
  "$BASE_URL/api/admin/analytics/stats")

HTTP_CODE=$(echo "$STATS_RESPONSE" | tail -n 1)
BODY=$(echo "$STATS_RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Stats fetched successfully"
  echo "$BODY" | jq '.'
else
  echo "❌ Stats fetch failed (HTTP $HTTP_CODE)"
  echo "$BODY"
fi

echo ""

# Test 3: Get Recent Activity
echo "Test 3: Get Recent Activity"
echo "---------------------------"
ACTIVITY_RESPONSE=$(curl -s -b /tmp/admin_test_cookies.txt -w "\n%{http_code}" \
  "$BASE_URL/api/admin/analytics/recent-activity?limit=5")

HTTP_CODE=$(echo "$ACTIVITY_RESPONSE" | tail -n 1)
BODY=$(echo "$ACTIVITY_RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Recent activity fetched successfully"
  echo "$BODY" | jq '.activities | length' | xargs echo "Number of activities:"
  echo "$BODY" | jq '.activities[0]' 2>/dev/null || echo "No activities found"
else
  echo "❌ Recent activity fetch failed (HTTP $HTTP_CODE)"
  echo "$BODY"
fi

echo ""

# Test 4: Get All Users
echo "Test 4: Get All Users"
echo "---------------------"
USERS_RESPONSE=$(curl -s -b /tmp/admin_test_cookies.txt -w "\n%{http_code}" \
  "$BASE_URL/api/admin/users")

HTTP_CODE=$(echo "$USERS_RESPONSE" | tail -n 1)
BODY=$(echo "$USERS_RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Users fetched successfully"
  echo "$BODY" | jq '.total' | xargs echo "Total users:"
  echo "$BODY" | jq '.users[0] | {email, role}' 2>/dev/null || echo "No users found"
else
  echo "❌ Users fetch failed (HTTP $HTTP_CODE)"
  echo "$BODY"
fi

echo ""
echo "================================"
echo "✅ Admin API Test Complete!"

# Cleanup
rm -f /tmp/admin_test_cookies.txt
