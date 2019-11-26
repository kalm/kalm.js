/**
 * Event Emitter
 * 
 * Taken from https://github.com/developit/mitt/blob/master/src/index.js
 */

type WildCardEventHandler = (type: string, event?: any) => void

type EventHandlerList = Array<EventHandler>;
type WildCardEventHandlerList = Array<WildCardEventHandler>;
type EventHandlerMap = {
  '*'?: WildCardEventHandlerList,
  [type: string]: EventHandlerList,
};

export default function EventEmitter(all?: EventHandlerMap) {
  all = all || Object.create(null);

  return {
  	on(type: string, handler: EventHandler) {
  	  (all[type] || (all[type] = [])).push(handler);
  	},
  	off(type: string, handler: EventHandler) {
  	  if (all[type]) {
  	  	all[type].splice(all[type].indexOf(handler) >>> 0, 1);
  	  }
  	},
  	emit(type: string, evt?: any, evt2?: any) {
  	  (all[type] || []).slice().map((handler) => { handler(evt, evt2); });
    },
    removeAllListeners(type?: string) {
      if (type) all[type] = [];
      else all = Object.create(null);
    },
    listenerCount(type?: string): number {
      if (type) return (all[type] || []).length;
      return Object.keys(all).reduce((acc, key) => acc + key.length, 0);
    }
  };
}