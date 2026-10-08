/**
 * MathUtils - Mathematical & Physics Calculation Utilities
 * High-performance helpers for smooth interpolations, angles, and bounds.
 */
export class MathUtils {
  /**
   * Linear Interpolation
   * @param {number} start 
   * @param {number} end 
   * @param {number} factor (0 - 1)
   * @returns {number}
   */
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Clamp value between min and max
   * @param {number} val 
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Map a value from one range to another
   * @param {number} value 
   * @param {number} inMin 
   * @param {number} inMax 
   * @param {number} outMin 
   * @param {number} outMax 
   * @returns {number}
   */
  static mapRange(value, inMin, inMax, outMin, outMax) {
    if (inMax - inMin === 0) return outMin;
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  /**
   * Euclidean Distance between two points
   * @param {number} x1 
   * @param {number} y1 
   * @param {number} x2 
   * @param {number} y2 
   * @returns {number}
   */
  static dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.hypot(dx, dy);
  }

  /**
   * Angle in radians between two points
   * @param {number} x1 
   * @param {number} y1 
   * @param {number} x2 
   * @param {number} y2 
   * @returns {number}
   */
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Random float between min and max
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Random integer between min and max (inclusive)
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
