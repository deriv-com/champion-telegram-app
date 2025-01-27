import { ERROR_CODES } from '@/constants/error.constants';
import { AppError } from './error';

export const validators = {
  required: (value, fieldName = 'Field') => {
    if (value === undefined || value === null || value === '') {
      throw new AppError(
        ERROR_CODES.REQUIRED_FIELD,
        `${fieldName} is required`
      );
    }
    return true;
  },

  minLength: (value, min, fieldName = 'Field') => {
    if (value.length < min) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `${fieldName} must be at least ${min} characters`
      );
    }
    return true;
  },

  maxLength: (value, max, fieldName = 'Field') => {
    if (value.length > max) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `${fieldName} must not exceed ${max} characters`
      );
    }
    return true;
  },

  email: (value, fieldName = 'Email') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `${fieldName} is not valid`
      );
    }
    return true;
  },

  numeric: (value, fieldName = 'Field') => {
    if (isNaN(value)) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `${fieldName} must be a number`
      );
    }
    return true;
  },

  min: (value, min, fieldName = 'Field') => {
    if (Number(value) < min) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `${fieldName} must be at least ${min}`
      );
    }
    return true;
  },

  max: (value, max, fieldName = 'Field') => {
    if (Number(value) > max) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `${fieldName} must not exceed ${max}`
      );
    }
    return true;
  },
};

export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    try {
      const fieldRules = rules[field];
      const value = data[field];

      fieldRules.forEach((rule) => {
        if (typeof rule === 'function') {
          rule(value, field);
        } else if (Array.isArray(rule)) {
          const [validator, ...params] = rule;
          validator(value, ...params, field);
        }
      });
    } catch (error) {
      if (error.isAppError) {
        errors[field] = error.message;
      } else {
        errors[field] = 'Validation failed';
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Form validation failed', errors);
  }

  return true;
};

// Example usage:
// const formRules = {
//   username: [
//     validators.required,
//     [validators.minLength, 3],
//     [validators.maxLength, 20],
//   ],
//   email: [
//     validators.required,
//     validators.email,
//   ],
//   amount: [
//     validators.required,
//     validators.numeric,
//     [validators.min, 0],
//     [validators.max, 1000000],
//   ],
// };
//
// try {
//   validateForm(formData, formRules);
//   // Form is valid
// } catch (error) {
//   // error.details contains field-specific error messages
// }
