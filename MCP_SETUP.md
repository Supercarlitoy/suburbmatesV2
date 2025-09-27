# SuburbMates MCP Configuration

## Overview
This document outlines the Model Context Protocol (MCP) setup for the SuburbMates project, providing enhanced AI capabilities for development, testing, and business directory management.

## Installed MCPs

### Core MCPs (Already Configured)
1. **Filesystem** - Enhanced with SuburbMates project directory access
2. **Playwright** - Browser automation for testing and web scraping
3. **Fetch** - HTTP requests for API integration
4. **PostHog** - Analytics and event tracking
5. **Desktop Commander** - Desktop automation

### New MCPs Added
6. **SQLite** - Local database for prototyping business listings
7. **GitHub** - Repository management and issue tracking
8. **Memory** - Persistent context and note-taking

## Environment Variables Setup

### Required for GitHub MCP
```bash
# Add to your ~/.zshrc or ~/.bash_profile
export GITHUB_TOKEN="your_github_personal_access_token"
```

To create a GitHub token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these scopes:
   - `repo` (full repository access)
   - `read:org` (read organization data)
   - `read:user` (read user profile data)

### Optional Environment Variables
```bash
# For Google Maps integration (future use)
export GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# For ABN Lookup API (Australian Business Register)
export ABN_LOOKUP_GUID="your_abn_lookup_guid"

# For Mapbox integration (future use)
export NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token"
```

## SuburbMates-Specific Use Cases

### SQLite MCP Benefits
- **Business Listings Database**: Prototype business directory schema
- **Search Index**: Test full-text search capabilities
- **User Management**: Develop authentication and user profiles
- **Analytics Storage**: Store and analyze user behavior data

### GitHub MCP Benefits
- **Issue Management**: Track bugs and feature requests
- **Project Planning**: Manage development milestones
- **Code Review**: Automated code quality checks
- **Documentation**: Maintain project documentation

### Playwright MCP Benefits
- **ABN Verification**: Automate business verification workflows
- **SEO Testing**: Validate page performance and SEO
- **User Journey Testing**: Test business registration and search flows
- **Competitive Analysis**: Monitor other directory platforms

## Development Workflow Integration

### Database Prototyping
```sql
-- Example SQLite schema for business listings
CREATE TABLE businesses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    abn TEXT UNIQUE,
    category TEXT,
    suburb TEXT,
    postcode TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suburbs (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    postcode TEXT,
    state TEXT DEFAULT 'VIC'
);
```

### Testing Scenarios
1. **Business Registration Flow**: Use Playwright to test form validation
2. **Search Functionality**: Test Melbourne suburb-based search
3. **ABN Verification**: Mock ABN API responses for development
4. **Mobile Responsiveness**: Test responsive design across devices

## Restart Required
After updating the MCP configuration, restart Claude Desktop for changes to take effect.

## Verification
Once restarted, you should have access to new tools for:
- SQLite database operations
- GitHub repository management
- Enhanced file system access to the SuburbMates project
- Persistent memory for development context

## Next Steps
1. Restart Claude Desktop
2. Set up GitHub token environment variable
3. Initialize SQLite database for business listings prototype
4. Create development and testing workflows using new MCPs

## Troubleshooting
- Ensure all npm packages are available globally or locally
- Check environment variable setup with `echo $GITHUB_TOKEN`
- Verify file permissions for the SuburbMates project directory
- Check Claude Desktop logs if MCPs fail to load