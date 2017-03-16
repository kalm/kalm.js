/** Queue manager */

'use strict';

/* Local variables -----------------------------------------------------------*/

const reservedBytes = 4;

/* Methods -------------------------------------------------------------------*/

function QueueManager(scope) {

  /** 
   * @memberof QueueManager
   */
  function queue(name, profile) {
    if (scope.queues.hasOwnProperty(name)) return scope.queues[name];

    scope.queues[name] = Queue({ 
      name,
      frame: 0,
      packets: [],
      timer: null,
      bytes: 0
    }, profile || scope.profile, scope.wrap);

    return scope.queues[name];
  }

  return { queues: {}, queue };
}

function Queue(scope, profile, wrap) {
  if (profile.tick !== null) scope.timer = setInterval(step, profile.tick);
  
  function add(packet) {
    if (profile.maxBytes !== null) {
      if (bytes() + packet.length > profile.maxBytes) step();
      scope.packets.push(packet);
      scope.bytes += packet.length;
    }
    else scope.packets.push(packet);
  }

  function bytes() {
    return scope.bytes + scope.packets.length * 2 + scope.name.split('').length + reservedBytes;
  }
  
  function step() {
    if (scope.packets.length > 0) {
      wrap(scope, scope.packets.concat());
      scope.packets.length = 0;
      scope.bytes = 0;
      scope.frame++;
    }
  }

  return { add, step };
}

/* Exports -------------------------------------------------------------------*/

module.exports = QueueManager;