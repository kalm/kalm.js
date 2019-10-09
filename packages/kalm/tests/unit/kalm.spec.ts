import kalm from '../../src/kalm';

const bindSpy = jest.fn();
const connectSpy = jest.fn();
const mockTransport = () => () => ({ bind: bindSpy, connect: connectSpy });

describe('Kalm constructors', () => {
  describe('#listen', () => {
    let server;

    it('should throw an error if no transports are provided', () => {
      expect(kalm.listen).toThrow();
    });

    it('listen should bind to a transport if one is provided', () => {
      server = kalm.listen({ transport: mockTransport() });
      expect(bindSpy).toHaveBeenCalled();
    });

    it('should return an object with all the required fields', () => {
      expect(server).toHaveProperty('label');
    });
  });

  describe('#connect', () => {
    let client;

    it('should throw an error if no transports are provided', () => {
      expect(kalm.connect).toThrow();
    });

    it('listen should connect via a transport if one is provided', () => {
      client = kalm.connect({ transport: mockTransport() });
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should return an object with all the required fields', () => {
      expect(client).toHaveProperty('label');
    });
  });
});
