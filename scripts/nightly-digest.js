// Enhanced nightly digest script (Node 20)
import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBusinessMetrics() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get inquiries from last 24h (leads)
    const leads24h = await prisma.inquiry.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: { not: 'SPAM' }, // Exclude spam
      },
    });

    // Get audit log events for shares and claims
    const auditEvents = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        action: {
          in: ['SHARE_BUSINESS_PROFILE', 'CLAIM_BUSINESS', 'REGISTER_BUSINESS'],
        },
      },
      select: {
        action: true,
        meta: true,
      },
    });

    const shares24h = auditEvents.filter(e => e.action === 'SHARE_BUSINESS_PROFILE').length;
    const claims24h = auditEvents.filter(e => e.action === 'CLAIM_BUSINESS').length;
    const registrations24h = auditEvents.filter(e => e.action === 'REGISTER_BUSINESS').length;

    // Get top businesses by leads
    const topBusinessesByLeads = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        suburb: true,
        _count: {
          select: {
            inquiries: {
              where: {
                createdAt: {
                  gte: yesterday,
                  lt: today,
                },
                status: { not: 'SPAM' },
              },
            },
          },
        },
      },
      orderBy: {
        inquiries: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get businesses missing hero images
    const businessesMissingHero = await prisma.business.findMany({
      where: {
        status: 'APPROVED',
        logo: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        suburb: true,
        email: true,
      },
      take: 10,
    });

    // Get recent activity summary
    const totalBusinesses = await prisma.business.count({
      where: { status: 'APPROVED' },
    });

    const newBusinesses24h = await prisma.business.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: 'APPROVED',
      },
    });

    return {
      leads24h,
      shares24h,
      claims24h,
      registrations24h,
      newBusinesses24h,
      totalBusinesses,
      topBusinessesByLeads: topBusinessesByLeads.filter(b => b._count.inquiries > 0),
      businessesMissingHero,
    };
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    return {
      leads24h: 0,
      shares24h: 0,
      claims24h: 0,
      registrations24h: 0,
      newBusinesses24h: 0,
      totalBusinesses: 0,
      topBusinessesByLeads: [],
      businessesMissingHero: [],
      error: error.message,
    };
  }
}

function generateEmailHTML(summary, metrics) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SuburbMates Growth Digest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0A2540 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric { background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #64748b; margin-top: 4px; }
        .section { margin: 25px 0; }
        .business-list { background-color: #fafafa; padding: 15px; border-radius: 6px; }
        .business-item { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .business-item:last-child { border-bottom: none; }
        .footer { padding: 20px 30px; background-color: #f8fafc; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🚀 SuburbMates Growth Digest</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Generated: ${summary.generatedAt}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 15px;">📊 24-Hour Metrics</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="metric">
                <div class="metric-value">${metrics.leads24h}</div>
                <div class="metric-label">New Leads</div>
              </div>
              <div class="metric">
                <div class="metric-value">${metrics.shares24h}</div>
                <div class="metric-label">Profile Shares</div>
              </div>
              <div class="metric">
                <div class="metric-value">${metrics.claims24h}</div>
                <div class="metric-label">Business Claims</div>
              </div>
              <div class="metric">
                <div class="metric-value">${metrics.registrations24h}</div>
                <div class="metric-label">New Registrations</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 15px;">🏢 Business Growth</h2>
            <div class="metric">
              <div class="metric-value">${metrics.totalBusinesses}</div>
              <div class="metric-label">Total Active Businesses (+${metrics.newBusinesses24h} today)</div>
            </div>
          </div>

          ${metrics.topBusinessesByLeads.length > 0 ? `
          <div class="section">
            <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 15px;">🔥 Top Performing Businesses (24h)</h2>
            <div class="business-list">
              ${metrics.topBusinessesByLeads.map(business => `
                <div class="business-item">
                  <strong><a href="${baseUrl}/business/${business.slug}" target="_blank">${business.name}</a></strong>
                  <br><small>${business.suburb} • ${business._count.inquiries} lead${business._count.inquiries !== 1 ? 's' : ''}</small>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${metrics.businessesMissingHero.length > 0 ? `
          <div class="section">
            <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 15px;">⚠️ Profile Optimization Opportunities</h2>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
              These businesses could improve their profiles by adding hero images:
            </p>
            <div class="business-list">
              ${metrics.businessesMissingHero.slice(0, 5).map(business => `
                <div class="business-item">
                  <strong><a href="${baseUrl}/business/${business.slug}" target="_blank">${business.name}</a></strong>
                  <br><small>${business.suburb} • Missing hero image</small>
                </div>
              `).join('')}
              ${metrics.businessesMissingHero.length > 5 ? `
                <div class="business-item">
                  <small>...and ${metrics.businessesMissingHero.length - 5} more</small>
                </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 15px;">🎯 Quick Actions</h2>
            <p>
              <a href="${baseUrl}/admin" target="_blank">→ View Admin Dashboard</a><br>
              <a href="${baseUrl}/admin/businesses" target="_blank">→ Manage Businesses</a><br>
              <a href="${baseUrl}/dashboard/leads" target="_blank">→ Review New Leads</a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          Generated by SuburbMates automated reporting • <a href="${baseUrl}" target="_blank">suburbmates.com.au</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function main() {
  const now = new Date().toISOString();
  
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    console.error('Missing RESEND_API_KEY or ADMIN_EMAIL');
    process.exit(1);
  }

  // Get business metrics from database
  const metrics = await getBusinessMetrics();
  
  const summary = {
    generatedAt: now,
    ...metrics,
  };

  const html = generateEmailHTML(summary, metrics);

  try {
    await axios.post('https://api.resend.com/emails', {
      from: process.env.AUTH_EMAIL_FROM || 'SuburbMates <no-reply@suburbmates.com.au>',
      to: process.env.ADMIN_EMAIL,
      subject: `📈 SuburbMates Daily Digest - ${metrics.leads24h} leads, ${metrics.registrations24h} new businesses`,
      html
    }, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }
    });

    console.log('✅ Nightly digest email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send digest email:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });