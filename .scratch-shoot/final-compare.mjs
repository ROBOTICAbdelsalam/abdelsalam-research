import { chromium } from "playwright";

const BASE = "http://localhost:4173/projects/hybrid-adaptive-bci";
const browser = await chromium.launch();

// ===== 1440px — main pipeline overview for direct structural comparison =====
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("#system-pipeline").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "/tmp/fc-1440-overview.png" });
  await page.close();
}

// ===== 1280 / 1024 / 768 / 375 — normal viewport shots, pipeline top =====
for (const w of [1280, 1024, 768, 375]) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 500 ? 812 : 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("#system-pipeline").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `/tmp/fc-${w}-overview.png` });
  await page.close();
}

// ===== Lab 11 with horizontal sub-step row =====
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator('button[aria-label*="11.1 Dataset Preparation"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/fc-lab11-row.png" });
  await page.close();
}

// ===== Lab 14 + ROS2 Robot Control Layer =====
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator('button[aria-label*="14.1 Live EEG Streaming"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/fc-lab14-ros2.png" });
  await page.close();
}

// ===== Selected sub-lab with detail panel open =====
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("#system-pipeline").scrollIntoViewIfNeeded();
  await page.locator('button[aria-label*="12.4 CNN-LSTM Classifier"]').click();
  await page.waitForTimeout(400);
  await page.locator("#bci-pipeline-detail").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "/tmp/fc-detail-panel.png" });
  await page.close();
}

// ===== Mobile 375px — horizontal scrolling behavior =====
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("#system-pipeline").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "/tmp/fc-mobile-375-a.png" });

  // scroll the first row horizontally to show the scroll behavior mid-strip
  const firstRow = page.locator('button[aria-label*="Environment Setup"]').locator("xpath=ancestor::div[contains(@class,'overflow-x-auto')]");
  await firstRow.evaluate((el) => { el.scrollLeft = el.scrollWidth * 0.4; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "/tmp/fc-mobile-375-b-scrolled.png" });
  await page.close();
}

console.log("done");
await browser.close();
