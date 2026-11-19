**አዲስ v10.3:** የFull Admin ሰውን ለዘላለም መሰረዣ አማራጭ ተጨምሯል። [የv10.3 መመሪያ](GAIUS_v10_3_ADMIN_DELETE_AMHARIC.md)። ከታች የv10.2 የኢሜይል ማዋቀሪያ መመሪያ እንዳለ ተጠብቋል።

---

# GAIUS Ministry v10.2 — የGitHub ማዘመኛ፣ Forgot Password እና የኢሜይል ኮድ መመሪያ

**ይህ v10ን የሚያሻሽል ነው፤ ከv10 የተወሰደ ይዘት በፈቃድህ ውጪ አልተሰረዘም።** በተለይ የአማርኛ/English ቋንቋ ቅየራ፣ ስድስቱ የጥቅምት ሪፖርቶች፣ 12 የግላዊነት ድንጋጌዎች፣ የሰኞ መገኘት፣ የተጠቃሚ አስተዳደር፣ እቅዶች፣ ሪፖርቶችና ማጽደቅ ተጠብቀዋል።

**የታከለው:** የይለፍ ቃል የረሳ ሰው በኢሜይሉ 8 አሃዝ የማረጋገጫ ኮድ ይቀበላል፤ ኮዱ ከ10 ደቂቃ በኋላ ያበቃል፣ 5 የተሳሳቱ ሙከራዎች ከተደረጉ አዲስ ኮድ ያስፈልጋል፣ ኮዱ ለአንድ ጊዜ ብቻ ይሠራል። የይለፍ ቃሉ ሲቀየር ቀድሞ በሌሎች መሣሪያዎች ያሉ መግቢያዎች ይዘጋሉ። የኢሜይል አድራሻን ለመቀየርም ከአሁኑ የይለፍ ቃል በተጨማሪ በ**አዲሱ ኢሜይል** የሚላክ ኮድ ያስፈልጋል። ተጠቃሚዎች **ከሁሉም መሣሪያዎች ውጣ** በማለት የቆዩ ክፍለ ጊዜዎችን መሰረዝ ይችላሉ።

## 1. ካሉት 18 የv4 እና v10 GitHub ፋይሎች ጋር ምን ታደርጋለህ?

**መጀመሪያ በGitHub ላይ የv10 repositoryህን አድርስ።** በዚያ `index.html` ያለበት **root** የመተግበሪያው ዋና ማውጫ ነው። በሌላ የv4 ንዑስ አቃፊ ውስጥ ያሉትን ፋይሎች አትሰርዝ። ለv10 ገጹ የሚሠራው የPages ማሰማሪያ በዚህ root እንደሚያመለክት አረጋግጥ።

1. **የምትሠራበትን repository አስቀድመህ አስቀምጥ።** በGitHub ላይ አዲስ ቅርንጫፍ (`backup-before-v10-2`) ፍጠር። የአካባቢው መዝገቦች ለአስተዳዳሪ በ**የሥራ መዝገቦችን አውርድ** በኩል መውረድ ይችላሉ። የነባር አሳሽ ዳታ እንዳትጠፋ የSafari/Chrome የድረ ገጽ መረጃ አታጽዳ።
2. ከታች የሚገኘውን `GAIUS_v10_2_GitHub_Update.zip` **አውርድና ፈታ**። ZIPውን ራሱን እንደ ፋይል በGitHub ላይ አትጫን፤ **ውስጡ ያሉትን ፋይሎች** ምረጥ።
3. በGitHub repositoryህ **Add file → Upload files** በል፣ ZIPው ውስጥ ያሉ ዋና ፋይሎችን `index.html` ባለበት **root** ደረጃ አስገባ። `index.html` እና `sw.js` ነባሩን ያዘምናሉ፤ ቀሪዎቹ `.js` ፋይሎች ይጨመራሉ ወይም ይዘምናሉ። በሌላ የv4 ንዑስ አቃፊ ውስጥ አታስገባቸው።
4. **Create a new branch → Propose changes → Create pull request** ምረጥ። **Files changed** ውስጥ የጠበቅካቸው የv10 ፋይሎች እንዳሉ አረጋግጥ። ሌላ ያልላክህልኝ በGitHub ላይ ያደረግኸው ማሻሻያ ካለ፣ ከማዋሃድህ በፊት እንዲጠበቅ አመሳክር። ከዚያ **Merge pull request** በል።
5. **Settings → Pages → Build and deployment** ውስጥ የነባሩ `main` የGitHub Actions ማሰማሪያ እንደሚሠራ አረጋግጥ። **Actions** ላይ ማሰማራት በአረንጓዴ መጠናቀቁን ተመልከት። በSafari ድረ ገጹን አድስ። በ`sw.js` የcache ስሪት v10.2 ተቀይሯል።

**ለዚህ ተግባር የምትመርጠው `GAIUS_v10_2_GitHub_Update.zip` ነው።** `GAIUS_v10_2_Full_Repository.zip` ደግሞ የላክኸውን የv10 ዋና ፋይሎችና አዲሶቹን ያካተተ ሙሉ ቅጂ ነው። ሁለቱን አትጫን፤ አንዱን በቂ ብለህ ምረጥ።

## 2. Email code ለመላክ የሚያስፈልገው

**አስፈላጊ ገደብ:** GitHub Pages የድረ ገጽ ፋይሎችን ያሳያል፤ በደህንነት የተጠበቀ ኢሜይል መላክንና የአባላት የጋራ መረጃ ማከማቻን **ብቻውን አይሠራም**። በዚህ ጥቅል የተዘጋጀው አሠራር `Cloudflare Worker + Durable Object SQLite` ለመለያዎችና ለኮዶች፣ `Resend` ደግሞ የኮድ ኢሜይል ለመላክ ይጠቀማል። እነዚህን መለያዎችና የሚስጥር ቁልፎች አንተ ማዋቀር ያስፈልግሃል። በZIP ውስጥ እውነተኛ ሚስጥራዊ ቁልፎች አልተካተቱም።

### 2A. Cloudflare Worker ማዘጋጀት

1. በrepository ውስጥ `wrangler.jsonc` ክፈት። `ALLOWED_ORIGIN` እንደ `https://YOUR-GITHUB-USERNAME.github.io` ያለውን ምሳሌ በእውነተኛ **የPages origin** ተካ። ለምሳሌ የPages ሙሉ URL `https://username.github.io/gaius/` ከሆነ **origin ብቻ** `https://username.github.io` ነው፤ `/gaius/` አትጨምር። የራስህን domain የምትጠቀም ከሆነ የዚያን origin አስገባ።
2. የCloudflare መለያህን ክፈት። **Workers & Pages → Create application → Connect to GitHub** ምረጥና የv10 repositoryህን አገናኝ። ለWorkerው በ`wrangler.jsonc` ያለውን `gaius-ministry-reviews` ስምና ዋና ማውጫ ተጠቀም። የDeploy command `npx wrangler deploy` ይሁን። እንደ ነባሩ Worker ስም ካለህ፣ ከዳታ ኪሳራ ለመዳን **የአሁኑን Worker አዘምን፣ አዲስ የውሂብ ማከማቻ አትፍጠር**።
3. በCloudflare Worker ውስጥ **Settings → Variables and Secrets → Add** በመጠቀም `SETUP_KEY` የሚባለውን ረጅም ሚስጥራዊ ቁልፍ እንደ **Secret** አስቀምጥ። ይህ የመጀመሪያውን ዳይሬክተር ለመመዝገብ ብቻ ያስፈልጋል።
4. Cloudflare የሰጠህን **Worker HTTPS URL** (በ`workers.dev` የሚያበቃ) ቅዳ። በGitHub `gaius-config.js` ውስጥ `apiUrl: ""` የሚለውን `apiUrl: "https://YOUR-WORKER.workers.dev"` በሚል **በራስህ የWorker URL ተክተህ** አስቀምጥ። የ`publishable key` ወይም `secret key` እዚህ አታስገባ። ከዚያ የPages ማሰማራቱን አድስ።

### 2B. Resend በመጠቀም እውነተኛ ኢሜይል መላክ

1. በ[Resend](https://resend.com) የሚኒስትሪውን መለያ ክፈት። ኢሜይል ለመላክ የምትፈልገውን የሚኒስትሪውን ጎራ (ለምሳሌ በድርጅቱ ባለቤትነት ያለ `gaiusministry.org`) **Domains → Add domain** በማለት አስመዝግብ። በResend የታዩትን DNS SPF/DKIM መዝገቦች በdomain አስተዳደር አስገባ። ሁኔታው **Verified** እስኪሆን ጠብቅ። ጎራው የአንተ ካልሆነ፣ ባለቤቱን አስፈቅድ።
2. በResend **API Keys → Create API Key** ውስጥ ለመላክ የሚፈቅድ ቁልፍ ፍጠር። ቁልፉን በስልክህ ማስታወሻ ወይም በGitHub አትለጥፍ።
3. በCloudflare Worker **Settings → Variables and Secrets** ሥር የሚከተሉትን አስቀምጥ፦

| Name | አይነት | ዋጋው ምንድነው? |
|---|---|---|
| `RESEND_API_KEY` | **Secret** | ከResend የፈጠርከው ሚስጥራዊ የAPI ቁልፍ |
| `RESET_CODE_SECRET` | **Secret** | በይለፍ ቃል አስተዳዳሪ የፈጠርከው ቢያንስ 32 ቁምፊ ያለው፣ ለዚህ ብቻ የሚያገለግል የዘፈቀደ ሚስጥራዊ ቁልፍ |
| `MAIL_FROM` | Variable ወይም Secret | ለምሳሌ `GAIUS Ministry <security@YOUR-VERIFIED-DOMAIN>` — በResend የተረጋገጠ ጎራ ነው የሚያስፈልገው |
| `SETUP_KEY` | **Secret** | የመጀመሪያው ዳይሬክተር የሚጠቀምበት ሚስጥራዊ ቁልፍ |

4. ቅንብሮቹን **Deploy** ብለህ አስቀምጥ። ከዚያ በGAIUS Login ገጽ **የይለፍ ቃል ረሳሁ** ምረጥ፣ በመለያ የተመዘገበውን ኢሜይል ጻፍ፣ **የማረጋገጫ ኮድ ላክ** ተጫን። ኮዱን ከኢሜይል አግኝተህ በ10 ደቂቃ ውስጥ አስገባ፣ አዲስ ይለፍ ቃል ሙላ። ከተሳካ በኋላ እንደገና ግባ።

**ማሳሰቢያ:** የኢሜይል አድራሻ መኖሩን በማንኛውም ሰው እንዳይፈተሽ፣ የ“Send code” ምላሹ ሁልጊዜ አጠቃላይ መልዕክት ይሰጣል። ኮዱ ካልደረሰ Inbox/Spam ያረጋግጥ፤ በResend Emails/Logs የመላኪያ ሁኔታ መርምር። የሰርቨሩ ማዋቀሪያ ካልተጠናቀቀ “Email delivery is not configured” ይታያል፤ የማይሠራ የማረጋገጫ ኮድ አይፈጥርም።

## 3. ተጠቃሚዎች በፕላትፎርሙ ላይ ምን ያደርጋሉ?

- **Forgot password:** Login → የይለፍ ቃል ረሳሁ → Email → Send code → 8-digit code → New Password → ወደ Login ተመልሰው ይግቡ።
- **Change email:** ወደ Profile → Change account email → New email + Current Password → Send code → አዲሱ ኢሜይል የተቀበለውን ኮድ Verify። ኢሜይል በተለመደው Profile edit ብቻ አይቀየርም።
- **Sign out everywhere:** Profile → ከሁሉም መሣሪያዎች ውጣ → Confirm። የቀድሞ መግቢያዎች ይሰረዛሉ።
- **ተጠቃሚው የሚጠቀምበት ኢሜይል ከጠፋ:** Admin → Manage users → Set temporary password በማለት ጊዜያዊ ቃል ሊሰጠው ይችላል። በመጀመሪያ መግቢያ አዲስ ቃል፣ ፕሮፋይልና የግላዊነት ስምምነት ያጠናቅቃል።
- **Account approval, report approval, plan approval, review history, comment, project planning, attendance, Amharic/English** ከv10 የቀድሞ ማሻሻያ እንዳሉ ይቀጥላሉ።

## 4. የምትፈትሸው 10 መርሃ ግብሮች

1. GitHub Pages ላይ የGAIUS ገጽ ይከፈታል፣ ቀድሞ ያለው የv10 ገጽና ስድስት ሪፖርቶቹ አሉ።
2. የመጀመሪያው Director ከ`SETUP_KEY` ጋር ይመዘገባል።
3. ሌላ ሠራተኛ ይመዘገባል፣ አስተዳዳሪው እስኪያጸድቀው ድረስ መግባት አይችልም።
4. ሠራተኛው እቅድና ሪፖርት ይላካል፤ አስተዳዳሪው ከሌላ ስልክ ያጸድቃል።
5. አንዱን ሪፖርት ለማሻሻያ ይመልሳል፤ የውሳኔው ታሪክ ይታያል።
6. ሰሞኑን የሥራ መገኘት ይመዘገባል፤ የተለያዩ ስልኮች አድሰው ያዩታል።
7. በLogin ላይ Forgot password ኮድ ወደ ተመዘገበ ኢሜይል ይደርሳል፤ የተሳሳተ ኮድ ውድቅ ይደረጋል።
8. ትክክለኛውን ኮድ በመጠቀም አዲስ ቃል ይያዛል፤ የቀድሞው ቃልና መግቢያዎች አይሠሩም።
9. በProfile ላይ ኢሜይል ማስተካከል በአዲሱ ኢሜይል ኮድ ብቻ እንደሚቻል አረጋግጥ።
10. በiPhone Safari ላይ Share → Add to Home Screen በማለት እንደ App ይክፈት።

## 5. በተለይ ማወቅ ያለብህ

- **Local mode የኢሜይል ኮድ አይልክም።** `gaius-config.js` ውስጥ `apiUrl` ባዶ ከሆነ፣ መረጃዎች በዚያ አሳሽ ላይ ብቻ ይቀመጣሉ። የኢሜይል ኮድ ለመላክ `Cloudflare + Resend` አገናኝ።
- **የቀድሞ Local data በራሱ ወደ Shared Worker አይዛወርም።** በነባሩ አሳሽ ቀድሞዎቹን ለማየት በPages URL መጨረሻ `?workspace=local` ጨምር። የሥራ መዝገቦች የJSON ምትኬን በተፈቀደለት ግለሰብ ብቻ ጠብቅ። የዳታ ማስመጫ ተግባር በዚህ ስሪት አልተጨመረም።
- **ሚስጥራዊ ሪፖርቶችን በGitHub አትጻፍ።** ስድስቱ የጥቅምት ነባር ሪፖርቶች እንደ ላክኸው በ`index.html` ውስጥ ተጠብቀዋል፤ GitHub Pages ለሁሉም ሰው ተደራሽ ከሆነ፣ የHTML ምንጩን የሚያወርድ ሰው እነሱን ሊያነብ ይችላል። ከማሰማራት በፊት ይህን አረጋግጥ፤ ሪፖርቶቹን በፈቃድህ ብቻ ወደ ግል ማከማቻ ማዛወር ይቻላል።
- **መመለሻ ምትኬ አስፈላጊ ነው።** የCloudflare Durable Object የዳታቤዝ ምትኬና የመመለሻ መርሃ ግብር በድርጅቱ የሥራ ደንብ ውስጥ ያስቀምጥ። ይህ ጥቅል በራሱ የየቀን ውጫዊ ምትኬ አይፈጥርም።
- **አዲሱ ኢሜይል አገልግሎት እስኪዋቀር ድረስ ኮድ አይላክም።** ZIPው የአስፈላጊውን ኮድ አካትቷል፤ በእውነተኛ የResend መለያ/የተረጋገጠ ጎራ ላይ የመላኪያ ፈተና አንተ ማድረግ አለብህ።

**ለማጣቀሻ:** [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/get-started/) · [Cloudflare Secrets](https://developers.cloudflare.com/workers/configuration/secrets/) · [Resend](https://resend.com/docs)
