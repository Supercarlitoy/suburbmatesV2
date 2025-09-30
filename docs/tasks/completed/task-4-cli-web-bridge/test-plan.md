# Task #4: CLI-to-Web Bridge Testing Plan

**Status:** Implementation Complete - Ready for User Testing  
**Test Environment:** `/admin/cli` page  
**Prerequisites:** Admin user login required

---

## 🧪 Pre-deployment Testing Checklist

### 1. Service Availability Tests

#### ✅ API Endpoints Status
```bash
# Test CLI bridge job creation endpoint
curl -X GET https://your-domain.com/api/admin/cli-bridge/jobs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected: 200 OK with jobs list and stats
```

#### ✅ Database Schema Verification
```sql
-- Verify CLIJob table exists with correct structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'CLIJob';

-- Expected columns: id, command, args, status, progress, result, etc.
```

---

## 🖥️ Web Interface Testing

### Access the Admin CLI Interface
1. **Navigate to:** `https://your-domain.com/admin/cli`
2. **Login:** Admin user credentials required
3. **Verify:** Two-tab interface (Advanced Dashboard + Quick Operations)

### Tab 1: Advanced Dashboard Testing

#### Job Monitoring Verification
- [ ] **Jobs List Display:** Recent jobs show with status, command, creator
- [ ] **Real-time Updates:** Status changes reflect automatically
- [ ] **Filtering Options:** Status, command, creator, date range filters work
- [ ] **Pagination:** Large job lists paginate correctly
- [ ] **Job Details:** Click on job shows full details including results

#### Performance Metrics Verification
- [ ] **Command Frequency Chart:** Bar chart shows command usage distribution
- [ ] **Success Rate Metrics:** Shows percentage success by command
- [ ] **Hourly Distribution:** Activity patterns display correctly
- [ ] **Daily Trends:** Week-over-week trend analysis works

#### Job Stream Monitoring
- [ ] **Real-time Progress:** Live progress updates via SSE
- [ ] **Status Changes:** PENDING → RUNNING → COMPLETED flow
- [ ] **Error Display:** Failed jobs show error details clearly
- [ ] **Cancellation:** Cancel button works for running jobs

### Tab 2: Quick Operations Testing

#### CLI Command Forms
Test each CLI command through the web interface:

### 2. List Businesses Testing
- [ ] **Form Submission:** Select filters (status, suburb, category, limit)
- [ ] **Job Creation:** Creates CLIJob with PENDING status
- [ ] **Real-time Progress:** Shows progress from 0% to 100%
- [ ] **Results Display:** Shows business list with applied filters
- [ ] **Error Handling:** Invalid filters show appropriate errors

### 3. Import CSV Testing
- [ ] **CSV Data Input:** Paste or input CSV business data
- [ ] **Validation Options:** Toggle skipDuplicates and validateData
- [ ] **Progress Tracking:** Shows row-by-row processing progress
- [ ] **Results Summary:** Displays imported/duplicate/error counts
- [ ] **Database Verification:** Confirm businesses created in database

### 4. Export CSV Testing
- [ ] **Filter Selection:** Choose export filters (status, category, etc.)
- [ ] **Field Selection:** Select specific fields to export
- [ ] **Format Options:** Test both CSV and JSON formats
- [ ] **Download Preparation:** Export data prepared for download
- [ ] **Large Dataset:** Test with substantial record count

### 5. Business Approval Testing
- [ ] **Business ID Input:** Enter valid business ID
- [ ] **Reason Optional:** Test with and without approval reason
- [ ] **Status Update:** Verify business approvalStatus changes to APPROVED
- [ ] **Audit Logging:** Confirm audit event created
- [ ] **Error Cases:** Test with invalid business ID

### 6. Business Rejection Testing
- [ ] **Business ID Input:** Enter valid business ID
- [ ] **Reason Required:** Verify rejection reason is mandatory
- [ ] **Status Update:** Verify business approvalStatus changes to REJECTED
- [ ] **Audit Logging:** Confirm audit event with reason
- [ ] **Validation:** Test rejection without reason (should fail)

### 7. Statistics Testing
- [ ] **Stats Generation:** Request directory statistics
- [ ] **Breakdown Display:** Shows approval status, ABN status, source distribution
- [ ] **Quality Metrics:** Displays average, min, max quality scores
- [ ] **Visual Format:** Results clearly formatted and readable
- [ ] **Performance:** Large dataset statistics complete reasonably fast

### 8. List Suburbs Testing
- [ ] **Suburb Retrieval:** Fetches all unique suburbs
- [ ] **Sorting:** Suburbs appear alphabetically ordered
- [ ] **Count Accuracy:** Displayed count matches actual suburbs
- [ ] **Database Query:** Efficient distinct query execution
- [ ] **Display Limit:** Large suburb lists handled appropriately

### 9. List Categories Testing
- [ ] **Category Retrieval:** Fetches all unique categories
- [ ] **Sorting:** Categories appear alphabetically ordered  
- [ ] **Count Accuracy:** Displayed count matches actual categories
- [ ] **Database Query:** Efficient distinct query execution
- [ ] **Display Limit:** Large category lists handled appropriately

### 10. Batch Operations Testing

#### Batch Approve Testing
- [ ] **Multiple IDs:** Enter array of business IDs
- [ ] **Reason Optional:** Test with and without batch reason
- [ ] **Progress Tracking:** Shows "X of Y approved" progress
- [ ] **Partial Failures:** Handles some successes, some failures gracefully
- [ ] **Final Results:** Summary of approved/failed counts

#### Batch Reject Testing
- [ ] **Multiple IDs:** Enter array of business IDs
- [ ] **Reason Required:** Verify rejection reason mandatory for batch
- [ ] **Progress Tracking:** Shows "X of Y rejected" progress
- [ ] **Partial Failures:** Handles some successes, some failures gracefully
- [ ] **Final Results:** Summary of rejected/failed counts

### 11. Advanced Operations Testing

#### Quality Recalculation Testing
- [ ] **Full Dataset:** Process all businesses for quality score updates
- [ ] **Progress Tracking:** Shows businesses processed count
- [ ] **Score Updates:** Verify quality scores actually updated in database
- [ ] **Performance:** Large dataset processing completes without timeout
- [ ] **Error Recovery:** Handles individual business processing failures

#### Duplicate Detection Testing
- [ ] **Analysis Execution:** Processes all businesses for duplicates
- [ ] **Progress Tracking:** Shows analysis progress through dataset
- [ ] **Results Display:** Shows potential duplicates with reasons
- [ ] **Duplicate Types:** Identifies both strict and loose duplicates
- [ ] **Result Limiting:** Large duplicate sets handled (100 result limit)

---

## 🔄 Job Management Testing

### Job Lifecycle Testing
- [ ] **Job Creation:** New jobs appear with PENDING status
- [ ] **Status Transitions:** PENDING → RUNNING → COMPLETED flow works
- [ ] **Progress Updates:** Real-time progress percentage increases
- [ ] **Completion:** Jobs finish with success/failure status
- [ ] **Result Storage:** Job results stored and displayable

### Job Control Testing
- [ ] **Job Cancellation:** Cancel running jobs successfully
- [ ] **Job Retry:** Retry failed jobs creates new job
- [ ] **Job History:** All jobs maintained in searchable history
- [ ] **Concurrent Limits:** 3-job limit per user enforced
- [ ] **Queue Management:** Jobs process in appropriate order

---

## 🚨 Error Handling Testing

### Input Validation Testing
- [ ] **Invalid Business IDs:** Non-existent IDs show clear errors
- [ ] **Malformed CSV:** Invalid CSV data handled gracefully
- [ ] **Missing Required Fields:** Required fields validation works
- [ ] **Authentication Failures:** Non-admin users get access denied
- [ ] **Network Errors:** Network failures show user-friendly messages

### System Error Testing
- [ ] **Database Unavailable:** Database connection errors handled
- [ ] **Large Dataset Timeouts:** Long operations don't crash system
- [ ] **Memory Constraints:** Large imports handled within limits
- [ ] **Concurrent Operations:** Multiple simultaneous jobs handled
- [ ] **Malformed Requests:** Invalid API requests return proper errors

---

## 📊 Performance Testing

### Load Testing
- [ ] **Multiple Jobs:** Submit multiple jobs simultaneously
- [ ] **Large Datasets:** Test with significant data volumes
- [ ] **Concurrent Users:** Multiple admin users operating simultaneously
- [ ] **Memory Usage:** Monitor memory consumption during operations
- [ ] **Response Times:** Operations complete within acceptable timeframes

### Stress Testing
- [ ] **Maximum Concurrent Jobs:** Test 3-job limit per user
- [ ] **Large Import/Export:** Test with maximum dataset sizes
- [ ] **Extended Operation Time:** Long-running jobs complete successfully
- [ ] **Resource Recovery:** System recovers after high-load periods
- [ ] **Error Rate Monitoring:** Failure rates remain acceptable under load

---

## 🔍 Browser Compatibility Testing

### Desktop Testing
- [ ] **Chrome:** Full functionality in latest Chrome
- [ ] **Safari:** Full functionality in latest Safari  
- [ ] **Firefox:** Full functionality in latest Firefox
- [ ] **Edge:** Full functionality in latest Edge

### Mobile Testing
- [ ] **iOS Safari:** Admin interface usable on iPhone/iPad
- [ ] **Android Chrome:** Admin interface usable on Android devices
- [ ] **Responsive Design:** Layout adapts to different screen sizes
- [ ] **Touch Interface:** Touch controls work properly

---

## 🏁 Production Deployment Testing

### Pre-deployment Checklist
- [ ] **Database Migrations:** All migrations run successfully
- [ ] **Environment Variables:** All required env vars configured
- [ ] **Service Dependencies:** Supabase, Prisma connections verified
- [ ] **API Authentication:** Admin JWT validation working
- [ ] **Error Monitoring:** Sentry/logging configured for production

### Post-deployment Verification
- [ ] **Health Checks:** All endpoints return healthy status
- [ ] **Admin Access:** Admin users can access CLI interface
- [ ] **Job Execution:** Sample jobs execute successfully
- [ ] **Real-time Updates:** SSE streaming works in production
- [ ] **Audit Logging:** All actions logged to audit system

---

## 📋 User Acceptance Testing

### Admin User Workflow Testing
1. **Daily Operations:** Admin can perform typical daily tasks
2. **Bulk Operations:** Batch processing works for large datasets
3. **Error Recovery:** Failed operations can be retried/resolved
4. **Monitoring:** Job progress and history accessible
5. **Performance:** Operations complete in reasonable timeframes

### Training Verification
- [ ] **Interface Intuitive:** Admin users understand interface without extensive training
- [ ] **Error Messages Clear:** Error messages guide users to resolution
- [ ] **Help Documentation:** Built-in help or documentation available
- [ ] **Workflow Efficiency:** Web interface more efficient than CLI
- [ ] **Feature Discovery:** Users can discover and use advanced features

---

## ✅ Test Completion Criteria

### Implementation Testing: ✅ COMPLETE
- [x] **CLI Service Integration:** Real CLI execution service implemented
- [x] **API Endpoints:** All CLI bridge endpoints functional  
- [x] **Database Schema:** CLIJob model and relationships working
- [x] **Progress Tracking:** Real-time SSE streaming implemented
- [x] **Job Management:** Full lifecycle management working

### User Acceptance Testing: 🔄 PENDING USER VALIDATION
- [ ] **Admin User Testing:** Requires actual admin users to test workflows
- [ ] **Performance Validation:** Needs real-world data volume testing
- [ ] **Browser Compatibility:** Requires testing across different browsers/devices
- [ ] **Security Validation:** Penetration testing and security audit
- [ ] **Load Testing:** Production-scale performance verification

---

## 🎯 Testing Recommendations

### Immediate Testing (Day 1)
1. **Basic Functionality:** Test all 12 CLI commands through web interface
2. **Job Management:** Verify job creation, progress, completion flow
3. **Error Handling:** Test common error scenarios and recovery

### Extended Testing (Week 1)
1. **Performance Testing:** Large datasets and concurrent operations
2. **Browser Compatibility:** Test across different browsers and devices
3. **User Acceptance:** Admin users test typical workflows

### Ongoing Testing (Production)
1. **Monitoring:** Set up alerts for job failures and performance issues
2. **User Feedback:** Collect admin user feedback on interface improvements
3. **Performance Metrics:** Monitor and optimize based on actual usage patterns

---

**Testing Status:** Implementation Complete - Ready for User Testing  
**Next Step:** Deploy to staging and conduct user acceptance testing  
**Contact:** Assistant (CLI Integration Specialist) for implementation questions