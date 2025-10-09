#!/usr/bin/env node

const fs = require('fs');

const issueBody = process.argv[2] || '';

function extractSiteData(body) {
  console.log('Extracting data from issue body...');
  
  const lines = body.split('\n');
  const data = {
    name: '',
    url: '',
    category: '',
    icon: '',
    description: ''
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Format 1: **Field:** value
    if (line.includes('Site Name:**')) {
      data.name = line.split('Site Name:**')[1]?.replace(/\*\*/g, '').trim() || '';
    }
    else if (line.includes('URL:**') && !line.includes('Icon URL')) {
      data.url = line.split('URL:**')[1]?.replace(/\*\*/g, '').trim() || '';
    }
    else if (line.includes('Category:**')) {
      data.category = line.split('Category:**')[1]?.replace(/\*\*/g, '').trim() || '';
    }
    else if (line.includes('Icon URL:**')) {
      data.icon = line.split('Icon URL:**')[1]?.replace(/\*\*/g, '').trim() || '';
    }
    else if (line.includes('Description:**')) {
      data.description = line.split('Description:**')[1]?.replace(/\*\*/g, '').trim() || '';
    }
    
    // Format 2: ### Field + next line
    else if (line === '### Site Name' && i + 1 < lines.length) {
      data.name = lines[i + 1].trim();
    }
    else if (line === '### Site URL' && i + 1 < lines.length) {
      data.url = lines[i + 1].trim();
    }
    else if (line === '### Category' && i + 1 < lines.length) {
      data.category = lines[i + 1].trim();
    }
    else if (line === '### Description' && i + 2 < lines.length) {
      data.description = lines[i + 2].trim(); // Skip the _No response line
    }
  }

  console.log('Extracted data:', data);
  return data;
}

// Main execution
if (issueBody) {
  const data = extractSiteData(issueBody);
  
  // Validate
  if (!data.name || !data.url || !data.category) {
    console.error('❌ Missing required fields');
    console.error('Name:', data.name);
    console.error('URL:', data.url);
    console.error('Category:', data.category);
    process.exit(1);
  }
  
  // Map category to status
  const categoryLower = data.category.toLowerCase();
  let status = 0;
  switch (categoryLower) {
    case 'manga': status = 1; break;
    case 'light novel':
    case 'ln': status = 2; break;
    case 'movie': status = 3; break;
    case 'app': status = 4; break;
    case 'anime': status = 5; break;
    case 'learning': status = 6; break;
    case 'nsfw': status = 7; break;
    default:
      console.error('❌ Unknown category:', data.category);
      process.exit(1);
  }
  
  // Generate provider key
  const providerKey = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + 'Provider';
  
  // Output for GitHub Actions
  console.log(`::set-output name=provider_key::${providerKey}`);
  console.log(`::set-output name=site_name::${data.name}`);
  console.log(`::set-output name=site_url::${data.url}`);
  console.log(`::set-output name=site_status::${status}`);
  console.log(`::set-output name=site_icon::${data.icon}`);
  console.log(`::set-output name=site_description::${data.description}`);
  
} else {
  console.error('❌ No issue body provided');
  process.exit(1);
}
