const path = require('path');
const dotenv = require('dotenv');

describe('authUtils tests', () => {
  let checkAllowedIP, normalizeIP;

  beforeAll(() => {
    process.env.ALLOWED_IPS = '127.0.0.1,1.2.3.4';
  });

  afterAll(() => {
    delete process.env.ALLOWED_IPS;
  });

  beforeEach(() => {
    jest.resetModules();
    ({ checkAllowedIP, normalizeIP } = require('../authUtils'));
  });

  const createMockRequest = ({ ip = '127.0.0.1' } = {}) => ({
    headers: {
      'x-forwarded-for': ip,
    },
    ip,
    socket: {
      destroy: jest.fn(),
    },
  });

  describe('checkAllowedIP Middleware', () => {
    let req;
    let next;

    beforeEach(() => {
      next = jest.fn();
    });

    test('Allowed IP → Should pass (allow access)', () => {
      req = createMockRequest({ ip: '1.2.3.4' });

      checkAllowedIP(req, {}, next);
      // Should call next()
      expect(next).toHaveBeenCalled();
      // Should not destroy the socket
      expect(req.socket.destroy).not.toHaveBeenCalled();
    });

    test('Disallowed IP → Should not pass (deny access)', () => {
      req = createMockRequest({ ip: '8.8.8.8' });

      checkAllowedIP(req, {}, next);
      // Should not call next()
      expect(next).not.toHaveBeenCalled();
      // Should destroy the socket
      expect(req.socket.destroy).toHaveBeenCalled();
    });

    test('Allowed IP via x-forwarded-for header → Should pass', () => {
      req = createMockRequest({ ip: '1.2.3.4, 8.8.8.8' });

      checkAllowedIP(req, {}, next);
      // Should call next()
      expect(next).toHaveBeenCalled();
      // Should not destroy the socket
      expect(req.socket.destroy).not.toHaveBeenCalled();
    });

    test('Disallowed IP via x-forwarded-for header → Should deny access', () => {
      req = createMockRequest({ ip: '9.9.9.9, 1.2.3.4' });

      checkAllowedIP(req, {}, next);
      // Should not call next()
      expect(next).not.toHaveBeenCalled();
      // Should destroy the socket
      expect(req.socket.destroy).toHaveBeenCalled();
    });
  });

  describe('normalizeIP Function', () => {
    test('Comma-separated IP → Should return the first IP', () => {
      const req = createMockRequest({ ip: '8.8.8.8,9.9.9.9' });

      // Normalize IP
      const result = normalizeIP(req);
      // Should return the first IP
      expect(result).toBe('8.8.8.8');
    });

    test('IPv6-mapped IPv4 address → Should return the IPv4 address', () => {
      const req = createMockRequest({ ip: '::ffff:192.168.1.1' });

      // Normalize IP
      const result = normalizeIP(req);
      // Should return the IPv4 address
      expect(result).toBe('192.168.1.1');
    });

    test('Localhost IPv6 address → Should return 127.0.0.1', () => {
      const req = createMockRequest({ ip: '::1' });

      // Normalize IP
      const result = normalizeIP(req);
      // Should return 127.0.0.1
      expect(result).toBe('127.0.0.1');
    });

    test('No x-forwarded-for header → Should return req.ip normalized', () => {
      const req = {
        headers: {},
        ip: '::ffff:10.0.0.1',
        socket: {
          destroy: jest.fn(),
        },
      };

      // Normalize IP
      const result = normalizeIP(req);
      // Should return the IPv4 address
      expect(result).toBe('10.0.0.1');
    });

    test('Empty x-forwarded-for header → Should return req.ip normalized', () => {
      const req = {
        headers: {
          'x-forwarded-for': '',
        },
        ip: '::1',
        socket: {
          destroy: jest.fn(),
        },
      };

      // Normalize IP
      const result = normalizeIP(req);
      // Should return 127.0.0.1
      expect(result).toBe('127.0.0.1');
    });
  });
});
