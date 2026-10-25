/**
 * validator.js - Server-Side Validation & Sanitization Engine
 * Practical No. 04 (Server-Side Development: NodeJS - CO3)
 * MIT Academy of Engineering (MIT-AOE)
 */

const ALLOWED_AREAS = [
  'Shivajinagar',
  'Pimpri',
  'Wakad',
  'Baner',
  'Hinjewadi',
  'Aundh',
  'Kothrud',
  'Viman Nagar'
];

const ALLOWED_SLEEP_SCHEDULES = [
  'Early Bird (10:00 PM)',
  'Early Bird (10:30 PM)',
  'Flexible (11:30 PM)',
  'Midnight (12:30 AM)',
  'Night Owl (1:30 AM)',
  'Night Owl (2:30 AM)'
];

const ALLOWED_CLEANLINESS = ['Spotless', 'High', 'Moderate', 'Relaxed'];

/**
 * Sanitizes input string to prevent XSS / script injection
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Server-Side Validation function
 * Validates incoming roommate registration payload
 * @param {Object} data - Raw request payload
 * @returns {Object} { isValid: boolean, errors: Object, sanitized: Object }
 */
function validateRoommateInput(data) {
  const errors = {};
  const sanitized = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { payload: 'Invalid or missing request body.' },
      sanitized: {}
    };
  }

  // 1. Full Name Validation
  const rawName = typeof data.name === 'string' ? data.name.trim() : '';
  if (!rawName) {
    errors.name = 'Full name is required on server.';
  } else if (rawName.length < 3) {
    errors.name = 'Full name must be at least 3 characters long.';
  } else if (rawName.length > 50) {
    errors.name = 'Full name cannot exceed 50 characters.';
  } else if (!/^[a-zA-Z\s.]+$/.test(rawName)) {
    errors.name = 'Full name can only contain alphabetic letters, spaces, and periods.';
  } else {
    sanitized.name = sanitizeString(rawName);
  }

  // 2. Email Validation (RFC 5322 Regex standard)
  const rawEmail = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!rawEmail) {
    errors.email = 'College email address is required.';
  } else if (!emailRegex.test(rawEmail)) {
    errors.email = 'Invalid email syntax (e.g. student@college.edu or student@mitaoe.ac.in).';
  } else {
    sanitized.email = rawEmail;
  }

  // 3. College / Course Validation
  const rawRole = typeof data.role === 'string' ? data.role.trim() : '';
  if (!rawRole) {
    errors.role = 'Department and academic course is required.';
  } else if (rawRole.length < 2) {
    errors.role = 'Course description must be at least 2 characters.';
  } else if (rawRole.length > 60) {
    errors.role = 'Course description cannot exceed 60 characters.';
  } else {
    sanitized.role = sanitizeString(rawRole);
  }

  // 4. Preferred Area Whitelist Validation
  const rawArea = typeof data.area === 'string' ? data.area.trim() : '';
  if (!rawArea) {
    errors.area = 'Preferred Pune neighborhood is required.';
  } else if (!ALLOWED_AREAS.includes(rawArea)) {
    errors.area = `Area must be one of: ${ALLOWED_AREAS.join(', ')}.`;
  } else {
    sanitized.area = rawArea;
  }

  // 5. Monthly Budget Validation (Numeric boundaries)
  const rawBudget = Number(data.budget);
  if (data.budget === undefined || data.budget === null || data.budget === '') {
    errors.budget = 'Monthly budget amount is required.';
  } else if (isNaN(rawBudget) || !Number.isFinite(rawBudget)) {
    errors.budget = 'Monthly budget must be a valid numeric figure.';
  } else if (!Number.isInteger(rawBudget)) {
    errors.budget = 'Monthly budget must be an integer amount (no decimals).';
  } else if (rawBudget < 2000 || rawBudget > 35000) {
    errors.budget = 'Monthly budget must be between ₹2,000 and ₹35,000.';
  } else {
    sanitized.budget = rawBudget;
  }

  // 6. Sleep Schedule Validation
  const rawSleep = typeof data.sleepSchedule === 'string' ? data.sleepSchedule.trim() : '';
  if (!rawSleep) {
    errors.sleepSchedule = 'Sleep routine selection is required.';
  } else if (!ALLOWED_SLEEP_SCHEDULES.includes(rawSleep)) {
    errors.sleepSchedule = 'Invalid sleep schedule option selected.';
  } else {
    sanitized.sleepSchedule = rawSleep;
  }

  // 7. Cleanliness Level Validation
  const rawClean = typeof data.cleanliness === 'string' ? data.cleanliness.trim() : '';
  if (!rawClean) {
    errors.cleanliness = 'Cleanliness preference is required.';
  } else if (!ALLOWED_CLEANLINESS.includes(rawClean)) {
    errors.cleanliness = 'Cleanliness must be Spotless, High, Moderate, or Relaxed.';
  } else {
    sanitized.cleanliness = rawClean;
  }

  // 8. Lifestyle Bio Validation
  const rawBio = typeof data.bio === 'string' ? data.bio.trim() : '';
  if (!rawBio) {
    errors.bio = 'Living habits description is required.';
  } else if (rawBio.length < 15) {
    errors.bio = `Bio must be at least 15 characters long (currently ${rawBio.length} chars).`;
  } else if (rawBio.length > 300) {
    errors.bio = `Bio cannot exceed 300 characters (currently ${rawBio.length} chars).`;
  } else {
    sanitized.bio = sanitizeString(rawBio);
  }

  // 9. 5-Axis Lifestyle Rating (Integer 0 - 100)
  const axes = data.axes || {};
  const validatedAxes = {};
  ['sleep', 'clean', 'noise', 'guests', 'social'].forEach(axis => {
    const val = Number(axes[axis]);
    if (isNaN(val) || val < 0 || val > 100) {
      validatedAxes[axis] = 50; // Fallback to neutral default
    } else {
      validatedAxes[axis] = Math.round(val);
    }
  });
  sanitized.axes = validatedAxes;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
}

module.exports = {
  validateRoommateInput,
  sanitizeString,
  ALLOWED_AREAS,
  ALLOWED_SLEEP_SCHEDULES,
  ALLOWED_CLEANLINESS
};
