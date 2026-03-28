export const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 120,
    label: "Course Title",
  },
  slug: {
    required: true,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    label: "URL Slug",
    patternMessage: "Only lowercase letters, numbers, and hyphens allowed",
  },
  summary: {
    required: true,
    minLength: 10,
    maxLength: 300,
    label: "Summary",
  },
  description: {
    required: true,
    minLength: 10,
    label: "Full Description",
  },
  category: {
    required: true,
    label: "Category",
  },
  level: {
    required: true,
    label: "Level",
  },
  duration: {
    required: true,
    min: 0.5,
    max: 500,
    label: "Duration",
  },
  price: {
    required: true,
    min: 0,
    max: 9999,
    label: "Price",
  },
  thumbnail: {
    required: false, // optional but validated if provided
    label: "Thumbnail Image",
  },
};

/**
 * Validate a single field value against its rules.
 * @returns {string|null} error message or null if valid
 */
export function validateField(name, value) {
  const rule = VALIDATION_RULES[name];
  if (!rule) return null;

  const strVal =
    value !== undefined && value !== null ? String(value).trim() : "";

  // Required check
  if (rule.required && !strVal) {
    return `${rule.label} is required`;
  }

  // Skip further checks if empty and not required
  if (!strVal) return null;

  // Min length
  if (rule.minLength && strVal.length < rule.minLength) {
    return `${rule.label} must be at least ${rule.minLength} characters`;
  }

  // Max length
  if (rule.maxLength && strVal.length > rule.maxLength) {
    return `${rule.label} must be ${rule.maxLength} characters or less`;
  }

  // Pattern
  if (rule.pattern && !rule.pattern.test(strVal)) {
    return rule.patternMessage || `${rule.label} format is invalid`;
  }

  // Check for numeric fields - validate format
  if ((name === "duration" || name === "price") && strVal) {
    const numericPattern = /^[0-9]*\.?[0-9]*$/;
    if (!numericPattern.test(strVal)) {
      return `${rule.label} can only contain numbers and decimal point`;
    }
  }

  // Numeric min/max
  if (rule.min !== undefined || rule.max !== undefined) {
    const num = parseFloat(strVal);
    if (isNaN(num)) return `${rule.label} must be a number`;
    if (rule.min !== undefined && num < rule.min)
      return `${rule.label} must be at least ${rule.min}`;
    if (rule.max !== undefined && num > rule.max)
      return `${rule.label} must be at most ${rule.max}`;
  }

  return null;
}

/**
 * Validate the entire form data object.
 * @param {object} formData - flat object of field values
 * @returns {{ isValid: boolean, errors: object }}
 */
export function validateCourseForm(formData) {
  const errors = {};
  Object.keys(VALIDATION_RULES).forEach((field) => {
    const error = validateField(field, formData[field]);
    if (error) errors[field] = error;
  });
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
