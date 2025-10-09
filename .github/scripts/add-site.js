#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};
args.forEach(arg => {
  const [key, value] = arg.replace('--', '').split('=');
  params[key] = value;
});

const providersPath = path.join(process.cwd(), 'providers.json');

// Read existing providers
let providers = {};
try {
  const data = fs.readFileSync(providersPath, 'utf8');
  providers = JSON.parse(data);
} catch (error) {
  console.error('Error reading providers.json:', error);
  process.exit(1);
}

// Generate unique key if there's a conflict
let providerKey = params.key;
let counter = 1;
while (providers[providerKey]) {
  providerKey = `${params.key}${counter}`;
  counter++;
}

// Create new provider object
const newProvider = {
  name: params.name,
  url: params.url,
  status: parseInt(params.status) || 0,
  icon: params.icon || `https://www.google.com/s2/favicons?domain=${new URL(params.url).hostname}&sz=128`
};

// Add description if provided
if (params.description && params.description !== 'Not provided') {
  newProvider.description = params.description;
}

// Add to providers
providers[providerKey] = newProvider;

// Sort providers alphabetically by key
const sortedProviders = {};
Object.keys(providers).sort().forEach(key => {
  sortedProviders[key] = providers[key];
});

// Write back to file
try {
  fs.writeFileSync(providersPath, JSON.stringify(sortedProviders, null, 2));
  console.log(`✅ Successfully added ${params.name} to providers.json`);
  console.log(`🔑 Provider Key: ${providerKey}`);
  console.log(`🌐 URL: ${params.url}`);
  console.log(`📁 Category: ${params.status}`);
} catch (error) {
  console.error('Error writing to providers.json:', error);
  process.exit(1);
}
