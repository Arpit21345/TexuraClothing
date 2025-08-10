import puppeteer from "puppeteer";

// Launch Puppeteer with standard flags and safe fallbacks
export const launchBrowser = async () => {
  try {
    return await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      timeout: 60000,
    });
  } catch (err) {
    // Fallbacks: try explicit executable path env or puppeteer.executablePath()
    const candidates = [];
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      candidates.push(process.env.PUPPETEER_EXECUTABLE_PATH);
    }
    try {
      const ep = typeof puppeteer.executablePath === "function" ? puppeteer.executablePath() : undefined;
      if (ep) candidates.push(ep);
    } catch {}

    let lastErr = err;
    for (const execPath of candidates) {
      try {
        // eslint-disable-next-line no-console
        console.log("Retrying puppeteer.launch with executablePath:", execPath);
        const b = await puppeteer.launch({
          headless: true,
          executablePath: execPath,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
          ],
          timeout: 60000,
        });
        return b;
      } catch (e2) {
        // eslint-disable-next-line no-console
        console.error("Fallback puppeteer launch failed with path:", execPath, e2);
        lastErr = e2;
      }
    }
    throw lastErr;
  }
};
