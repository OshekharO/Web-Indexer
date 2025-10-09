#!/usr/bin/env node

// Parse the issue body from the argument
const issueBody = process.argv[2] ? JSON.parse(process.argv[2]) : '';
const issueNumber = process.argv[3];

function validateSiteSubmission(body) {
  const validations = [];
  const feedback = [];
  
  console.log('Validating issue body:', body);
  
  // Extract fields using the exact format from your site suggestions
  const siteNameMatch = body.match(/\*\*Site Name:\*\*\s*(.*?)(?=\n|$)/);
  const urlMatch = body.match(/\*\*URL:\*\*\s*(.*?)(?=\n|$)/);
  const categoryMatch = body.match(/\*\*Category:\*\*\s*(.*?)(?=\n|$)/);
  
  const siteName = siteNameMatch ? siteNameMatch[1].trim() : '';
  const url = urlMatch ? urlMatch[1].trim() : '';
  const category = categoryMatch ? categoryMatch[1].trim() : '';
  
  console.log('Extracted - Name:', siteName, 'URL:', url, 'Category:', category);
  
  // Validate required fields
  if (!siteName) {
    validations.push(false);
    feedback.push('❌ **Site Name** is required and cannot be empty');
  } else {
    validations.push(true);
  }
  
  if (!url) {
    validations.push(false);
    feedback.push('❌ **URL** is required and cannot be empty');
  } else {
    // Validate URL format
    try {
      new URL(url);
      validations.push(true);
    } catch (e) {
      validations.push(false);
      feedback.push('❌ **URL** must be a valid URL (include http:// or https://)');
    }
  }
  
  if (!category) {
    validations.push(false);
    feedback.push('❌ **Category** is required and cannot be empty');
  } else {
    // Validate category
    const validCategories = ['manga', 'light novel', 'movie', 'app', 'anime', 'learning', 'nsfw'];
    const categoryLower = category.toLowerCase();
    if (!validCategories.includes(categoryLower)) {
      validations.push(false);
      feedback.push(`❌ **Category** must be one of: ${validCategories.join(', ')}`);
    } else {
      validations.push(true);
    }
  }
  
  const isValid = validations.every(v => v);
  
  if (isValid) {
    feedback.push('✅ All validations passed! This submission is ready for review.');
  }
  
  // Use the new GitHub Actions output format
  const outputs = [
    `::set-output name=result::${isValid ? 'valid' : 'invalid'}`,
    `::set-output name=feedback::${feedback.join('\\n\\n')}`,
    `::set-output name=site_name::${siteName}`,
    `::set-output name=site_url::${url}`,
    `::set-output name=site_category::${category}`
  ];
  
  outputs.forEach(output => console.log(output));
  
  return isValid;
}

// Run validation
if (issueBody) {
  validateSiteSubmission(issueBody);
} else {
  console.log('::set-output name=result::invalid');
  console.log('::set-output name=feedback::❌ No issue body found');
}
