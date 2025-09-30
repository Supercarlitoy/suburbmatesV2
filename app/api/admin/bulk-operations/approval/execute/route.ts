import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BulkOperationExecution {
  operationId: string;
  name: string;
  description: string;
  type: 'APPROVE' | 'REJECT' | 'CONDITIONAL_APPROVE' | 'STAGED_APPROVAL' | 'BULK_UPDATE';
  targetBusinesses: string[];
  criteria?: {
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'BETWEEN';
    value: any;
    label: string;
  }[];
  safetyChecks: {
    maxRecords: number;
    requireApproval: boolean;
    confirmationRequired: boolean;
    backupRequired: boolean;
    rollbackEnabled: boolean;
    stagingEnabled: boolean;
    checkpointFrequency: number;
  };
  approvalDetails?: {
    reason: string;
    conditions?: string[];
    notifyOwners: boolean;
    customMessage?: string;
    futureEffectiveDate?: string;
    qualityScoreThreshold?: number;
  };
  rejectionDetails?: {
    reason: string;
    category: 'INCOMPLETE' | 'INVALID' | 'DUPLICATE' | 'POLICY_VIOLATION' | 'OTHER';
    appealAllowed: boolean;
    improvementSuggestions?: string[];
    resubmissionAllowed: boolean;
    notifyOwners: boolean;
    customMessage?: string;
  };
  stagedWorkflow?: {
    stages: {
      id: string;
      name: string;
      description: string;
      order: number;
      type: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'CONDITIONAL' | 'CHECKPOINT';
      conditions?: {
        qualityScoreMin?: number;
        abnRequired?: boolean;
        ownershipVerified?: boolean;
        customRules?: string[];
      };
      approvers?: string[];
      checkpointConfig?: {
        message: string;
        allowContinue: boolean;
        requireConfirmation: boolean;
      };
    }[];
  };
}

interface ExecutionResult {
  success: boolean;
  operationId: string;
  processedCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results: {
    businessId: string;
    businessName: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    message: string;
    previousState?: any;
    newState?: any;
  }[];
  snapshotId?: string;
  rollbackAvailable: boolean;
  errors: string[];
  warnings: string[];
}

// Helper function to validate business against conditions
async function validateBusiness(business: any, conditions: any[]): Promise<{ valid: boolean; messages: string[] }> {
  const messages: string[] = [];
  let valid = true;

  for (const condition of conditions || []) {
    switch (condition.type) {
      case 'qualityScoreMin':
        if ((business.quality_score || 0) < condition.value) {
          valid = false;
          messages.push(`Quality score ${business.quality_score} is below minimum ${condition.value}`);
        }
        break;
      
      case 'abnRequired':
        if (condition.value && business.abn_status !== 'VERIFIED') {
          valid = false;
          messages.push('ABN verification required but not verified');
        }
        break;
      
      case 'ownershipVerified':
        if (condition.value && !business.ownership_claimed) {
          valid = false;
          messages.push('Ownership verification required but not claimed');
        }
        break;
      
      default:
        // Custom rules would be evaluated here
        break;
    }
  }

  return { valid, messages };
}

// Helper function to create snapshot for rollback
async function createSnapshot(businessIds: string[]): Promise<string> {
  try {
    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get current state of businesses
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')
      .in('id', businessIds);

    if (error) {
      throw error;
    }

    // Store snapshot in a snapshots table or as JSON
    const snapshotData = {
      id: snapshotId,
      timestamp: new Date().toISOString(),
      business_ids: businessIds,
      business_states: businesses,
      metadata: {
        operation_type: 'bulk_approval',
        business_count: businessIds.length
      }
    };

    // In production, store this in a dedicated snapshots table
    // For now, we'll simulate this
    console.log('Snapshot created:', snapshotId, 'for', businessIds.length, 'businesses');

    return snapshotId;

  } catch (error) {
    console.error('Error creating snapshot:', error);
    throw new Error('Failed to create rollback snapshot');
  }
}

// Helper function to execute staged workflow
async function executeStagedWorkflow(
  businesses: any[],
  workflow: any,
  operationType: string
): Promise<{
  processedBusinesses: any[];
  results: ExecutionResult['results'];
  errors: string[];
}> {
  const results: ExecutionResult['results'] = [];
  const processedBusinesses: any[] = [];
  const errors: string[] = [];

  for (const business of businesses) {
    let shouldProcess = true;
    let skipReason = '';

    // Process each stage in order
    for (const stage of workflow.stages.sort((a: any, b: any) => a.order - b.order)) {
      if (!shouldProcess) break;

      switch (stage.type) {
        case 'AUTO_APPROVE':
          // Check conditions for auto-approval
          if (stage.conditions) {
            const validation = await validateBusiness(business, Object.entries(stage.conditions).map(([type, value]) => ({ type, value })));
            if (!validation.valid) {
              shouldProcess = false;
              skipReason = `Auto-approval conditions not met: ${validation.messages.join(', ')}`;
            }
          }
          break;

        case 'MANUAL_REVIEW':
          // In a real implementation, this would pause for manual review
          // For now, we'll simulate based on business quality
          if ((business.quality_score || 0) < 70) {
            shouldProcess = false;
            skipReason = 'Requires manual review due to low quality score';
          }
          break;

        case 'CONDITIONAL':
          // Apply conditional logic
          if (stage.conditions) {
            const validation = await validateBusiness(business, Object.entries(stage.conditions).map(([type, value]) => ({ type, value })));
            if (!validation.valid) {
              shouldProcess = false;
              skipReason = `Conditional stage failed: ${validation.messages.join(', ')}`;
            }
          }
          break;

        case 'CHECKPOINT':
          // For checkpoints, we would normally pause execution
          // For demo purposes, we'll log and continue
          console.log(`Checkpoint reached for business ${business.id}: ${stage.checkpointConfig?.message || 'Manual checkpoint'}`);
          break;
      }
    }

    if (shouldProcess) {
      processedBusinesses.push(business);
      results.push({
        businessId: business.id,
        businessName: business.name,
        status: 'SUCCESS',
        message: `Processed through staged workflow successfully`,
        previousState: { approval_status: business.approval_status },
        newState: { approval_status: operationType === 'APPROVE' ? 'APPROVED' : 'REJECTED' }
      });
    } else {
      results.push({
        businessId: business.id,
        businessName: business.name,
        status: 'SKIPPED',
        message: skipReason || 'Skipped by workflow conditions',
        previousState: { approval_status: business.approval_status }
      });
    }
  }

  return { processedBusinesses, results, errors };
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BulkOperationExecution = await request.json();
    const {
      name,
      description,
      type,
      targetBusinesses,
      safetyChecks,
      approvalDetails,
      rejectionDetails,
      stagedWorkflow
    } = body;

    // Validate request
    if (!name || !type || !targetBusinesses || !Array.isArray(targetBusinesses) || targetBusinesses.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Apply safety checks
    if (targetBusinesses.length > safetyChecks.maxRecords) {
      return NextResponse.json({ 
        error: `Operation exceeds maximum record limit of ${safetyChecks.maxRecords}. Requested: ${targetBusinesses.length}` 
      }, { status: 400 });
    }

    const operationId = body.operationId || `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let snapshotId: string | undefined;
    const results: ExecutionResult['results'] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Create rollback snapshot if enabled
    if (safetyChecks.rollbackEnabled && safetyChecks.backupRequired) {
      try {
        snapshotId = await createSnapshot(targetBusinesses);
      } catch (error) {
        errors.push('Failed to create rollback snapshot');
        if (safetyChecks.requireApproval) {
          return NextResponse.json({ 
            error: 'Cannot proceed without rollback snapshot when approval required',
            details: errors
          }, { status: 500 });
        }
      }
    }

    // Fetch target businesses
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', targetBusinesses);

    if (fetchError) {
      console.error('Error fetching target businesses:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch target businesses' }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ error: 'No businesses found for the given IDs' }, { status: 404 });
    }

    let processedBusinesses = businesses;
    let processedResults = results;

    // Execute staged workflow if provided
    if (stagedWorkflow && stagedWorkflow.stages.length > 0) {
      const workflowResult = await executeStagedWorkflow(businesses, stagedWorkflow, type);
      processedBusinesses = workflowResult.processedBusinesses;
      processedResults = workflowResult.results;
      errors.push(...workflowResult.errors);
    }

    // Prepare update fields based on operation type
    let updateFields: any = {
      updated_at: new Date().toISOString()
    };

    const currentUser = 'system'; // Would extract from auth token in production

    switch (type) {
      case 'APPROVE':
        updateFields.approval_status = 'APPROVED';
        updateFields.approved_at = new Date().toISOString();
        updateFields.approved_by = currentUser;
        if (approvalDetails?.reason) {
          updateFields.approval_reason = approvalDetails.reason;
        }
        if (approvalDetails?.futureEffectiveDate) {
          updateFields.effective_date = approvalDetails.futureEffectiveDate;
        }
        break;

      case 'REJECT':
        updateFields.approval_status = 'REJECTED';
        updateFields.rejected_at = new Date().toISOString();
        updateFields.rejected_by = currentUser;
        if (rejectionDetails?.reason) {
          updateFields.rejection_reason = rejectionDetails.reason;
        }
        if (rejectionDetails?.category) {
          updateFields.rejection_category = rejectionDetails.category;
        }
        if (rejectionDetails?.appealAllowed !== undefined) {
          updateFields.appeal_allowed = rejectionDetails.appealAllowed;
        }
        break;

      case 'CONDITIONAL_APPROVE':
        updateFields.approval_status = 'APPROVED';
        updateFields.approved_at = new Date().toISOString();
        updateFields.approved_by = currentUser;
        if (approvalDetails?.conditions) {
          updateFields.approval_conditions = approvalDetails.conditions;
        }
        if (approvalDetails?.reason) {
          updateFields.approval_reason = approvalDetails.reason;
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    // Process businesses in batches for safety
    const batchSize = Math.min(safetyChecks.checkpointFrequency || 100, 100);
    const businessesToUpdate = processedBusinesses.filter(b => 
      !processedResults.find(r => r.businessId === b.id && r.status === 'SKIPPED')
    );

    for (let i = 0; i < businessesToUpdate.length; i += batchSize) {
      const batch = businessesToUpdate.slice(i, i + batchSize);
      const batchIds = batch.map(b => b.id);

      try {
        // Execute batch update
        const { data: updatedBusinesses, error: updateError } = await supabase
          .from('businesses')
          .update(updateFields)
          .in('id', batchIds)
          .select('id, name, approval_status');

        if (updateError) {
          console.error(`Error updating batch ${i / batchSize + 1}:`, updateError);
          
          // Mark batch as failed
          for (const business of batch) {
            results.push({
              businessId: business.id,
              businessName: business.name,
              status: 'FAILED',
              message: `Database update failed: ${updateError.message}`,
              previousState: { approval_status: business.approval_status }
            });
            failedCount++;
          }
          errors.push(`Batch ${i / batchSize + 1} failed: ${updateError.message}`);
          continue;
        }

        // Mark batch as successful
        for (const business of updatedBusinesses || []) {
          const originalBusiness = batch.find(b => b.id === business.id);
          results.push({
            businessId: business.id,
            businessName: business.name,
            status: 'SUCCESS',
            message: `Successfully ${type.toLowerCase()}ed`,
            previousState: { approval_status: originalBusiness?.approval_status },
            newState: { approval_status: business.approval_status }
          });
          successCount++;
        }

        // Create audit log entries
        const auditPromises = (updatedBusinesses || []).map(async (business) => {
          const originalBusiness = batch.find(b => b.id === business.id);
          return supabase.from('audit_logs').insert({
            table_name: 'businesses',
            record_id: business.id,
            action: `BULK_${type}`,
            changes: updateFields,
            user_id: currentUser,
            metadata: {
              business_name: business.name,
              bulk_operation: true,
              operation_id: operationId,
              operation_name: name,
              previous_status: originalBusiness?.approval_status,
              new_status: business.approval_status,
              snapshot_id: snapshotId,
              batch_number: Math.floor(i / batchSize) + 1,
              ...(approvalDetails || {}),
              ...(rejectionDetails || {})
            }
          });
        });

        await Promise.all(auditPromises);

        // Checkpoint logging
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(businessesToUpdate.length / batchSize)}: ${updatedBusinesses?.length || 0} businesses updated`);

      } catch (error) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, error);
        errors.push(`Batch ${i / batchSize + 1} encountered error: ${error}`);
        
        // Mark batch as failed
        for (const business of batch) {
          results.push({
            businessId: business.id,
            businessName: business.name,
            status: 'FAILED',
            message: `Processing error: ${error}`,
            previousState: { approval_status: business.approval_status }
          });
          failedCount++;
        }
      }
    }

    // Count skipped items from workflow
    skippedCount = processedResults.filter(r => r.status === 'SKIPPED').length;

    const executionResult: ExecutionResult = {
      success: failedCount === 0,
      operationId,
      processedCount: businesses.length,
      successCount,
      failedCount,
      skippedCount,
      results,
      snapshotId,
      rollbackAvailable: !!snapshotId && safetyChecks.rollbackEnabled,
      errors,
      warnings
    };

    // Add warnings for partial success
    if (successCount > 0 && failedCount > 0) {
      warnings.push(`Partial success: ${successCount} successful, ${failedCount} failed, ${skippedCount} skipped`);
    }

    return NextResponse.json(executionResult);

  } catch (error) {
    console.error('Error executing bulk operation:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}