// Renders an HTML string to an A4 PDF buffer. Same Chromium print engine
// as a browser's own "Print to PDF" — so what we already designed for
// the email (and its @media print rules) comes out identical in the PDF.
//
// On Vercel this uses @sparticuz/chromium (a serverless-sized Chromium
// build for Linux/AWS Lambda-style runtimes). Locally there is no such
// binary for Windows, so it falls back to the machine's real Chrome
// install — override with CHROME_PATH if it's somewhere else.

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const puppeteer = await import('puppeteer-core');
  const isServerless = !!process.env.VERCEL;

  let executablePath: string;
  let args: string[];

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium')).default;
    executablePath = await chromium.executablePath();
    args = chromium.args;
  } else {
    executablePath =
      process.env.CHROME_PATH ??
      'C:/Program Files/Google/Chrome/Application/chrome.exe';
    args = ['--no-sandbox', '--disable-setuid-sandbox'];
  }

  const browser = await puppeteer.launch({
    executablePath,
    args,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    // 'load' — the email templates pull product photos from
    // officelabsco.com, and the load event only fires once images are done.
    await page.setContent(html, { waitUntil: 'load', timeout: 20_000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
