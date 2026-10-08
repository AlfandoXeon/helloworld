/**
 * DomUtils - Lightweight DOM Manipulation and Query Helpers
 */
export class DomUtils {
  /**
   * Query single element
   * @param {string} selector 
   * @param {Element|Document} [scope=document] 
   * @returns {Element|null}
   */
  static $(selector, scope = document) {
    return scope.querySelector(selector);
  }

  /**
   * Query all elements
   * @param {string} selector 
   * @param {Element|Document} [scope=document] 
   * @returns {NodeListOf<Element>}
   */
  static $$(selector, scope = document) {
    return scope.querySelectorAll(selector);
  }

  /**
   * Create element with class and optional attributes
   * @param {string} tag 
   * @param {string} [className=''] 
   * @param {Object} [attributes={}] 
   * @returns {HTMLElement}
   */
  static create(tag, className = '', attributes = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    for (const [key, value] of Object.entries(attributes)) {
      el.setAttribute(key, value);
    }
    return el;
  }

  /**
   * Set multiple inline styles safely
   * @param {HTMLElement} element 
   * @param {Object} styles 
   */
  static setStyles(element, styles) {
    if (!element || !element.style) return;
    Object.assign(element.style, styles);
  }
}
