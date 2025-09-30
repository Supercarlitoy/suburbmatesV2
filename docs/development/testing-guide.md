# SuburbMates Testing Strategy

This document outlines the comprehensive testing strategy for the SuburbMates platform, a Melbourne-focused business community platform.

## Overview

The testing infrastructure includes **250 comprehensive E2E tests** across **7 test files** covering all critical platform functionality, from basic page loads to complex business workflows.

## Test Structure

### 🏥 Smoke Tests (`smoke-test-suite.spec.ts`)
**Comprehensive platform health monitoring**
- **Platform Health Check**: Verifies core pages load correctly 
- **Authentication System**: Tests login/signup functionality
- **Business Profile System**: Validates creation and claim workflows
- **Admin System**: Ensures access control is working
- **API Health**: Monitors core API endpoints
- **Email System**: Verifies email configuration
- **Melbourne Features**: Tests location-specific functionality
- **Performance**: Monitors page load times

### 🏢 Business Workflows (`business-workflows.spec.ts`)
**End-to-end business profile testing**

#### Workflow 1: Create New Business Profile
- Business registration form validation
- Profile creation process
- Form interaction and validation

#### Workflow 2: Claim Existing Business Profile  
- Business search and discovery
- Claim submission process
- Verification workflows

#### Profile Display & Sharing
- SuburbMates branding verification
- Profile sharing functionality
- OpenGraph metadata testing

### 👨‍💼 Admin Panel (`admin-panel.spec.ts`)
**Administrative functionality testing**
- **Authentication**: Admin access control and role validation
- **Dashboard**: Admin interface components
- **Claims Management**: Claims queue and approval workflows
- **AI Management**: Automation settings and thresholds
- **Business Listings**: Business management interface

### 🔌 API Endpoints (`api-endpoints.spec.ts`)
**Backend service testing**

#### Business Operations API
- Business search functionality
- Profile retrieval and creation
- Data validation

#### Claims API
- Claim submission and processing
- Admin claims management
- Status update workflows

#### Inquiry API
- Customer inquiry submission
- Data validation and processing

#### Health & Status APIs
- Service health monitoring
- Database connectivity
- System status checks

#### Authentication APIs
- Session management
- Provider configuration

### 📧 Email Functionality (`email-functionality.spec.ts`)
**Email system comprehensive testing**

#### Email Configuration
- Service configuration validation
- Health endpoint monitoring

#### Welcome Email Workflow
- Registration email triggering
- Email confirmation process
- Resend functionality

#### Claim Notification Emails
- Claim submission notifications
- Email template validation
- Admin notifications

#### Business Inquiry Emails
- Customer inquiry notifications
- Email delivery testing

#### Admin Email Notifications
- Administrative alert system
- Email queue management

### 🔐 Authentication Diagnosis (`auth-diagnosis.spec.ts`)
**Authentication system deep dive**
- Login page functionality
- Signup page validation
- NextAuth API endpoints
- Database connectivity testing

### 🗺️ Link Discovery (`discover-only.spec.ts`)
**Site-wide link validation**
- Internal link discovery
- Broken link detection
- Site map generation
- SEO validation

## Running Tests

### Quick Health Check
```bash
# Run the comprehensive smoke test suite
npx playwright test smoke-test-suite.spec.ts
```

### Full Test Suite
```bash
# Run all tests across all browsers
npx playwright test

# Run specific test category
npx playwright test business-workflows.spec.ts
npx playwright test admin-panel.spec.ts
npx playwright test api-endpoints.spec.ts
```

### Development Testing
```bash
# Run tests in headed mode for development
npx playwright test --headed

# Run tests with debug output
npx playwright test --debug
```

### CI/CD Testing
```bash
# Run tests in CI mode (with retries and artifacts)
npx playwright test --reporter=html
```

## Test Configuration

### Browser Coverage
Tests run across **5 different browsers/devices**:
- **Desktop Chrome** (Chromium)
- **Desktop Firefox** 
- **Desktop Safari** (WebKit)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 14 Pro)

### Test Environment
- **Base URL**: Configurable via `PLAYWRIGHT_BASE_URL`
- **Local Development**: Auto-starts dev server on `localhost:3000`
- **Production Testing**: Points to deployed application
- **Parallel Execution**: Full parallel support for CI/CD

### Artifact Collection
- **Screenshots**: On test failure
- **Videos**: Disabled by default (configurable)
- **Traces**: Retained on failure for debugging
- **HTML Reports**: Generated for CI/CD

## CI/CD Integration

### GitHub Actions
The platform includes automated testing in CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
- name: Run Playwright tests
  run: npx playwright test
  env:
    CI: true
- name: Upload test artifacts
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Execution Strategy
1. **Build Verification**: Ensures application builds successfully
2. **Test Execution**: Runs comprehensive test suite
3. **Artifact Collection**: Collects failure reports and screenshots
4. **Status Reporting**: Provides detailed test results

## Melbourne-Specific Testing

The test suite includes specialized testing for Melbourne business features:

### Location-Based Functionality
- Melbourne suburb search and filtering
- Business category validation
- Service area mapping

### Local Business Features
- Australian business classification testing
- Melbourne metropolitan area focus
- Suburb-specific search validation

## Monitoring and Alerting

### Health Checks
- **Platform Health**: Core page availability
- **API Health**: Service endpoint monitoring  
- **Email Health**: Communication system status
- **Database Health**: Data layer connectivity

### Performance Monitoring
- **Page Load Times**: Performance regression detection
- **API Response Times**: Service performance tracking
- **Error Rate Monitoring**: System stability metrics

## Test Data Strategy

### Safe Testing Approach
- **No Real Data Creation**: Tests avoid creating production data
- **Mock Interactions**: Form validation without submission
- **Test-Specific Routes**: Using test business IDs and paths
- **Error Condition Testing**: Validates error handling

### Test Business Data
- Test business IDs: `test-business-123`, `test-business-456`
- Test claim routes: `/claim/test-business-*`
- Test profile routes: `/business/test-*`

## Debugging and Development

### Test Development Workflow
1. **Write Test**: Create new test in appropriate file
2. **Run Locally**: Test with `npx playwright test --headed`
3. **Debug Issues**: Use `--debug` flag for step-by-step execution
4. **Validate CI**: Ensure tests pass in GitHub Actions

### Common Debugging Techniques
- **Console Logging**: All tests include descriptive console output
- **Element Inspection**: Tests verify UI elements are present
- **Network Monitoring**: API tests validate request/response cycles
- **Error Handling**: Graceful failure with informative messages

## Test Maintenance

### Regular Maintenance Tasks
- **Update Test Data**: Refresh test business IDs as needed
- **Browser Updates**: Keep Playwright browsers current
- **Flaky Test Management**: Monitor and fix unstable tests
- **Performance Baselines**: Update performance expectations

### Test Coverage Goals
- **✅ 100% Critical Path Coverage**: All essential user journeys tested
- **✅ Cross-Browser Compatibility**: All major browsers and devices
- **✅ API Contract Testing**: All public APIs validated  
- **✅ Error Condition Testing**: Failure scenarios covered

## Getting Started

### Prerequisites
```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps
```

### First Test Run
```bash
# Quick smoke test
npx playwright test smoke-test-suite.spec.ts --headed

# View test results
npx playwright show-report
```

### Development Setup
```bash
# Start development server
npm run dev

# In another terminal, run tests
npx playwright test
```

This comprehensive testing strategy ensures the SuburbMates platform maintains high quality, reliability, and performance across all user interactions and business workflows.

<citations>
<document>
    <document_type>RULE</document_type>
    <document_id>/Users/carlg/Documents/PROJECTS/suburbmates/WARP.md</document_id>
</document>
</citations>