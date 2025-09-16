import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const START_PATHS = ['/'];          // seed routes
const MAX_PAGES = 500;              // adjust as needed
const ALLOWED_HOST = 'suburbmates.com.au';
const DENY = [/\/api\//, /\.(png|jpg|jpeg|gif|webp|svg|ico)$/, /mailto:/, /tel:/, /#/, /\?download=/];

type Node = { url: string; from?: string; status?: number; title?: string };

function normalize(href: string): string | null {
  try {
    const u = new URL(href, `https://${ALLOWED_HOST}`);
    if (u.host !== ALLOWED_HOST) return null;
    // skip denies
    const full = u.toString();
    if (DENY.some(rx => rx.test(full))) return null;
    u.hash = '';
    // strip tracking params
    ['utm_source','utm_medium','utm_campaign','gclid','fbclid','_gl'].forEach(p => u.searchParams.delete(p));
    return u.pathname + (u.search ? `?${u.searchParams.toString()}` : '');
  } catch { return null; }
}

test('discover internal links only', async ({ page }, testInfo) => {
  const visited = new Set<string>();
  const queue: Node[] = START_PATHS.map(p => ({ url: p }));
  const graph: Node[] = [];

  while (queue.length && visited.size < MAX_PAGES) {
    const node = queue.shift()!;
    if (visited.has(node.url)) continue;
    visited.add(node.url);

    const baseURL = testInfo.project.use.baseURL || 'http://localhost:3000';
    const full = new URL(node.url, baseURL).toString();
    const resp = await page.goto(full, { waitUntil: 'domcontentloaded' }).catch(() => null);
    const status = resp?.status();
    const title = await page.title().catch(() => '');

    graph.push({ ...node, status, title });

    // collect same-origin links
    const hrefs = await page.$$eval('a[href]', as => as.map(a => (a as HTMLAnchorElement).href));
    for (const h of hrefs) {
      const n = normalize(h);
      if (!n) continue;
      if (!visited.has(n) && !queue.find(q => q.url === n)) queue.push({ url: n, from: full });
    }
  }

  // export artifacts
  const json = JSON.stringify({ start: START_PATHS, count: graph.length, nodes: graph }, null, 2);
  await testInfo.attach('discover.json', { body: Buffer.from(json), contentType: 'application/json' });
  fs.writeFileSync('discover.json', json, 'utf8');

  // CSV (url,status,title,from)
  const esc = (s: any) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const csv = ['url,status,title,from']
    .concat(graph.map(n => [esc(n.url), n.status ?? '', esc(n.title || ''), esc(n.from || '')].join(',')))
    .join('\n');
  await testInfo.attach('discover.csv', { body: Buffer.from(csv), contentType: 'text/csv' });
  fs.writeFileSync('discover.csv', csv, 'utf8');

  expect(graph.length).toBeGreaterThan(0);
});