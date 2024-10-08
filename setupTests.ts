import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = require('util').TextDecoder; // Node.js provides TextDecoder
}

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder; // Node.js provides TextEncoder
}