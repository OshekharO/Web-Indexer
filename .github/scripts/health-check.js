const axios = require('axios');
const fs = require('fs');

const providers = JSON.parse(fs.readFileSync('providers.json', 'utf8'));
const sites = Object.values(providers);

async function checkSite(url) {
  try {
    const response = await axios.head(url, { timeout: 10000 });
    return response.status < 400 ? 'online' : 'offline';
  } catch (error) {
    return 'offline';
  }
}

async function runHealthCheck() {
  console.log('Starting health check...');
  
  for (const site of sites) {
    const status = await checkSite(site.url);
    console.log(`${site.name}: ${status}`);
    
    // Add delay to avoid overwhelming sites
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Health check completed');
}

runHealthCheck().catch(console.error);
