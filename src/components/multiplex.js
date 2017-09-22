/* Multiplex */

'use strict';

/* Methods -------------------------------------------------------------------*/

function Multiplexed(scope) {

  /**
   * Subscribes to a queue
   * @memberof Client
   * @param {string} name The name of the channel.
   * @param {function} handler The handler to add to the channel
   * @returns {Client} The client, for chaining
   */
  function subscribe(name, handler) {
    scope.channels[name] = (scope.channels[name] || []);
    scope.channels[name].push(handler);
    return scope;
  }

  /**
   * Unsubscribes from a queue
   * @memberof Client
   * @param {string} name The name of the channel.
   * @param {function} handler The handler to remove from the channel
   * @returns {Client} The client, for chaining
   */
  function unsubscribe(name, handler) {
    scope.channels[name] = (scope.channels[name] || [])
      .filter((event) => event !== handler && handler !== undefined);
    return scope;
  }

  /** @private */
  function trigger(name, params) {
    (scope.channels[name] || [])
      .forEach((handler) => handler(params));
  }

  return { subscribe, unsubscribe, trigger, channels: {} };
}

/* Exports -------------------------------------------------------------------*/

module.exports = Multiplexed;