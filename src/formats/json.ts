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
      return Buffer.from(JSON.stringify(payload));
    }

    async function decode(payload: ByteList): Promise<Serializable> {
      return JSON.parse(payload.toString());
    }

    return { encode, decode };
  };
}

/* Exports -------------------------------------------------------------------*/

export default json;
