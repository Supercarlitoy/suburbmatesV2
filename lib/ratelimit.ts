export async function hit(key: string, max: number, windowSec: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}` },
    body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSec]])
  }).then(r=>r.json());
  const count = Number(r?.[0]?.result ?? 0);
  if (count > max) throw new Error('Rate limit');
}