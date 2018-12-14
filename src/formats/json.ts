/**
 * TODO: Add unit tests for special characters
 */

/* Requires ------------------------------------------------------------------*/

import { Serializer, Serializable, Format, ByteList } from '../types';
import { EventEmitter } from 'events';

/* Methods -------------------------------------------------------------------*/

function json(): Format {
  return function serializer(params: object, emitter: EventEmitter): Serializer {

    async function encode(payload: Serializable): Promise<ByteList> {
      return (Buffer.isBuffer(payload)) ? payload : toUInt8Array(JSON.stringify(payload));
    }

    async function decode(payload: ByteList): Promise<Serializable> {
      return JSON.parse(String.fromCharCode.apply(null, payload));
    }

    function toUInt8Array(str: string): number[] {
      return [...str].map(c => c.charCodeAt(0) | 0);
    }

    return { encode, decode };
  };
}

/* Exports -------------------------------------------------------------------*/

export default json;
