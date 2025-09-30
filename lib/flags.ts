export async function isFlagOn(key: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${url}/GET/${encodeURIComponent('flag:'+key)}`, { headers: { Authorization: `Bearer ${tok}` } });
  const t = await r.text();
  return t.trim() === '1';
}