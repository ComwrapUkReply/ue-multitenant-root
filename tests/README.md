# Gated Content Testing Guide

This directory contains all testing resources for the gated content implementation.

## Quick Start

### 1. Setup Testing Environment

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Verify Setup

Run the setup verification script to ensure all components are in place:

```bash
./tests/manual/verify-setup.sh
```

This will check:
- Core configuration files
- Authentication scripts
- UI blocks
- Access Provider actions
- CloudFlare Worker
- Documentation
- Testing infrastructure

### 3. Run Automated Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/auth.spec.js

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests with UI mode (interactive)
npx playwright test --ui
```

### 4. Manual API Testing

Test the Access Provider endpoints:

```bash
# Test with default local URL
./tests/manual/test-api.sh

# Test with custom URL
ACCESS_PROVIDER_URL=https://your-api.com ./tests/manual/test-api.sh

# Verbose output
VERBOSE=true ./tests/manual/test-api.sh
```

## Test Structure

```
tests/
├── README.md                    # This file
├── auth.spec.js                 # Main authentication tests
├── helpers/
│   └── test-utils.js           # Reusable test utilities
└── manual/
    ├── verify-setup.sh         # Setup verification script
    └── test-api.sh             # API testing script
```

## Test Coverage

### Automated Tests (Playwright)

The automated test suite (`auth.spec.js`) covers:

1. **Public Content Access**
   - Homepage access without authentication
   - Public pages load correctly
   - Header shows "Sign In" link

2. **Protected Content - Unauthenticated**
   - Redirects to login page
   - Return URL parameter is set
   - All protected levels tested

3. **Login Flow**
   - Valid credentials login
   - Invalid credentials rejection
   - Return URL redirect after login
   - Cookie verification

4. **Access Control - Member User**
   - Access to member content
   - Denied access to premium content
   - Denied access to admin content

5. **Access Control - Premium User**
   - Access to member content (inheritance)
   - Access to premium content
   - Denied access to admin content
   - Premium badge display

6. **Access Control - Admin User**
   - Access to all content levels
   - Admin badge display

7. **Logout Flow**
   - Session clearing
   - Cookie removal
   - Post-logout protection

8. **Cookie Security**
   - HTTP-only verification cookie
   - Tampered cookie detection
   - Secure cookie attributes

9. **UI Components**
   - Access badge block
   - Protected content block
   - Header authentication state

10. **Performance**
    - Cache behavior
    - Load times
    - Network optimization

11. **Accessibility**
    - Keyboard navigation
    - ARIA labels
    - Focus management

12. **Edge Cases**
    - Multiple tabs
    - Rapid login/logout
    - Network interruptions

### Manual Tests

The manual testing plan (`docs/GATED_CONTENT_TESTING.md`) includes:

- 20 detailed test cases
- Step-by-step instructions
- Expected results
- Pass/fail tracking
- Summary reporting

## Test Users

Demo credentials for testing:

| User Type | Email | Password | Access Level |
|-----------|-------|----------|--------------|
| Member | `member@example.com` | `demo123` | member |
| Premium | `premium@example.com` | `demo123` | premium |
| Admin | `admin@example.com` | `demo123` | admin |

## Test URLs

Configure the test URL using environment variable:

```bash
# Default (local)
TEST_URL=http://localhost:3000 npx playwright test

# Staging
TEST_URL=https://staging.yourdomain.com npx playwright test

# Production
TEST_URL=https://yourdomain.com npx playwright test
```

## Viewing Test Results

### HTML Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Video and Screenshots

On test failure, Playwright captures:
- Screenshots in `test-results/`
- Videos in `test-results/`
- Traces in `test-results/`

View trace files:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Continuous Integration

### GitHub Actions

Example CI configuration (`.github/workflows/test.yml`):

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npx playwright test
        env:
          TEST_URL: ${{ secrets.TEST_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Debugging Tests

### Debug Mode

Run tests in debug mode:

```bash
npx playwright test --debug
```

This opens Playwright Inspector for step-by-step debugging.

### Console Logs

Add console logs to tests:

```javascript
test('my test', async ({ page }) => {
  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'debug.png' });
});
```

### Pause Execution

Pause test execution:

```javascript
test('my test', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
});
```

## Performance Testing

### Lighthouse CI

Add Lighthouse CI for performance testing:

```bash
npm install -D @lhci/cli

# Run Lighthouse
lhci autorun --collect.url=http://localhost:3000
```

### Load Testing

For load testing, consider using:
- Apache Bench (ab)
- k6
- Artillery

Example with Apache Bench:

```bash
ab -n 1000 -c 10 http://localhost:3000/members/dashboard
```

## Best Practices

1. **Keep tests independent**: Each test should work in isolation
2. **Use descriptive names**: Test names should clearly describe what's being tested
3. **Clean up after tests**: Remove test data and reset state
4. **Use test utilities**: Leverage helper functions in `test-utils.js`
5. **Mock external services**: Don't rely on external APIs in tests
6. **Test edge cases**: Include error handling and boundary conditions
7. **Monitor test performance**: Keep tests fast (< 30s per test)

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify server is running

**Authentication failing**
- Check Access Provider is deployed
- Verify ENCRYPTION_KEY is set
- Check cookie domain configuration

**Flaky tests**
- Add proper wait conditions
- Use `waitForLoadState('networkidle')`
- Avoid fixed timeouts

**Browser not launching**
- Run `npx playwright install`
- Check system dependencies

### Getting Help

- Check `docs/GATED_CONTENT_SETUP.md` for setup issues
- Review `docs/GATED_CONTENT_TESTING.md` for detailed test cases
- Check Playwright documentation: https://playwright.dev

## Contributing

When adding new tests:

1. Follow existing test structure
2. Add to appropriate test file
3. Update this README if needed
4. Ensure all tests pass before committing
5. Add comments for complex test logic

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Gated Content Setup Guide](../docs/GATED_CONTENT_SETUP.md)
- [Gated Content Testing Plan](../docs/GATED_CONTENT_TESTING.md)
- [AEM Edge Delivery Services](https://www.aem.live)

