// tests/og.spec.ts
import { test, expect } from "@playwright/test";

test("OG route works and returns an image or redirects", async ({ request }) => {
  const response = await request.get(`/api/og?slug=demo&name=Demo&suburb=Richmond`);
  
  // Should return either 200 (dynamic image) or 302 (redirect to fallback)
  expect([200, 302]).toContain(response.status());
  
  const contentType = response.headers()["content-type"] || "";
  
  if (response.status() === 200) {
    // Dynamic image response - should be PNG from ImageResponse
    expect(contentType).toContain("image/png");
  }
  
  if (response.status() === 302) {
    // Fallback redirect - should redirect to static PNG
    const location = response.headers()["location"];
    expect(location).toMatch(/og-image-default\.(png|svg)$/);
  }
});

test("OG route handles missing parameters gracefully", async ({ request }) => {
  const response = await request.get(`/api/og`);
  
  // Should still work with default values
  expect([200, 302]).toContain(response.status());
});

test("OG route handles long parameters", async ({ request }) => {
  const longName = "A".repeat(100);
  const longSuburb = "B".repeat(100);
  const response = await request.get(`/api/og?slug=test&name=${longName}&suburb=${longSuburb}`);
  
  // Should truncate long parameters and still work
  expect([200, 302]).toContain(response.status());
});

test("Static fallback PNG exists and is accessible", async ({ request }) => {
  const response = await request.get(`/social/og-image-default.png`);
  
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});