/* Methods -------------------------------------------------------------------*/

function Encrypter(key) {
  const seed: number = Number(_toUint8(key).join(''));
  const outMap: number[] = _mapKeyOut(String(key));
  const inMap: number[] = _mapKeyIn(String(key));

  function encrypt(bytes: number[]): number[] {
    return bytes.map(byte => inMap[byte]);
  }

  function decrypt(bytes: number[]): number[] {
    return bytes.map(byte => outMap[byte]);
  }

  function _mapKeyIn(key: string): number[] {
    const list: number[] = [0];
    const dict: number[] = [0];

    for (let i = 0; i < 256; i++) {
      const temp: number = list[i] || i;
      const rand: number = (seed % (i+1) + i) % 256;
      list[i] = list[rand] || rand;
      list[rand] = temp;
    }

    list.forEach((val, index) => dict[val] = index);

    return dict;
  }

  function _mapKeyOut(key: string): number[] {
    const dict: number[] = [0];

    for (let i = 0; i < 256; i++) {
      const temp: number = dict[i] || i;
      const rand: number = (seed % (i+1) + i) % 256;
      dict[i] = dict[rand] || rand;
      dict[rand] = temp;
    }

    return dict;
  }

  function _toUint8(str: string): number[] {
    return `${str}`.split('')
      .map(char => char.charCodeAt(0));
  }

  return { encrypt, decrypt };
}

/* Exports -------------------------------------------------------------------*/

export default Encrypter;
