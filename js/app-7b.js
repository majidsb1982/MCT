/* cont */
window.addClass=addClass;window.delClass=delClass;window.setTheme=setTheme;window.toggleTheme=toggleTheme;
window.setFS=setFS;window.backup=backup;window.restore=restore;window.wipeAll=wipeAll;
window.copyTxt=copyTxt;window.toggleCallFilter=toggleCallFilter;
window.setColor=setColor;window.toggleSound=toggleSound;window.shareBackup=shareBackup;
window.toggleFS=toggleFS;window.goBack=goBack;
window.printAttendReport=printAttendReport;window.showInsights=showInsights;window.togglePrivacyMode=togglePrivacyMode;window.logoutUser=logoutUser;window.userForm=userForm;window.delUser=delUser;window.reportForSupporters=reportForSupporters;window.reportRoundToHami=reportRoundToHami;window.reportFeesToHami=reportFeesToHami;window.periodForm=periodForm;window.toggleDoorCheck=toggleDoorCheck;window.loginUser=loginUser;window.remindUnpaidWA=remindUnpaidWA;window.attendRemindWA=attendRemindWA;window.shareStoryCard=shareStoryCard;window.humanHamiSummary=humanHamiSummary;window.toggleFocusMode=toggleFocusMode;window.toggleA11y=toggleA11y;window.tgShare=tgShare;window.celebrate=celebrate;window.autoSplitTasks=autoSplitTasks;window.clearSplit=clearSplit;window.openCommandPalette=openCommandPalette;window.weeklyDigest=weeklyDigest;window.copyPrevSession=copyPrevSession;window.transferMyTasks=transferMyTasks;window.toggleOled=toggleOled;window.togglePin=togglePin;window.reassignMember=reassignMember;window.performUndo=performUndo;window.handoffPackage=handoffPackage;window.showMemberTimeline=showMemberTimeline;window.teamBoardHTML=teamBoardHTML;window.setListFilter=setListFilter;window.toggleBatchPick=toggleBatchPick;window.batchSetAtt=batchSetAtt;window.clearBatch=clearBatch;window.openBatchPicker=openBatchPicker;window.communicationHub=communicationHub;window.hubTilesHTML=hubTilesHTML;window.celebrateConfetti=celebrateConfetti;window.compactSyncExport=compactSyncExport;window.editTemplates=editTemplates;window.toggleAutoTheme=toggleAutoTheme;window.logActivity=logActivity;window.careQueue=careQueue;window.startSpeech=startSpeech;window.enableNotifs=enableNotifs;window.exportICS=exportICS;window.shareClassCode=shareClassCode;window.scheduleClassNotif=scheduleClassNotif;window.pruneSessions=pruneSessions;window.storageInfo=storageInfo;
window.setClassName=setClassName;window.addGroup=addGroup;window.delGroup=delGroup;

if(Store.get().settings.requireLogin&&!currentUser())route="login";
render();
try{scheduleClassNotif();}catch(e){}

if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0)
navigator.serviceWorker.register("sw.js").catch(()=>{});
window.addEventListener("online",()=>{toast("🟢 آنلاین شدید");render();});
window.addEventListener("offline",()=>{toast("🔴 آفلاین — داده محلی امن است");render();});
