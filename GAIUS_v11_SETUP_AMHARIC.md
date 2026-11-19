# GAIUS Ministry v11 — የGitHub፣ Cloudflare፣ Email እና R2 ሙሉ የማዋቀሪያ መመሪያ

## 1. የትኛውን ZIP መጠቀም አለብህ?

**የቀድሞው v10/v4 ፋይሎች በGitHub ካሉ:** `GAIUS_v11_Update_Only.zip` ፈትተህ ፋይሎቹን በ`index.html` ባለበት የrepository root ላይ ጫን። አዲስ `gaius-v11-...` ፋይሎች ይጨመራሉ፤ ነባር `index.html`, `gaius-app.js`, `gaius-core.js`, `gaius-store.js`, `gaius-worker.js`, `sw.js` እና ሌሎች የሚያስፈልጉ ፋይሎች ይዘመናሉ። **የቀድሞዎቹን በጅምላ አትሰርዝ።**

**አዲስ Repository ካዘጋጀህ:** `GAIUS_v11_Complete_Repository.zip` ያለውን ሙሉ ፋይል ፈትተህ ጫን።

ከመጫንህ በፊት: GitHub → repository → Code → አዲስ `backup/v10.3` branch ፍጠር። በአዲስ `feature/v11` branch ፋይሎች ጫን፣ Pull Request ፍጠር፣ ለውጦቹን አረጋግጥና Merge አድርግ። የነባር መዝገቦች ምትኬ በተለይ ይያዝ።

## 2. የGitHub Pages ቅንብር

Repository → **Settings → Pages** → Build and deployment → **GitHub Actions** ምረጥ። `.github/workflows/static.yml` ነባሩን ተግባር ተጠቀም። በስልክ ላይ Safari → Share → **Add to Home Screen** ይጠቀም።

`gaius-config.js` ውስጥ ያለው `apiUrl` **የይፋዊ HTTPS Worker URL** ብቻ ይይዝ። ይህ የተፈቀደ የPublic URL ነው፤ የሚስጥር ቁልፍ አይደለም። ምሳሌ፦

```js
window.GAIUS_CONFIG = { apiUrl: 'https://gaius-ministry-reviews.YOUR-SUBDOMAIN.workers.dev' };
```

## 3. የCloudflare Worker + Durable Object

የCloudflare account እና የWorker ፕሮጀክት ያስፈልጋል። `gaius-worker.js`, `gaius-core.js`, `gaius-v11-core.js`, `gaius-v11-model.js`, `gaius-recovery.js` እና `wrangler.jsonc` አብረው መሰማራት አለባቸው። Wrangler የJavaScript import dependencies ያጠቃልላል።

ከNode 20+ እና Wrangler ጋር በTerminal፦

```sh
npm install --save-dev wrangler
npx wrangler login
npx wrangler r2 bucket create gaius-v11-secure-files
npx wrangler secret put SETUP_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESET_CODE_SECRET
npx wrangler secret put MAIL_FROM
npx wrangler deploy
```

`wrangler.jsonc` ውስጥ `ALLOWED_ORIGIN` የGitHub Pages የመነሻ origin ብቻ ይሁን፦ `https://YOUR-USERNAME.github.io` (**የrepository path አትጨምር**።) በGitHub username ተካው።

**SETUP_KEY:** በአንድ ጊዜ የሚጠቀም ጠንካራ አዲስ ሚስጥር ነው። በGitHub አትለጥፈው። ከዚህ ውይይት ውስጥ የተጋራ የDirector Code አትጠቀም። **አንድ ኮድ ለCountry Director እና International Director ይሠራል፤ በBackend እያንዳንዱ መደብ አንድ ጊዜ ብቻ ይጠቀምበታል።** ሁለቱ ከተመዘገቡ በኋላ የመጀመሪያ ምዝገባው ይዘጋል። ተጨማሪ የDirector ለውጥ በሙሉ Admin የተረጋገጠ ሂደት ይሁን።

**አስፈላጊ:** የቀድሞ v10 Worker ውሂብ ካለ፣ የWorker Durable Object class/name እና `gaius-ministry-v10` የroom key አትቀይር። አዲስ ክፍል በተመሳሳይ SQL Records መዋቅር ይቀመጣል። ከLive migration በፊት ምትኬ አውጣና test environment ተጠቀም።

## 4. የForgot Password ኢሜይል

የ`RESEND_API_KEY` ከResend account መፈጠር አለበት። `MAIL_FROM` የተረጋገጠ ጎራ ያለው መላኪያ ኢሜይል ይሁን። `RESET_CODE_SECRET` ረጅም (ቢያንስ 32 ቁምፊ) ማንኛውም በሌላ ቦታ ያልተጠቀመ ሚስጥር ይሁን።

8-አሃዝ የኢሜይል ኮድ 10 ደቂቃ ይሠራል። ከServer ሳይገናኝ የኢሜይል ኮድ መላክ **አይሠራም**። ምንም `secret` በPublic Repository፣ `index.html` ወይም `gaius-config.js` ውስጥ አትጻፍ።

## 5. የSecure File Uploads / Cloudflare R2

`wrangler.jsonc` ውስጥ `MEDIA_BUCKET` binding ወደ `gaius-v11-secure-files` ይመራል። R2 ከተፈጠረ በኋላ `npx wrangler deploy` አድርግ። በዚህ App ላይ 10 MB የፋይል ገደብ አለ። ፋይሎች እንደ Pending ይጫናሉ፤ Director ወይም በፈቃድ የተመደበ Admin ያጸድቃቸዋል። በPrivate R2 ውስጥ ያሉ ፋይሎች በBearer Session API ብቻ ይወርዳሉ። ለሕዝብ የሚታይ Public Bucket URL አትስጥ።

## 6. የኦሪጅናል ሰነዶች እና Teaching Roadmap

ሦስቱን የተላኩ GAIUS ሰነዶች **በPublic GitHub አትጫን**። የሙሉ ዋና መመሪያና «የትምህርት ሂደት» ጽሑፍ በv11 → Operations → **Master Documents** ገጽ ላይ ዳይሬክተሩ በአንድ የተጠበቀ መለያ ከገባ በኋላ ያስገባ። ለሰነዱ የጽሑፍ ማስተካከያ፣ ረቂቅ፣ ማጽደቅ፣ አዲስ ቅጂና ታሪክ ይጠቀም። DOCX እንደ ፋይል ማስገባት እና ጽሑፉን በራስ-ሰር ወደ አርታዒ ማውጣት ገና አልተተገበረም።

## 7. የOffline አጠቃቀም

PWA አንድ ጊዜ በHTTPS ተከፍቶ Service Worker ከተጫነ በኋላ የተያዙ የApp ፋይሎች ያለ ኢንተርኔት ይከፈታሉ። አዲስ የማይስጥራዊ እቅድ/ሪፖርት **ረቂቅ** በIndexedDB ሊቀመጥ ይችላል። ኢንተርኔት ሲመለስ በv11 → Offline Drafts → **Sync** አዝራር ይላክ። ከServer እስኪቀበል ድረስ የተላከ ወይም የጸደቀ አይባልም። በተጋራ ስልክ ላይ የግል መረጃ አታስቀምጥ።

## 8. ሙከራ (ከእውነተኛ አጠቃቀም በፊት)

1. Country Director ይመዝገብ፤ International Director በተመሳሳይ Setup Key ይመዝገብ። ሦስተኛ ሰው መመዝገብ እንደማይችል ፈትን።
2. አንድ HQ Leader እና አንድ Center Leader ይመዝገቡ፤ Admin ያጽድቃቸው።
3. የራሳቸውን የ6 ወር እቅድ ያቅርቡ፣ ሪፖርት ያስገቡ፣ Director ያጽድቅ።
4. የCenter Leader መለያ የሌላ ማዕከል እቅድና ግላዊ መረጃ እንደማያይ ፈትን።
5. በሁለት ስልኮች የተላከ ሪፖርት በጋራ እንደሚታይ ፈትን።
6. ኢንተርኔት ቆርጠህ ረቂቅ ጻፍ፤ ከተመለሰ በኋላ Sync አድርግ።
7. DOCX/PDF በiPhone ላይ አውርድ፣ አማርኛ ፊደል በትክክል እንደሚታይ አረጋግጥ።
8. በR2 ፋይል ጫን፣ ሳይጸድቅ ሌላ ተጠቃሚ እንዳያይ ፈትን።

**እስካሁን እነዚህ የLive Cloudflare/Resend/R2/Mobile ሙከራዎች በዚህ ውይይት አልተከናወኑም።** የNode ሙከራዎች ብቻ ከእነዚህ የማዋቀሪያ ማረጋገጫዎች ምትክ አይሆኑም።
