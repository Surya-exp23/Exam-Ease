/**
 * localStorage-based backend for test data persistence
 */

const STORAGE_KEY = 'examease_tests';

function loadTests() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function persistTests(tests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

/**
 * Get all saved tests
 * @returns {Array} Array of test objects
 */
export function getTests() {
  return loadTests();
}

/**
 * Get a specific test by ID
 * @param {string} id - Test ID
 * @returns {object|null} Test object or null
 */
export function getTestById(id) {
  const tests = loadTests();
  return tests.find(t => t.id === id) || null;
}

/**
 * Save a new test
 * @param {object} test - Test object { title, subject, createdBy, questions }
 * @returns {object} Saved test with generated ID and timestamp
 */
export function saveTest(test) {
  const tests = loadTests();
  const newTest = {
    ...test,
    id: 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    createdAt: new Date().toISOString(),
  };
  tests.unshift(newTest); // newest first
  persistTests(tests);
  return newTest;
}

/**
 * Delete a test by ID
 * @param {string} id - Test ID to delete
 */
export function deleteTest(id) {
  const tests = loadTests();
  const filtered = tests.filter(t => t.id !== id);
  persistTests(filtered);
}

/**
 * Get tests created by a specific user
 * @param {string} email - Creator's email
 * @returns {Array} Filtered test array
 */
export function getTestsByCreator(email) {
  const tests = loadTests();
  return tests.filter(t => t.createdBy === email);
}
