/** Queue manager */

'use strict';

/* Local variables -----------------------------------------------------------*/

const reservedBytes = 4;

/* Methods -------------------------------------------------------------------*/

function QueueManager(scope) {

  /** 
   * @memberof Client
   */
  function queue(name, wrap) {
    if (scope.queues.hasOwnProperty(name)) return scope.queues[name];

    scope.queues[name] = Queue({ 
      name,
      frame: 0,
      packets: [],
      timer: null,
      bytes: 0
    }, scope.profile, wrap);

    return scope.queues[name];
  }
  
  /** 
   * @memberof Client
   */
  function flush() {
    for (let channel in scope.queues) {
      scope.queues[channel].step();
    }
  }

  return { queues: {}, queue, flush };
}

function Queue(scope, profile, wrap) {
  if (profile.tick > 0) scope.timer = setInterval(step, profile.tick);
  
  function add(packet) {
    if (profile.maxBytes !== null && profile.maxBytes !== undefined) {
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
      wrap(scope, scope.packets);
      scope.packets.length = 0;
      scope.bytes = 0;
      scope.frame = scope.frame + 1;
    }
  }

  return { add, step };
}

/* Exports -------------------------------------------------------------------*/

module.exports = QueueManager;