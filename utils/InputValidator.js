/**
 * 输入验证和过滤工具类
 * 提供前端输入验证和过滤功能
 */
const logger = require('./Logger.js');

class InputValidator {
  /**
   * 验证字符串长度
   * @param {string} value - 要验证的字符串
   * @param {number} min - 最小长度
   * @param {number} max - 最大长度
   * @returns {boolean} 验证结果
   */
  static validateStringLength(value, min, max) {
    if (typeof value !== 'string') {
      return false;
    }
    
    const length = value.length;
    return length >= min && length <= max;
  }
  
  /**
   * 验证字符串是否包含非法字符
   * @param {string} value - 要验证的字符串
   * @returns {boolean} 验证结果
   */
  static validateSafeString(value) {
    if (typeof value !== 'string') {
      return false;
    }
    
    // 检查是否包含潜在的恶意字符
    const unsafePatterns = [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /expression\(/i
    ];
    
    for (const pattern of unsafePatterns) {
      if (pattern.test(value)) {
        logger.warn('Unsafe string detected', { value, pattern: pattern.toString() });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 过滤字符串中的HTML标签
   * @param {string} value - 要过滤的字符串
   * @returns {string} 过滤后的字符串
   */
  static stripHtmlTags(value) {
    if (typeof value !== 'string') {
      return '';
    }
    
    return value.replace(/<[^>]*>/g, '');
  }
  
  /**
   * 转义HTML特殊字符
   * @param {string} value - 要转义的字符串
   * @returns {string} 转义后的字符串
   */
  static escapeHtml(value) {
    if (typeof value !== 'string') {
      return '';
    }
    
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return value.replace(/[&<>"'\/]/g, (match) => htmlEntities[match]);
  }
  
  /**
   * 验证数字范围
   * @param {number} value - 要验证的数字
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {boolean} 验证结果
   */
  static validateNumberRange(value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }
    
    return value >= min && value <= max;
  }
  
  /**
   * 验证整数
   * @param {any} value - 要验证的值
   * @returns {boolean} 验证结果
   */
  static validateInteger(value) {
    return Number.isInteger(value);
  }
  
  /**
   * 验证邮箱格式
   * @param {string} email - 要验证的邮箱
   * @returns {boolean} 验证结果
   */
  static validateEmail(email) {
    if (typeof email !== 'string') {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * 验证手机号格式
   * @param {string} phone - 要验证的手机号
   * @returns {boolean} 验证结果
   */
  static validatePhone(phone) {
    if (typeof phone !== 'string') {
      return false;
    }
    
    // 简单的手机号验证（中国手机号）
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * 验证URL格式
   * @param {string} url - 要验证的URL
   * @returns {boolean} 验证结果
   */
  static validateUrl(url) {
    if (typeof url !== 'string') {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * 验证JSON字符串
   * @param {string} jsonString - 要验证的JSON字符串
   * @returns {boolean} 验证结果
   */
  static validateJson(jsonString) {
    if (typeof jsonString !== 'string') {
      return false;
    }
    
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * 综合验证游戏配置键名
   * @param {string} configKey - 配置键名
   * @returns {object} 验证结果
   */
  static validateGameConfigKey(configKey) {
    const result = {
      isValid: true,
      errors: []
    };
    
    // 检查是否为空
    if (!configKey || configKey.trim() === '') {
      result.isValid = false;
      result.errors.push('配置键名不能为空');
    }
    
    // 检查长度
    if (!this.validateStringLength(configKey, 1, 100)) {
      result.isValid = false;
      result.errors.push('配置键名长度必须在1-100个字符之间');
    }
    
    // 检查是否包含非法字符
    if (!this.validateSafeString(configKey)) {
      result.isValid = false;
      result.errors.push('配置键名包含非法字符');
    }
    
    // 检查是否只包含字母、数字、下划线和点
    const keyRegex = /^[a-zA-Z0-9_.]+$/;
    if (!keyRegex.test(configKey)) {
      result.isValid = false;
      result.errors.push('配置键名只能包含字母、数字、下划线和点');
    }
    
    return result;
  }
  
  /**
   * 综合验证游戏配置值
   * @param {any} configValue - 配置值
   * @param {string} configType - 配置类型
   * @returns {object} 验证结果
   */
  static validateGameConfigValue(configValue, configType) {
    const result = {
      isValid: true,
      errors: []
    };
    
    switch (configType) {
      case 'string':
        if (typeof configValue !== 'string') {
          result.isValid = false;
          result.errors.push('配置值必须是字符串类型');
        } else if (!this.validateStringLength(configValue, 0, 1000)) {
          result.isValid = false;
          result.errors.push('字符串配置值长度不能超过1000个字符');
        } else if (!this.validateSafeString(configValue)) {
          result.isValid = false;
          result.errors.push('字符串配置值包含非法字符');
        }
        break;
        
      case 'integer':
        const intValue = parseInt(configValue, 10);
        if (isNaN(intValue)) {
          result.isValid = false;
          result.errors.push('配置值必须是整数类型');
        } else if (!this.validateNumberRange(intValue, -2147483648, 2147483647)) {
          result.isValid = false;
          result.errors.push('整数配置值超出有效范围');
        }
        break;
        
      case 'float':
        const floatValue = parseFloat(configValue);
        if (isNaN(floatValue)) {
          result.isValid = false;
          result.errors.push('配置值必须是浮点数类型');
        } else if (!isFinite(floatValue)) {
          result.isValid = false;
          result.errors.push('浮点数配置值无效');
        }
        break;
        
      case 'boolean':
        if (configValue !== true && configValue !== false && configValue !== 'true' && configValue !== 'false') {
          result.isValid = false;
          result.errors.push('配置值必须是布尔类型');
        }
        break;
        
      case 'json':
        if (typeof configValue !== 'string') {
          result.isValid = false;
          result.errors.push('JSON配置值必须是字符串类型');
        } else if (!this.validateJson(configValue)) {
          result.isValid = false;
          result.errors.push('JSON配置值格式无效');
        } else if (configValue.length > 5000) {
          result.isValid = false;
          result.errors.push('JSON配置值长度不能超过5000个字符');
        }
        break;
        
      default:
        result.isValid = false;
        result.errors.push('不支持的配置类型');
    }
    
    return result;
  }
  
  /**
   * 过滤和清理游戏配置数据
   * @param {object} configData - 配置数据
   * @returns {object} 清理后的配置数据
   */
  static sanitizeGameConfig(configData) {
    const sanitized = {};
    
    // 过滤配置键名
    if (configData.config_key) {
      sanitized.config_key = this.stripHtmlTags(configData.config_key).trim();
    }
    
    // 过滤配置名称
    if (configData.config_name) {
      sanitized.config_name = this.stripHtmlTags(configData.config_name).trim();
    }
    
    // 过滤配置值（根据类型处理）
    if (configData.config_value !== undefined) {
      if (configData.config_type === 'string' || configData.config_type === 'json') {
        sanitized.config_value = this.stripHtmlTags(configData.config_value);
      } else {
        sanitized.config_value = configData.config_value;
      }
    }
    
    // 过滤配置类型
    if (configData.config_type) {
      sanitized.config_type = configData.config_type;
    }
    
    // 过滤描述
    if (configData.description) {
      sanitized.description = this.stripHtmlTags(configData.description).trim();
    }
    
    // 过滤状态
    if (configData.status !== undefined) {
      sanitized.status = configData.status;
    }
    
    return sanitized;
  }
}

module.exports = InputValidator;