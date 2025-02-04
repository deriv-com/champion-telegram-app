/**
 * Simple schema validator for API requests and responses
 */
export class Validator {
  /**
   * Validate value against schema
   * @param {Object} schema Schema definition
   * @param {Object} value Value to validate
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  static validate(schema, value) {
    if (!value || typeof value !== 'object') {
      throw new Error('Value must be an object');
    }

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in value)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }

    // Validate properties
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (key in value) {
          this.validateProperty(prop, value[key], key);
        }
      }
    }

    return true;
  }

  /**
   * Validate property against schema
   * @param {Object} schema Property schema
   * @param {*} value Property value
   * @param {string} path Property path for error messages
   * @throws {Error} If validation fails
   * @private
   */
  static validateProperty(schema, value, path) {
    // Skip validation if value is undefined/null and not required
    if (value === undefined || value === null) {
      return;
    }

    // Handle array of types
    if (Array.isArray(schema.type)) {
      const isValid = schema.type.some(type => this._validateType(type, value, schema, path));
      if (!isValid) {
        throw new Error(`${path} must be one of types: ${schema.type.join(', ')}`);
      }
      return;
    }

    // Validate single type
    this._validateType(schema.type, value, schema, path);
  }

  /**
   * Validate value against a specific type
   * @param {string} type Type to validate against
   * @param {*} value Value to validate
   * @param {Object} schema Full property schema
   * @param {string} path Property path for error messages
   * @returns {boolean} True if valid
   * @private
   */
  static _validateType(type, value, schema, path) {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`${path} must be a string`);
        }
        // Validate enum if specified
        if (schema.enum && !schema.enum.includes(value)) {
          throw new Error(`${path} must be one of: ${schema.enum.join(', ')}`);
        }
        return true;

      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`${path} must be a number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`${path} must be a boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`${path} must be an array`);
        }
        // Validate array items if schema specified
        if (schema.items) {
          value.forEach((item, index) => {
            this.validateProperty(schema.items, item, `${path}[${index}]`);
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error(`${path} must be an object`);
        }
        // Validate nested object
        if (schema.properties) {
          this.validate(schema, value);
        }
        break;
    }
  }

  /**
   * Validate request against endpoint schema
   * @param {Object} endpoint API endpoint definition
   * @param {Object} request Request object
   * @returns {Object} Validated request object
   * @throws {Error} If validation fails
   */
  static validateRequest(endpoint, request) {
    try {
      this.validate(endpoint.requestSchema, request);
      return request;
    } catch (error) {
      throw new Error(`Invalid request: ${error.message}`);
    }
  }

  /**
   * Validate response against endpoint schema
   * @param {Object} endpoint API endpoint definition
   * @param {Object} response Response object
   * @returns {Object} Validated response object
   * @throws {Error} If validation fails
   */
  static validateResponse(endpoint, response) {
    try {
      this.validate(endpoint.responseSchema, response);
      return response;
    } catch (error) {
      throw new Error(`Invalid response: ${error.message}`);
    }
  }
}
