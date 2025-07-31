import * as kalm from './transports/kalm.ts';
import * as ipc from './transports/ipc.ts';
import * as tcp from './transports/tcp.ts';
import * as udp from './transports/udp.ts';
import * as ws from './transports/socketio.ts';
import settings from './settings.ts';

const _maxCount = null;
let _curr = 0;
const Suite = { ipc, tcp, udp, ws };
const tests: any[] = [];
const results = {};

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
  console.error(err);
  process.exit(1);
}

function _postResults() {
  console.log(JSON.stringify(results));
  // Do something with the info
  process.exit();
}

// Roll port number
settings.port = 3000 + Math.round(Math.random() * 1000);

const adpts = Object.keys(Suite).map(k => ({
  transport: k,
  settings: { transport: k.toLowerCase() },
  raw: Suite[k],
  kalm,
}));

adpts.forEach((i) => {
  tests.push((resolve) => {
    console.log('Configuring ' + i.transport);
    _updateSettings(i.settings, resolve);
  });

  tests.push((resolve) => {
    console.log('Measuring raw ' + i.transport);
    _measure(i.raw, (total) => {
      results[`raw_${i.transport}`] = total;
      resolve();
    });
  });

  tests.push((resolve) => {
    console.log('Measuring Kalm ' + i.transport);
    _measure(i.kalm, (total) => {
      results[`kalm_${i.transport}`] = total;
      resolve();
    });
  });
});

tests.push(_postResults);

console.log(`Launching benchmarks for ${settings.testDuration / 1000} second(s) -- MAKE SURE THAT YOU BUILD THE CODE FIRST --`);

tests.reduce(
  (c, n) => c.then(resolve => new Promise(n).then(resolve, _errorHandler), _errorHandler),
  Promise.resolve(),
);
