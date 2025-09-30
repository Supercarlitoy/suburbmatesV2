// Sentry setup and validation script
import 'dotenv/config';
import axios from 'axios';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (status, message) => {
  const color = status === 'SUCCESS' ? colors.green : 
                status === 'ERROR' ? colors.red : 
                status === 'WARNING' ? colors.yellow : colors.blue;
  console.log(`${color}[${status}]${colors.reset} ${message}`);
};

async function discoverSentryOrganization() {
  const token = process.env.SENTRY_API_TOKEN;
  
  if (!token || token.includes('your_') || token === 'your_sentry_api_token_here') {
    log('ERROR', 'No valid Sentry API token found');
    return null;
  }

  try {
    log('INFO', 'Discovering Sentry organizations with current token...');
    
    // Get user's organizations
    const response = await axios.get('https://sentry.io/api/0/organizations/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const orgs = response.data;
      log('SUCCESS', `Found ${orgs.length} organization(s):`);
      
      orgs.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.slug} (${org.name})`);
      });
      
      // Return the first organization slug
      return orgs[0].slug;
    } else {
      log('WARNING', 'No organizations found for this token');
      return null;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      log('ERROR', 'Sentry API: Invalid token or unauthorized');
    } else {
      log('ERROR', `Sentry API error: ${error.message}`);
    }
    return null;
  }
}

async function createSentryProject(orgSlug) {
  const token = process.env.SENTRY_API_TOKEN;
  
  try {
    log('INFO', `Creating SuburbMates project in organization: ${orgSlug}`);
    
    const response = await axios.post(`https://sentry.io/api/0/organizations/${orgSlug}/projects/`, {
      name: 'suburbmates',
      platform: 'javascript',
      defaultRules: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      log('SUCCESS', `Project created successfully!`);
      log('INFO', `Project slug: ${response.data.slug}`);
      log('INFO', `Project ID: ${response.data.id}`);
      return response.data;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      log('WARNING', 'Project "suburbmates" already exists');
      return { slug: 'suburbmates' };
    } else if (error.response?.status === 403) {
      log('ERROR', 'Insufficient permissions to create project');
    } else {
      log('ERROR', `Project creation error: ${error.message}`);
    }
    return null;
  }
}

async function getSentryDSN(orgSlug, projectSlug = 'suburbmates') {
  const token = process.env.SENTRY_API_TOKEN;
  
  try {
    log('INFO', `Getting DSN for project: ${projectSlug}`);
    
    const response = await axios.get(`https://sentry.io/api/0/projects/${orgSlug}/${projectSlug}/keys/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const key = response.data[0];
      log('SUCCESS', 'Found project DSN!');
      return {
        dsn: key.dsn.secret,
        publicDsn: key.dsn.public
      };
    } else {
      log('WARNING', 'No keys found for project');
      return null;
    }
  } catch (error) {
    log('ERROR', `Error getting DSN: ${error.message}`);
    return null;
  }
}

async function updateEnvironmentFile(orgSlug, dsns) {
  const fs = await import('fs');
  const envPath = '.env.local';
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update organization
    envContent = envContent.replace(/SENTRY_ORG=your-org/, `SENTRY_ORG=${orgSlug}`);
    
    // Update DSNs
    if (dsns) {
      envContent = envContent.replace(/SENTRY_DSN=your_sentry_dsn_here/, `SENTRY_DSN=${dsns.dsn}`);
      envContent = envContent.replace(/NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn_here/, `NEXT_PUBLIC_SENTRY_DSN=${dsns.publicDsn}`);
    }
    
    fs.writeFileSync(envPath, envContent);
    log('SUCCESS', 'Environment file updated!');
    
    // Also update .env file for consistency
    if (fs.existsSync('.env')) {
      let envContentMain = fs.readFileSync('.env', 'utf8');
      envContentMain = envContentMain.replace(/SENTRY_ORG=your-org/, `SENTRY_ORG=${orgSlug}`);
      if (dsns) {
        envContentMain = envContentMain.replace(/SENTRY_DSN=your_sentry_dsn_here/, `SENTRY_DSN=${dsns.dsn}`);
        envContentMain = envContentMain.replace(/NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn_here/, `NEXT_PUBLIC_SENTRY_DSN=${dsns.publicDsn}`);
      }
      fs.writeFileSync('.env', envContentMain);
    }
    
  } catch (error) {
    log('ERROR', `Error updating environment file: ${error.message}`);
  }
}

async function main() {
  log('INFO', '🔧 Sentry Setup Wizard');
  log('INFO', '====================\n');
  
  // Step 1: Discover organization
  const orgSlug = await discoverSentryOrganization();
  if (!orgSlug) {
    log('ERROR', 'Cannot proceed without a valid Sentry organization');
    log('INFO', 'Please:');
    log('INFO', '1. Sign up at https://sentry.io');
    log('INFO', '2. Create an organization');
    log('INFO', '3. Generate an API token with org:read, project:write scopes');
    log('INFO', '4. Update SENTRY_API_TOKEN in .env.local');
    return;
  }
  
  // Step 2: Create or find project
  const project = await createSentryProject(orgSlug);
  
  // Step 3: Get DSN
  const dsns = await getSentryDSN(orgSlug, project?.slug || 'suburbmates');
  
  // Step 4: Update environment files
  await updateEnvironmentFile(orgSlug, dsns);
  
  log('SUCCESS', '🎉 Sentry setup complete!');
  log('INFO', 'You can now use Sentry for error tracking in your application');
  
  if (dsns) {
    log('INFO', '\\nYour Sentry configuration:');
    log('INFO', `Organization: ${orgSlug}`);
    log('INFO', `Project: suburbmates`);
    log('INFO', `DSN: ${dsns.dsn.substring(0, 50)}...`);
  }
}

main().catch(error => {
  log('ERROR', `Setup failed: ${error.message}`);
  process.exit(1);
});