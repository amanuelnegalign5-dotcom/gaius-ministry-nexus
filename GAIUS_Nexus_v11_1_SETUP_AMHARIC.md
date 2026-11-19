# Gaius Nexus v11.1 — የGitHub እና Cloudflare ማዋቀሪያ

## 1. ፋይሎች እና መለያየት

- `GAIUS_Nexus_v11_1_Complete_Repository.zip` — ሙሉ የምንጭ ኮድ፣ ሙከራዎችና መመሪያዎች።
- `GAIUS_Nexus_v11_1_Update_Only.zip` — ከተረጋገጠው v11 መነሻ የተለወጡ/የተጨመሩ ፋይሎች ብቻ።
- **በተለየ መንገድ የሚሰጥ የግል ፋይል** `GAIUS_Nexus_v11_1_Private_Director_Plan_Import.json` — የ16ቱ የCountry Director ዕቅድ መዝገቦች። **ይህን ፋይል ወደ GitHub አትጫን!**

በሚሠራው GitHub repository ላይ ከመቀየርህ በፊት Backup አድርግ። ነባር መዝገቦችን አትሰርዝ።

## 2. GitHub Repository ማዋቀር

1. በGitHub ውስጥ `gaius-ministry-nexus` በሚል ስም አዲስ repository ፍጠር። ስሙ ከተወሰደ ሌላ ቅጥያ ምረጥ።
2. የComplete Repository ZIP ውስጡን ወደ repository ጫን (ZIP ፋይሉን ራሱን አይደለም)።
3. የግል የDirector JSON፣ `.env`፣ Email Secret፣ `SETUP_KEY` ወይም API Secret **በGitHub ላይ አታስቀምጥ**።
4. Settings → Pages → Build and deployment → Source: **GitHub Actions** ምረጥ።
5. `.github/workflows/static.yml` የFrontend ፋይሎችን ብቻ ይሰበስባል። Worker ኮድና ሚስጥራዊ ፋይሎች በPages እንዳይታተሙ ይረዳል።
6. Actions ሲጠናቀቅ የGitHub Pages URL አረጋግጥ። ይህን URL እንደ `ALLOWED_ORIGIN` መጠቀም ሲኖር **Origin** ብቻ (ለምሳሌ `https://yourname.github.io`) አስገባ።

**ማስታወሻ:** GitHub repository እንደ Public ከተቀመጠ በrepository ውስጥ የተጫኑት የWorker ምንጭ ኮዶች ራሳቸው ሊነበቡ ይችላሉ፤ ስለዚህ እውነተኛ Secrets በምንጭ ኮድ ውስጥ አይገቡ። የDirector ዕቅድም በrepository ውስጥ አይኖር።

## 3. Cloudflare Worker እና Durable Object

1. Cloudflare Dashboard ውስጥ ግባ።
2. Workers እና Durable Objects ለGAIUS Workspace አዘጋጅ። በComplete ZIP ያለው `wrangler.jsonc` የሚፈለጉ Bindings ይገልጻል።
3. R2 Bucket `gaius-v11-secure-files` ፍጠር ወይም ከነባሩ ጋር አገናኝ።
4. `ALLOWED_ORIGIN` ለGitHub Pages ትክክለኛ Origin አዘጋጅ።
5. እነዚህን Secrets በCloudflare የSecret/Environment ቅንብር ውስጥ ብቻ አስቀምጥ፦

   - `SETUP_KEY` — በራስህ የሚፈጠር ጠንካራ የመጀመሪያ ቁልፍ
   - `COUNTRY_DIRECTOR_EMAIL` — የCountry Director በቅድሚያ የተፈቀደ ኢሜይል
   - `INTERNATIONAL_DIRECTOR_EMAIL` — የInternational Director በቅድሚያ የተፈቀደ ኢሜይል
   - `RESEND_API_KEY` — የResend የEmail API Secret
   - `RESET_CODE_SECRET` — ቢያንስ 32-character random secret
   - `MAIL_FROM` — በResend የተረጋገጠ የመላኪያ ኢሜይል

6. የCloudflare Worker ሲለጠፍ HTTPS API URL ይኖረዋል። ይህን በ`gaius-config.js` ውስጥ በ`apiUrl` ላይ ብቻ አስገባ። **URL ብቻ የተለመደ ይፋዊ configuration ነው፤ Secret ግን አይደለም።**
7. የመጀመሪያ መለያ ሲፈጠር ነባር የዳታቤዝ መረጃ ካለ አይሰረዝ።

## 4. ሁለቱ Directors እንዴት ይመዘገባሉ?

1. Register → Country Director ወይም International Director ምረጥ።
2. ለዚያ መደብ በCloudflare Secret የተመደበውን Email አስገባ።
3. የጋራ የDirector Setup Key ጻፍ።
4. **Send email code** ጫን።
5. ወደ Email የሚመጣውን 8-አሃዝ ኮድ ጻፍ።
6. ሌሎቹን (*) መስኮች ሙላና Register ጫን።
7. በሁለቱ መደቦች ለየብቻ የDirector መለያ እንደተፈጠረ አረጋግጥ። በተመሳሳይ ኮድ ሦስተኛ የDirector መለያ አይፈጠርም።
8. ሁለቱ ሲመዘገቡ `SETUP_KEY` ሰርዝ/ቀይር፤ በኋላ የDirector ተተኪ ምዝገባ በተረጋገጠ የአመራር ሂደት ይሆን።

የEmail መላክ ካልሠራ የResend እና የCloudflare ማዋቀሪያ መፈተሽ አለብህ። የEmail መላክ ከማያስፈልገው የLocal Demo ጋር አትደባልቅ።

## 5. የDirector 16 የእቅድ ግቦች ማስገባት

1. **የግል JSON ፋይል** `GAIUS_Nexus_v11_1_Private_Director_Plan_Import.json` በራስህ ስልክ ወይም ኮምፒውተር ውስጥ አስቀምጥ።
2. Country Director በራሱ መለያ ወደ App ይግባ።
3. Gaius Nexus → Director workspace → **Import privately** ጫን።
4. JSON ምረጥ። Backend ቁጥሩን (16) እና በጀቱን (68,000 ብር) ያረጋግጣል።
5. 16ቱ ግቦች የግል እና Editable መዝገቦች ይሆናሉ። የመጀመሪያ መረጃ በSource Snapshot ይጠበቃል።
6. ኦሪጅናሉ DOCX በFile uploads → **Personal — owner only** ላይ በተለየ መልኩ ጫን።
7. በዕቅዱ ያሉት ወሮች በኦሪጅናል እንደተጻፉ ናቸው፤ በሰነዱ በግልጽ ያልተመዘገበ ዓመት በራስ-ሰር አይጨመር።

## 6. የCenter Visit Planner

- Operations → Centers → ማዕከሎችን በመጀመሪያ መዝግብ። City መስክ አዲስ አበባ ወይም Bishoftu ይሁን።
- Director workspace → **Center visits** → አዲስ Visit ረቂቅ ፍጠር።
- የተጎበኘበትን ትክክለኛ ቀንና የታዩትን ነገሮች በEdit ሙላ።
- **Mark visit completed** በሚል አረጋግጥ። የተዘጋጀ Visit ብቻ የCompleted ሁኔታ አይኖረውም።
- የAddis Ababa ማዕከላት በየወሩ፣ የBishoftu ማዕከል በሁለት ወር አንድ ጊዜ ይከታተላሉ።

## 7. የክፍሎች ሪፖርትና Analytics

- Operations → Monthly reports → Department template ምረጥ። Media, Research, Counseling, Follow-up ወዘተ ሲመረጡ የየራሳቸው መስኮች ይታያሉ።
- Center analytics → ወር/ማዕከል/ዲፓርትመንት/የኢትዮጵያ ዓመትና ወር ማጣሪያ ተጠቀም።
- ለተመሳሳይ የመለኪያ ክፍል (Indicator Unit) ብቻ Planned vs Actual ማነጻጸር ይፈቀዳል።
- ተመን ካልተገለጸ እንደ **N/A** ይታያል፤ የሐሰት 100% አይሰላም።

## 8. Offline PWA በiPhone

1. GitHub Pages ሊንኩን በSafari ክፈት።
2. Share → Add to Home Screen ምረጥ።
3. የGaius Nexus ስምና የGAIUS ሎጎ በHome Screen መታየቱን አረጋግጥ።
4. ኢንተርኔት ተቋርጦ ስልኩን ለመፈተሽ የሚያስፈልጉትን ገጾች በፊት ክፈት።
5. Offline Draft ጻፍ፤ ኢንተርኔት ሲመለስ **Sync pending drafts** ጫን።

በOffline ሁኔታ የPassword Reset፣ የDirector Registration ወይም የAdmin Approval ሥራ አይጠናቀቅም። የስልክ እና የCloudflare ቀጥታ ሙከራ ገና ያስፈልጋል።

## 9. ከv11 ወደ v11.1 እንዴት ይሻገራል?

- የv11 Complete ZIP በትክክል በRepository ያለ ከሆነ Update-Only ZIP ተጠቀም።
- የቀድሞ ስሪቶች ተደባልቀው ካሉ Complete ZIP በአዲስ Branch ወይም Repo ተጠቀም።
- በCloudflare Durable Object ውስጥ ያለውን ዳታ ከመቀየርህ በፊት Backup ይያዝ።
- ይህ ስሪት የSchema-on-record አዲስ አይነቶችን ያክላል፤ ነባር መዝገቦችን በኃይል አይቀይርም።
- በቀጥታ የማረጋገጫ ፈተና ሳይደረግ በነባር Production ላይ አትጫን።

**የሙሉ አፈጻጸም አረጋግጥ ሪፖር:** `QA_V11_1_RESULTS.md`.
