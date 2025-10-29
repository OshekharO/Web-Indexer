#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateSafeKey, mapCategoryToStatus } = require('./shared-utils');

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
    
    // Debug: Show all lines for analysis
    console.log(`Line ${i}: "${line}"`);
    
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
    
    // Format 2: ### Field\n\nValue (GitHub form with empty line)
    else if (line.startsWith('### Site Name') && i + 2 < lines.length) {
      // Skip empty line and get the value
      if (lines[i + 1].trim() === '' && lines[i + 2].trim() !== '') {
        data.name = lines[i + 2].trim();
        console.log('✅ Found Site Name (Format 2):', data.name);
      }
    }
    else if (line.startsWith('### Site URL') && i + 2 < lines.length) {
      if (lines[i + 1].trim() === '' && lines[i + 2].trim() !== '') {
        data.url = lines[i + 2].trim();
        console.log('✅ Found URL (Format 2):', data.url);
      }
    }
    else if (line.startsWith('### Category') && i + 2 < lines.length) {
      if (lines[i + 1].trim() === '' && lines[i + 2].trim() !== '') {
        data.category = lines[i + 2].trim();
        console.log('✅ Found Category (Format 2):', data.category);
      }
    }
    else if (line.startsWith('### Description') && i + 2 < lines.length) {
      if (lines[i + 1].trim() === '' && lines[i + 2].trim() !== '' && lines[i + 2].trim() !== '_No response') {
        data.description = lines[i + 2].trim();
        console.log('✅ Found Description (Format 2):', data.description);
      }
    }
    
    // Format 3: Direct field extraction for GitHub forms
    else if (line.startsWith('### Site Name')) {
      // Try to extract from the same line first
      const match = line.match(/### Site Name\s+(.*)/);
      if (match && match[1].trim()) {
        data.name = match[1].trim();
        console.log('✅ Found Site Name (Format 3):', data.name);
      }
    }
    else if (line.startsWith('### Site URL')) {
      const match = line.match(/### Site URL\s+(.*)/);
      if (match && match[1].trim()) {
        data.url = match[1].trim();
        console.log('✅ Found URL (Format 3):', data.url);
      }
    }
    else if (line.startsWith('### Category')) {
      const match = line.match(/### Category\s+(.*)/);
      if (match && match[1].trim()) {
        data.category = match[1].trim();
        console.log('✅ Found Category (Format 3):', data.category);
      }
    }
  }

  console.log('🎯 Final extracted data:', JSON.stringify(data, null, 2));
  return data;
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
  console.log('=== RAW ISSUE BODY ===');
  console.log(issueBody);
  console.log('=== END RAW ISSUE BODY ===');

  const data = extractSiteData(issueBody);
  
  // Validate required fields
  if (!data.name || data.name.trim() === '') {
    console.error('❌ Missing required field: Site Name');
    console.error('Available data:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  if (!data.url || data.url.trim() === '') {
    console.error('❌ Missing required field: URL');
    console.error('Available data:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  if (!data.category || data.category.trim() === '') {
    console.error('❌ Missing required field: Category');
    console.error('Available data:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  
  // Map category to status using shared utility
  const status = mapCategoryToStatus(data.category);
  
  if (status === 0) {
    console.error('❌ Unknown category:', data.category);
    process.exit(1);
  }
  
  console.log('📊 Category mapping:', data.category, '->', status);
  
  // Generate provider key
  const providerKey = generateSafeKey(data.name);
  console.log('🔑 Generated provider key:', providerKey);
  
  // Create data object
  const extractedData = {
    provider_key: providerKey,
    site_name: data.name,
    site_url: data.url,
    site_status: status,
    site_icon: data.icon || '',
    site_description: data.description || ''
  };
  
  // Write to JSON file for reliable data passing
  fs.writeFileSync('extracted_data.json', JSON.stringify(extractedData, null, 2));
  console.log('📁 Extracted data written to extracted_data.json');
  
  // Also output to GITHUB_OUTPUT for backward compatibility
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const outputs = [
      `provider_key=${providerKey}`,
      `site_name=${data.name.replace(/\n/g, ' ')}`,
      `site_url=${data.url.replace(/\n/g, ' ')}`,
      `site_status=${status}`,
      `site_icon=${(data.icon || '').replace(/\n/g, ' ')}`,
      `site_description=${(data.description || '').replace(/\n/g, ' ')}`
    ].join('\n');
    
    fs.appendFileSync(outputFile, outputs);
    console.log('✅ Outputs written to GITHUB_OUTPUT');
  }
  
  console.log('🎉 Extraction completed successfully!');
  
} catch (error) {
  console.error('❌ Error during extraction:', error);
  process.exit(1);
}
