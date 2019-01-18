const expect = require('chai').expect;
const sinon = require('sinon');
const kalm = require('../../bin/kalm');

const bindSpy = sinon.spy();
const connectSpy = sinon.spy();
const mockTransport = () => () => ({ bind: bindSpy, connect: connectSpy });

describe('Kalm constructors', () => {
    describe('#listen', () => {
        let server;

        it('should throw an error if no transports are provided', () => {
            expect(kalm.listen).to.throw();
        });

        it('listen should bind to a transport if one is provided', () => {
            server = kalm.listen({ transport: mockTransport() });
            expect(bindSpy.called).to.be.true;
        });

        it('should return an object with all the required fields', () => {
            expect(server).to.have.property('label');
        });
    });
    
    describe('#connect', () => {
        let client;

        it('should throw an error if no transports are provided', () => {
            expect(kalm.connect).to.throw();
        });

        it('listen should connect via a transport if one is provided', () => {
            client = kalm.connect({ transport: mockTransport() });
            expect(connectSpy.called).to.be.true;
        });
    
        it('should return an object with all the required fields', () => {
            expect(client).to.have.property('label');
        });
    });
});