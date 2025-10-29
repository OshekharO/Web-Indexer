#!/usr/bin/env node

/**
 * Shared utility functions for GitHub scripts
 */

/**
 * Generate a safe provider key from a site name
 * @param {string} name - The site name
 * @returns {string} A safe provider key
 */
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

/**
 * Status codes for different site categories
 */
const STATUS_CODES = {
  MANGA: 1,
  LN: 2,
  MOVIE: 3,
  APP: 4,
  ANIME: 5,
  LEARNING: 6,
  NSFW: 7
};

/**
 * Map a category string to a status code
 * @param {string} category - The category name
 * @returns {number} The status code (0 if unknown)
 */
function mapCategoryToStatus(category) {
  const categoryLower = category.toLowerCase();
  
  switch (categoryLower) {
    case 'manga':
      return STATUS_CODES.MANGA;
    case 'light novel':
    case 'ln':
      return STATUS_CODES.LN;
    case 'movie':
      return STATUS_CODES.MOVIE;
    case 'app':
      return STATUS_CODES.APP;
    case 'anime':
      return STATUS_CODES.ANIME;
    case 'learning':
      return STATUS_CODES.LEARNING;
    case 'nsfw':
      return STATUS_CODES.NSFW;
    default:
      return 0;
  }
}

/**
 * Map a status code to a category object with type and CSS class
 * @param {number} status - The status code
 * @returns {{type: string, typeClass: string}} Category information
 */
function mapStatusToCategory(status) {
  switch (status) {
    case STATUS_CODES.MANGA:
      return { type: "MANGA", typeClass: "type-manga" };
    case STATUS_CODES.LN:
      return { type: "LN", typeClass: "type-ln" };
    case STATUS_CODES.MOVIE:
      return { type: "MOVIE", typeClass: "type-movie" };
    case STATUS_CODES.APP:
      return { type: "APP", typeClass: "type-app" };
    case STATUS_CODES.ANIME:
      return { type: "ANIME", typeClass: "type-anime" };
    case STATUS_CODES.LEARNING:
      return { type: "LEARNING", typeClass: "type-learning" };
    case STATUS_CODES.NSFW:
      return { type: "NSFW", typeClass: "type-nsfw" };
    default:
      return { type: "Unknown", typeClass: "type-unknown" };
  }
}

module.exports = {
  generateSafeKey,
  STATUS_CODES,
  mapCategoryToStatus,
  mapStatusToCategory
};
