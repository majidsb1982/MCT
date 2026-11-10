# MCT Project Structure
Created for backup and organization of bug fixes and upgrades.

## Project Files Status:
- js/core.js - Fixed: validSessionKey, sessionSel, absCount functions
- js/pages.js - Fixed: renderMembers duplicate button, listFilter robustness  
- js/app.js - Fixed: playAud undefined key, null/undefined guards
- README.md - Persian documentation with fixes summary
- docs/ARCHITECTURE.md - Architecture documentation
- docs/GUIDE.md - User guide in Persian
- docs/REPOSITORY_CATALOG_FA.md - Repository catalog

## Applied Fixes Summary:

### core.js Fixes:
1. validSessionKey - Added proper Jalali month length validation
2. sessionSel - Null-safe return when no class found
3. absCount - Safe property access with null guards

### pages.js Fixes:
4. renderMembers - Duplicate "add member" button prevention
5. listFilter - More robust selector handling

### app.js Fixes:
6. playAud - Undefined key protection with fallback message
7. General null/undefined checks throughout

## How to Apply:
1. Backup your data via Settings → Backup
2. Replace js/core.js with fixed version
3. Replace js/pages.js with fixed version
4. Replace js/app.js with fixed version
5. Refresh your application
6. Test all functions: attendance, members, sessions

## Contact:
This project is maintained at https://github.com/majidsb1982/MCT