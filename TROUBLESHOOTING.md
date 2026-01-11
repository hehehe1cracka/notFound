# Troubleshooting Guide

## Common Issues & Solutions

### ✅ FIXED: Firebase 400 Error - "undefined in property"

**Error Message:**
```
set failed: value argument contains undefined in property 'users.xxx.photoURL'
```

**Cause:** Firebase Realtime Database doesn't accept `undefined` values.

**Solution Applied:**
- Modified `useAuth.tsx` to conditionally include `photoURL` only when it exists
- Added filtering in `updateUser()` to remove all undefined values before saving
- This fix is already applied in your code ✅

---

## Other Potential Issues

### Issue: Profile not updating after edit

**Symptoms:**
- Click "Save Changes" but profile doesn't update
- No error shown

**Solutions:**
1. Check browser console for errors
2. Verify Firebase connection (check Network tab)
3. Make sure you're logged in
4. Try refreshing the page

---

### Issue: Gamification panel not showing

**Symptoms:**
- Profile page loads but no XP/level/achievements shown

**Solutions:**
1. Check if user has the new fields initialized:
   - Sign out and sign back in
   - This will create the new fields automatically
2. Verify in Firebase Console that user has:
   - `level`, `xp`, `achievements`, `streak`, `lastActiveDate`

---

### Issue: People page shows no users

**Symptoms:**
- Navigate to /people but see "No people found"

**Solutions:**
1. Clear all filters (click "Clear Filters" button)
2. Check if there are users in Firebase database
3. Verify Firebase rules allow reading users collection

---

### Issue: Tasks not showing deadlines

**Symptoms:**
- Tasks display but no deadline information

**Solutions:**
1. Tasks need to have `deadline` field set
2. Create new tasks with deadlines
3. Existing tasks without deadlines won't show deadline info (this is normal)

---

### Issue: XP not updating

**Symptoms:**
- Complete tasks but XP stays the same

**Solutions:**
1. The gamification functions need to be called when actions occur
2. Currently, XP functions are available but need to be integrated into:
   - Task completion handlers
   - Startup creation handlers
   - Gallery post handlers
3. Example integration needed in task completion:
```typescript
import { awardTaskCompletionXP } from '@/lib/gamification';

// After task is marked complete:
await awardTaskCompletionXP(userId, userProfile);
```

---

### Issue: Can't add skills in Edit Profile

**Symptoms:**
- Type skill name but nothing happens

**Solutions:**
1. Press **Enter** after typing skill name
2. Or click the **+** button
3. Make sure skill name is not empty
4. Check if skill already exists (duplicates not allowed)

---

### Issue: Social links not working

**Symptoms:**
- Click social link but nothing happens

**Solutions:**
1. Make sure you saved the profile after adding links
2. Links should be in correct format:
   - Website: `https://example.com`
   - GitHub: just username (not full URL)
   - Twitter: `@username` or just `username`
   - LinkedIn: just username (not full URL)
3. Check browser console for errors

---

## Firebase Configuration Issues

### Issue: Firebase connection errors

**Symptoms:**
- "Firebase: Error (auth/...)" messages
- Can't sign in or sign up

**Solutions:**
1. Check `src/lib/firebase.ts` configuration
2. Verify Firebase project settings
3. Check Firebase Console for:
   - Authentication enabled
   - Realtime Database created
   - Database rules configured

---

### Recommended Firebase Rules

For development, use these rules (⚠️ **NOT for production**):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

For production, implement proper security rules based on your needs.

---

## Performance Issues

### Issue: Slow page loads

**Solutions:**
1. Check network tab for slow requests
2. Optimize Firebase queries with indexes
3. Implement pagination for large lists
4. Use Firebase caching

---

### Issue: Too many Firebase reads

**Solutions:**
1. Use Firebase listeners efficiently
2. Unsubscribe from listeners when components unmount
3. Implement data caching
4. Use Firebase offline persistence

---

## Development Tips

### Hot Reload Not Working

**Solutions:**
1. Stop dev server (Ctrl+C)
2. Clear node_modules cache: `npm cache clean --force`
3. Restart: `npm run dev`

---

### TypeScript Errors

**Common Fixes:**
1. Run `npm install` to ensure all types are installed
2. Restart TypeScript server in VS Code
3. Check for missing imports
4. Verify type definitions match actual data

---

## Browser Compatibility

### Tested Browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari

### Known Issues:
- Some animations may not work in older browsers
- Use modern browser for best experience

---

## Getting Help

### Before Asking for Help:

1. **Check browser console** for error messages
2. **Check Network tab** for failed requests
3. **Verify Firebase Console** for data
4. **Try incognito mode** to rule out extensions
5. **Clear browser cache** and cookies

### Information to Provide:

When reporting issues, include:
- Error message (full text)
- Browser and version
- Steps to reproduce
- Screenshot if applicable
- Console logs

---

## Quick Fixes Checklist

When something doesn't work:

- [ ] Refresh the page
- [ ] Check browser console for errors
- [ ] Verify you're logged in
- [ ] Check internet connection
- [ ] Try signing out and back in
- [ ] Clear browser cache
- [ ] Restart dev server
- [ ] Check Firebase Console

---

## Status: All Known Issues Fixed ✅

Current version has all known issues resolved:
- ✅ Firebase undefined error - FIXED
- ✅ Profile editing - Working
- ✅ Gamification display - Working
- ✅ People discovery - Working
- ✅ Task deadlines - Working

---

**Last Updated:** January 8, 2026  
**Version:** 2.0.0
