#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments properly
const params = {};
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    // Check if next argument exists and doesn't start with --
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      params[key] = args[i + 1];
      i++; // Skip the next argument since we used it as value
    } else {
      params[key] = ''; // No value provided
    }
  }
}

console.log('📝 Adding site with params:', JSON.stringify(params, null, 2));

const providersPath = path.join(process.cwd(), 'providers.json');

// Read existing providers
let providers = {};
try {
  const data = fs.readFileSync(providersPath, 'utf8');
  providers = JSON.parse(data);
  console.log(`📖 Read existing providers.json with ${Object.keys(providers).length} entries`);
} catch (error) {
  console.error('❌ Error reading providers.json:', error);
  process.exit(1);
}

// Generate safe provider key
function generateSafeKey(name) {
  if (!name || name.trim() === '') {
    throw new Error('Site name is required for key generation');
  }
  
  let baseKey = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Ensure it ends with Provider
  if (!baseKey.endsWith('provider')) {
    baseKey += 'Provider';
  }
  
  return baseKey;
}

let providerKey = params.key;
if (!providerKey || providerKey.trim() === '') {
  console.error('❌ Provider key is required');
  process.exit(1);
}

console.log(`🔑 Using provider key: ${providerKey}`);

// Ensure key is unique
let counter = 1;
const originalKey = providerKey;
while (providers[providerKey]) {
  providerKey = `${originalKey}${counter}`;
  counter++;
  console.log(`⚠️  Key conflict, trying: ${providerKey}`);
  if (counter > 10) {
    console.error('❌ Could not generate unique key after 10 attempts');
    process.exit(1);
  }
}

// Validate required fields
if (!params.name || params.name.trim() === '') {
  console.error('❌ Error: Site name is required');
  process.exit(1);
}

if (!params.url || params.url.trim() === '') {
  console.error('❌ Error: Site URL is required');
  process.exit(1);
}

// Create new provider object (without description as it's not supported)
const newProvider = {
  name: params.name.trim(),
  url: params.url.trim(),
  status: parseInt(params.status) || 0
};

console.log(`✅ Created provider object for: ${newProvider.name}`);

// Handle icon
if (params.icon && params.icon.trim() !== '' && params.icon !== 'Not provided') {
  try {
    new URL(params.icon);
    newProvider.icon = params.icon.trim();
    console.log(`🖼️  Using provided icon: ${newProvider.icon}`);
  } catch (e) {
    console.log('⚠️  Invalid icon URL, will generate default');
  }
}

// Generate default icon if none provided
if (!newProvider.icon) {
  try {
    const siteUrl = new URL(newProvider.url);
    newProvider.icon = `https://www.google.com/s2/favicons?domain=${siteUrl.href}&sz=128`;
    console.log(`🖼️  Generated default icon for: ${siteUrl.href}`);
  } catch (e) {
    console.error('❌ Error: Invalid site URL');
    process.exit(1);
  }
}

// Description is not supported in providers.json, so we skip it
console.log('ℹ️  Description field is not supported in providers.json - skipping');

// Add to providers
providers[providerKey] = newProvider;
console.log(`✅ Added ${providerKey} to providers`);

// Sort providers by status (0-7) and then alphabetically by name
console.log('🔄 Sorting providers by status and name...');
const sortedProviders = {};

// Convert to array, sort, then convert back to object
const sortedEntries = Object.entries(providers).sort(([keyA, providerA], [keyB, providerB]) => {
  // First sort by status (0-7)
  if (providerA.status !== providerB.status) {
    return providerA.status - providerB.status;
  }
  // If same status, sort alphabetically by name
  return providerA.name.localeCompare(providerB.name);
});

// Convert back to object
sortedEntries.forEach(([key, provider]) => {
  sortedProviders[key] = provider;
});

// Write back to file
try {
  fs.writeFileSync(providersPath, JSON.stringify(sortedProviders, null, 2));
  console.log(`🎉 Successfully sorted and saved providers.json`);
  console.log(`✅ Successfully added ${params.name} to providers.json`);
  console.log(`🔑 Provider Key: ${providerKey}`);
  console.log(`🌐 URL: ${newProvider.url}`);
  console.log(`📁 Status: ${newProvider.status}`);
  console.log(`🖼️ Icon: ${newProvider.icon}`);
} catch (error) {
  console.error('❌ Error writing providers.json:', error);
  process.exit(1);
}
