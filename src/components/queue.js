/** Queue */

'use strict';

/* Local variables -----------------------------------------------------------*/

const reservedBytes = 4;

/* Methods -------------------------------------------------------------------*/

function Queue(scope, profile, wrap) {

  const baseBytes = scope.name.split('').length + reservedBytes;

  function initTimer() {
    if ((profile.tick > 0 || profile.tick === 0) && scope.timer === null) {
      scope.timer = setTimeout(step, profile.tick);
    }
  }

  function resetTimer() {
    if (scope.timer !== null) {
      clearTimeout(scope.timer);
      scope.timer = null;
    }
  }

  function reset() {
    resetTimer();
    scope.packets.length = 0;
    scope.bytes = 0;
    scope.frame = scope.frame + 1;
  }
  
  function add(packet) {
    scope.packets.push(packet);
    scope.bytes += packet.length;
    
    if (checkSize()) {
      initTimer();
    }
  }

  function checkSize() {
    if (profile.maxBytes !== null && profile.maxBytes !== undefined) {
      if (bytes() >= profile.maxBytes) {
        step();
        return false;
      }
    }
    return true;
  }

  function bytes() {
    return scope.bytes + scope.packets.length * 2 + baseBytes;
  }
  
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