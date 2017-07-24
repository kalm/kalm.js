/* QueueList */

'use strict';

/* Requires ------------------------------------------------------------------*/

const Queue = require('./queue');

/* Methods -------------------------------------------------------------------*/

function QueueList(scope) {

  /**
   * Creates a new named Queue
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
   * Force-triggers all named Queues
   * @memberof Client
   */
  function flush() {
    for (let channel in scope.queues) {
      scope.queues[channel].step();
    }
  }

  return { queues: {}, queue, flush };
}

/* Exports -------------------------------------------------------------------*/

module.exports = QueueList;