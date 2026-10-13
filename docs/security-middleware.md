# Security Middleware

**Target file:** [`src/middleware/security.ts`](../src/middleware/security.ts)

Think of your API like a **school with a security guard at the door**.

This middleware is the security guard.

Every time someone sends a request, the guard checks:

- **Who are you?** Admin, teacher, or guest?
- **Are you asking too many times?**
- **Are you a bot?**
- **Does your request look dangerous?**

## Request Limits

The limits work like this:

- **Admin** → can knock **20 times per minute**
- **Teacher** → can knock **10 times per minute**
- **Guest** → can knock **5 times per minute**

## What `next()` Means

If everything looks okay, the guard says:

```typescript
next();
```

This basically means:

> "You're good. You can go inside."

The request is then allowed to continue to the next middleware or API route.

## When Arcjet Blocks a Request

If Arcjet thinks the request comes from a bot:

```typescript
if (decision.isDenied() && decision.reason.isBot())
```

It means:

> "Arcjet thinks you're a robot. You can't come in."

If the user sends too many requests:

```typescript
if (decision.isDenied() && decision.reason.isRateLimit())
```

It means:

> "You've knocked on the door too many times. Please wait."

If Arcjet's security shield detects something suspicious:

```typescript
if (decision.isDenied() && decision.reason.isShield())
```

It means:

> "This request looks unsafe, so you can't come in."

## Simple Summary

The middleware protects your API before the request reaches your route.

It:

1. Checks the user's role.
2. Gives each role a request limit.
3. Uses Arcjet to inspect the request.
4. Blocks bots and unsafe requests.
5. Blocks users who make too many requests.
6. Calls `next()` when everything is okay.

A simple comment you can place above the middleware in `src/middleware/security.ts` is:

```typescript
// Security guard for our API: blocks bad requests and limits how many requests each user can make.
```
