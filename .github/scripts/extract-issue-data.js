#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function extractSiteData(body) {
  console.log('🔍 Extracting data from issue body...');
  console.log('Issue body length:', body.length);
  
  const lines = body.split('\n');
  const data = {
    name: '',
    url: '',
    category: '',
    icon: '',
    description: ''
  };

  console.log('Total lines:', lines.length);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Debug: Show lines that might contain our data
    if (line.includes('Site Name') || line.includes('URL') || line.includes('Category') || line.includes('Description')) {
      console.log(`Line ${i}: ${line}`);
    }
    
    // Format 1: **Field:** value (from website form)
    if (line.includes('Site Name:**')) {
      data.name = line.split('Site Name:**')[1]?.replace(/\*\*/g, '').trim() || '';
      console.log('✅ Found Site Name (Format 1):', data.name);
    }
    else if (line.includes('URL:**') && !line.includes('Icon URL')) {
      data.url = line.split('URL:**')[1]?.replace(/\*\*/g, '').trim() || '';
      console.log('✅ Found URL (Format 1):', data.url);
    }
    else if (line.includes('Category:**')) {
      data.category = line.split('Category:**')[1]?.replace(/\*\*/g, '').trim() || '';
      console.log('✅ Found Category (Format 1):', data.category);
    }
    else if (line.includes('Icon URL:**')) {
      data.icon = line.split('Icon URL:**')[1]?.replace(/\*\*/g, '').trim() || '';
      console.log('✅ Found Icon URL (Format 1):', data.icon);
    }
    else if (line.includes('Description:**')) {
      data.description = line.split('Description:**')[1]?.replace(/\*\*/g, '').trim() || '';
      console.log('✅ Found Description (Format 1):', data.description);
    }
    
    // Format 2: ### Field + next line (from GitHub form)
    else if (line === '### Site Name' && i + 1 < lines.length) {
      data.name = lines[i + 1].trim();
      console.log('✅ Found Site Name (Format 2):', data.name);
    }
    else if (line === '### Site URL' && i + 1 < lines.length) {
      data.url = lines[i + 1].trim();
      console.log('✅ Found URL (Format 2):', data.url);
    }
    else if (line === '### Category' && i + 1 < lines.length) {
      data.category = lines[i + 1].trim();
      console.log('✅ Found Category (Format 2):', data.category);
    }
    else if (line === '### Description' && i + 1 < lines.length) {
      // Skip the "_No response" line if present
      const nextLine = lines[i + 1].trim();
      if (nextLine !== '_No response') {
        data.description = nextLine;
        console.log('✅ Found Description (Format 2):', data.description);
      }
    }
  }

  console.log('🎯 Final extracted data:', JSON.stringify(data, null, 2));
  return data;
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

// Main execution
try {
  // Read issue body from file
  const issueBodyPath = path.join(process.cwd(), 'issue_body.json');
  if (!fs.existsSync(issueBodyPath)) {
    console.error('❌ Issue body file not found');
    process.exit(1);
  }

  const issueBodyContent = fs.readFileSync(issueBodyPath, 'utf8');
  const issueBody = JSON.parse(issueBodyContent);
  
  console.log('📝 Issue body parsed successfully');

  const data = extractSiteData(issueBody);
  
  // Validate required fields
  if (!data.name || data.name.trim() === '') {
    console.error('❌ Missing required field: Site Name');
    process.exit(1);
  }
  if (!data.url || data.url.trim() === '') {
    console.error('❌ Missing required field: URL');
    process.exit(1);
  }
  if (!data.category || data.category.trim() === '') {
    console.error('❌ Missing required field: Category');
    process.exit(1);
  }
  
  // Map category to status
  const categoryLower = data.category.toLowerCase();
  let status = 0;
  switch (categoryLower) {
    case 'manga': 
      status = 1; 
      break;
    case 'light novel':
    case 'ln': 
      status = 2; 
      break;
    case 'movie': 
      status = 3; 
      break;
    case 'app': 
      status = 4; 
      break;
    case 'anime': 
      status = 5; 
      break;
    case 'learning': 
      status = 6; 
      break;
    case 'nsfw': 
      status = 7; 
      break;
    default:
      console.error('❌ Unknown category:', data.category);
      process.exit(1);
  }
  
  console.log('📊 Category mapping:', data.category, '->', status);
  
  // Generate provider key
  const providerKey = generateSafeKey(data.name);
  console.log('🔑 Generated provider key:', providerKey);
  
  // Output for GitHub Actions
  console.log(`::set-output name=provider_key::${providerKey}`);
  console.log(`::set-output name=site_name::${data.name}`);
  console.log(`::set-output name=site_url::${data.url}`);
  console.log(`::set-output name=site_status::${status}`);
  console.log(`::set-output name=site_icon::${data.icon}`);
  console.log(`::set-output name=site_description::${data.description}`);
  
} catch (error) {
  console.error('❌ Error during extraction:', error);
  process.exit(1);
}
