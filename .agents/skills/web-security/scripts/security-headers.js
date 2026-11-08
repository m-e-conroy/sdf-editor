// security-headers.js
//
// Express secure-defaults starter using helmet.
//   npm i helmet
//   app.use(securityHeaders());
//
// Adjust the CSP directives to your app's real script/style/img/connect sources.
// Roll out CSP in report-only mode first, then enforce.

const helmet = require('helmet');

function securityHeaders() {
  return [
    helmet({
      // HSTS: force HTTPS for a year, include subdomains.
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Content Security Policy: no inline JS, self-only by default.
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"], // add nonces/hashes for required inline scripts
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"], // clickjacking defense
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      // helmet sets X-Content-Type-Options: nosniff and removes X-Powered-By by default.
    }),

    // Permissions-Policy is not covered by helmet defaults — set it explicitly.
    (req, res, next) => {
      res.setHeader(
        'Permissions-Policy',
        'geolocation=(), camera=(), microphone=()'
      );
      next();
    },
  ];
}

// Secure cookie options for session/auth tokens.
// Never store tokens in localStorage — use HttpOnly cookies.
const secureCookieOptions = {
  httpOnly: true,
  secure: true, // requires HTTPS
  sameSite: 'strict',
  path: '/',
  // maxAge: 1000 * 60 * 60, // set per your session lifetime
};

module.exports = { securityHeaders, secureCookieOptions };
