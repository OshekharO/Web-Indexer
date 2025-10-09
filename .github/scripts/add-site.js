#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};
args.forEach(arg => {
  const [key, value] = arg.replace('--', '').split('=');
  params[key] = value || '';
});

console.log('Adding site with params:', params);

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

// Generate safe provider key
function generateSafeKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + 'Provider';
}

let providerKey = params.key || generateSafeKey(params.name);

// Ensure key is unique
let counter = 1;
const originalKey = providerKey;
while (providers[providerKey]) {
  providerKey = `${originalKey}${counter}`;
  counter++;
  if (counter > 10) {
    console.error('❌ Could not generate unique key after 10 attempts');
    process.exit(1);
  }
}

// Create new provider object
const newProvider = {
  name: params.name,
  url: params.url,
  status: parseInt(params.status) || 0
};

// Add icon if provided and not empty
if (params.icon && params.icon.trim() !== '' && params.icon !== 'Not provided') {
  try {
    new URL(params.icon);
    newProvider.icon = params.icon;
    console.log('✅ Using provided icon:', params.icon);
  } catch (e) {
    console.log('❌ Invalid icon URL, using default');
    // Fall through to default icon
  }
}

// If no icon provided or invalid, use default favicon service
if (!newProvider.icon) {
  try {
    const siteUrl = new URL(params.url);
    newProvider.icon = `https://www.google.com/s2/favicons?domain=${siteUrl.hostname}&sz=128`;
    console.log('✅ Generated default icon for:', siteUrl.hostname);
  } catch (e) {
    newProvider.icon = `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
    console.log('⚠️ Using fallback default icon');
  }
}

// Add description if provided and not empty
if (params.description && params.description.trim() !== '' && params.description !== 'Not provided') {
  newProvider.description = params.description;
  console.log('✅ Added description');
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
  console.log(`📁 Status: ${params.status}`);
  console.log(`🖼️ Icon: ${newProvider.icon}`);
  if (newProvider.description) {
    console.log(`📝 Description: ${newProvider.description}`);
  }
} catch (error) {
  console.error('❌ Error writing to providers.json:', error);
  process.exit(1);
    }
