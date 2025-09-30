# Admin Duplicate Management API

## Overview

The Admin Duplicate Management API provides comprehensive tools for administrators to detect, manage, and resolve duplicate business entries in the SuburbMates platform. This API integrates with the existing service layer architecture to provide automated duplicate detection, manual review capabilities, and bulk management operations.

## Authentication

All endpoints require admin-level authentication. The API validates user permissions using the `isAdmin()` function from `@/server/auth/auth`.

## Endpoints

### 1. List Duplicate Groups

**Endpoint:** `GET /api/admin/duplicates`

Lists all duplicate business groups with filtering, pagination, and statistics.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `strict \| loose` | `strict` | Detection algorithm mode |
| `limit` | `number` | `50` | Maximum results per page |
| `offset` | `number` | `0` | Results offset for pagination |
| `suburb` | `string` | - | Filter by suburb (case-insensitive) |
| `category` | `string` | - | Filter by business category |
| `resolved` | `true \| false` | - | Filter by resolution status |

#### Response

```typescript
{
  success: boolean;
  duplicateGroups: DuplicateGroup[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    totalGroups: number;
    unresolvedGroups: number;
    strictDuplicates: number;
    looseDuplicates: number;
  };
}
```

#### Example

```bash
GET /api/admin/duplicates?mode=strict&limit=10&suburb=melbourne&resolved=false
```

### 2. Detect Duplicates for Specific Business

**Endpoint:** `GET /api/admin/duplicates/detect/{businessId}`

Detects potential duplicates for a specific business with confidence scoring.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `strict \| loose` | `strict` | Detection algorithm mode |
| `includeResolved` | `true \| false` | `false` | Include already resolved duplicates |

#### Response

```typescript
{
  success: boolean;
  business: Business;
  duplicates: Array<Business & {
    analysisResult: {
      confidence: number; // 0-100
      matches: string[]; // Array of matching fields
      duplicateType: 'strict' | 'loose';
      recommendation: 'merge' | 'review' | 'ignore';
    };
  }>;
  summary: {
    totalFound: number;
    highConfidence: number; // confidence >= 80
    mediumConfidence: number; // 50 <= confidence < 80
    lowConfidence: number; // confidence < 50
    recommendMerge: number;
  };
  detectionMode: 'strict' | 'loose';
}
```

#### Confidence Scoring

The API calculates confidence scores based on matching fields:

- **Phone match:** +30 points
- **Website match:** +25 points
- **Email match:** +20 points
- **ABN match:** +35 points
- **Exact name match:** +20 points
- **Suburb match:** +10 points

#### Example

```bash
GET /api/admin/duplicates/detect/cm57a8qzd0000j7uhrhs1k8lm?mode=loose&includeResolved=true
```

### 3. Merge Duplicate Businesses

**Endpoint:** `POST /api/admin/duplicates`

Merges multiple duplicate businesses into a primary business.

#### Request Body

```typescript
{
  primaryBusinessId: string;
  duplicateBusinessIds: string[];
  mergeStrategy: 'keep_primary' | 'merge_data' | 'manual';
  preserveFields?: string[];
  reason?: string;
}
```

#### Merge Strategies

- **`keep_primary`**: Keep all data from primary business (default)
- **`merge_data`**: Merge missing data from duplicates into primary
- **`manual`**: Use `preserveFields` to specify which fields to keep

#### Response

```typescript
{
  success: boolean;
  message: string;
  result: {
    primaryBusinessId: string;
    mergedBusinessIds: string[];
    mergedData: object;
    inquiriesTransferred: number;
    claimsTransferred: number;
  };
}
```

#### Example

```bash
POST /api/admin/duplicates
Content-Type: application/json

{
  "primaryBusinessId": "cm57a8qzd0000j7uhrhs1k8lm",
  "duplicateBusinessIds": ["cm57a8qzd0001j7uhrhs1k8ln", "cm57a8qzd0002j7uhrhs1k8lo"],
  "mergeStrategy": "merge_data",
  "reason": "Verified duplicate entries for same business"
}
```

### 4. Remove Duplicate Marking

**Endpoint:** `DELETE /api/admin/duplicates/unmark/{businessId}`

Removes duplicate marking from a business and restores it to active status.

#### Request Body (Optional)

```typescript
{
  reason?: string;
  restoreApprovalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
}
```

#### Response

```typescript
{
  success: boolean;
  message: string;
  business: Business;
  changes: {
    duplicateOfId: { from: string | null; to: null };
    approvalStatus: { from: string; to: string };
  };
}
```

#### Example

```bash
DELETE /api/admin/duplicates/unmark/cm57a8qzd0003j7uhrhs1k8lp
Content-Type: application/json

{
  "reason": "False positive - businesses are actually different",
  "restoreApprovalStatus": "APPROVED"
}
```

### 5. Bulk Duplicate Operations

**Endpoint:** `POST /api/admin/duplicates/bulk`

Perform bulk operations on multiple businesses simultaneously.

#### Request Body

```typescript
{
  operation: 'merge' | 'unmark' | 'mark_as_duplicate';
  businessIds: string[];
  primaryBusinessId?: string; // Required for merge and mark_as_duplicate
  reason?: string;
  mergeStrategy?: 'keep_primary' | 'merge_data';
  restoreApprovalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
}
```

#### Response

```typescript
{
  success: boolean;
  message: string;
  summary: {
    operation: string;
    total: number;
    successful: number;
    failed: number;
  };
  results: Array<{
    businessId?: string;
    success: boolean;
    error?: string;
    originalState?: object;
    newState?: object;
  }>;
}
```

#### Example

```bash
POST /api/admin/duplicates/bulk
Content-Type: application/json

{
  "operation": "unmark",
  "businessIds": ["cm57a8qzd0003j7uhrhs1k8lp", "cm57a8qzd0004j7uhrhs1k8lq"],
  "reason": "Batch correction of false positives",
  "restoreApprovalStatus": "PENDING"
}
```

## Duplicate Detection Algorithms

### Strict Mode

Strict mode identifies duplicates based on exact matches:

1. **Phone number match** (if both have phone)
2. **Website domain match** (if both have website)
3. **Email match** (if both have email)
4. **ABN match** (if both have ABN)

### Loose Mode

Loose mode includes strict criteria plus:

1. **Name similarity** using Levenshtein distance (≥80% similarity)
2. **Same suburb + similar name** (≥70% similarity)
3. **Partial phone match** (last 8 digits)
4. **Similar email domains**

## Audit Logging

All duplicate management operations are automatically logged using the `AdminBusinessService.logAdminAccess` method:

### Logged Events

- `ADMIN_DUPLICATES_LIST_ACCESS` - Viewing duplicate groups
- `ADMIN_DUPLICATE_DETECTION` - Running duplicate detection
- `ADMIN_MERGE_DUPLICATES` - Merging businesses
- `ADMIN_UNMARK_DUPLICATE` - Removing duplicate marking
- `ADMIN_BULK_DUPLICATE_OPERATION` - Bulk operations
- Error events for failed operations

### Audit Data Captured

- User ID and IP address
- Operation parameters and filters
- Business IDs affected
- Results and statistics
- Failure reasons (if applicable)

## Error Handling

The API implements comprehensive error handling:

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `403` - Forbidden (not admin)
- `404` - Resource not found
- `500` - Internal server error

### Error Response Format

```typescript
{
  error: string;
  message?: string;
  details?: ValidationError[]; // For Zod validation errors
}
```

## Rate Limiting

The duplicate management API inherits rate limiting from the application's general admin API rate limiting configuration. Default limits apply per admin user.

## Security Considerations

1. **Admin Authentication Required** - All endpoints validate admin privileges
2. **Input Validation** - All requests validated using Zod schemas
3. **Audit Trail** - Complete audit logging of all operations
4. **Transaction Safety** - Database operations use transactions where applicable
5. **IP Tracking** - All operations log client IP addresses

## Performance Optimization

### Database Queries

- Efficient pagination with proper indexing
- Selective field loading to minimize data transfer
- Transaction-based bulk operations for consistency

### Caching Considerations

- Results are not cached due to the administrative nature
- Real-time data ensures accuracy for admin operations

## Service Layer Integration

The API integrates with several service layers:

### AdminBusinessService
- Audit logging and admin operations
- Business validation and statistics

### DuplicateDetectionService
- Core duplicate detection algorithms
- Confidence scoring and analysis

### Quality Scoring
- Integrated quality score updates after merge operations
- Automatic recalculation for affected businesses

### Notification System
- Email notifications for significant operations
- Admin alert system integration

## Testing

### Unit Tests
```bash
npm run test:duplicate-api
```

### API Testing
Use the provided test endpoints to validate functionality:

1. **Service Integration Test** - Validates all service imports
2. **Duplicate Detection Test** - Tests core algorithms
3. **Database Statistics** - Validates data consistency

### Manual Testing

1. Use the admin interface to create test duplicates
2. Test various confidence scenarios
3. Validate audit logging in database
4. Test bulk operations with different sizes

## Migration and Deployment

### Database Schema
The API uses existing database schema with no additional migrations required:
- Uses `duplicateOfId` field for marking
- Leverages existing audit log system
- Compatible with current business approval workflow

### Deployment Checklist

- [ ] Admin permissions configured
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Error tracking configured
- [ ] Database indexes optimized
- [ ] Service layer dependencies deployed

## Monitoring

### Key Metrics
- Duplicate detection accuracy
- Merge operation success rate
- Admin operation frequency
- Processing time for bulk operations

### Alerting
- Failed merge operations
- High duplicate detection volume
- Authentication failures
- Database transaction failures

## Future Enhancements

### Planned Features
1. **AI-Powered Detection** - Machine learning duplicate detection
2. **Auto-Merge Rules** - Configurable automatic merging
3. **Business Owner Notifications** - Notify owners of duplicate resolutions
4. **Duplicate Prevention** - Real-time detection during business registration
5. **Advanced Analytics** - Duplicate trend analysis and reporting

### API Versioning
Current version: v1
Future versions will maintain backward compatibility with appropriate deprecation notices.