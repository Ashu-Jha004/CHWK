# Testing Guide for Customer Onboarding

## Pre-Testing Setup
1. Ensure you're logged in with Clerk
2. Clear localStorage to reset onboarding state (if testing multiple times)
3. Open browser DevTools to monitor network requests and console logs

---

## Test Scenarios

### ✅ **Scenario 1: Happy Path (Complete Flow)**

**Steps:**
1. Navigate to `/onboarding`
2. Fill in Step 1:
   - First Name: "John"
   - Last Name: "Doe"
   - Username: "johndoe123"
3. Click "Continue"
4. Verify: Success toast appears, progress bar advances
5. Fill in Step 2:
   - Phone: "9876543210"
6. Click "Next"
7. Verify: Success toast appears, progress bar advances
8. Fill in Step 3:
   - Pincode: "110001" (Delhi)
9. Wait for auto-fill
10. Verify:
    - Loading spinner appears
    - Success toast shows "Location detected successfully!"
    - City and State are auto-filled
    - Green checkmark appears next to pincode
11. Click "Complete Setup"
12. Verify:
    - Loading toast shows "Setting up your profile..."
    - Success toast shows "Welcome! Your profile is all set up!"
    - Redirects to home page after 500ms

**Expected Result:** ✅ Onboarding completed successfully

---

### ❌ **Scenario 2: Validation Errors**

#### Test 2.1: Invalid Username
**Steps:**
1. Enter username with special characters: "john@doe!"
2. Click "Continue"

**Expected Result:**
- Error message: "Only letters, numbers, and underscores allowed"
- Red border on input field
- Alert icon next to error message
- Error toast: "Please fix the errors before continuing."

#### Test 2.2: Invalid Phone Number
**Steps:**
1. Complete Step 1 correctly
2. Enter phone: "12345" (too short)
3. Click "Next"

**Expected Result:**
- Error message: "Enter a valid 10-digit Indian phone number"
- Red border on input field
- Cannot proceed to next step

#### Test 2.3: Invalid Pincode
**Steps:**
1. Complete Steps 1 & 2
2. Enter pincode: "999999" (invalid)
3. Wait for API call

**Expected Result:**
- Error toast: "Invalid pincode. Please check and try again."
- Error message below input
- No auto-fill for city/state
- Red border on pincode field

---

### 🔄 **Scenario 3: API Error Handling**

#### Test 3.1: Pincode API Timeout
**Steps:**
1. Throttle network in DevTools (Slow 3G)
2. Enter a valid pincode
3. Wait for timeout (5 seconds)

**Expected Result:**
- Error toast: "Location service is taking too long to respond"
- Can manually enter city/state

#### Test 3.2: Network Disconnection
**Steps:**
1. Disconnect internet
2. Enter pincode
3. Click "Continue"

**Expected Result:**
- Error toast: "Network error. Please check your connection."
- Can retry when connection is restored

---

### 🎯 **Scenario 4: Geolocation Feature**

#### Test 4.1: Allow Location Access
**Steps:**
1. Click "Use Current Geolocation (Optional)"
2. Click "Allow" in browser prompt

**Expected Result:**
- Loading state shows "Detecting Location..."
- Success toast: "Location detected successfully!"
- Latitude and longitude are stored (check form state)

#### Test 4.2: Deny Location Access
**Steps:**
1. Click "Use Current Geolocation (Optional)"
2. Click "Block" in browser prompt

**Expected Result:**
- Error toast: "Could not detect location. Please enable location access."
- Can continue without geolocation

---

### 💾 **Scenario 5: Data Persistence**

**Steps:**
1. Fill in Step 1 data
2. Click "Continue"
3. Fill in Step 2 data
4. Refresh the page

**Expected Result:**
- Returns to Step 2 (where you left off)
- Previously entered data is preserved
- Form validation still works

---

### 🚀 **Scenario 6: Performance Testing**

#### Test 6.1: Debouncing
**Steps:**
1. Rapidly type pincode: "1", "11", "110", "1100", "11000", "110001"
2. Monitor Network tab

**Expected Result:**
- Only ONE API call is made (500ms after you stop typing)
- No multiple requests

#### Test 6.2: Multiple Button Clicks
**Steps:**
1. Fill in all data correctly
2. Click "Complete Setup" button multiple times rapidly

**Expected Result:**
- Button is disabled after first click
- Only one submission occurs
- Prevents duplicate user records

---

### ♿ **Scenario 7: Accessibility Testing**

**Steps:**
1. Use keyboard only (Tab, Shift+Tab, Enter)
2. Navigate through all form fields
3. Use screen reader (if available)

**Expected Result:**
- All fields are keyboard accessible
- Focus states are visible
- Error messages are announced by screen reader
- Labels are properly associated with inputs
- Progress bar has aria attributes

---

### 🎨 **Scenario 8: Visual Design Verification**

**Checklist:**
- [ ] Primary color is orange (not blue)
- [ ] Gradients appear smooth
- [ ] Step badges show numbers 1, 2, 3
- [ ] Progress bar animates smoothly
- [ ] Buttons have hover effects
- [ ] Loading spinners are orange
- [ ] Error messages are red with icons
- [ ] Success checkmarks are green
- [ ] Responsive on mobile (test at 375px width)
- [ ] Centered layout on desktop

---

### 🔐 **Scenario 9: Security & Edge Cases**

#### Test 9.1: Duplicate Username
**Steps:**
1. Complete onboarding with username "testuser"
2. Log out, create new account
3. Try onboarding with same username "testuser"

**Expected Result:**
- Error: "This username is already taken. Please choose another."

#### Test 9.2: SQL Injection Attempt
**Steps:**
1. Enter username: `admin' OR '1'='1`
2. Try to submit

**Expected Result:**
- Validation error due to special characters
- Request never reaches database

---

## Browser Compatibility Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Performance Benchmarks

### Metrics to Check:
- **Pincode API Response Time**: < 500ms (average)
- **Form Submission Time**: < 2s (average)
- **Page Load Time**: < 1s
- **Debounce Delay**: 500ms (exact)
- **Success Toast Duration**: Visible for 3-4s

### DevTools Profiling:
1. Open Performance tab
2. Record onboarding flow
3. Check for:
   - No memory leaks
   - No excessive re-renders
   - Smooth 60fps animations

---

## Console Checks

### Expected Console Messages:
- ✅ No errors in happy path
- ✅ Warnings only for external APIs (if any)
- ⚠️ Error logs for failed validations (development only)

### Monitor for:
- API errors with details
- Validation errors
- Network timeouts
- Clerk sync issues

---

## Database Verification

After successful onboarding:
1. Check Prisma Studio or database directly
2. Verify user record exists with:
   - Correct userId (matches Clerk)
   - All fields populated
   - Proper data types
   - Timestamp fields set

---

## Clean Up After Testing

1. Delete test user records from database
2. Clear Clerk test users
3. Reset localStorage: `localStorage.removeItem('onboarding-storage')`
4. Clear browser cache

---

## Automated Test Template (Optional)

```typescript
// Example E2E test with Playwright
describe('Customer Onboarding', () => {
  test('should complete onboarding successfully', async ({ page }) => {
    await page.goto('/onboarding');

    // Step 1
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#username', 'johndoe123');
    await page.click('button:has-text("Continue")');

    // Wait for toast
    await page.waitForSelector('text=Step 1 completed!');

    // Step 2
    await page.fill('#phone', '9876543210');
    await page.click('button:has-text("Next")');

    // Step 3
    await page.fill('#pincode', '110001');
    await page.waitForSelector('text=Location detected successfully!');

    // Complete
    await page.click('button:has-text("Complete Setup")');
    await page.waitForURL('/');

    expect(page.url()).toBe('/');
  });
});
```

---

## Issue Reporting Template

If you find bugs:

```markdown
**Bug Title:** Brief description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Environment:**
- Browser:
- OS:
- Screen Size:

**Console Errors:**
\`\`\`
Paste errors here
\`\`\`

**Screenshots:**
Attach if relevant
```

---

## Sign-Off Checklist

Before marking as "Production Ready":
- [ ] All happy path scenarios pass
- [ ] All error scenarios handled gracefully
- [ ] Performance benchmarks met
- [ ] Accessibility verified
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Security validated
- [ ] Database records correct
- [ ] No console errors in production build
- [ ] Documentation complete
