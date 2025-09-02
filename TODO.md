# TODO: Fix Merchant Status Synchronization Issue

## Problem
- Admin verifies merchant in backend, shows as verified on admin side
- Merchant side still shows status as "pending" 
- No synchronization between admin approval and merchant frontend

## Root Cause
- Merchant dashboard loads business data from localStorage only
- No API call to fetch fresh business info from backend
- Status not updated after admin approval

## Solution Plan

### 1. Fix ESLint Warnings
- [ ] Use `hasApprovedBusiness` computed property in template
- [ ] Use `approvedBusinesses` computed property in template  
- [ ] Use `createTransaction` method in template
- [ ] Use `createPayment` method in template

### 2. Implement Fresh Data Fetching
- [ ] Add `fetchBusinessInfo` method to merchant store
- [ ] Use `/api/merchant/profile` endpoint to get latest business data
- [ ] Update localStorage with fresh data
- [ ] Add error handling for API calls

### 3. Update Merchant Dashboard
- [ ] Call `fetchBusinessInfo` on component mount
- [ ] Add manual refresh button in dashboard
- [ ] Show loading state during refresh
- [ ] Update status display with fresh data

### 4. Add Auto-Refresh Mechanism
- [ ] Add periodic refresh (every 30 seconds) when status is pending
- [ ] Stop auto-refresh when status becomes approved
- [ ] Add visual indicator for last refresh time

### 5. Testing
- [ ] Test admin approval flow
- [ ] Verify merchant status updates automatically
- [ ] Test manual refresh functionality
- [ ] Ensure no breaking changes to existing functionality
