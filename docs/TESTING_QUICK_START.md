# Gated Content Testing - Quick Start Guide

This guide helps you quickly get started with testing the gated content implementation.

## Prerequisites

- Node.js 18+ installed
- Access to test environment
- Test user credentials

## 1. Install Dependencies

```bash
# Install all dependencies including Playwright
npm install

# Install Playwright browsers
npx playwright install
```

## 2. Verify Setup

Before running tests, verify that all components are properly configured:

```bash
npm run test:verify
```

This script checks:
- ✓ Core configuration files exist
- ✓ Authentication scripts are present
- ✓ UI blocks are created
- ✓ Access Provider actions are configured
- ✓ CloudFlare Worker is set up
- ✓ Documentation is available
- ✓ Testing infrastructure is ready

**Expected Output:**
```
✓ All critical checks passed!
You can proceed with deployment.
```

## 3. Run Automated Tests

### Basic Test Run

```bash
# Run all tests
npm test

# Or explicitly
npx playwright test
```

### Interactive Testing

```bash
# Run tests with UI (recommended for first time)
npm run test:ui
```

This opens Playwright's test runner UI where you can:
- See all tests
- Run tests individually
- Watch tests execute
- Debug failures

### Headed Mode

To see the browser during testing:

```bash
npm run test:headed
```

### Debug Mode

To step through tests:

```bash
npm run test:debug
```

## 4. Test Access Provider API

Test the backend API endpoints:

```bash
# Local testing
npm run test:api

# Test deployed API
ACCESS_PROVIDER_URL=https://your-api.com npm run test:api

# Verbose output
VERBOSE=true npm run test:api
```

## 5. View Test Results

After running tests:

```bash
npm run test:report
```

This opens an HTML report showing:
- Test results summary
- Screenshots of failures
- Video recordings
- Detailed traces

## Test Configuration

### Environment Variables

Set test URL in `.env` or command line:

```bash
# Local testing
TEST_URL=http://localhost:3000 npm test

# Staging
TEST_URL=https://staging.yourdomain.com npm test

# Production
TEST_URL=https://yourdomain.com npm test
```

### Access Provider Configuration

```bash
# Set Access Provider URL
export ACCESS_PROVIDER_URL=https://your-runtime-namespace.adobeio-static.net/api/v1/web/your-package

# Set encryption key
export ENCRYPTION_KEY=your-32-character-encryption-key
```

## Quick Test Checklist

### Before Deployment

- [ ] Run `npm run test:verify` - all checks pass
- [ ] Run `npm test` - all automated tests pass
- [ ] Run `npm run test:api` - API tests pass
- [ ] Manually test login flow in browser
- [ ] Verify protected content is actually protected

### After Deployment

- [ ] Test production URLs
- [ ] Verify CloudFlare Worker is active
- [ ] Check Access Provider endpoints
- [ ] Test all user access levels
- [ ] Verify cookies are set correctly
- [ ] Test logout functionality

## Common Testing Scenarios

### Test Login

```bash
# Automated
npx playwright test tests/auth.spec.js -g "should login successfully"

# Manual
1. Navigate to /login
2. Enter: member@example.com / demo123
3. Verify redirect to dashboard
4. Check header shows "Hello, John Member!"
```

### Test Access Control

```bash
# Automated
npx playwright test tests/auth.spec.js -g "Access Control"

# Manual
1. Login as member
2. Try to access /premium/article
3. Should see "Upgrade Now" message
```

### Test Token Security

```bash
# Automated
npx playwright test tests/auth.spec.js -g "Cookie Security"

# Manual
1. Login as member
2. Open DevTools → Application → Cookies
3. Modify user_data cookie level to "premium"
4. Try to access premium content
5. Should be denied/redirected
```

## Test Users

Use these credentials for testing:

| Type | Email | Password | Access |
|------|-------|----------|--------|
| Member | member@example.com | demo123 | Member content only |
| Premium | premium@example.com | demo123 | Member + Premium |
| Admin | admin@example.com | demo123 | All content |

## Troubleshooting

### Tests Fail to Start

**Error:** `Cannot find module '@playwright/test'`

**Solution:**
```bash
npm install
npx playwright install
```

### Authentication Tests Fail

**Error:** `Login endpoint not responding`

**Solution:**
- Check Access Provider is deployed
- Verify ACCESS_PROVIDER_URL is correct
- Test API directly: `npm run test:api`

### Cookie Tests Fail

**Error:** `Cookies not set`

**Solution:**
- Check ENCRYPTION_KEY is set
- Verify cookie domain configuration
- Check browser allows cookies

### Timeout Errors

**Error:** `Test timeout of 30000ms exceeded`

**Solution:**
- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify server is running

## Getting Help

1. **Check Documentation:**
   - [Setup Guide](./GATED_CONTENT_SETUP.md)
   - [Testing Plan](./GATED_CONTENT_TESTING.md)
   - [Test README](../tests/README.md)

2. **Review Test Output:**
   ```bash
   npm run test:report
   ```

3. **Debug Specific Test:**
   ```bash
   npx playwright test tests/auth.spec.js --debug
   ```

4. **Check Server Logs:**
   - CloudFlare Worker logs
   - Access Provider logs (Adobe I/O Console)

## Next Steps

After successful testing:

1. **Deploy to Production:**
   - Follow deployment guide
   - Update production URLs
   - Test with production data

2. **Monitor:**
   - Set up error monitoring
   - Track login success rates
   - Monitor access denials

3. **Iterate:**
   - Add more test cases
   - Improve test coverage
   - Update documentation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Full Testing Plan](./GATED_CONTENT_TESTING.md)
- [Setup Guide](./GATED_CONTENT_SETUP.md)
- [Test Utils API](../tests/helpers/test-utils.js)

---

**Need more help?** Check the comprehensive guides in the `docs/` directory.

