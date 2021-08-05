import nock from 'nock';
import { WebSocket, Server } from 'mock-socket';

process.on('uncaughtException', error => {
  if (error.message.includes('mockwebsocket')) return;
  console.log('UNCAUGHT EXCEPTION - keeping process alive:', error);
});

/**
 * HTTP Requests
 *
 * We should not allow external http requests from tests
 * All http requests should be mocked with expected responses
 * See nock docs for details: https://github.com/nock/nock
 */
nock.disableNetConnect();
// Enable for mocked websockets
nock.enableNetConnect('mockwebsocket');

/**
 * WebSockets
 *
 * Our websocket providers get initiated on class instantiation
 * so we need to mock a websocket server locally and use in
 * network config.
 * See mock-socket for details: https://github.com/thoov/mock-socket
 */
window.WebSocket = WebSocket;

const mockServer = new Server('ws://mockwebsocket:1234');

mockServer.on('connection', socket => {
  console.log('WS COPNNNECT');
  socket.on('message', () => 'Default message');
  socket.on('close', () => 'Default close');

  socket.send('message');
  socket.close();
});
