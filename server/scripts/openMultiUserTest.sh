#!/bin/bash

echo "🚀 Opening 3 Browser Windows for Multi-User Testing"
echo "===================================================="
echo ""

APP_URL="http://localhost:5173"

echo "Opening browsers..."
echo ""

# Window 1: Chrome (Normal) - For Farmer
echo "1️⃣  Chrome (Normal) → Login as FARMER"
echo "   Email: farmer1234@gmail.com"
echo "   Password: farmer123"
open -na "Google Chrome" --args --new-window "$APP_URL" 2>/dev/null
sleep 2

# Window 2: Chrome (Incognito) - For Buyer
echo ""
echo "2️⃣  Chrome (Incognito) → Login as BUYER"
echo "   Email: buyer1234@gmail.com"  
echo "   Password: buyer123"
open -na "Google Chrome" --args --incognito "$APP_URL" 2>/dev/null
sleep 2

# Window 3: Safari - For Admin
echo ""
echo "3️⃣  Safari → Login as ADMIN"
echo "   Email: admin@harvesthub.com"
echo "   Password: admin123"
open -a Safari "$APP_URL" 2>/dev/null

echo ""
echo "===================================================="
echo "✅ 3 Browser windows opened!"
echo ""
echo "📋 Next Steps:"
echo "1. Login to each browser with credentials shown above"
echo "2. Test that each shows correct dashboard"
echo "3. Test cross-user interactions (add product, place order, etc.)"
echo ""
echo "💡 Tip: Arrange windows side-by-side to see all 3 at once"
echo ""
