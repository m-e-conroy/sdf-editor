# JWT Refresh Token Flow

This pattern ensures stateless security with long-lived sessions without exposing high-privilege tokens for long periods.

## The Logic

1. **Login**: Client sends credentials. Server returns:
   - `accessToken`: (e.g., 15m) in JSON response.
   - `refreshToken`: (e.g., 7d) in `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
2. **Request**: Client sends `Authorization: Bearer <accessToken>` header.
3. **Expiry**: Server returns `401 Unauthorized`.
4. **Refresh**: Client sends POST to `/refresh`. No body needed (browser sends cookie).
5. **Validation**: Server verifies cookie, checks DB for token revocation, and returns a new `accessToken`.

## Pseudo-Code (Express/Fastify)

```javascript
app.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401);

  try {
    const payload = verify(token, process.env.REFRESH_SECRET);
    const user = await db.users.find(payload.id);
    
    // Check if token was revoked
    if (user.tokenVersion !== payload.version) throw Error();

    const newAccessToken = sign({ id: user.id }, process.env.ACCESS_SECRET, '15m');
    res.json({ accessToken: newAccessToken });
  } catch {
    res.clearCookie('refreshToken').status(401);
  }
});
```
