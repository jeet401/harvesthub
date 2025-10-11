#!/bin/bash
# Security Check Script - Run before pushing to GitHub

echo "🔐 HarvestHub Security Check"
echo "========================="

# Check if .env files exist but are ignored
echo "📁 Checking .env files..."
if [ -f "server/.env" ]; then
    if git check-ignore server/.env >/dev/null 2>&1; then
        echo "✅ server/.env exists and is ignored"
    else
        echo "❌ WARNING: server/.env is NOT ignored!"
        exit 1
    fi
else
    echo "⚠️  server/.env not found (create from .env.example)"
fi

if [ -f "client/.env" ]; then
    if git check-ignore client/.env >/dev/null 2>&1; then
        echo "✅ client/.env exists and is ignored"
    else
        echo "❌ WARNING: client/.env is NOT ignored!"
        exit 1
    fi
else
    echo "⚠️  client/.env not found (create from .env.example)"
fi

# Check for accidentally staged sensitive files
echo ""
echo "🔍 Checking staged files for sensitive content..."
staged_files=$(git diff --cached --name-only)
for file in $staged_files; do
    if [[ $file == *".env"* && $file != *".env.example"* ]]; then
        echo "❌ WARNING: $file is staged (contains secrets!)"
        exit 1
    fi
    
    # Check file content for common secret patterns
    if git diff --cached "$file" | grep -i -E "(secret|password|key.*=|token.*=)" >/dev/null 2>&1; then
        echo "⚠️  WARNING: $file may contain sensitive data"
        echo "   Please review before committing"
    fi
done

echo "✅ No obvious security issues found"
echo ""
echo "📋 Pre-commit checklist:"
echo "   □ Updated .env.example files (without real secrets)"
echo "   □ Removed any hardcoded API keys from source code"
echo "   □ Generated new secrets for production"
echo "   □ Verified Razorpay is in test mode"
echo ""
echo "🚀 Ready to push safely!"