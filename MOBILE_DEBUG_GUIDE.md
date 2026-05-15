# Mobile Admin Login Debugging Guide

## Overview
Comprehensive debugging has been implemented to diagnose and fix mobile admin login issues. This guide explains what was fixed and how to troubleshoot remaining issues.

## Changes Made

### 1. **Enhanced Logging (Debug Visibility)**
Added detailed console logging to track auth flow:
- `[AuthContext]` - Auth state management & user profile loading
- `[AdminRoute]` - Route protection logic & admin access decisions
- `[ProtectedRoute]` - Protected route guards
- `[firestoreService]` - Firestore user read/write operations
- `[LoginPage]` - Login flow & navigation decisions
- `[CacheBusting]` - Cache clearing on mobile

**How to view logs on mobile:**
- iOS Safari: Settings → Advanced → Web Inspector (connect to Mac)
- Android Chrome: `chrome://inspect` → Select device → View logs
- Alternative: Use Firebase Console → Logging tab

### 2. **Profile Loading Timeout (Mobile Network Latency)**
- **Before:** 10 seconds
- **After:** 20 seconds
- **Why:** Mobile networks often slower; timeout caused auth to proceed without Firestore profile data

### 3. **Firestore User Service Enhanced Logging**
Functions now log detailed info:
- `getUserById()` - Logs user fetch status & role value
- `createUserRecord()` - Logs when new user is created
- `updateUserRole()` - Logs role update operations

### 4. **Admin Route Protection Updated**
- Fixed hardcoded dev admin email to match created account: `chinuanyaatugwu@gmai.com`
- Added comprehensive logging to show why access is denied
- Better error visibility without silent failures

### 5. **Cache Busting for Mobile**
- New utility: `src/utils/cacheBusting.ts`
- Automatically clears service worker & browser cache on version change
- Prevents stale builds from being served on mobile
- Runs on every app startup

---

## Troubleshooting Steps

### Step 1: Check Console Logs on Mobile
Open browser DevTools and search for these patterns:

```
[AuthContext] Auth state changed. User: <email>
[AuthContext] Firebase user authenticated: <email>
[AuthContext] Fetching Firestore user profile...
[firestoreService] getUserById: User found. Role: <role>
[AdminRoute] Access granted, rendering children
```

### Step 2: Verify Firestore User Document
The admin user **must** have a Firestore document with:
```json
{
  "uid": "...",
  "email": "chinuanyaatugwu@gmai.com",
  "role": "admin",
  "status": "pending",
  "emailVerified": false,
  "balance": 0,
  "totalReturns": 0
}
```

Check at: Firebase Console → Firestore → `users` collection → User UID

### Step 3: Verify Firestore Permissions
If you see permission denied errors:
1. Check `firestore.rules` - especially the `isAdmin()` function
2. Verify user has read access to their own document:
   ```
   allow read: if request.auth != null && request.auth.uid == userId
   ```

### Step 4: Network Issues
If you see network errors:
- Check mobile device has stable WiFi or cellular connection
- Clear browser cache: Settings → (App name) → Storage → Clear cache
- Refresh the page
- Try with aeroplane mode OFF

### Step 5: Cache Issues
If changes aren't reflecting on mobile:
1. Hard refresh: Settings → (App name) → Storage → Clear site data
2. Check if cache version was updated:
   - Open DevTools Console
   - Look for: `[CacheBusting] Cache version mismatch, clearing stale cache`

---

## What to Look For in Console Logs

### ✅ Successful Admin Login
```
[LoginPage] Login attempt for: chinuanyaatugwu@gmai.com
[AuthContext] Signing in with Firebase...
[AuthContext] Firebase sign-in successful. UID: abc123...
[AuthContext] Fetching Firestore user data...
[firestoreService] getUserById: User found. Role: admin
[AuthContext] Login successful. Admin: true
[AdminRoute] Auth loaded. User: chinuanyaatugwu@gmai.com IsAdmin: true
[AdminRoute] Access granted, rendering children
```

### ❌ Common Failure Scenarios

**User not found in Firestore:**
```
[firestoreService] getUserById: User document does not exist for UID: abc123
[AuthContext] Firestore user profile is null
[AdminRoute] User is not admin and not dev admin, redirecting to dashboard
```
**Fix:** Create admin account via `/admin-setup` page

**Profile loading timeout:**
```
[AuthContext] Auth profile load timed out after 20 seconds
[ProfileLoading] Still loading, showing overlay
```
**Fix:** Check network connection; increase timeout if needed

**Permission denied reading user:**
```
[firestoreService] getUserById: Error fetching user: FirebaseError: Permission denied
```
**Fix:** Check Firestore security rules allow reads on user's own document

---

## Performance Metrics

Monitor these on mobile:

1. **Auth State Setup Time**: Should be < 5 seconds (20s timeout allows for slower networks)
2. **Firestore Read Time**: Should be < 2 seconds per document
3. **Route Rendering Time**: Should be < 1 second after auth loads

If times exceed these, network might be the issue.

---

## Mobile-Specific Issues to Check

1. **Orientation Changes**: Ensure auth state persists on rotate
2. **Background/Foreground**: App might lose connection when backgrounded
3. **Memory Pressure**: On low-memory devices, Firebase SDK might reload
4. **Safari Private Browsing**: May block localStorage/IndexedDB
5. **Cache Blocking**: Some mobile browsers don't respect cache headers

---

## How to File a Better Bug Report

When reporting issues, include:

1. Mobile device model (iPhone 12, Samsung Galaxy S21, etc.)
2. OS version (iOS 15.2, Android 12, etc.)
3. Browser (Safari, Chrome, Firefox, etc.)
4. Network type (WiFi, 4G, 5G)
5. Console logs showing the error
6. Firestore user document contents
7. Whether it works on desktop

This makes debugging much faster!
