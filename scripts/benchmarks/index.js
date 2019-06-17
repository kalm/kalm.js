/**
 * Kalm benchmarking
 */

/* Requires ------------------------------------------------------------------*/

const Kalm = require('./transports/kalm');
const TCP = require('./transports/tcp');
const IPC = require('./transports/ipc');
const UDP = require('./transports/udp');
const WS = require('./transports/socketio');
const settings = require('./settings');

/* Local variables -----------------------------------------------------------*/

const _maxCount = null;
let _curr = 0;
const Suite = { IPC, TCP, UDP, WS };
const tests = [];
const results = {};

/* Methods -------------------------------------------------------------------*/

function _measure(transport, resolve) {
  _curr = 0;
  transport.setup(() => {
    setTimeout(() => {
      transport.stop(() => {
        transport.teardown(resolve);
      });
    }, settings.testDuration);

    function _repeat() {
      if (_maxCount !== null) {
        if (_curr >= _maxCount) return;
        _curr++;
      }
      setImmediate(() => {
        transport.step(_repeat);
      });
    }

    _repeat();
  });
}

function _updateSettings(obj, resolve) {
  settings.transport = obj.transport || settings.transport;
  resolve();
}

function _errorHandler(err) {
  console.error(err); /* eslint-disable-line */
  process.exit(1);
}

function _postResults() {
  console.log(JSON.stringify(results)); /* eslint-disable-line */
  // Do something with the info
  process.exit();
}

/* Init ----------------------------------------------------------------------*/


// Roll port number
settings.port = 3000 + Math.round(Math.random() * 1000);

const adpts = Object.keys(Suite).map(k => ({
  transport: k,
  settings: { transport: k.toLowerCase() },
  raw: Suite[k],
  kalm: Kalm,
}));

adpts.forEach((i) => {
  tests.push((resolve) => {
    // console.log('Configuring ' + i.transport);
    _updateSettings(i.settings, resolve);
  });

  tests.push((resolve) => {
    // console.log('Measuring raw ' + i.transport);
    _measure(i.raw, (total) => {
      results[`raw_${i.transport}`] = total;
      resolve();
    });
  });

  tests.push((resolve) => {
    // console.log('Measuring Kalm ' + i.transport);
    _measure(i.kalm, (total) => {
      results[`kalm_${i.transport}`] = total;
      resolve();
    });
  });
});

tests.push(_postResults);

tests.reduce(
  (c, n) => c.then(resolve => new Promise(n).then(resolve, _errorHandler), _errorHandler),
  Promise.resolve(),
);
