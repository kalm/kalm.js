/**
 * TODO: Add unit tests for special characters
 */

/* Requires ------------------------------------------------------------------*/

import { Serializer, Serializable, Format, ByteList } from '../types';
import { EventEmitter } from 'events';

/* Methods -------------------------------------------------------------------*/

function json(): Format {
  return function serializer(params: object, emitter: EventEmitter): Serializer {

    function encode(payload: Serializable): ByteList {
      return (Buffer.isBuffer(payload)) ? payload : toUInt8Array(JSON.stringify(payload));
    }

    function decode(payload: ByteList): Serializable {
      return JSON.parse(String.fromCharCode.apply(null, payload));
    }

    function toUInt8Array(str: string): number[] {
      const chars: number[] = [0];
      for (let i = 0; i < str.length; i++) {
        chars[i] = str.charCodeAt(i) | 0;
      }

      return chars;
    }

    return { encode, decode };
  };
}

/* Exports -------------------------------------------------------------------*/

export default json;
