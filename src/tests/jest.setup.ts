import nock from 'nock';
import { WebSocket, Server } from 'mock-socket';

/**
 * HTTP Requests
 *
 * We should not allow external http requests from tests
 * All http requests should be mocked with expected responses
 * See nock docs for details: https://github.com/nock/nock
 */
nock.disableNetConnect();
// Enable for mocked websockets
// nock.enableNetConnect('127.0.0.1');
nock(/127.0.0.1/)
  .get('/')
  .reply(101);

/**
 * WebSockets
 *
 * Our websocket providers get initiated on class instantiation
 * so we need to mock a websocket server locally and use in
 * network config.
 * See mock-socket for details: https://github.com/thoov/mock-socket
 */
window.WebSocket = WebSocket;

const mockServer = new Server('ws://127.0.0.1:1234');

mockServer.on('connection', socket => {
  console.log('WS COPNNNECT');
  socket.on('message', () => 'Default message');
  socket.on('close', () => 'Default close');

  socket.send('message');
  socket.close();
});
