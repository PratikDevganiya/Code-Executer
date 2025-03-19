/**
 * Utility functions for language formatting and validation
 */

/**
 * Format language name to proper case for consistency
 * @param {string} language - The language name to format
 * @returns {string} - The properly formatted language name
 */
function formatLanguageName(language) {
  // Map of lowercase language names to their properly formatted versions
  const languageMap = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'c': 'C',
    'c++': 'C++',
    'c#': 'C#',
    'php': 'PHP',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin'
  };
  
  // Return the properly formatted language name or the original if not found
  return languageMap[language.toLowerCase()] || language;
}

module.exports = {
  formatLanguageName
};