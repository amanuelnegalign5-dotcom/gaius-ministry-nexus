import * as store from './gaius-store.js';
import { CENTER_UNITS } from './gaius-v11-model.js';
import { roleDepartments, directors, permissions, seedPeople, stateOf, full, permit, seesReports, writesReports, managesAttendance, isMondayParticipant, publishes, canManage, flow, version } from './gaius-core.js';

const $=id=>document.getElementById(id);
const base=window.GAIUS_V10;
const extras={};
const words=`
batchAttendance|የስብሰባውን መገኘት በአንድ ላይ መዝግብ|Record the meeting roster
batchHelp|ከላይ ቀኑንና የፕሮግራሙን ዓይነት ይምረጡ። የመገኘት ሁኔታቸው የተለወጠባቸው ሰዎች ብቻ ይመዘገባሉ።|Choose the date and program above. Only the attendance marks you change will be saved.
saveAttendanceBatch|የመረጥኳቸውን አስቀምጥ|Save selected attendance
unmarked|ያልተመዘገበ|Unmarked
refresh|አድስ|Refresh
forgotPassword|የይለፍ ቃል ረሳሁ|Forgot password?
resetTitle|የይለፍ ቃል መመለሻ|Password recovery
recoveryInstructions|በመለያዎ የተመዘገበውን ኢሜይል ያስገቡ። ኢሜይሉ የታወቀና የጸደቀ ከሆነ ለ10 ደቂቃ የሚቆይ 8 አሃዝ ኮድ ይላካል።|Enter the email address on your account. If the account is eligible, an 8-digit code valid for 10 minutes will be emailed.
resetEmail|የመለያዬ ኢሜይል|Account email address
sendCode|የማረጋገጫ ኮድ ላክ|Send verification code
verificationCode|የ8 አሃዝ ማረጋገጫ ኮድ|8-digit verification code
confirmReset|የይለፍ ቃሌን ቀይር|Reset password
backToLogin|ወደ መግቢያ ተመለስ|Back to sign in
recoveryRequested|መለያው ከዚህ ኢሜይል ጋር ከተመዘገበና ለመመለስ ብቁ ከሆነ፣ ኮድ ይላካል። የInbox እና Spam አቃፊዎችን ይመልከቱ።|If an eligible account is registered with this email, a code will be sent. Check Inbox and Spam.
passwordChanged|የይለፍ ቃልህ ተቀይሯል። አሁን በአዲሱ ይግቡ።|Your password has changed. Sign in with the new password.
emailChange|የመለያ ኢሜይል መቀየር|Change account email
emailChangeHelp|አዲሱን ኢሜይል እና የአሁኑን የይለፍ ቃል ያስገቡ። ለአዲሱ አድራሻ የሚላከውን ኮድ በማረጋገጥ ብቻ ኢሜይሉ ይቀየራል።|Enter a new email and your current password. The address changes only after you confirm the code sent to the new inbox.
newEmail|አዲስ ኢሜይል|New email address
confirmEmail|አዲስ ኢሜይል አረጋግጥ|Verify new email
verificationRequested|ወደ አዲሱ ኢሜይል ኮድ ተልኳል። 10 ደቂቃ ውስጥ ያስገቡት።|A code was requested for your new email. Enter it within 10 minutes.
emailChanged|አዲሱ ኢሜይል ተረጋግጦ ተቀምጧል።|Your new email has been verified and saved.
emailNotConfigured|ኮድ ለመላክ Cloudflare Worker እና የተረጋገጠ የኢሜይል አስተላላፊ ማዋቀር ያስፈልጋል። አስተዳዳሪውን ያነጋግሩ።|Email delivery is not configured. An administrator must configure the shared Worker and verified email sender.
emailRequiresServer|የኢሜይል ኮድ በአሳሽ ብቻ አይሰራም። የጋራ አገልግሎትን ያገናኙ ወይም አስተዳዳሪው የይለፍ ቃል እንዲቀይር ይጠይቁ።|Email codes need the shared service. Connect the backend, or ask an administrator to set a temporary password.
emailInvalid|ትክክለኛ የኢሜይል አድራሻ ያስገቡ።|Enter a valid email address.
emailInUse|ይህ ኢሜይል በሌላ መለያ ላይ ተመዝግቧል።|This email is used by another account.
emailUnchanged|ይህ ኢሜይል አስቀድሞ በመለያዎ ላይ ነው።|That email is already on your account.
emailChangeVerification|ኢሜይል ለመቀየር ከፕሮፋይል በታች ያለውን የኢሜይል ማረጋገጫ ይጠቀሙ።|Use verified email change below the profile form.
emailDeliveryFailed|የኢሜይል አገልግሎቱ ጥያቄውን አልተቀበለም።|The email provider rejected the request.
codeInvalid|ኮዱ ልክ አይደለም፣ አልቋል፣ ወይም የሙከራ ገደቡ ተደርሷል። አዲስ ኮድ ጠይቁ።|The code is wrong, expired or attempts were exhausted. Request a new code.
logoutEverywhere|ከሁሉም መሣሪያዎች ውጣ|Sign out on all devices
confirmLogoutAll|በሌሎች መሣሪያዎች ያሉትን መግቢያዎች መዝጋት ይፈልጋሉ?|Sign out of every device?
allSessionsRevoked|ሁሉም መግቢያዎች ተዘግተዋል። እንደገና ይግቡ።|All sessions were revoked. Please sign in again.
plans|እቅዶች|Plans
localCodeLabel|የዳይሬክተር ምዝገባ ለBackend የተያዘ ነው|Director registration requires secure backend
localDirectorCode|የአካባቢውን v10 የዳይሬክተር ኮድ ያስገቡ።|Enter the standalone v10 Director code shown above.
setupKeyLabel|የመጀመሪያው አስተዳዳሪ ማዋቀሪያ ቁልፍ|First administrator setup key
localMode|በዚህ አሳሽ ላይ ብቻ|This browser only
sharedMode|የጋራ የሚኒስትሪ መዝገብ|Shared ministry workspace
localExplain|በዚህ አሳሽ የተመዘገቡ መለያዎችና ውሳኔዎች በዚህ መሣሪያ ላይ ይቀመጣሉ።|Accounts and decisions in this workspace are saved in this browser.
sharedExplain|ከሌላ መሣሪያ ስትገቡ በተመሳሳይ የጋራ መዝገብ ላይ ትሠራላችሁ።|Sign in from another device to use the same ministry workspace.
setupLocal|በዚህ አሳሽ የመጀመሪያውን አስተዳዳሪ ለመመዝገብ ከሁለቱ የዳይሬክተር ሚናዎች አንዱን ይምረጡ።|To set up the first administrator in this browser, choose either Director role.
setupShared|የመጀመሪያው ዳይሬክተር ሲመዘገቡ በጋራ ሰርቨሩ ላይ ያዘጋጁትን ማዋቀሪያ ቁልፍ ያስገቡ።|The first Director must enter the setup key configured on the shared service.
requestHelp|ምዝገባውን ካጠናቀቁ በኋላ አስተዳዳሪው መለያዎን ያጸድቃል።|After registration, an administrator reviews your account before you can sign in.
pending|ማጽደቅ የሚጠብቅ|Pending approval
active|የጸደቀ|Active
removed|ከአገልግሎት የወጣ|Removed
pendingLogin|መለያዎ ለአስተዳዳሪው ተልኳል። ከጸደቀ በኋላ ይግቡ።|Your request is waiting for an administrator. Sign in after approval.
removedLogin|የዚህ መለያ መግቢያ ተዘግቷል።|Access to this account has been removed.
draft|ረቂቅ|Draft
submitted|የቀረበ|Submitted
approved|የጸደቀ|Approved
under_review|በግምገማ ላይ|Under review
revision_requested|ለማሻሻያ የተመለሰ|Changes requested
locked|የጸደቀና የተቆለፈ|Approved and locked
delayed|የዘገየ|Delayed
awaiting|ውሳኔ የሚጠብቅ|Awaiting review
reviewLabel|የማጽደቅ ሁኔታ|Review status
reviews|ውሳኔዎች|Decisions
all|ሁሉም|All
empty|በዚህ ምርጫ የተገኘ መዝገብ የለም።|No matching records.
performance|የዕቅድ አፈጻጸም|Performance against plan
achievement|አፈጻጸም|Achievement
monthlyRates|ወርሃዊ አፈጻጸም|Monthly achievement
approve|አጽድቅ|Approve
returnReview|ለማሻሻያ መልስ|Request changes
startReview|ግምገማ ጀምር|Start review
lock|የጸደቀውን ቆልፍ|Lock approved item
reviewNote|የውሳኔ ማስታወሻ|Review note
reviewHistory|የውሳኔ ታሪክ|Decision history
reviewQueue|ውሳኔ የሚጠባበቁ ሪፖርቶችና እቅዶች|Reports and plans awaiting review
adminHelp|ሙሉ አስተዳዳሪ ተጠቃሚዎችን፣ ፈቃዶችን፣ ሪፖርቶችንና እቅዶችን ያስተዳድራል።|Full administrators manage accounts, permissions, reports and plans.
lockedHelp|የቀረበ ሪፖርትን አስተዳዳሪ ይገመግማል። ረቂቅዎንና ለማሻሻያ የተመለሰልዎትን ሪፖርት ማረም ይችላሉ።|An administrator reviews submitted reports. You can edit your drafts and reports returned for changes.
source|የጥቅምት ዋና ሰነድ · ጽሑፉ የተጠበቀ|October source · text preserved
edit|አስተካክል|Edit
newPlan|አዲስ እቅድ|New plan
editPlan|እቅድ ማስተካከያ|Edit plan
submitPlan|እቅዱን ላክ|Submit plan
saveDraft|ረቂቅ አስቀምጥ|Save draft
target|የእቅዱ ዒላማና መለኪያ|Target and unit
linkedProject|ተያያዥ ፕሮጀክት|Linked project
noProject|ገለልተኛ እቅድ|Standalone plan
planForProject|ለዚህ ፕሮጀክት እቅድ አቅርብ|Submit a plan for this project
addUser|ተጠቃሚ ጨምር|Add user
createUser|መለያ ፍጠር|Create account
searchUsers|በስም ወይም በመለያ ፈልግ|Search name or username
accountStatus|የመለያ ሁኔታ|Account status
tempPassword|ጊዜያዊ የይለፍ ቃል|Temporary password
inviteHelp|ጊዜያዊውን የይለፍ ቃል በግል ያስረክቡ። ተጠቃሚው ሲገባ የራሱን ቃል ይመርጣል፣ ፕሮፋይሉንና የግላዊነት ስምምነቱን ያጠናቅቃል።|Give the temporary password privately. At first sign-in the user chooses a new password, completes their profile and accepts the agreement.
complete|ምዝገባዬን አጠናቅቅ|Complete my account
completeHelp|ፕሮፋይልዎን ይሙሉ፣ 12ቱን ድንጋጌዎች ያንብቡ፣ አዲስ የግል የይለፍ ቃል ይምረጡ።|Complete your profile, read the 12 statements and choose a new personal password.
fullAdmin|ሙሉ አስተዳዳሪ|Full administrator
limited|ውስን አስተዳዳሪ|Delegated administrator
standard|ተጠቃሚ|Member
permissions|ሚናና ፈቃዶች|Role and permissions
review_reports|ሪፖርቶችን ማጽደቅ|Review reports
review_plans|እቅዶችን ማጽደቅ|Review plans
comments|የዳይሬክተር አስተያየቶች|Director comments
projects|ፕሮጀክቶች|Projects
announcements|ማስታወቂያዎች|Announcements
manage_users|ተጠቃሚዎችን ማስተዳደር|Manage users
formerMember|የቀድሞ አባል|Former member
permanentDelete|ለዘላለም ሰርዝ|Permanently delete user
permanentDeleteTitle|የመለያ ቋሚ ስረዛ — ከባድ ውሳኔ|Permanent account deletion — irreversible
permanentDeleteHelp|የተጠቃሚው መለያ፣ ይለፍ ቃል፣ ፎቶ፣ ኢሜይል፣ የመግቢያ ክፍለ ጊዜዎችና ያልጸደቁ የኮድ ጥያቄዎች ይሰረዛሉ። የድርጅቱ ሪፖርት፣ እቅድ፣ መገኘትና የውሳኔ ታሪክ በስም ሳይጠቅሱ ይቀመጣሉ። የነፃ ጽሑፍ ይዘቶች፣ የወረዱ ምትኬዎችና ውጫዊ ስርዓቶች ያንን ሰው ሊጠቅሱ ይችላሉ፤ ለብቻቸው ግምገማ ይፈልጋሉ።|The account, password, photo, email, sessions and recovery challenges will be deleted. Organization reports, plans, attendance and review history remain, with structured authorship anonymized. Free-text content, downloaded backups and external systems may still identify this person and need separate review.
permanentDeleteVerify|ለማረጋገጥ የተጠቃሚውን መግቢያ ስም በትክክል ጻፍ|Type the exact username to confirm
permanentDeletePhrase|DELETE ብለህ ጻፍ|Type DELETE
permanentDeletePassword|የራስህ የFull Admin ይለፍ ቃል|Your Full Admin password
permanentDeleteAcknowledge|ይህ ስረዛ ከፕላትፎርሙ መመለስ እንደማይቻል ተረድቻለሁ።|I understand this action cannot be undone in the platform.
permanentDeleteConfirm|የመጨረሻ ማረጋገጫ — ለዘላለም ሰርዝ|Final confirmation — permanently delete
permanentDeleteDone|መለያው ተሰርዟል፤ የድርጅቱ መዝገቦች ተጠብቀው በስም ሳይጠቅሱ ተመዝግበዋል።|Account deleted; organizational records preserved with structured identifying fields anonymized.
permanentDeleteFinal|ይህን መለያ ከፕላትፎርሙ ለዘላለም ለመሰረዝ ያረጋግጣሉ? ሂደቱ አይመለስም።|Are you sure you want to permanently delete this account? This cannot be undone.
purgeConfirmation|የተጠቃሚ ስምንና DELETE የሚለውን ማረጋገጫ በትክክል ያስገቡ።|Enter the exact username and DELETE confirmation phrase.
removeUser|መግቢያውን ዝጋ|Remove user
restore|መለያውን መልስ|Restore account
confirmRemove|የዚህን ሰው መግቢያ መዝጋት ይፈልጋሉ? የቀድሞ ሥራው ይቀመጣል።|Remove this person's access? Their previous work will be retained.
confirmDelete|ይህን መዝገብ ለመሰረዝ ያረጋግጡ።|Confirm deletion of this record.
resetPassword|ጊዜያዊ የይለፍ ቃል ስጥ|Set temporary password
exportData|የሥራ መዝገቦችን አውርድ|Download workspace records
audit|የአስተዳደር ለውጦች ታሪክ|Administration history
directorComment|የዳይሬክተር አስተያየት|Director comment
publicComment|ሪፖርት ማየት ለሚችሉ አባላት ይታይ|Visible to members with report access
private|ለተፈቀደላቸው ገምጋሚዎች|Reviewers only
context|የሪፖርቱ ዝርዝሮች|Report details
programType|የፕሮግራም ዓይነት|Program type
regular|መደበኛ ሰኞ|Regular Monday
special|ልዩ ፕሮግራም|Special program
eventProgram|ዝግጅት|Event
monthlyAttendance|የተመረጠው ወር የመገኘት ማጠቃለያ|Attendance in the selected month
expected|መገኘቱ ይጠበቃል|Expected to attend
exception|በዚህ ጊዜ መገኘቱ አይጠበቅም|Attendance optional for this session
editProfile|ፕሮፋይል አስተካክል|Edit profile
occupation|ሌላ ሥራ ወይም ንግድ|Other occupation or business
cancel|ተው|Cancel
views|ዕይታዎች / ተደራሽነት|Views / reach
engagement|ተሳትፎ|Engagement
followers|አዲስ ተከታዮች|New followers
expiry|የሚያበቃበት ቀን|Expiry
country|ሀገር|Country
region|ክልል / የከተማ አስተዳደር|Region / chartered city
city|ከተማ|City / town
subcity|ክፍለ ከተማ|Sub-city
woreda|ወረዳ|Woreda
kebele|ቀበሌ|Kebele
landmark|ሰፈር / የአቅራቢያ ምልክት|Neighborhood / landmark
email|ኢሜይል|Email
reportedBy|ያቀረበው|Submitted by
previousStatus|በሪፖርቱ ላይ የተመዘገበ ሁኔታ|Recorded report status
saved|ተቀምጧል።|Saved.
required|እባክዎ አስፈላጊዎቹን መስኮች ይሙሉ።|Complete the required fields.
consentRequired|12ቱንም የግላዊነት ድንጋጌዎች ያንብቡና ይቀበሉ።|Read and accept all 12 privacy statements.
profileRequired|ስም፣ ፎቶ፣ ስልክ፣ ኢሜይል፣ ሙያና ከተማ ይሙሉ።|Enter a name, photo, phone, valid email, profession and city.
weakPassword|ቢያንስ 8 ቁምፊዎች፣ አንድ የላቲን ፊደልና አንድ ቁጥር ያስገቡ።|Use at least 8 characters, including a Latin letter and a number.
newPasswordNeeded|ከጊዜያዊው የተለየ አዲስ የይለፍ ቃል ይምረጡ።|Choose a password different from the temporary password.
mismatch|የይለፍ ቃሎቹ አይመሳሰሉም።|The two passwords do not match.
invalidLogin|የተጠቃሚ ስሙንና የይለፍ ቃሉን ያረጋግጡ።|Check your username and password.
wrongPassword|የአሁኑ የይለፍ ቃል አልተዛመደም።|The current password did not match.
setupKey|የማዋቀሪያ ቁልፉን በጋራ ሰርቨሩ ላይ ካስቀመጡት ጋር ያመሳክሩ።|Check the setup key configured on the shared service.
expired|እባክዎ እንደገና ይግቡ።|Please sign in again.
forbidden|ይህን ለመፈጸም ፈቃድ ያስፈልጋል።|This action requires additional permission.
nameTaken|የተጠቃሚ ስሙ ተይዟል።|This username is already in use.
usernameRequired|የተጠቃሚ ስም ያስገቡ።|Enter a username.
lastAdmin|በመጀመሪያ ለሌላ ንቁ አባል ሙሉ የአስተዳዳሪ መብት ይስጡ።|Give another active member full administrator rights first.
revisionNote|ምን መሻሻል እንዳለበት ይጻፉ።|Describe what needs to change.
conflict|በሌላ ቦታ ተሻሽሏል። የታደሰውን መዝገብ ይመልከቱና ድጋሚ ይምረጡ።|This record changed. Check its latest version and repeat your action.
offline|የጋራ መዝገቡን መገናኘት አልተቻለም። ግንኙነቱንና የሰርቨሩን አድራሻ ያረጋግጡ።|The shared service is unreachable. Check the connection and service URL.
serviceError|የጋራ ሰርቨሩ ጥያቄውን ማጠናቀቅ አልቻለም።|The shared service could not complete the request.
quota|የአሳሹ ማከማቻ ሞልቷል። ትንሽ ፎቶ ወይም አባሪ ይጠቀሙ።|Browser storage is full. Try a smaller photo or attachment.
badStore|የአሳሹ መዝገብ ሊነበብ አልቻለም። የድረ ገጹን መረጃ ይጠብቁ።|The browser records could not be read. Preserve this site's data.
configInvalid|በማዋቀሪያው ውስጥ የHTTPS አድራሻ ያስገቡ።|Enter the HTTPS service URL in the configuration.
originDenied|የGitHub Pages አድራሻዎን በሰርቨሩ ALLOWED_ORIGIN ላይ ያረጋግጡ።|Check the Pages origin in ALLOWED_ORIGIN on the service.
fileInvalid|የአባሪው መጠን እስከ 2 MB ይሁን።|Use an attachment of up to 2 MB.
photoInvalid|እስከ 2 MB የሚሆን ፎቶ ይምረጡ።|Choose an image of up to 2 MB.
docInvalid|እስከ 5 MB የሚሆን PDF፣ JPG ወይም PNG ይምረጡ።|Choose a PDF, JPEG or PNG of up to 5 MB.
titleRequired|የክንውኑን ወይም የመዝገቡን ርዕስ ይሙሉ።|Enter a title.
planRequired|የእቅዱን ርዕስና ዓላማ ይሙሉ።|Enter the plan title and objective.
monthRequired|ዓመቱንና ወሩን ይምረጡ።|Choose a reporting year and month.
numberInvalid|ዜሮ ወይም ከዜሮ በላይ የሆነ ቁጥር ያስገቡ።|Enter zero or a positive number.
invalidTransition|ለዚህ መዝገብ የሚፈቀደውን የግምገማ እርምጃ ይምረጡ።|Choose an available review action for this record.
sourceLocked|የጥቅምት ዋና ጽሑፍ የተጠበቀ ነው።|The October source text is protected.
attendanceExists|የዚህ ስብሰባ መገኘት ተመዝግቧል። መዝገቡን ይምረጡና ያስተካክሉ።|This attendance entry exists. Select it to edit.
rateLimited|ጥቂት ቆይተው መልሰው ይሞክሩ።|Try again in a few minutes.
missing|መዝገቡ አልተገኘም።|This record could not be found.
tooLong|ጽሑፉን ያሳጥሩ።|Shorten this field.
confirmGrant|የተተኪውን መብት ለማስተላለፍ የማረጋገጫ ሳጥኑን ይምረጡ።|Select the confirmation box to grant successor rights.
onboardingTag|የመጀመሪያ መግቢያ ይጠበቃል|First sign-in setup required
automaticSummary|የመገኘት፣ የፕሮጀክትና የሪፖርት ቁጥሮች ከመዝገቦቹ automatically ይሰላሉ።|Attendance, project and report counts are calculated automatically.
documentWarning|የሰነዱ ስምና መግለጫ ብቻ ይመዘገባሉ።|The registry stores file names and document details only.
`.trim().split('\n');
for(const line of words){const [k,am,en]=line.split('|');extras[k]={am,en};}
const roleText={
 media_leader:['የሚዲያ ክፍል ኃላፊ','Media Department Leader'],followup_leader:['የክትትል ክፍል ኃላፊ','Follow-up Department Leader'],
 service_leader:['የአገልግሎት ቅንጅት ኃላፊ','Service Coordination Department Leader'],counseling_leader:['የምክርና ድጋፍ ክፍል ኃላፊ','Counseling and Support Department Leader'],
 research_leader:['የምርምርና ሥልጠና ኃላፊ','Research and Training Department Leader'],support_leader:['የድጋፍ ክፍል ኃላፊ','Support Department Leader'],establishment_leader:['የማዕከላት ምሥረታ ክፍል ኃላፊ','Centers Establishment Department Leader'],event_leader:['የዝግጅት ክፍል ኃላፊ','Event Department Leader'],
 admin_finance:['የአስተዳደርና ፋይናንስ ክፍል ኃላፊ','Administration and Finance HQ Leader'],monday_leader:['የሰኞ ፕሮግራም ኃላፊ','Monday Staff Program Leader'],
 country_director:['የሀገር ውስጥ ዳይሬክተር','Country Director'],international_director:['ዓለም አቀፍ ዳይሬክተር','International Director'],
 international_staff:['ዓለም አቀፍ ሠራተኛ','International Staff'],assisting_staff:['ረዳት ሠራተኛ','Assisting Staff'],prayer_staff:['የጸሎት አገልጋይ','Prayer Staff'],staff:['ሠራተኛ','Staff'],
 center_senior_leader:['የማዕከል ከፍተኛ መሪ','Center Senior Leader'],center_leader:['የማዕከል መሪ','Center Leader'], potential_center_leader:['እጩ የማዕከል መሪ','Potential Center Leader'],
 center_department_leader:['የማዕከል ክፍል መሪ','Center Department Leader'],potential_department_leader:['እጩ የክፍል መሪ','Potential Department Leader'],
 volunteer:['በጎ ፈቃደኛ','Volunteer'],hq_staff:['የHQ ሠራተኛ','HQ Staff']
};
const departments={'Media':'ሚዲያ','Follow-up':'ክትትል','Service Coordination':'የአገልግሎት ቅንጅት','Counseling and Support':'ምክርና ድጋፍ','Research and Training':'ምርምርና ሥልጠና','Event':'ዝግጅት','Administration and Finance':'አስተዳደርና ፋይናንስ','Monday Staff Program':'የሰኞ ሠራተኞች ፕሮግራም','Support Team Department':'የድጋፍ ክፍል','Department of Centers Establishment':'የማዕከላት ምሥረታ ክፍል','International':'ዓለም አቀፍ','Prayer':'ጸሎት'};
let lang=localStorage.gLang==='en'?'en':'am', mode='login', bootstrap=false, emailRecovery=false, view=null, tab='dashboard', editReport=null, editPlan=null, editProfile=null;
const edits={},busy=new Set();
const t=k=>extras[k]?.[lang]??base.translations[lang][k]??k;
const role=r=>roleText[r]?.[lang==='am'?0:1]||r||'—';
const dept=d=>lang==='am'?(departments[d]||d):d;
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=id=>$(id).value;
const set=(id,v)=>{$(id).value=v??'';};
const vis=(el,show)=>{(typeof el==='string'?$(el):el).classList.toggle('hide',!show);};
const options=(a,current)=>a.map(([v,label])=>`<option value="${h(v)}" ${v===current?'selected':''}>${h(label)}</option>`).join('');
const empty=()=>`<p class="muted">${h(t('empty'))}</p>`;
const current=()=>view?.me;
function syncMondayAccess(){const allowed=!view?.onboarding&&isMondayParticipant(current());$('app').dataset.mondayAccess=allowed?'yes':'no';return allowed;}
const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Addis_Ababa',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function monday(date){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
function dateTime(s){return s&&Number.isFinite(Date.parse(s))?new Intl.DateTimeFormat(lang==='am'?'am-ET-u-ca-gregory':'en-GB',{timeZone:'Africa/Addis_Ababa',dateStyle:'medium',timeStyle:'short'}).format(new Date(s)):'—';}
const photo=p=>typeof p==='string'&&/^data:image\/(png|jpe?g|gif|webp|bmp|avif|heic|heif);base64,[A-Za-z0-9+/=]+$/i.test(p)?p:'./icons/icon-192.png';
function fileData(file){return new Promise((resolve,reject)=>{if(!file)return resolve(null);if(file.size>2*1024*1024)return reject(Error('fileInvalid'));const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('fileInvalid'));r.readAsDataURL(file);});}
function assignment(select,depId){
 const selectedRole=val(select),dep=roleDepartments[selectedRole],isCenter=['center_senior_leader','center_leader','center_department_leader','potential_center_leader','potential_department_leader','volunteer'].includes(selectedRole);
 const prior=val(depId),list=isCenter?CENTER_UNITS.map(d=>[d.en,lang==='am'?d.am:d.en]):Object.keys(departments).map(d=>[d,dept(d)]);
 $(depId).innerHTML=options([['','—'],...list],prior);
 if(dep)set(depId,dep);
 $(depId).disabled=!!dep;
 const centerInput=$(select==='regRole'?'regCenter':'addCenter');if(centerInput)centerInput.required=isCenter;
}
function notification(key,isError=false){
 const k=key==='pending'?'pendingLogin':key==='removed'?'removedLogin':key;
 if($('app').classList.contains('hide')){$('authMsg').textContent=t(k);$('authMsg').classList.toggle('ok',!isError);return;}
 $('feedback').innerHTML=`<button type="button" aria-label="${h(t('clear'))}" data-dismiss>×</button>${h(t(k))}`;vis('feedback',true);$('feedback').classList.toggle('error',isError);
}
function forgetEdits(){editReport=editPlan=editProfile=null;for(const k of Object.keys(edits))delete edits[k];}
function signedOut(){
 view=null;syncMondayAccess();forgetEdits();store.clearSession();vis('app',false);vis('auth',true);vis('feedback',false);
 window.dispatchEvent(new Event('gaius:nexus-session-cleared'));
 // Clear rendered private content and fields before another account uses the same tab.
 for(const id of ['adminUsers','auditList','queue','reportList','recent','planList','docList','peopleList','profileFields','attendanceList','annList','projectList'])$(id).replaceChildren();
 for(const id of ['monthChart','performanceMonths','deptSummary','attendanceSummary','batchRows','successorUser','userCounts','who','profileName','profileRole','profileSummary'])$(id).replaceChildren();
 for(const id of ['kCount','kSubmitted','kApproved','kPending','kPlan','kActual','kRate'])$(id).textContent='—';
 $('profilePhoto').removeAttribute('src');$('miniPhoto').removeAttribute('src');$('profileEditor').open=false;vis('addForm',false);vis('deleteReport',false);
 document.querySelectorAll('.cancelRecord').forEach(b=>vis(b,false));
 for(const el of document.querySelectorAll('input:not([type=checkbox]),textarea'))if(el.type!=='button')el.value='';
 set('regCountry','Ethiopia');$('photoPreview').removeAttribute('src');vis('photoPreview',false);setMode('login');
}
async function info(){const result=await store.info();bootstrap=result.bootstrap;emailRecovery=result.emailRecovery===true;authText();}
async function refresh(){
 const next=await store.state(); if(next.onboarding){if(!view?.onboarding){view=next;onboarding();}else view=next;return;}
 const first=!view||view.onboarding;view=next;syncMondayAccess();
 if(first){vis('auth',false);vis('app',true);forgetEdits();defaults();tab=seesReports(current())?'dashboard':isMondayParticipant(current())?'attendance':'profilePage';}
 renderAll();
 // UI-only notification: no credentials or organizational data leave the browser.
 window.dispatchEvent(new CustomEvent('gaius:nexus-session-ready',{
  detail:{id:next.me?.id,role:next.me?.role}
 }));
}
async function act(el,fn){
 if(busy.has(el))return;busy.add(el);if(el.matches('button'))el.disabled=true;
 try{await fn();}catch(e){
  if(['expired','removed','pending'].includes(e.message)&&store.hasSession()){signedOut();info().catch(()=>{});}
  if(e.message==='conflict' && current())try{await refresh();}catch{}
  notification(e.message,true);
 }finally{busy.delete(el);if(el.matches('button')&&el.isConnected)el.disabled=false;}
}
function on(id,fn){$(id).onclick=e=>act(e.currentTarget,fn);}
async function mutate(action,payload,done){
 const result=await store.command(action,payload);
 if(done)done(result);
 await refresh();notification('saved');return result;
}
function authText(){
 $('authScope').textContent=t(store.shared?'sharedExplain':'localExplain');
 $('modeLine').innerHTML=h(t(store.shared?'sharedMode':'localMode'))+' · '+button('refresh','refresh',{},'refreshBtn');
 $('authInstructions').textContent=mode==='complete'?t('completeHelp'):bootstrap?t(store.shared?'setupShared':'setupLocal'):t('requestHelp');
 vis('authInstructions',['register','complete'].includes(mode));vis('directorBox',mode==='register'&&directors.includes(val('regRole'))&&(store.shared&&bootstrap));
 $('directorBox').querySelector('label').textContent=t(store.shared?'setupKeyLabel':'localCodeLabel');
 $('authBtn').textContent=t(mode==='login'?'login':mode==='complete'?'complete':'register');
 vis('forgotPassword',mode==='login');
 $('resetPanel').querySelector('.notice').textContent=t(!store.shared?'emailRequiresServer':!emailRecovery?'emailNotConfigured':'recoveryInstructions');
}
function setMode(v){
 mode=v;const reg=['register','complete'].includes(v),reset=v==='reset';
 vis('registerFields',reg);vis('confirmBox',reg);vis('authCredentials',!reset);vis('resetPanel',reset);
 $('registerTab').disabled=v==='complete';$('loginTab').textContent=t(v==='complete'?'cancel':'login');$('registerTab').textContent=t('register');
 $('loginTab').classList.toggle('on',!reg);$('registerTab').classList.toggle('on',reg);
 $('username').readOnly=v==='complete';$('regRole').disabled=v==='complete';
 assignment('regRole','regDept');if(v==='complete')$('regDept').disabled=true;
 $('authMsg').textContent='';authText();
}
function translate(){
 document.documentElement.lang=lang;localStorage.gLang=lang;set('langAuth',lang);set('langApp',lang);
 document.querySelectorAll('[data-i]').forEach(x=>x.textContent=t(x.dataset.i));document.querySelectorAll('[data-ph]').forEach(x=>x.placeholder=t(x.dataset.ph));
 for(const id of ['regRole','addRole'])for(const o of $(id).options)o.textContent=role(o.value);
 for(const id of ['reportDept','planDept'])for(const o of $(id).options){if(!o.hasAttribute('value'))o.value=o.textContent;o.textContent=dept(o.value);}
 assignment('regRole','regDept');assignment('addRole','addDept');
 const checked=Array.from(document.querySelectorAll('.pcheck'),c=>c.checked);
 $('privacy').innerHTML=base.privacy.map((p,i)=>`<label class="privacyRow"><span>${p[0]}</span><span><input type="checkbox" class="pcheck" ${checked[i]?'checked':''}> ${h(p[lang==='am'?1:2])}</span></label>`).join('');
 $('logout').textContent=lang==='am'?'ውጣ':'Log out';$('loginTab').textContent=t(mode==='complete'?'cancel':'login');$('registerTab').textContent=t('register');authText();
 if(view&&!view.onboarding)renderAll();
}
const profileKeys=['name','phone','email','profession','church','churchService','occupation','talents','hobbies','languages','center'];
const addrKeys=['country','region','city','subcity','woreda','kebele','landmark'];
const cap=k=>k[0].toUpperCase()+k.slice(1);
function regProfile(){
 const data=Object.fromEntries(profileKeys.filter(k=>$('reg'+cap(k))).map(k=>[k,val('reg'+cap(k))]));
 data.address=Object.fromEntries(addrKeys.map(k=>[k,val('reg'+cap(k))]));data.accepted=Array.from(document.querySelectorAll('.pcheck'),x=>x.checked);
 return data;
}
function onboarding(){
 const u=current();vis('auth',true);vis('app',false);
 for(const k of profileKeys)if($('reg'+cap(k)))set('reg'+cap(k),u[k]);
 for(const k of addrKeys)if(u.address?.[k])set('reg'+cap(k),u.address[k]);requiredCenterInput();
 $('regPhoto').value='';$('photoPreview').src=photo(u.photo);vis('photoPreview',!!u.photo);
 set('username',u.username);set('password','');set('confirmPassword','');set('regRole',u.role);set('regDept',u.department);setMode('complete');
 document.querySelectorAll('.pcheck').forEach(x=>x.checked=false);
}
on('directorSendOtp',async()=>{
 if(!store.shared)throw Error('directorRequiresServer');
 if(!val('regEmail').trim()||!val('directorCode').trim())throw Error('Email and setup key are required');
 await store.requestDirectorCode(val('regRole'),val('regEmail'),val('directorCode'));
 alert(lang==='am'?'የ8 አሃዝ ኮዱን ከEmail ይመልከቱ። በ10 ደቂቃ ውስጥ ይጠቀሙ።':'Check your email for the eight-digit code. Use it within 10 minutes.');
});
on('authBtn',async()=>{
 const credentials={username:val('username').trim(),password:val('password')};
 if(mode==='login'){await store.login(credentials);await refresh();return;}
 if(credentials.password!==val('confirmPassword'))throw Error('mismatch');
 requiredCenterInput();if($('regCenter').required&&!val('regCenter').trim())throw Error('centerRequired');
 const data={...regProfile(),...credentials,role:val('regRole'),department:val('regDept'),photo:await fileData($('regPhoto').files[0])||current()?.photo||'',setupKey:val('directorCode'),directorEmailCode:val('directorOtp')};
 if(mode==='complete'){await mutate('profile.complete',data);resetAuthForm();return;}
 const res=await store.register(data);
 resetAuthForm();setMode('login');await info();set('username',credentials.username);
 if(res.status==='pending'){notification('pending');return;}
 await store.login(credentials);await refresh();
});
function resetAuthForm(){
 for(const field of $('registerFields').querySelectorAll('input')){if(field.type==='checkbox')field.checked=false;else field.value='';}
 set('regCountry','Ethiopia');set('password','');set('confirmPassword','');$('photoPreview').removeAttribute('src');vis('photoPreview',false);
}
on('forgotPassword',async()=>{vis('resetCodeArea',false);setMode('reset');await info();$('resetEmail').focus();});
on('resetBack',async()=>{for(const id of ['resetCode','resetNewPassword','resetConfirmPassword'])set(id,'');vis('resetCodeArea',false);setMode('login');await info();});
on('sendResetCode',async()=>{
 await store.requestPasswordCode(val('resetEmail'));
 vis('resetCodeArea',true);
 notification('recoveryRequested');$('resetCode').focus();
});
on('finishReset',async()=>{
 if(val('resetNewPassword')!==val('resetConfirmPassword'))throw Error('mismatch');
 await store.confirmPasswordCode(val('resetEmail'),val('resetCode'),val('resetNewPassword'));
 for(const id of ['resetCode','resetNewPassword','resetConfirmPassword'])set(id,'');
 vis('resetCodeArea',false);setMode('login');notification('passwordChanged');
});
on('loginTab',async()=>{if(mode==='complete'){try{await store.logout();}finally{signedOut();}return;}setMode('login');});
on('registerTab',async()=>{await info();setMode('register');});
on('logout',async()=>{try{await store.logout();}finally{signedOut();}await info();});
const centerRegistrationRoles=new Set(['center_senior_leader','center_leader','potential_center_leader','center_department_leader','potential_department_leader','volunteer']);
function requiredCenterInput(){const isCenter=centerRegistrationRoles.has(val('regRole'));
 $('regCenter').required=isCenter;$('regCenterStar').textContent=isCenter?'*':'';
 if(['potential_center_leader','potential_department_leader','volunteer'].includes(val('regRole')))$('regDept').required=false;
 else $('regDept').required=true;
 if(directors.includes(val('regRole'))){$('regDept').required=false;set('regDept','');}
 $('regDeptStar').textContent=$('regDept').required?'*':'';
}
$('regRole').onchange=()=>{assignment('regRole','regDept');requiredCenterInput();authText();};
$('addRole').onchange=()=>assignment('addRole','addDept');
$('regPhoto').onchange=()=>act($('regPhoto'),async()=>{const data=await fileData($('regPhoto').files[0]);$('photoPreview').src=photo(data);vis('photoPreview',!!data);});
for(const id of ['langApp','langAuth'])$(id).onchange=()=>{lang=val(id);translate();};


const source=base.originals.map(r=>({...r,month:'2026-10',submittedAt:'2026-11-01T09:00:00Z',department:r.enTitle,original:true}));
const reports=()=>seesReports(current())?[...source,...view.reports]:[];
const reviewOf=(kind,id)=>view.reviews.find(r=>r.id===kind+':'+id);
const memberName=id=>[...view.directory,...seedPeople,...view.former].find(p=>p.id===id)?.name||id||'—';
const listFor=kind=>kind==='plan'?view.plans:reports();
const item=(kind,id)=>listFor(kind).find(r=>r.id===id);
const badge=s=>`<span class="state ${h(s)}">${h(t(s))}</span>`;
function button(action,label,attrs={},cls='btn ghost'){
 return `<button type="button" class="${cls}" data-action="${action}" ${Object.entries(attrs).map(([k,v])=>`data-${k}="${h(v)}"`).join(' ')}>${h(t(label))}</button>`;
}
function fields(pairs){
 const a=pairs.filter(([,v])=>v!==undefined&&v!==null&&v!=='');
 return a.length?`<dl class="fieldgrid">${a.map(([k,v])=>`<div><dt>${h(t(k))}</dt><dd>${h(v)}</dd></div>`).join('')}</dl>`:'';
}
function selectOptions(id,entries,fallback=''){
 const old=val(id),selected=entries.some(([v])=>v===old)?old:fallback;
 $(id).innerHTML=options(entries,selected);
}
function reportOptions(){return [['draft',t('draft')],['submitted',t('submitted')],['delayed',t('delayed')]];}
function defaults(){
 const today=day();
 for(const id of ['dashMonth','reportMonth','planMonth'])set(id,today.slice(0,7));
 set('dashYear',today.slice(0,4));set('activityDate',today);set('attDate',monday(today));
 $('reportStatus').innerHTML=options(reportOptions(),'submitted');
 set('reportDept',current().department||'Media');if(!val('reportDept'))$('reportDept').selectedIndex=0;
 set('planDept',current().department||'Media');if(!val('planDept'))$('planDept').selectedIndex=0;
 assignment('addRole','addDept');
}
function allowPage(id){
 if(!current()||view.onboarding)return false;
 if(id==='attendance'&&!isMondayParticipant(current()))return false;
 if(id==='workspace'&&!isMondayParticipant(current()))return false;
 // Unassigned staff use Monday staff workspace, attendance, and own profile only.
 if(!full(current())&&!seesReports(current())&&!permit(current(),'manage_users'))
   return ['workspace','attendance','profilePage'].includes(id);
 if(['dashboard','reports'].includes(id))return seesReports(current());
 if(id==='reportEntry')return writesReports(current());
 if(id==='documents')return permit(current(),'documents');
 if(id==='admin')return permit(current(),'manage_users');
 return true;
}
function navigate(id,scroll=true){
 tab=allowPage(id)?id:(isMondayParticipant(current())?'attendance':'profilePage');
 document.querySelectorAll('.page').forEach(p=>p.classList.toggle('on',p.id===tab));
 document.querySelectorAll('.nav').forEach(n=>{const on=n.dataset.page===tab;vis(n,allowPage(n.dataset.page));n.classList.toggle('on',on);n.classList.toggle('ghost',!on);if(on)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});
 vis('auditPanel',tab==='admin'&&full(current()));
 if(scroll)window.scrollTo({top:0,behavior:'auto'});
}
function revisionHistory(review){
 if(!review?.history?.length)return '';
 return `<details><summary>${h(t('reviewHistory'))} (${review.history.length})</summary>${review.history.slice().reverse().map(e=>
 `<div class="compactRow">${badge(e.state)} · ${h(e.byName)} · ${h(dateTime(e.at))}${e.note?`<div>${h(e.note)}</div>`:''}</div>`).join('')}</details>`;
}
function reviewBlock(kind,r){
 const v=reviewOf(kind,r.id),state=flow(r,v);
 let html='';
 if(v?.recordVersion===version(r))html+=`<div class="muted">${h(v.byName)} · ${h(dateTime(v.at))}${v.note?' · '+h(v.note):''}</div>`;
 if(directors.includes(current()?.role)&&state!=='draft'){
  const actions=[['approved','approve'],['revision_requested','returnReview'],['under_review','startReview']];
  if(state==='approved')actions.push(['locked','lock']);
  html+=`<details class="reviewControls"><summary>${h(t('reviews'))}</summary><label>${h(t('reviewNote'))}<textarea data-review-note rows="2"></textarea></label><div class="actions">${actions.filter(([s])=>s!==state).map(([s,label])=>button('review',label,{decision:s},s==='approved'?'btn':'btn ghost')).join('')}</div></details>`;
 }
 return html+revisionHistory(v);
}
function commentBlock(r){
 const comments=view.comments.filter(c=>c.reportId===r.id),can=permit(current(),'comments');
 const editor=(c={})=>`<details class="commentEditor" data-comment="${h(c.id||'')}" data-version="${version(c)}"><summary>${h(c.id?t('edit'):t('directorComment'))}</summary><label>${h(t('directorComment'))}<textarea data-comment-text>${h(c.text||'')}</textarea></label><label class="checkLine"><input type="checkbox" data-visible ${c.visible===false?'':'checked'}> ${h(t('publicComment'))}</label><div class="actions">${button('comment','save')}</div></details>`;
 const mine=comments.find(c=>c.directorId===current().id);
 return comments.map(c=>`<div class="notice"><b>${h(c.author)}</b> · ${h(t('directorComment'))}${c.visible?'':' · '+h(t('private'))}<div class="reporttext">${h(c.text)}</div>${can&&(full(current())||c.directorId===current().id)?editor(c):''}${full(current())?button('delete-record','delete',{bucket:'comments',id:c.id,version:version(c)}):''}</div>`).join('')+(can&&!mine?editor():'');
}
const reportMap={recordId:'recordId',reportMonth:'month',activityDate:'activityDate',reportDept:'department',reportCenter:'center',activity:'activity',planned:'planned',actual:'actual',result:'result',problem:'problem',challenge:'challenge',actionTaken:'actionTaken',nextAction:'nextAction',actionOwner:'actionOwner',dueDate:'dueDate',priority:'priority',dataSource:'dataSource',views:'views',engagement:'engagement',followers:'followers',evidence:'evidence',notes:'notes'};
const planMap={planTitle:'title',planObjective:'objective',planTarget:'target',planDept:'department',planMonth:'month',planOwner:'owner',planDue:'dueDate',planProject:'projectId'};
const readMap=map=>Object.fromEntries(Object.entries(map).map(([id,k])=>[k,val(id)]));
function editAllowed(r,kind){
 return !r.original&&(full(current())||(r.userId===current().id&&['draft','revision_requested'].includes(flow(r,reviewOf(kind,r.id)))));
}
function recordCard(kind,r,compact=false){
 const v=reviewOf(kind,r.id),state=flow(r,v),plan=kind==='plan',label=plan?r.title:r.original?(lang==='am'?r.amTitle:r.enTitle):r.activity||r.department;
 const head=`<div class="top"><h2>${h(label)}</h2>${badge(state)}</div><div class="muted">${[r.recordId||(!plan?r.id:''),r.month,dept(r.department),r.center,r.submitterName,r.submittedAt?dateTime(r.submittedAt):''].filter(Boolean).map(h).join(' · ')}</div>`;
 let content='';
 if(compact){
  content=`<div class="actions">${button('open-item','details')}</div>`;
 }else{
  if(plan){
   const pro=view.projects.find(x=>x.id===r.projectId);
   content=`<div class="reporttext">${h(r.objective)}</div>`+fields([['target',r.target],['owner',r.owner],['deadline',r.dueDate],['linkedProject',pro?.title||r.projectId]]);
  }else{
   content=(r.original?`<p class="pill">${h(t('source'))}</p>`:'')+`<div class="reporttext">${h(r.original?r[lang]:r.result)}</div>`;
   if(!r.original){
    const pct=r.planned>0&&r.actual!=null?Math.round(r.actual/r.planned*100)+'%':'N/A';
    content+=fields([['planned',r.planned],['actual',r.actual],['achievement',pct],['challenge',r.challenge],['nextAction',r.nextAction]]);
    content+=`<details><summary>${h(t('context'))}</summary>${fields([['activityDate',r.activityDate],['previousStatus',t(r.status||'submitted')],['problem',r.problem],['actionTaken',r.actionTaken],['owner',r.actionOwner],['deadline',r.dueDate],['priority',r.priority],['dataSource',r.dataSource],['views',r.views],['engagement',r.engagement],['followers',r.followers],['evidence',r.evidence],['notes',r.notes],['role',role(r.submitterRole)]])}</details>`;
   }
  }
  content+=reviewBlock(kind,r);
  if(!plan)content+=commentBlock(r);
  content+=`<div class="actions">${editAllowed(r,kind)?button('edit-item','edit'):''}${full(current())&&!r.original?button('delete-record','delete',{bucket:plan?'plans':'reports',id:r.id,version:version(r)}):''}</div>`;
 }
 return `<article class="card workItem" data-kind="${kind}" data-id="${h(r.id)}" data-version="${version(r)}" data-review-version="${version(v)}">${head}${content}</article>`;
}
function renderReports(){
 if(!seesReports(current())){$('reportList').replaceChildren();$('recent').replaceChildren();return;}
 const rows=reports(),ds=[...new Set([...Object.values(roleDepartments).filter(Boolean),...rows.map(r=>r.department).filter(Boolean)])];
 selectOptions('deptFilter',[['',t('all')],...ds.map(d=>[d,dept(d)])]);
 selectOptions('reviewFilter',[['',t('all')],...['submitted','draft','under_review','approved','revision_requested','locked'].map(k=>[k,t(k)])]);
 const q=val('search').trim().toLowerCase();
 const visible=rows.filter(r=>(!val('deptFilter')||r.department===val('deptFilter'))&&(!val('monthFilter')||r.month===val('monthFilter'))&&(!val('reviewFilter')||flow(r,reviewOf('report',r.id))===val('reviewFilter'))&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
 $('reportList').innerHTML=visible.slice().reverse().map(r=>recordCard('report',r)).join('')||empty();
}
function totals(rows){
 let planned=0,actual=0,pairedPlan=0,pairedActual=0,hasP=false,hasA=false;
 for(const r of rows){
  if(r.planned!=null&&r.planned!==''){hasP=true;planned+=Number(r.planned)||0;}
  if(r.actual!=null&&r.actual!==''){hasA=true;actual+=Number(r.actual)||0;
   if(r.planned>0){pairedPlan+=Number(r.planned);pairedActual+=Number(r.actual)||0;}
  }
 }
 return {planned:hasP?planned:'—',actual:hasA?actual:'—',rate:pairedPlan>0?Math.round(100*pairedActual/pairedPlan)+'%':'N/A'};
}
function renderDashboard(){
 if(!seesReports(current()))return;
 const annual=val('period')==='annual',all=reports(),month=val('dashMonth'),year=annual?val('dashYear'):month.slice(0,4);
 const a=all.filter(r=>annual?r.month?.startsWith(year+'-'):r.month===month);
 const submitted=a.filter(r=>flow(r,reviewOf('report',r.id))!=='draft');
 const approved=submitted.filter(r=>['approved','locked'].includes(flow(r,reviewOf('report',r.id))));
 const pending=submitted.filter(r=>['submitted','under_review'].includes(flow(r,reviewOf('report',r.id))));
 const total=totals(submitted);for(const [id,n] of Object.entries({kCount:a.length,kSubmitted:submitted.length,kApproved:approved.length,kPending:pending.length,kPlan:total.planned,kActual:total.actual,kRate:total.rate}))$(id).textContent=n;
 vis($('dashMonth').parentElement,!annual);vis($('dashYear').parentElement,annual);
 const byMonth=Array.from({length:12},(_,i)=>all.filter(r=>r.month===`${year}-${String(i+1).padStart(2,'0')}`));
 const max=Math.max(1,...byMonth.map(rs=>rs.length));
 $('monthChart').innerHTML=byMonth.map((rs,i)=>`<div><i style="height:${130*rs.length/max}px"></i><small>${i+1}</small><small>${rs.length}</small></div>`).join('');
 $('performanceMonths').innerHTML=`<details><summary>${h(t('monthlyRates'))} · ${h(year)}</summary><div class="monthRates">${byMonth.map((rs,i)=>`<span>${String(i+1).padStart(2,'0')}<b>${totals(rs.filter(r=>flow(r)!=='draft')).rate}</b></span>`).join('')}</div></details>`;
 const ds=new Set([...Object.values(roleDepartments).filter(Boolean),...a.map(r=>r.department).filter(Boolean)]);
 $('deptSummary').innerHTML=Array.from(ds,d=>{const rs=submitted.filter(r=>r.department===d);return `<div class="compactRow"><b>${h(dept(d))}</b> · ${h(t('reports'))} ${rs.length} · ${h(t('achievement'))} ${totals(rs).rate}</div>`;}).join('');
 $('recent').innerHTML=a.slice().reverse().slice(0,5).map(r=>recordCard('report',r,true)).join('')||empty();
}
function renderPlans(){
 $('planList').innerHTML=view.plans.slice().reverse().map(r=>recordCard('plan',r)).join('')||empty();
 const chosen=val('planProject'),ref=editPlan&&item('plan',editPlan.id)?.projectId;
 const ps=view.projects.map(p=>[p.id,p.title]);if(ref&&!ps.some(([id])=>id===ref))ps.push([ref,ref]);
 $('planProject').innerHTML=options([['',t('noProject')],...ps],chosen);
 $('planFormTitle').textContent=t(editPlan?'editPlan':'newPlan');
}
function clearItem(kind){
 const plan=kind==='plan',map=plan?planMap:reportMap;
 for(const id of Object.keys(map)){const el=$(id);if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';}
 if(plan){editPlan=null;set('planMonth',day().slice(0,7));$('planFormTitle').textContent=t('newPlan');}
 else{editReport=null;set('editReportId','');set('reportMonth',day().slice(0,7));set('activityDate',day());set('reportStatus','submitted');vis('deleteReport',false);}
 const depEl=$(plan?'planDept':'reportDept');if([...depEl.options].some(o=>o.value===current().department))depEl.value=current().department;
}
function editItem(kind,r){
 const map=kind==='plan'?planMap:reportMap;
 for(const [id,k] of Object.entries(map)){
  const el=$(id),value=r[k];if(el.tagName==='SELECT' && value && ![...el.options].some(o=>o.value===value))el.add(new Option(value,value));
  set(id,value);
 }
 const editing={id:r.id,version:version(r),reviewVersion:version(reviewOf(kind,r.id))};
 if(kind==='plan'){editPlan=editing;$('planFormTitle').textContent=t('editPlan');navigate('plans');$('planTitle').focus();}
 else{editReport=editing;set('editReportId',r.id);set('reportStatus',['draft','delayed'].includes(r.status)?r.status:'submitted');vis('deleteReport',full(current()));navigate('reportEntry');}
}
async function saveItem(kind,status){
 const plan=kind==='plan',edit=plan?editPlan:editReport;
 await mutate(kind+'.save',{...readMap(plan?planMap:reportMap),...edit,status},()=>{clearItem(kind);navigate(plan?'plans':'reports');});
}
on('submitReport',()=>saveItem('report',val('reportStatus')));on('clearReport',()=>clearItem('report'));
on('submitPlan',()=>saveItem('plan','submitted'));on('draftPlan',()=>saveItem('plan','draft'));on('clearPlan',()=>clearItem('plan'));
on('deleteReport',async()=>{if(editReport&&confirm(t('confirmDelete')))await mutate('record.remove',{bucket:'reports',id:editReport.id,version:editReport.version},()=>{clearItem('report');navigate('reports');});});
for(const id of ['search','monthFilter','deptFilter','reviewFilter'])$(id).oninput=renderReports;
for(const id of ['period','dashMonth','dashYear'])$(id).oninput=renderDashboard;


const people=()=>[...new Map([...seedPeople,...view.directory].map(p=>[p.id,p])).values()].filter(p=>view.directory.some(u=>u.id===p.id)||isMondayParticipant(current()));
const mondayRoster=()=>people().filter(isMondayParticipant);
function expected(p,date,type){
 if(!p)return false;
 const name=(p.name||'').toLowerCase().trim().split(/\s+/)[0];
 if(p.regular===false||['selam','ሰላም','kesemay','ቀሰማይ','ከሰማይ','meron','ሜሮን'].includes(name))return type!=='regular';
 if(p.monthlyOnce||['nathnael','nathanael','ናትናኤል'].includes(name)){
  return !view.attendance.some(a=>a.personId===p.id&&a.date?.slice(0,7)===date.slice(0,7)&&a.date<date&&['present','late'].includes(a.status));
 }
 return true;
}
function entityButtons(bucket,r,editable){
 if(!editable&&!full(current()))return '';
 return `<div class="actions">${editable?button('edit-record','edit',{bucket,id:r.id}):''}${full(current())?button('delete-record','delete',{bucket,id:r.id,version:version(r)}):''}</div>`;
}
function renderAttendance(){
 if(!syncMondayAccess())return;
 const roster=mondayRoster(),sel=val('attPerson'),editing=edits.attendance&&view.attendance.find(r=>r.id===edits.attendance.id);
 const entries=roster.map(p=>[p.id,p.name]);
 if(editing&&!entries.some(([id])=>id===editing.personId))entries.push([editing.personId,memberName(editing.personId)]);
 selectOptions('attPerson',entries,sel||entries[0]?.[0]);
 const date=val('attDate'),type=val('programType')||'regular';
 $('expectation').textContent=t(expected(roster.find(p=>p.id===val('attPerson')),date,type)?'expected':'exception');
 $('attendanceList').innerHTML=view.attendance.slice().reverse().map(a=>`<div class="item"><b>${h((a.personId?memberName(a.personId):(a.personName||t('formerMember'))))}</b> · ${h(a.date)} · ${badge(a.status)} · ${h(t(a.programType||'regular'))}<div class="muted">${h(a.note)}</div>${entityButtons('attendance',a,managesAttendance(current()))}</div>`).join('')||empty();
 const monthly=new Map();for(const row of view.attendance.filter(a=>a.date?.slice(0,7)===date.slice(0,7))){
  // Anonymous attendance entries must not collapse into a single "null" person.
  const key=row.personId?[row.personId,row.date,row.programType||'regular'].join('|'):'anonymous:'+row.id;
  monthly.set(key,row);
 }
 const monthRows=[...monthly.values()],ids=new Set([...roster.map(p=>p.id),...monthRows.filter(r=>r.personId).map(r=>r.personId)]);
 const tally=rs=>['present','absent','permitted','late'].map(s=>`${h(t(s))} ${rs.filter(a=>a.status===s).length}`).join(' · ');
 const anonymous=monthRows.filter(r=>!r.personId);
 $('attendanceSummary').innerHTML=Array.from(ids,id=>{
  const rs=monthRows.filter(a=>a.personId===id);
  return `<div class="compactRow"><b>${h(memberName(id))}</b><div class="muted">${tally(rs)}</div></div>`;
 }).join('')+(anonymous.length?`<div class="compactRow"><b>${h(t('formerMember'))} · ${anonymous.length}</b><div class="muted">${tally(anonymous)}</div></div>`:'');
 vis('saveAttendance',managesAttendance(current()));
 vis($('batchAttendance').parentElement,managesAttendance(current()));
 const records=view.attendance.filter(a=>a.date===date && (a.programType||'regular')===type);
 const lastByPerson=new Map(records.map(r=>[r.personId,r]));
 $('batchRows').innerHTML=managesAttendance(current())?roster.map(p=>{
  const old=lastByPerson.get(p.id),marks=[['',t('unmarked')],...['present','absent','permitted','late'].map(s=>[s,t(s)])];
  return `<label>${h(p.name)} · ${h(t(expected(p,date,type)?'expected':'exception'))}<select data-person="${h(p.id)}" data-id="${h(old?.id||'')}" data-version="${version(old)}" data-original="${h(old?.status||'')}">${options(marks,old?.status||'')}</select></label>`;
 }).join(''):'';

}
on('saveBatch',async()=>{
 const rows=[];
 for(const el of $('batchRows').querySelectorAll('[data-person]')){
  if(!el.value || el.value===el.dataset.original)continue;
  const old=view.attendance.find(r=>r.id===el.dataset.id);
  rows.push({id:old?.id,version:+el.dataset.version,personId:el.dataset.person,status:el.value,note:old?.note||''});
 }
 if(!rows.length)throw Error('required');
 await mutate('attendance.batch',{date:val('attDate'),programType:val('programType'),rows});
});
for(const id of ['attPerson','attDate','programType'])$(id).onchange=renderAttendance;
function attachmentLink(file){
 if(!file || !/^data:[^,"<>\s]*;base64,[A-Za-z0-9+/=]*$/.test(file.data||''))return '';
 return `<div class="attach">📎 <a download="${h(file.name)}" href="${h(file.data)}">${h(file.name)}</a></div>`;
}
const catalogs={
 announcements:{fields:{annTitle:'title',annBody:'body'},file:'annFile',page:'board',save:'publishAnn'},
 projects:{fields:{proTitle:'title',proBody:'body',proOwner:'owner',proDue:'due'},file:'proFile',page:'workspace',save:'saveProject'},
 documents:{fields:{docTitle:'title',docType:'type',docExpiry:'expiry'},file:'docFile',page:'documents',save:'addDocument'},
 attendance:{fields:{attPerson:'personId',attDate:'date',attStatus:'status',attNote:'note',programType:'programType'},page:'attendance',save:'saveAttendance'}
};
function clearCatalog(bucket){
 delete edits[bucket];const c=catalogs[bucket];
 for(const id of Object.keys(c.fields)){const el=$(id);if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';}
 if(c.file)$(c.file).value='';
 if(bucket==='attendance')set('attDate',monday(day()));
 vis(document.querySelector(`.cancelRecord[data-bucket="${bucket}"]`),false);
 $(c.save).textContent=t(bucket==='announcements'?'publish':'save');
}
function editCatalog(bucket,r){
 const c=catalogs[bucket];edits[bucket]={id:r.id,version:version(r)};
 if(bucket==='attendance')renderAttendance();
 for(const [id,k] of Object.entries(c.fields)){
  const v=r[k]??(k==='programType'?'regular':'');
  if($(id).tagName==='SELECT'&&v&&![...$(id).options].some(o=>o.value===v))$(id).add(new Option(v,v));
  set(id,v);
 }
 if(c.file)$(c.file).value='';
 vis(document.querySelector(`.cancelRecord[data-bucket="${bucket}"]`),true);$(c.save).textContent=t('save');
 navigate(c.page);$(Object.keys(c.fields)[0]).focus();
}
async function saveCatalog(bucket){
 const c=catalogs[bucket],d={bucket,...readMap(c.fields),...edits[bucket]},f=c.file&&$(c.file).files[0];
 if(bucket==='documents'){
  if(f&&(!['application/pdf','image/jpeg','image/png'].includes(f.type)||f.size>5*1024*1024))throw Error('docInvalid');
  d.fileName=f?.name||view.documents.find(r=>r.id===d.id)?.fileName||'';
 }else if(f)d.file={name:f.name,type:f.type,data:await fileData(f)};
 await mutate('record.save',d,()=>{
  clearCatalog(bucket);
  if(bucket==='attendance'){set('attDate',d.date);set('programType',d.programType);set('attPerson',d.personId);}
 });
}
for(const [bucket,c] of Object.entries(catalogs))on(c.save,()=>saveCatalog(bucket));
document.querySelectorAll('.cancelRecord').forEach(b=>b.onclick=()=>clearCatalog(b.dataset.bucket));
function renderCatalogs(){
 const u=current();
 vis(document.querySelector('#board .publisher'),publishes(u));
 $('annList').innerHTML=view.announcements.slice().reverse().map(r=>`<div class="item"><b>${h(r.title)}</b><div class="reporttext">${h(r.body)}</div>${attachmentLink(r.file)}<div class="muted">${h(r.author)} · ${h(dateTime(r.createdAt))}</div>${entityButtons('announcements',r,permit(u,'announcements'))}</div>`).join('')||empty();
 const owner=val('proOwner');selectOptions('proOwner',people().map(p=>[p.id,p.name]),owner||people()[0]?.id);
 $('projectList').innerHTML=view.projects.map(r=>`<div class="item"><b>${h(r.title)}</b><div class="reporttext">${h(r.body)}</div><div class="muted">${h(t('owner'))} · ${h(memberName(r.owner))} · ${h(r.due)}</div>${attachmentLink(r.file)}${button('project-plan','planForProject',{id:r.id})}${entityButtons('projects',r,permit(u,'projects'))}</div>`).join('')||empty();
 $('docList').innerHTML=permit(u,'documents')?(view.documents.map(r=>`<div class="item"><b>${h(r.title)}</b><div class="muted">${h(r.type)} · ${h(r.fileName)} · ${h(r.expiry||'—')}</div>${entityButtons('documents',r,true)}</div>`).join('')||empty()):'';
}
function summary(p){
 const att=view.attendance.filter(a=>a.personId===p.id),pr=view.projects.filter(r=>r.owner===p.id);
 const parts=[role(p.role),dept(p.department),p.profession,`${t('projects')} ${pr.length}`];
 if(isMondayParticipant(current())&&isMondayParticipant(p))parts.push(`${t('present')} ${att.filter(r=>r.status==='present').length}`,`${t('permitted')} ${att.filter(r=>r.status==='permitted').length}`);
 if(seesReports(current()))parts.push(`${t('reports')} ${view.reports.filter(r=>r.userId===p.id).length}`);
 return parts.filter(Boolean).join(' · ');
}
function renderPeople(){
 $('peopleList').innerHTML=people().map(p=>`<div class="card profile"><img class="avatar" src="${h(photo(p.photo))}" alt=""><div><b>${h(p.name)}</b><div class="muted">${h(summary(p))}</div></div></div>`).join('');
 const u=current();$('profileName').textContent=u.name;$('profileRole').textContent=role(u.role)+' · '+(dept(u.department)||'');$('profilePhoto').src=photo(u.photo);
 $('profileSummary').textContent=summary(u);
}
function profileForm(u){
 editProfile={id:u.id,version:version(u)};
 const profileInput=(k,value)=>`<label>${h(t(k==='name'?'fullName':k))}<input data-profile="${k}" type="${k==='email'?'email':'text'}" value="${h(value)}" ${(k==='email'||(k==='center'&&u.id===current()?.id))?'readonly':''}></label>`;
 $('profileFields').innerHTML=profileKeys.map(k=>profileInput(k,u[k])).join('')+addrKeys.map(k=>profileInput(k,u.address?.[k])).join('')+
 `<label>${h(t('photo'))}<input id="profilePhotoInput" type="file" accept="image/*"></label>`;
 $('profileEditor').querySelector('summary').textContent=t('editProfile')+' · '+u.name;
}
$('profileEditor').ontoggle=()=>{if($('profileEditor').open&&!editProfile&&current())profileForm(current());};
on('cancelProfile',()=>{editProfile=null;$('profileEditor').open=false;$('profileEditor').querySelector('summary').textContent=t('editProfile');});
on('saveProfile',async()=>{
 const d={...editProfile,address:{}};
 for(const f of $('profileFields').querySelectorAll('[data-profile]'))(addrKeys.includes(f.dataset.profile)?d.address:d)[f.dataset.profile]=f.value;
 d.photo=await fileData($('profilePhotoInput').files[0]);
 await mutate('profile.save',d,()=>{$('profileEditor').open=false;editProfile=null;});
});
on('requestEmailChange',async()=>{
 await store.requestEmailCode(val('emailNewAddress'),val('emailCurrentPassword'));
 vis('emailChangeCodeArea',true);notification('verificationRequested');$('emailChangeCode').focus();
});
on('confirmEmailChange',async()=>{
 await store.confirmEmailCode(val('emailChangeCode'));
 for(const id of ['emailChangeCode','emailCurrentPassword','emailNewAddress'])set(id,'');
 vis('emailChangeCodeArea',false);$('emailChangePanel').open=false;
 await refresh();const shownEmail=$('profileFields').querySelector('[data-profile="email"]');if(shownEmail)shownEmail.value=current()?.email||'';
 notification('emailChanged');
});
on('logoutEverywhere',async()=>{
 if(!confirm(t('confirmLogoutAll')))return;
 try{await store.command('session.revoke',{});}finally{signedOut();}
 notification('allSessionsRevoked');await info();
});
on('changePassword',async()=>{
 if(val('newPassword')!==val('newPassword2'))throw Error('mismatch');
 await mutate('password.change',{currentPassword:val('currentPassword'),password:val('newPassword')},()=>{for(const id of ['currentPassword','newPassword','newPassword2'])set(id,'');});
});
function permanentDeleteEditor(u){
 if(!full(current()))return '';
 const countReports=view.reports.filter(r=>r.userId===u.id).length;
 const countPlans=view.plans.filter(r=>r.userId===u.id).length;
 return `<details class="permanentDeleteEditor"><summary>⚠ ${h(t('permanentDelete'))}</summary>
  <p class="notice dangerNotice">${h(t('permanentDeleteHelp'))}</p>
  <p class="muted">${h(t('reports'))}: ${countReports} · ${h(t('plans'))}: ${countPlans}</p>
  <label>${h(t('permanentDeleteVerify'))}: <strong>${h(u.username)}</strong><input data-purge-username type="text" autocomplete="off" autocapitalize="none" spellcheck="false"></label>
  <label>${h(t('permanentDeletePhrase'))}<input data-purge-phrase type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="DELETE"></label>
  <label>${h(t('permanentDeletePassword'))}<input data-purge-password type="password" autocomplete="current-password"></label>
  <label class="checkLine"><input data-purge-ack type="checkbox">${h(t('permanentDeleteAcknowledge'))}</label>
  <div class="actions">${button('account.purge','permanentDeleteConfirm',{},'btn danger')}</div></details>`;
}
function userAccessEditor(u){
 if(!full(current())||stateOf(u)!=='active')return '';
 return `<details class="accessEditor"><summary>${h(t('permissions'))}</summary><label>${h(t('role'))}<select data-role>${options(Object.keys(roleDepartments).map(k=>[k,role(k)]),u.role)}</select></label><label>${h(t('department'))}<select data-department>${options(Object.keys(departments).map(k=>[k,dept(k)]),u.department)}</select></label>
 <label>Center / ማዕከል<input data-center value="${h(u.center||'')}" placeholder="Center"></label>
 <label class="checkLine"><input type="checkbox" data-full ${u.fullAdmin?'checked':''}> ${h(t('fullAdmin'))}</label><div class="actions">${permissions.map(p=>`<label class="perm pill"><input type="checkbox" data-permission="${p}" ${(u.adminPermissions||[]).includes(p)?'checked':''}>${h(t(p))}</label>`).join('')}</div><div class="actions">${button('access','save')}</div></details>`;
}
function renderAdmin(){
 const me=current();if(!permit(me,'manage_users')){$('adminUsers').replaceChildren();$('queue').replaceChildren();$('auditList').replaceChildren();return;}
 const us=view.users,q=val('userSearch').toLowerCase(),filter=val('userFilter');
 const roles=Object.keys(roleDepartments).filter(r=>full(me)||!directors.includes(r));
 selectOptions('addRole',roles.map(r=>[r,role(r)]),roles[0]);assignment('addRole','addDept');
 $('userCounts').textContent=['pending','active','removed'].map(s=>t(s)+' '+us.filter(u=>stateOf(u)===s).length).join(' · ');
 const list=us.filter(u=>(!filter||stateOf(u)===filter)&&(!q||[u.name,u.username].some(v=>(v||'').toLowerCase().includes(q)))).sort((a,b)=>Number(stateOf(b)==='pending')-Number(stateOf(a)==='pending'));
 $('adminUsers').innerHTML=list.map(u=>{
  const status=stateOf(u),manage=canManage(me,u),labels=[u.fullAdmin||directors.includes(u.role)?t('fullAdmin'):u.adminPermissions?.length?t('limited'):t('standard'),u.onboarding?t('onboardingTag'):''].filter(Boolean);
  return `<article class="item userItem" data-id="${h(u.id)}" data-version="${version(u)}"><div class="top"><div><b>${h(u.name)}</b> <span class="muted">@${h(u.username)}</span><div class="muted">${h(role(u.role))} · ${h(labels.join(' · '))}</div></div>${badge(status)}</div>
  <div class="actions">${manage&&status==='pending'?button('account.approve','approve',{},'btn'):''}${manage&&status!=='removed'?button('account.remove','removeUser'):''}${manage&&status==='removed'?button('account.restore','restore'):''}${full(me)&&status==='active'?button('edit-profile','editProfile'):''}</div>
  <details><summary>${h(t('profile'))}</summary>${fields([...profileKeys.filter(k=>k!=='name').map(k=>[k,u[k]]),...addrKeys.map(k=>[k,u.address?.[k]])])}</details>
  ${userAccessEditor(u)}${full(me)?permanentDeleteEditor(u):''}${manage&&status==='active'&&me.id!==u.id?`<details><summary>${h(t('resetPassword'))}</summary><label>${h(t('tempPassword'))}<input data-reset type="password" autocomplete="new-password"></label>${button('reset','save')}</details>`:''}</article>`;
 }).join('')||empty();
 selectOptions('successorUser',us.filter(u=>stateOf(u)==='active'&&u.id!==me.id).map(u=>[u.id,u.name+' · '+role(u.role)]));
 vis('exportData',full(me));document.querySelectorAll('.fullAdminOnly').forEach(el=>vis(el,full(me)));
 if(full(me)){
  const queue=[...reports().map(r=>['report',r]),...view.plans.map(r=>['plan',r])].filter(([k,r])=>['submitted','under_review'].includes(flow(r,reviewOf(k,r.id))));
  $('queue').innerHTML=queue.map(([k,r])=>recordCard(k,r,true)).join('')||empty();
  $('auditList').innerHTML=view.audit.map(e=>`<div class="compactRow"><b>${h(e.actorName)}</b> · ${h(auditLabel(e.action))} · ${h(dateTime(e.at))}<div class="muted">${h(e.target)}</div></div>`).join('')||empty();
 }else{$('queue').replaceChildren();$('auditList').replaceChildren();}
}
function auditLabel(action){
 const parts=action.split('.'),k=parts[0],v=parts[1];
 const ent={account:'username',admin:'admin',report:'reports',plan:'plans',comment:'comments',profile:'profile',password:'password'};
 const verbs={add:'addUser',request:'pending',remove:'delete',purge:'permanentDelete',restore:'restore',approve:'approve',access:'permissions',grant:'transfer',reset:'resetPassword',edit:'edit',bootstrap:'fullAdmin',complete:'complete',change:'changePassword'};
 return [t(ent[k]||k),t(verbs[v]||v)].join(' · ');
}
on('toggleAdd',()=>{const opening=$('addForm').classList.contains('hide');vis('addForm',opening);if(opening)$('addName').focus();});
on('addUser',()=>mutate('account.add',{name:val('addName'),username:val('addUsername'),role:val('addRole'),department:val('addDept'),center:val('addCenter'),password:val('addPassword')},()=>{for(const id of ['addName','addUsername','addPassword'])set(id,'');vis('addForm',false);set('userFilter','');set('userSearch','');}));
on('transferAdmin',async()=>{
 if(!$('transferConfirm').checked)throw Error('confirmGrant');
 const u=view.users.find(x=>x.id===val('successorUser'));if(!u)throw Error('required');
 await mutate('account.grant',{id:u.id,version:version(u)},()=>{$('transferConfirm').checked=false;});
});
on('exportData',async()=>{
 await refresh();if(!full(current()))throw Error('forbidden');
 const payload={format:'GAIUS workspace records',exportedAt:new Date().toISOString(),mode:store.shared?'shared':'local',originalReports:base.originals,...view};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download='GAIUS-private-records-'+day()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
});
$('userSearch').oninput=renderAdmin;$('userFilter').onchange=renderAdmin;
function renderAll(){
 const u=current();syncMondayAccess();if(!u||view.onboarding)return;
 navigate(tab,false);
 $('who').textContent=u.name+' · '+role(u.role)+(full(u)?' · '+t('fullAdmin'):'');$('miniPhoto').src=photo(u.photo);
 selectOptions('reportStatus',reportOptions(),'submitted');
 renderDashboard();renderReports();renderPlans();if(isMondayParticipant(u))renderAttendance();else{for(const id of ['attendanceList','attendanceSummary','batchRows'])$(id).replaceChildren();}renderCatalogs();renderPeople();renderAdmin();navigate(tab,false);
}
document.querySelectorAll('.nav').forEach(n=>n.onclick=()=>act(n,async()=>{await refresh();navigate(n.dataset.page);if(n.dataset.page==='profilePage'){editProfile=null;$('profileEditor').open=false;}}));
document.addEventListener('click',e=>{
 if(e.target.closest('[data-dismiss]')){vis('feedback',false);return;}
 const b=e.target.closest('[data-action]');if(!b)return;
 act(b,async()=>{
  const a=b.dataset.action,row=b.closest('.workItem'),user=b.closest('.userItem'),kind=row?.dataset.kind,id=row?.dataset.id;
  const rev=row?{kind,id,version:+row.dataset.version,reviewVersion:+row.dataset.reviewVersion}:null;
  const userRef=user?{id:user.dataset.id,version:+user.dataset.version}:null;
  if(a==='refresh'){await refresh();return;}
  if(a==='open-item'){
   if(kind==='report'){for(const f of ['search','monthFilter','deptFilter','reviewFilter'])set(f,'');renderReports();}
   navigate(kind==='plan'?'plans':'reports');const target=[...$(kind==='plan'?'planList':'reportList').querySelectorAll('.workItem')].find(x=>x.dataset.id===id);
   if(target){target.scrollIntoView({block:'center'});const details=target.querySelector('.reviewControls');if(details)details.open=true;}return;
  }
  if(a==='edit-item'){editItem(kind,item(kind,id));return;}
  if(a==='review'){await mutate('review',{...rev,decision:b.dataset.decision,note:row.querySelector('[data-review-note]').value});return;}
  if(a==='comment'){
   const wrap=b.closest('.commentEditor');
   await mutate('comment.save',{reportId:id,id:wrap.dataset.comment||undefined,version:+wrap.dataset.version,text:wrap.querySelector('[data-comment-text]').value,visible:wrap.querySelector('[data-visible]').checked});return;
  }
  if(a==='delete-record'){if(confirm(t('confirmDelete')))await mutate('record.remove',{bucket:b.dataset.bucket,id:b.dataset.id,version:+b.dataset.version});return;}
  if(a==='edit-record'){editCatalog(b.dataset.bucket,view[b.dataset.bucket].find(x=>x.id===b.dataset.id));return;}
  if(a==='project-plan'){
   const p=view.projects.find(r=>r.id===b.dataset.id);clearItem('plan');set('planProject',p.id);set('planTitle',p.title);set('planObjective',p.body);
   set('planOwner',memberName(p.owner));set('planDue',p.due);navigate('plans');$('planTitle').focus();return;
  }
  if(a==='account.purge'){
    if(!full(current()))throw Error('forbidden');
    const original=view.users.find(u=>u.id===userRef.id),panel=b.closest('.permanentDeleteEditor');
    if(!original||!panel)throw Error('missing');
    const confirmUsername=panel.querySelector('[data-purge-username]').value.trim();
    const confirmPhrase=panel.querySelector('[data-purge-phrase]').value.trim();
    const currentPassword=panel.querySelector('[data-purge-password]').value;
    if(confirmUsername!==original.username||confirmPhrase!=='DELETE'||!panel.querySelector('[data-purge-ack]').checked)
      throw Error('purgeConfirmation');
    if(!currentPassword)throw Error('wrongPassword');
    if(!confirm(t('permanentDeleteFinal')))return;
    // Never retain the administrator password in a displayed field after submission.
    panel.querySelector('[data-purge-password]').value='';
    const deletingSelf=userRef.id===current().id;
    await store.command('account.purge',{...userRef,confirmUsername,confirmPhrase,currentPassword});
    if(deletingSelf){signedOut();await info();}
    else await refresh();
    notification('permanentDeleteDone');
    return;
  }
  if(a.startsWith('account.')){if(a!=='account.remove'||confirm(t('confirmRemove')))await mutate(a,userRef);return;}
  if(a==='access'){await mutate('account.access',{...userRef,role:user.querySelector('[data-role]').value,department:user.querySelector('[data-department]').value,center:user.querySelector('[data-center]').value,
     permissions:[...user.querySelectorAll('[data-permission]:checked')].map(el=>el.dataset.permission),fullAdmin:user.querySelector('[data-full]').checked});return;}
  if(a==='reset'){await mutate('account.reset',{...userRef,password:user.querySelector('[data-reset]').value});return;}
  if(a==='edit-profile'){profileForm(view.users.find(u=>u.id===userRef.id));navigate('profilePage');$('profileEditor').open=true;$('profileEditor').scrollIntoView();return;}
 });
});
function syncSession(){
 if(!store.hasSession()||document.hidden||busy.size)return;
 const el=$('modeLine');act(el,refresh);
}
let storageTimer;
window.addEventListener('storage',e=>{
 if(store.shared||!view||!e.key)return;
 if(e.key==='users'||e.key.startsWith('gaius.v10.')||['reports','attendance','projects','announcements','documents','comments'].includes(e.key)){
  clearTimeout(storageTimer);storageTimer=setTimeout(syncSession,80);
 }
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncSession();});
window.addEventListener('online',syncSession);
function associateLabels(){
 for(const l of document.querySelectorAll('label:not([for])')){const c=l.nextElementSibling;if(c?.id&&c.matches('select,input,textarea'))l.htmlFor=c.id;}
 for(const [id,key] of [['search','search'],['monthFilter','month'],['langAuth','languages'],['langApp','languages']])$(id).setAttribute('aria-label',t(key));
}
async function start(){
 window.GAIUS_LOGIN_READY=true;
 translate();setMode('login');associateLabels();requiredCenterInput();
 try{await info();if(store.hasSession())await refresh();}
 catch(e){
  if(e.message==='offline'&&store.shared&&store.hasSession()){
   // Offline reload opens only the safe v11 draft workspace, never the
   // server-governed v10 pages or confidential backend records.
   let marker=null;try{marker=JSON.parse(sessionStorage.getItem('gaius.v11.offlineIdentity')||'null');}catch{}
   if(marker?.me&&Date.now()-marker.at<86400000){
    $('app').dataset.mondayAccess='no';vis('auth',false);vis('app',true);
    setTimeout(()=>{const launcher=document.getElementById('v11launch');if(launcher)launcher.click();},50);
    return;
   }
  }
  if(['expired','pending','removed'].includes(e.message))signedOut();notification(e.message,true);
 }
}
start();

