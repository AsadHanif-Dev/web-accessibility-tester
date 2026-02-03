import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse(url) {
  let chrome;
  
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
      ],
    });

    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['accessibility'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse failed to return results');
    }

    const { lhr } = runnerResult;

    if (!lhr.categories?.accessibility) {
      throw new Error('Lighthouse did not return accessibility data');
    }

    // Return the raw lighthouse data
    return {
      success: true,
      data: {
        score: lhr.categories.accessibility.score,
        audits: lhr.audits,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// Run lighthouse when called directly
const url = process.argv[2];

if (!url) {
  console.error(JSON.stringify({ success: false, error: 'URL is required' }));
  process.exit(1);
}

runLighthouse(url)
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(JSON.stringify({ success: false, error: error.message }));
    process.exit(1);
  });
