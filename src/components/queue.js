/** 
 * Queue 
 * @namespace Queue
 */

'use strict';

/* Local variables -----------------------------------------------------------*/

const reservedBytes = 4;

/* Methods -------------------------------------------------------------------*/

/**
 * @private
 * @param {object} scope Reference to the Client scope
 * @param {object} profile Shortcut to the Client Profile settings
 * @param {function} wrap Action to perform when Profile predicates are met
 * @returns {object} The new Queue
 */
function Queue(scope, profile, wrap) {

  const baseBytes = scope.name.split('').length + reservedBytes;
  const sizeBased = (profile.maxBytes !== null && profile.maxBytes !== undefined);

  /** @private */
  function initTimer() {
    if (scope.timer === null && profile.tick !== null) {
      if (profile.tick < 0) step();
      else if (profile.tick >= 0) scope.timer = setTimeout(step, profile.tick);
    }
  }

  /** @private */
  function resetTimer() {
    if (scope.timer !== null) {
      clearTimeout(scope.timer);
      scope.timer = null;
    }
  }

  /**
   * Resets the queue
   * @memberof Queue
   */
  function reset() {
    resetTimer();
    scope.packets.length = 0;
    scope.bytes = 0;
    scope.frame = scope.frame + 1;
  }
  
  /**
   * Appends a packet to the queue and runs the checks based on the profile settings
   * @memberof Queue
   * @param {array} packet A buffer/UInt8Array containing a serialized message
   */
  function add(packet) {
    scope.packets.push(packet);
    scope.bytes += packet.length;
    
    if (sizeBased === false || (sizeBased === true && checkSize())) {
      initTimer();
    }
  }

  /** @private */
  function checkSize() {
    if (bytes() >= profile.maxBytes) {
      step();
      return false;
    }
    return true;
  }

  /**
   * Get the current size (in bytes) of the queue
   * @memberof Queue
   * @returns {number} The queue size
   */
  function bytes() {
    return scope.bytes + (scope.packets.length * 2) + baseBytes;
  }
  
  /**
   * Calls the Action method and resets the queue
   * @memberof Queue
   */
  function step() {
    if (scope.packets.length > 0) {
      wrap(scope, scope.packets);
    }
    reset();
  }

  return { add, step, reset, bytes };
}

/* Exports -------------------------------------------------------------------*/

module.exports = Queue;