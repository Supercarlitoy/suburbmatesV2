#!/bin/bash
# SuburbMates MCP Environment Setup Script

echo "🏢 SuburbMates MCP Environment Setup"
echo "======================================"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << 'EOF'
# MCP Configuration Environment Variables
# Copy this to your ~/.zshrc or ~/.bash_profile for global access

# GitHub Personal Access Token (required for GitHub MCP)
# Get from: https://github.com/settings/personal-access-tokens/tokens
GITHUB_TOKEN=your_github_token_here

# Optional: Google Maps API Key (for future location features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional: ABN Lookup GUID (for Australian Business Register API)
ABN_LOOKUP_GUID=your_abn_lookup_guid_here

# Optional: Mapbox Token (for interactive maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
EOF
    echo "✅ Created .env.local template"
else
    echo "✅ .env.local already exists"
fi

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo ""
    echo "⚠️  GitHub Token Setup Required"
    echo "   1. Go to: https://github.com/settings/personal-access-tokens/tokens"
    echo "   2. Create token with 'repo', 'read:org', 'read:user' scopes"
    echo "   3. Add to ~/.zshrc: export GITHUB_TOKEN=\"your_token\""
    echo "   4. Run: source ~/.zshrc"
else
    echo "✅ GitHub token is configured"
fi

echo ""
echo "🔧 MCP Configuration Status:"
echo "   - Filesystem: Enhanced with SuburbMates directory"
echo "   - SQLite: Added for database prototyping"  
echo "   - GitHub: Added for repository management"
echo "   - Memory: Added for persistent context"
echo "   - Playwright: Available for browser automation"
echo "   - Fetch: Available for HTTP requests"
echo "   - PostHog: Available for analytics"

echo ""
echo "🚀 Next Steps:"
echo "   1. Set up GitHub token (see above)"
echo "   2. Restart Claude Desktop"
echo "   3. Verify new MCPs are loaded"
echo "   4. Start prototyping with SQLite database"

echo ""
echo "📚 Documentation: See MCP_SETUP.md for detailed instructions"