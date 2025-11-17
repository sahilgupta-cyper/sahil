const http = require('http');
const WebSocket = require('ws');

function getDevtoolsList() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const list = await getDevtoolsList();
    if (!list || list.length === 0) {
      console.error('No devtools targets');
      process.exit(1);
    }
    const wsUrl = list[0].webSocketDebuggerUrl;
    console.log('WS URL:', wsUrl);
    const ws = new WebSocket(wsUrl);
    let id = 1;
    ws.on('open', () => {
      console.log('connected');
      ws.send(JSON.stringify({id: id++, method: 'Runtime.evaluate', params: {expression: "document.documentElement.getAttribute('data-theme')", returnByValue: true}}));
      ws.send(JSON.stringify({id: id++, method: 'Runtime.evaluate', params: {expression: "window.getComputedStyle(document.documentElement).backgroundColor", returnByValue: true}}));
      ws.send(JSON.stringify({id: id++, method: 'Runtime.evaluate', params: {expression: "window.getComputedStyle(document.body).backgroundColor", returnByValue: true}}));
      ws.send(JSON.stringify({id: id++, method: 'Runtime.evaluate', params: {expression: "window.getComputedStyle(document.body).color", returnByValue: true}}));
    });
    ws.on('message', msg => {
      try { const obj = JSON.parse(msg.toString()); console.log(JSON.stringify(obj, null, 2)); } catch(e) { console.log('non-json', msg.toString()); }
    });
    ws.on('error', e => { console.error('ws error', e); process.exit(1); });
  } catch (err) {
    console.error('err', err);
    process.exit(1);
  }
})();
