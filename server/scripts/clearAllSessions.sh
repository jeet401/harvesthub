#!/bin/bash

echo "🧹 Clearing All User Sessions"
echo "=============================="
echo ""

# Clear admin session
echo "1️⃣  Clearing Admin session..."
curl -s http://localhost:3000/api/auth/logout \
  -X POST \
  -H "Content-Type: application/json" \
  -c /tmp/clear_admin.txt \
  -b /tmp/clear_admin.txt > /dev/null 2>&1
echo "✅ Admin session cleared"

# Clear farmer session
echo "2️⃣  Clearing Farmer session..."
curl -s http://localhost:3000/api/auth/logout \
  -X POST \
  -H "Content-Type: application/json" \
  -c /tmp/clear_farmer.txt \
  -b /tmp/clear_farmer.txt > /dev/null 2>&1
echo "✅ Farmer session cleared"

# Clear buyer session
echo "3️⃣  Clearing Buyer session..."
curl -s http://localhost:3000/api/auth/logout \
  -X POST \
  -H "Content-Type: application/json" \
  -c /tmp/clear_buyer.txt \
  -b /tmp/clear_buyer.txt > /dev/null 2>&1
echo "✅ Buyer session cleared"

# Cleanup temp files
rm -f /tmp/clear_*.txt

echo ""
echo "=============================="
echo "✅ All sessions cleared!"
echo ""
echo "📋 Next Steps:"
echo "1. Open your browser"
echo "2. Press Cmd+Shift+Delete"
echo "3. Select 'Cookies and other site data'"
echo "4. Click 'Clear data'"
echo "5. Refresh the page (Cmd+R)"
echo ""
echo "OR simply use Incognito/Private mode"
echo ""
