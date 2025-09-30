#!/bin/bash
# 🎯 SuburbMates Documentation Reorganization Script
# Based on Next.js best practices and industry standards

set -e  # Exit on any error

echo "🚀 Starting SuburbMates documentation reorganization..."
echo "📋 This will reorganize all markdown files into /docs structure"
echo ""

# Confirm with user
read -p "Are you sure you want to proceed? This will move files around. (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

# Create backup
echo "💾 Creating backup of current documentation..."
mkdir -p .backup-docs-$(date +%Y%m%d-%H%M%S)
cp -r *.md .backup-docs-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || echo "No root markdown files to backup"
cp -r docs .backup-docs-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || echo "No docs directory to backup"

# Create new documentation structure
echo "📁 Creating new documentation structure..."
mkdir -p docs/{admin,automation,development,architecture,guides,specs}

# Create main docs README
cat > docs/README.md << 'EOF'
# 📚 SuburbMates Documentation

Welcome to the SuburbMates documentation. This directory contains all project documentation organized by purpose and audience.

## 📁 Documentation Structure

- **[Admin](./admin/)** - Administrative guides and workflows
- **[Automation](./automation/)** - Automation systems and AI workflows  
- **[Development](./development/)** - Developer setup and contribution guides
- **[Architecture](./architecture/)** - Technical architecture and system design
- **[Guides](./guides/)** - Step-by-step how-to guides
- **[Specs](./specs/)** - Technical specifications and requirements

## 🚀 Quick Links

- [Getting Started](./development/getting-started.md) - Set up your development environment
- [Admin Panel](./admin/admin-panel-guide.md) - Complete admin interface guide
- [Automation Workflows](./automation/workflows-guide.md) - All automation features
- [Project Structure](./architecture/project-structure.md) - Codebase organization

## 📖 Documentation Guidelines

When adding new documentation:
1. Choose the appropriate category directory
2. Follow the existing naming conventions (kebab-case)
3. Add a brief description to the relevant section README
4. Update cross-references as needed

EOF

# Create section README files
cat > docs/admin/README.md << 'EOF'
# 👨‍💼 Admin Documentation

Administrative guides and workflows for platform management.

## 📋 Contents

- [Admin Panel Guide](./admin-panel-guide.md) - Complete admin interface documentation
- [Verification Workflows](./verification-workflows.md) - Business claim verification process

EOF

cat > docs/automation/README.md << 'EOF'
# 🤖 Automation Documentation

Documentation for all automated systems and AI workflows.

## 📋 Contents

- [Workflows Guide](./workflows-guide.md) - Complete automation workflows
- [AI Systems](./ai-systems.md) - AI/ML system documentation  
- [Integration Status](./integration-status.md) - Current automation implementation status

EOF

cat > docs/development/README.md << 'EOF'
# 🛠️ Developer Documentation

Setup guides and development workflows for contributors.

## 📋 Contents

- [Getting Started](./getting-started.md) - Local development setup
- [Testing Guide](./testing-guide.md) - Testing procedures and guidelines
- [Workflows](./workflows.md) - Development workflow checklists

EOF

cat > docs/architecture/README.md << 'EOF'
# 🏗️ Technical Architecture

Technical architecture documentation and system design.

## 📋 Contents

- [Project Structure](./project-structure.md) - Codebase organization
- [Component System](./component-system.md) - React component architecture
- [Component Patterns](./component-patterns.md) - Component design patterns

EOF

cat > docs/guides/README.md << 'EOF'
# 📖 How-to Guides

Step-by-step guides for specific tasks and configurations.

## 📋 Contents

- [Email Setup](./email-setup.md) - Email service configuration
- [Environment Config](./environment-config.md) - Environment variables setup
- [Migration Guides](./migration-guides.md) - Version migration procedures

EOF

cat > docs/specs/README.md << 'EOF'
# 📋 Specifications

Technical specifications, requirements, and business logic documentation.

## 📋 Contents

- [Business Requirements](./business-requirements.md) - Business logic and requirements
- [MVP Checklist](./mvp-checklist.md) - MVP feature checklist
- [Progress Tracking](./progress-tracking.md) - Development progress tracking

EOF

# Move and reorganize existing files
echo "📦 Moving documentation files to new structure..."

# Admin Documentation
[ -f "ADMIN_PANEL_GUIDE.md" ] && mv ADMIN_PANEL_GUIDE.md docs/admin/admin-panel-guide.md
[ -f "VERIFICATION_TEMPLATE.md" ] && mv VERIFICATION_TEMPLATE.md docs/admin/verification-workflows.md

# Automation Documentation  
[ -f "AUTOMATION_WORKFLOWS_GUIDE.md" ] && mv AUTOMATION_WORKFLOWS_GUIDE.md docs/automation/workflows-guide.md
[ -f "AUTOMATION_FEATURES_COMPLETE.md" ] && mv AUTOMATION_FEATURES_COMPLETE.md docs/automation/integration-status.md
[ -f "AUTOMATION_INTEGRATION.md" ] && mv AUTOMATION_INTEGRATION.md docs/automation/ai-systems.md

# Development Documentation
[ -f "TESTING.md" ] && mv TESTING.md docs/development/testing-guide.md
[ -f "WORKFLOW_CHECKLISTS.md" ] && mv WORKFLOW_CHECKLISTS.md docs/development/workflows.md
[ -f "REORGANIZATION_SUMMARY.md" ] && mv REORGANIZATION_SUMMARY.md docs/development/reorganization-history.md

# Architecture Documentation
[ -f "docs/PROJECT_STRUCTURE.md" ] && mv docs/PROJECT_STRUCTURE.md docs/architecture/project-structure.md
[ -f "docs/REFINED_PROJECT_STRUCTURE.md" ] && mv docs/REFINED_PROJECT_STRUCTURE.md docs/architecture/component-system.md
[ -f "docs/COMPONENT_REORGANIZATION_GUIDE.md" ] && mv docs/COMPONENT_REORGANIZATION_GUIDE.md docs/architecture/component-patterns.md

# Handle duplicates from root
[ -f "PROJECT_STRUCTURE.md" ] && mv PROJECT_STRUCTURE.md docs/architecture/legacy-project-structure.md
[ -f "COMPONENT_REORGANIZATION_GUIDE.md" ] && mv COMPONENT_REORGANIZATION_GUIDE.md docs/architecture/component-migration.md
[ -f "REFINED_PROJECT_STRUCTURE.md" ] && mv REFINED_PROJECT_STRUCTURE.md docs/architecture/current-structure.md

# Guides Documentation  
[ -f "docs/EMAIL_SETUP_GUIDE.md" ] && mv docs/EMAIL_SETUP_GUIDE.md docs/guides/email-setup.md
[ -f "docs/RESEND_CLI_GUIDE.md" ] && mv docs/RESEND_CLI_GUIDE.md docs/guides/resend-configuration.md
[ -f "ENV_CONFIGURATION_REPORT.md" ] && mv ENV_CONFIGURATION_REPORT.md docs/guides/environment-config.md
[ -f "MIGRATION_GUIDE_v2.md" ] && mv MIGRATION_GUIDE_v2.md docs/guides/migration-guides.md

# Handle duplicates from root
[ -f "EMAIL_SETUP_GUIDE.md" ] && mv EMAIL_SETUP_GUIDE.md docs/guides/email-setup-legacy.md
[ -f "RESEND_CLI_GUIDE.md" ] && mv RESEND_CLI_GUIDE.md docs/guides/resend-cli-legacy.md

# Specifications
[ -f "docs/Suburbmates web spec.md" ] && mv "docs/Suburbmates web spec.md" docs/specs/business-requirements.md
[ -f "MVP_MASTER_CHECKLIST.md" ] && mv MVP_MASTER_CHECKLIST.md docs/specs/mvp-checklist.md
[ -f "MVP_PROGRESS_TRACKER.md" ] && mv MVP_PROGRESS_TRACKER.md docs/specs/progress-tracking.md
[ -f "PROFILE_BUILDING_STRATEGY.md" ] && mv PROFILE_BUILDING_STRATEGY.md docs/specs/profile-strategy.md

# Development files
[ -f "ADVANCED_SEARCH_README.md" ] && mv ADVANCED_SEARCH_README.md docs/development/advanced-search.md

# Clean up duplicate files
echo "🧹 Cleaning up duplicate files..."
rm -f docs/ADVANCED_SEARCH_README.md 2>/dev/null || true
rm -f docs/REORGANIZATION_PLAN.md 2>/dev/null || true

# Move any remaining markdown files to appropriate locations
echo "🔄 Processing remaining files..."
for file in *.md; do
    if [ -f "$file" ] && [ "$file" != "README.md" ] && [ "$file" != "WARP.md" ]; then
        echo "📝 Found remaining file: $file"
        case "$file" in
            *TEST*|*test*)
                mv "$file" "docs/development/$(echo $file | tr '[:upper:]' '[:lower:]')"
                ;;
            *ADMIN*|*admin*)
                mv "$file" "docs/admin/$(echo $file | tr '[:upper:]' '[:lower:]')"
                ;;
            *GUIDE*|*guide*|*SETUP*|*setup*)
                mv "$file" "docs/guides/$(echo $file | tr '[:upper:]' '[:lower:]')"
                ;;
            *SPEC*|*spec*|*REQUIREMENT*|*requirement*)
                mv "$file" "docs/specs/$(echo $file | tr '[:upper:]' '[:lower:]')"
                ;;
            *)
                mv "$file" "docs/development/$(echo $file | tr '[:upper:]' '[:lower:]')"
                ;;
        esac
    fi
done

echo ""
echo "✅ Documentation reorganization complete!"
echo ""
echo "📊 Summary:"
echo "├── 📁 Created organized /docs structure"
echo "├── 📚 Added section README files" 
echo "├── 🔄 Moved all documentation files"
echo "└── 🧹 Cleaned up duplicates"
echo ""
echo "📋 Next Steps:"
echo "1. Review the new structure: ls -la docs/"
echo "2. Check docs/README.md for navigation"
echo "3. Update any internal links between documents"
echo "4. Update main README.md to reference new structure"
echo "5. Consider setting up a documentation site (Docusaurus/GitBook)"
echo ""
echo "💾 Backup created in: .backup-docs-$(date +%Y%m%d)-*/"
echo ""
echo "🎉 Your documentation is now organized according to Next.js best practices!"