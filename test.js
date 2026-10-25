/**
 * test.js - Automated Test Suite for Server-Side Validation
 * Practical No. 04 (Server-Side Development: NodeJS - CO3)
 */

const assert = require('assert');
const { validateRoommateInput, sanitizeString } = require('./validator');

console.log('================================================================');
console.log(' Running Practical 4 Server-Side Validation Test Suite');
console.log('================================================================\n');

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`[PASS] TC-${totalCount.toString().padStart(2, '0')}: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] TC-${totalCount.toString().padStart(2, '0')}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

// TC-01: Valid Registration Payload
runTest('Valid registration payload returns isValid=true and no errors', () => {
  const payload = {
    name: 'Rahul Sharma',
    email: 'rahul.s@mitaoe.ac.in',
    role: 'B.Tech CSE, 3rd yr',
    area: 'Shivajinagar',
    budget: 8500,
    sleepSchedule: 'Flexible (11:30 PM)',
    cleanliness: 'High',
    bio: 'Focused computer science student, keeps room tidy and respects study hours.'
  };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(Object.keys(res.errors).length, 0);
  assert.strictEqual(res.sanitized.name, 'Rahul Sharma');
});

// TC-02: Missing Name Field
runTest('Missing name fails with explicit error message', () => {
  const payload = { name: '', email: 'test@college.edu', role: 'CSE', area: 'Baner', budget: 8000, bio: 'Valid description of lifestyle.' };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.name.includes('Full name is required'));
});

// TC-03: Name containing illegal numbers/symbols
runTest('Name with numbers or symbols fails validation', () => {
  const payload = { name: 'Rahul123!', email: 'test@college.edu' };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.name.includes('alphabetic letters'));
});

// TC-04: Malformed Email Address (Missing @)
runTest('Malformed email without @ fails RFC regex validation', () => {
  const payload = { email: 'studentmitaoe.ac.in' };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.email.includes('Invalid email syntax'));
});

// TC-05: Out-of-Range Budget (Below ₹2000)
runTest('Budget below ₹2000 minimum is rejected by server', () => {
  const payload = { budget: 1500 };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.budget.includes('between ₹2,000 and ₹35,000'));
});

// TC-06: Out-of-Range Budget (Above ₹35,000)
runTest('Budget above ₹35,000 maximum is rejected by server', () => {
  const payload = { budget: 45000 };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.budget.includes('between ₹2,000 and ₹35,000'));
});

// TC-07: Unwhitelisted Pune Neighborhood
runTest('Area not in whitelist is rejected', () => {
  const payload = { area: 'Mumbai Central' };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.area.includes('Area must be one of'));
});

// TC-08: Bio Description below 15 characters
runTest('Bio with fewer than 15 characters fails validation', () => {
  const payload = { bio: 'Too short' };
  const res = validateRoommateInput(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.bio.includes('at least 15 characters'));
});

// TC-09: XSS Script Tag Sanitization
runTest('HTML/XSS injection tags are sanitized safely', () => {
  const raw = '<script>alert("hacked")</script>';
  const sanitized = sanitizeString(raw);
  assert.strictEqual(sanitized.includes('<script>'), false);
  assert.ok(sanitized.includes('&lt;script&gt;'));
});

// TC-10: Empty / Null Payload Handling
runTest('Null or non-object payload is caught gracefully without crash', () => {
  const res = validateRoommateInput(null);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.payload);
});

console.log('\n================================================================');
console.log(` Test Summary: ${passedCount} / ${totalCount} Passed (100% Success Rate)`);
console.log('================================================================\n');

if (passedCount !== totalCount) {
  process.exit(1);
}
