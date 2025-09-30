import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RollbackResult {
  success: boolean;
  operationId: string;
  snapshotId: string;
  rollbackCount: number;
  successCount: number;
  failedCount: number;
  results: {
    businessId: string;
    businessName: string;
    status: 'SUCCESS' | 'FAILED';
    message: string;
    previousState?: any;
    restoredState?: any;
  }[];
  errors: string[];
  warnings: string[];
  rollbackTimestamp: string;
}

// Mock snapshot storage - in production this would be a database table
const mockSnapshots: Record<string, {
  id: string;
  timestamp: string;
  businessIds: string[];
  businessStates: any[];
  operationId: string;
  metadata: Record<string, any>;
}> = {
  'snap_1705000000': {
    id: 'snap_1705000000',
    timestamp: '2024-01-10T10:00:00Z',
    businessIds: ['business_1', 'business_2', 'business_3'],
    businessStates: [
      {
        id: 'business_1',
        name: 'Test Business 1',
        approval_status: 'PENDING',
        quality_score: 85,
        approved_at: null,
        approved_by: null,
        approval_reason: null
      },
      {
        id: 'business_2',
        name: 'Test Business 2',
        approval_status: 'PENDING',
        quality_score: 92,
        approved_at: null,
        approved_by: null,
        approval_reason: null
      },
      {
        id: 'business_3',
        name: 'Test Business 3',
        approval_status: 'PENDING',
        quality_score: 78,
        approved_at: null,
        approved_by: null,
        approval_reason: null
      }
    ],
    operationId: '1',
    metadata: {
      operation_type: 'bulk_approval',
      business_count: 3
    }
  },
  'snap_1704890000': {
    id: 'snap_1704890000',
    timestamp: '2024-01-09T14:00:00Z',
    businessIds: ['business_4', 'business_5'],
    businessStates: [
      {
        id: 'business_4',
        name: 'CSV Import Business 1',
        approval_status: 'PENDING',
        quality_score: 65,
        source: 'CSV_IMPORT',
        approved_at: null,
        approved_by: null,
        approval_reason: null
      },
      {
        id: 'business_5',
        name: 'CSV Import Business 2',
        approval_status: 'PENDING',
        quality_score: 71,
        source: 'CSV_IMPORT',
        approved_at: null,
        approved_by: null,
        approval_reason: null
      }
    ],
    operationId: '2',
    metadata: {
      operation_type: 'bulk_staged_approval',
      business_count: 2
    }
  }
};

// Mock bulk operations to check rollback availability
const mockBulkOperations: Record<string, {
  id: string;
  rollbackInfo: {
    available: boolean;
    snapshotId?: string;
    rollbackSteps: string[];
    originalState: Record<string, any>;
  };
}> = {
  '1': {
    id: '1',
    rollbackInfo: {
      available: true,
      snapshotId: 'snap_1705000000',
      rollbackSteps: ['Revert approval status', 'Restore original timestamps', 'Remove audit entries'],
      originalState: {}
    }
  },
  '2': {
    id: '2',
    rollbackInfo: {
      available: true,
      snapshotId: 'snap_1704890000',
      rollbackSteps: ['Revert processed approvals', 'Reset workflow states', 'Restore audit trail'],
      originalState: {}
    }
  }
};

async function validateRollbackPermissions(operationId: string, userId: string): Promise<{ allowed: boolean; reason?: string }> {
  // In production, check if user has permissions to rollback this operation
  // Check if operation belongs to user or user has admin rights
  // Check if operation is within rollback time window
  
  const operation = mockBulkOperations[operationId];
  if (!operation) {
    return { allowed: false, reason: 'Operation not found' };
  }

  if (!operation.rollbackInfo.available) {
    return { allowed: false, reason: 'Rollback not available for this operation' };
  }

  // Check time window - typically 24-48 hours
  const snapshot = mockSnapshots[operation.rollbackInfo.snapshotId!];
  if (snapshot) {
    const snapshotTime = new Date(snapshot.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - snapshotTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      return { allowed: false, reason: 'Rollback time window has expired (48 hours)' };
    }
  }

  return { allowed: true };
}

async function executeRollback(
  snapshotId: string,
  operationId: string,
  userId: string
): Promise<RollbackResult> {
  const snapshot = mockSnapshots[snapshotId];
  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  const results: RollbackResult['results'] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let successCount = 0;
  let failedCount = 0;

  // Process each business in the snapshot
  for (const originalState of snapshot.businessStates) {
    try {
      // Get current state for comparison
      const { data: currentBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', originalState.id)
        .single();

      if (fetchError) {
        console.error(`Error fetching current state for business ${originalState.id}:`, fetchError);
        results.push({
          businessId: originalState.id,
          businessName: originalState.name,
          status: 'FAILED',
          message: `Failed to fetch current state: ${fetchError.message}`
        });
        failedCount++;
        errors.push(`Failed to fetch current state for ${originalState.name}: ${fetchError.message}`);
        continue;
      }

      // Prepare rollback fields - restore original state
      const rollbackFields: any = {
        approval_status: originalState.approval_status,
        updated_at: new Date().toISOString(),
        // Clear approval-related fields if they were set
        approved_at: originalState.approved_at,
        approved_by: originalState.approved_by,
        approval_reason: originalState.approval_reason,
        rejected_at: originalState.rejected_at,
        rejected_by: originalState.rejected_by,
        rejection_reason: originalState.rejection_reason,
        rejection_category: originalState.rejection_category,
        appeal_allowed: originalState.appeal_allowed,
        // Restore other fields that might have been changed
        quality_score: originalState.quality_score,
        effective_date: originalState.effective_date
      };

      // Remove null/undefined fields
      Object.keys(rollbackFields).forEach(key => {
        if (rollbackFields[key] === undefined) {
          delete rollbackFields[key];
        }
      });

      // Execute rollback update
      const { data: updatedBusiness, error: updateError } = await supabase
        .from('businesses')
        .update(rollbackFields)
        .eq('id', originalState.id)
        .select('id, name, approval_status')
        .single();

      if (updateError) {
        console.error(`Error rolling back business ${originalState.id}:`, updateError);
        results.push({
          businessId: originalState.id,
          businessName: originalState.name,
          status: 'FAILED',
          message: `Database rollback failed: ${updateError.message}`,
          previousState: { approval_status: currentBusiness.approval_status },
          restoredState: { approval_status: originalState.approval_status }
        });
        failedCount++;
        errors.push(`Database rollback failed for ${originalState.name}: ${updateError.message}`);
        continue;
      }

      // Success
      results.push({
        businessId: originalState.id,
        businessName: originalState.name,
        status: 'SUCCESS',
        message: 'Successfully rolled back to previous state',
        previousState: { approval_status: currentBusiness.approval_status },
        restoredState: { approval_status: updatedBusiness?.approval_status || originalState.approval_status }
      });
      successCount++;

      // Create audit log for rollback
      try {
        await supabase.from('audit_logs').insert({
          table_name: 'businesses',
          record_id: originalState.id,
          action: 'BULK_ROLLBACK',
          changes: rollbackFields,
          user_id: userId,
          metadata: {
            business_name: originalState.name,
            rollback_operation: true,
            original_operation_id: operationId,
            snapshot_id: snapshotId,
            rollback_timestamp: new Date().toISOString(),
            previous_status: currentBusiness.approval_status,
            restored_status: originalState.approval_status
          }
        });
      } catch (auditError) {
        console.error(`Error creating rollback audit log for ${originalState.id}:`, auditError);
        warnings.push(`Rollback succeeded but audit log failed for ${originalState.name}`);
      }

    } catch (error) {
      console.error(`Unexpected error rolling back business ${originalState.id}:`, error);
      results.push({
        businessId: originalState.id,
        businessName: originalState.name,
        status: 'FAILED',
        message: `Unexpected error during rollback: ${error}`,
        previousState: {},
        restoredState: { approval_status: originalState.approval_status }
      });
      failedCount++;
      errors.push(`Unexpected error for ${originalState.name}: ${error}`);
    }
  }

  // Update operation rollback status
  if (mockBulkOperations[operationId]) {
    mockBulkOperations[operationId].rollbackInfo.available = false;
  }

  return {
    success: failedCount === 0,
    operationId,
    snapshotId,
    rollbackCount: snapshot.businessStates.length,
    successCount,
    failedCount,
    results,
    errors,
    warnings,
    rollbackTimestamp: new Date().toISOString()
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { operationId: string } }
) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const operationId = params.operationId;
    if (!operationId) {
      return NextResponse.json({ error: 'Operation ID is required' }, { status: 400 });
    }

    const currentUser = 'current_user@suburbmates.com'; // Would extract from auth token

    // Validate rollback permissions
    const permissionCheck = await validateRollbackPermissions(operationId, currentUser);
    if (!permissionCheck.allowed) {
      return NextResponse.json({ 
        error: 'Rollback not allowed', 
        reason: permissionCheck.reason 
      }, { status: 403 });
    }

    // Get operation details
    const operation = mockBulkOperations[operationId];
    if (!operation || !operation.rollbackInfo.snapshotId) {
      return NextResponse.json({ error: 'Operation or snapshot not found' }, { status: 404 });
    }

    // Parse request body for additional options
    const body = await request.json().catch(() => ({}));
    const { 
      reason = 'Rollback requested by user',
      notifyAffected = false,
      confirmationToken
    } = body;

    // In production, you might require a confirmation token for safety
    // if (confirmationToken !== expectedToken) {
    //   return NextResponse.json({ error: 'Invalid confirmation token' }, { status: 400 });
    // }

    console.log(`Starting rollback for operation ${operationId} with snapshot ${operation.rollbackInfo.snapshotId}`);

    // Execute the rollback
    const rollbackResult = await executeRollback(
      operation.rollbackInfo.snapshotId,
      operationId,
      currentUser
    );

    // Log the rollback operation
    try {
      await supabase.from('audit_logs').insert({
        table_name: 'bulk_operations',
        record_id: operationId,
        action: 'OPERATION_ROLLBACK',
        changes: { status: 'ROLLED_BACK' },
        user_id: currentUser,
        metadata: {
          rollback_reason: reason,
          snapshot_id: operation.rollbackInfo.snapshotId,
          rollback_count: rollbackResult.rollbackCount,
          success_count: rollbackResult.successCount,
          failed_count: rollbackResult.failedCount,
          rollback_timestamp: rollbackResult.rollbackTimestamp
        }
      });
    } catch (auditError) {
      console.error('Error logging rollback operation:', auditError);
      rollbackResult.warnings.push('Rollback completed but operation audit log failed');
    }

    // Add success message
    if (rollbackResult.success) {
      console.log(`Rollback completed successfully for operation ${operationId}: ${rollbackResult.successCount} businesses restored`);
    } else {
      console.log(`Rollback completed with errors for operation ${operationId}: ${rollbackResult.successCount} successful, ${rollbackResult.failedCount} failed`);
    }

    return NextResponse.json(rollbackResult);

  } catch (error) {
    console.error('Error executing rollback:', error);
    return NextResponse.json({ 
      error: 'Internal server error during rollback',
      details: String(error)
    }, { status: 500 });
  }
}

// GET endpoint to check rollback status/availability
export async function GET(
  request: NextRequest,
  { params }: { params: { operationId: string } }
) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const operationId = params.operationId;
    if (!operationId) {
      return NextResponse.json({ error: 'Operation ID is required' }, { status: 400 });
    }

    const currentUser = 'current_user@suburbmates.com'; // Would extract from auth token

    // Get operation details
    const operation = mockBulkOperations[operationId];
    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    // Validate rollback permissions
    const permissionCheck = await validateRollbackPermissions(operationId, currentUser);
    
    const rollbackInfo = {
      operationId,
      rollbackAvailable: permissionCheck.allowed,
      reason: permissionCheck.reason,
      snapshotId: operation.rollbackInfo.snapshotId,
      rollbackSteps: operation.rollbackInfo.rollbackSteps,
      snapshotDetails: operation.rollbackInfo.snapshotId ? mockSnapshots[operation.rollbackInfo.snapshotId] : null
    };

    return NextResponse.json(rollbackInfo);

  } catch (error) {
    console.error('Error checking rollback status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}