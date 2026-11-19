**የአሁኑ v10.3 የGitHub ማዘመኛና የቋሚ ስረዛ መመሪያ:** [GAIUS v10.3](GAIUS_v10_3_ADMIN_DELETE_AMHARIC.md)። ከታች የነባሩ የv10 መመሪያ ተጠብቋል።

---

**የv10.2 አዲሱ መመሪያ [እዚህ ነው](GAIUS_v10_2_SETUP_AMHARIC.md)። የኢሜይል ኮድን ለማዋቀር የአዲሱን መመሪያ ተከተል።**

---

# ጋይዮስ v10 በGitHub ላይ ማዘመኛና የአስተዳዳሪ መመሪያ

**ለነባሩ v10 repository የምትጠቀምበት ፋይል `GAIUS_v10_Update_Only.zip` ነው።** ውስጡ 11 ፋይሎች አሉ። ሁሉንም ነባሩ `index.html` ባለበት ደረጃ ጫን። `GAIUS_v10_Complete.zip` ሁሉንም የያዘ ሙሉ ቅጂ ነው። ለአንድ ማዘመኛ የመጀመሪያው ZIP በቂ ነው።

**ቡድኑ ከተለያዩ ስልኮች እንዲሠራ ክፍል 3ንም አጠናቅቅ።** GitHub Pages የመተግበሪያውን ገጽ ያቀርባል። የጋራ የሚኒስትሪ መዝገቡ በጥቅሉ ከተካተተው Cloudflare አገልግሎት ጋር ይሠራል። በተሰጠው የመነሻ ቅንብር መለያዎችና ውሳኔዎች በተጠቀምክበት አሳሽ ይቀመጣሉ። [የGitHub Pages አሠራር](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## 1. በrepositoryው ውስጥ የሚገቡ ፋይሎች

| በGitHub ላይ የሚደረገው | ፋይል | አገልግሎት |
|---|---|---|
| አዘምን | `index.html` | የv10 ገጾች፣ የተጠቃሚ አስተዳደር፣ እቅዶችና የግምገማ መቆጣጠሪያዎች |
| አዘምን | `sw.js` | አዲሶቹን ፋይሎች በስልክ እንዲጫኑና የአካባቢው ሥራ ኢንተርኔት ሳይኖር እንዲከፈት ያደርጋል |
| አዘምን | `README.md`፣ `UPLOAD_TO_GITHUB.md` | የዚህን ማዘመኛ መግቢያ ይጨምራሉ። ቀደምት ጽሑፎቹም ከሥር ተጠብቀዋል |
| ጨምር | `gaius-app.js` | የአማርኛና የእንግሊዝኛ ገጾች፣ ቅጾችና አዝራሮች |
| ጨምር | `gaius-core.js` | የፈቃድ፣ የማጽደቅ፣ የመገኘትና የመለያ ደንቦች |
| ጨምር | `gaius-store.js` | መተግበሪያውን ከነባሩ የአሳሽ መረጃ ወይም ከጋራ መዝገቡ ጋር ያገናኛል |
| ጨምር | `gaius-config.js` | የጋራ አገልግሎቱን ይፋዊ አድራሻ የምታስገባበት |
| ጨምር | `gaius-worker.js`፣ `wrangler.jsonc` | ከተለያዩ መሣሪያዎች የሚመጡ መለያዎች፣ ሪፖርቶችና ውሳኔዎች የሚቀመጡበትን የጋራ አገልግሎት ያቋቁማሉ |
| ጨምር | `GAIUS_v10_GitHub_Amharic.md` | ይህ መመሪያ |

የላክኸው v10 የማሰማሪያ ፋይል `.github/workflows/static.yml`፣ `.nojekyll`፣ `manifest.webmanifest`፣ ሁለቱ የ`icons/` ፋይሎችና ሌሎቹ የv10 ሰነዶች በሙሉው ቅጂ ውስጥ አሉ። በነባሩ repository ላይ የመሰረዝ ደረጃ የለም።

## 2. ከiPhone ወይም ከኮምፒውተር ወደ GitHub መጫን

1. `GAIUS_v10_Update_Only.zip`ን አውርድ። በiPhone **Files → Downloads** ክፈትና ZIPውን ንካ። ከተከፈተው አቃፊ ውስጥ 11ዱን ፋይሎች ትመርጣለህ። [የApple የZIP መመሪያ](https://support.apple.com/en-la/102532)
2. በGitHub ያለውን **ነባሩን v10 repository** ክፈት። **Code** ላይ `index.html` እና `sw.js` የሚታዩበትን ቦታ ምረጥ።
3. **Add file → Upload files → choose your files** ተከተል። ከፈታኸው አቃፊ ውስጥ 11ዱን ፋይሎች ምረጥ። ከጫንክ በኋላ `gaius-app.js` ከ`index.html` ጎን መታየት አለበት። [የGitHub ፋይል መጫኛ መመሪያ](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
4. በለውጡ መግለጫ `Update v10 admin approvals and plans` ብለህ ጻፍ። **Create a new branch** ምረጥ፣ ከዚያ **Propose changes → Create pull request** ተከተል። **Files changed** ላይ 4 የታደሱ፣ 7 የተጨመሩ፣ 0 የተሰረዙ ፋይሎች መሆናቸውን ከላክኸው v10 ጋር አመሳክር። በGitHub ላይ በኋላ የጨመርከው ጽሑፍ ወይም ባህሪ ካለ፣ ከማዋሃድህ በፊት ያንንም ወደ አዲሱ ቅጂ አስገባ። ሲስማማህ **Merge pull request** ብለህ ወደ `main` አዋህድ።
5. **Settings → Pages → Build and deployment → Source → GitHub Actions** ምረጥ። **Actions** ላይ የተሳካውን ማሰማራት ክፈት። በላክኸው v10 ውስጥ የሥራው ስም **Deploy GAIUS v9** ተብሎ ይታያል። ከዚያ **Settings → Pages → Visit site** ብለህ ነባሩን አድራሻ ክፈት። [የGitHub Pages ቅንብር](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 3. ሠራተኛው ከራሱ ስልክ ልኮ አንተ ከራስህ ስልክ እንድታጸድቅ

የጋራ መዝገቡን አንድ ጊዜ አዘጋጅ። የሚኒስትሪው የCloudflare መለያ እና በv10 repository ላይ የማዋቀር ፈቃድ ያስፈልጋሉ። Supabase መክፈት አያስፈልግም።

1. በGitHub `wrangler.jsonc` ክፈት። `ALLOWED_ORIGIN` ላይ የአንተን Pages አድራሻ የጎራ ክፍል ብቻ አስቀምጥ። ለምሳሌ የመተግበሪያው አድራሻ `https://example.github.io/gaius/` ከሆነ የምታስገባው `https://example.github.io` ነው። የራስህን ጎራ የምትጠቀም ከሆነ ያንን አስገባ። ለውጡን ወደ `main` አስቀምጥ።
2. በCloudflare **Workers & Pages → Create application → GitHub** ክፈት። የv10 repositoryህን ምረጥ። የWorker ስም `gaius-ministry-reviews`፣ ቅርንጫፍ `main`፣ የፕሮጀክት ቦታ የrepositoryው ዋና ማውጫ ይሁን። **Build command** ባዶ ይቆይ። **Deploy command** ላይ `npx wrangler deploy` አስቀምጥና **Save and Deploy** ምረጥ። የጋራ ዳታቤዙ በጥቅሉ ቅንብር ይፈጠራል። [የCloudflare የGitHub ግንኙነት](https://developers.cloudflare.com/workers/ci-cd/builds/) · [የማሰማሪያ ቅንብሮች](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
3. Workerው ላይ **Settings → Variables and Secrets → Add → Secret** ምረጥ። ስሙ `SETUP_KEY` ይሁን። ዋጋውን በpassword manager የፈጠርከውን ረጅም፣ ለዚህ ብቻ የሚያገለግል የሚስጥር ቁልፍ አድርግ። **Deploy** በል። ይህን ቁልፍ በCloudflare እና በpassword managerህ ውስጥ ጠብቀው። [የCloudflare የሚስጥር ቁልፍ መመሪያ](https://developers.cloudflare.com/workers/configuration/secrets/)
4. በCloudflare የታየውን የWorker `https://…workers.dev` አድራሻ ቅዳ። በGitHub `gaius-config.js` ውስጥ `apiUrl: ""` ባለበት በሁለቱ የጥቅስ ምልክቶች መካከል **የWorker አድራሻውን ብቻ** አስገባ። ለውጡን በ`main` ላይ አስቀምጥ። የPages ማሰማራቱ ሲያልቅ የGAIUSን ድረ ገጽ አድስ።
5. በGAIUS **መመዝገቢያ → የሀገር ውስጥ ዳይሬክተር** ወይም **ዓለም አቀፍ ዳይሬክተር** ምረጥ። በማዋቀሪያ ቁልፍ መስኩ `SETUP_KEY` ውስጥ ያስቀመጥኸውን ዋጋ አስገባ። ፕሮፋይልህን፣ ፎቶህን፣ 12ቱን የግላዊነት ድንጋጌዎችና የራስህን የመግቢያ ይለፍ ቃል ሙላ። ከገባህ በኋላ **የጋራ የሚኒስትሪ መዝገብ** የሚለውን ጽሑፍ ከስምህ ሥር ታያለህ። ለሠራተኞችህ የምትልከው የGitHub Pages የመተግበሪያ አድራሻ ነው።

**በአንድ መሣሪያ ስትጠቀም** `apiUrl`ን ባዶ አድርግ። በዚያ አሳሽ የv10 አስተዳዳሪ ካለ በነባሩ መለያ ግባ። መጀመሪያህ ከሆነ በዳይሬክተር ሚና ተመዝገብ። ቅጹ የቀድሞውን የአካባቢ v10 ኮድ ያሳያል።

## 4. በየቀኑ የምትጠቀምባቸው የአስተዳዳሪ ተግባሮች

| የምትፈልገው | የምትጫነውና ውጤቱ |
|---|---|
| ሠራተኛ ጨምር | **የአስተዳዳሪ ቁጥጥር → ተጠቃሚ ጨምር**። ስም፣ የተጠቃሚ ስም፣ ሚናና ጊዜያዊ የይለፍ ቃል ስጥ። ሠራተኛው ሲገባ ቃሉን ይቀይራል፣ ፕሮፋይሉንና ስምምነቱን ራሱ ያጠናቅቃል። |
| ራሱን የመዘገበ ሰው አጽድቅ | **የአስተዳዳሪ ቁጥጥር → የመለያ ሁኔታ → ማጽደቅ የሚጠብቅ → አጽድቅ**። አሁን ሠራተኛው በመለያው መግባት ይችላል። |
| ተጠቃሚ አስወጣ ወይም መልስ | ስሙን ፈልግ፣ **መግቢያውን ዝጋ** ብለህ አረጋግጥ። የቀድሞ ሪፖርቱ፣ እቅዱና የመገኘት ታሪኩ ከስሙ ጋር ይቀመጣሉ። **ከአገልግሎት የወጣ → መለያውን መልስ** ብለህ መመለስ ትችላለህ። |
| ሪፖርት አጽድቅ | **ሪፖርቶች → ሪፖርቱን ምረጥ → ውሳኔዎች → አጽድቅ**። ማሻሻያ ካስፈለገ ምክንያቱን ጻፍና **ለማሻሻያ መልስ** ምረጥ። የዳይሬክተር አስተያየት በተለየ ቦታ ይቀመጣል። |
| እቅድ አጽድቅ | ሠራተኛው **እቅዶች → አዲስ እቅድ → እቅዱን ላክ** ይጠቀማል። አንተ **እቅዶች → ውሳኔዎች → አጽድቅ** ምረጥ። ከነባር ፕሮጀክት ለመጀመር በጋራ የሥራ ቦታ **ለዚህ ፕሮጀክት እቅድ አቅርብ** የሚለውን ተጠቀም። |
| ፈቃድ ስጥ | በአባሉ ስም ሥር **ሚናና ፈቃዶች** ክፈት። ውስን ፈቃድ ለመስጠት የሚፈለጉትን ተግባሮች ምረጥ። ሙሉ መብት ለመስጠት **ሙሉ አስተዳዳሪ** ምረጥና አስቀምጥ። የv10 የተተኪ ማስተላለፊያውም ይሠራል። የመጨረሻውን ሙሉ አስተዳዳሪ ከማስወጣትህ በፊት ተተኪ መድብ። |

በሌላ መሣሪያ የገባን ጥያቄ ለማየት ከስምህ ሥር **አድስ** ተጫን። የውሳኔው ታሪክ ገምጋሚውን፣ ጊዜውንና የጻፈውን ማስታወሻ ያሳያል። የጸደቀ ሪፖርት ወይም እቅድ ይዘት ከታረመ አዲሱ ቅጂ እንደገና ውሳኔ ይጠብቃል።

## 5. ነባር መረጃና የመጨረሻ ፍተሻ

- **የቆዩ መለያዎችና ሪፖርቶች** ቀድሞ v10ን በተጠቀምክበት መሣሪያና አሳሽ ላይ በዚያው የPages አድራሻ ይከፈታሉ። ለዚህ ማዘመኛ Safari የድረ ገጽ መረጃን ማጽዳት አያስፈልግም። የጋራ መዝገቡ ሲቋቋም የአሳሹ መለያዎችና በእጅ የገቡ መዝገቦች ወደ ሰርቨሩ በራሳቸው አይዛወሩም። ከግንኙነቱ በኋላም `?workspace=local`ን በነባሩ የPages አድራሻ መጨረሻ ጨምረህ በዚያው አሳሽ ልትከፍታቸው ትችላለህ። **የሥራ መዝገቦችን አውርድ** ለግል ማጣቀሻ ቅጂ ያወጣል። ይህ ቅጂ የአባላትን መረጃ ስለሚይዝ በግል አስቀምጠው።
- **ስድስቱ የጥቅምት ዋና ሪፖርቶች** የአማርኛውን ጽሑፍና የእንግሊዝኛውን ትርጉም ይዘዋል። አስተዳዳሪው ውሳኔና አስተያየት ሊመዘግብባቸው ይችላል። በነባሩ v10 ውስጥ ጽሑፎቹ `index.html` ውስጥ ስለተካተቱ፣ በይፋዊ Pages ላይ ሲታተም ገጹን የሚያወርድ ሰው ሊያነባቸው ይችላል። ይህን በማወቅ የሕትመት ፈቃዳቸውን አረጋግጥ።
- **ከv4 የተጨመሩ መሣሪያዎች** በክፍል ሪፖርቶችን ማጣራት፣ የወርና የዓመት እቅድና ክንውን መመልከት፣ ለአንድ የሰኞ ስብሰባ ብዙ ሰዎችን በአንድ ጊዜ መመዝገብ፣ ልዩ ፕሮግራሞችንና ወርሃዊ መገኘትን ማየት፣ ፎቶንና የፕሮፋይል መረጃን ማዘመን። የአፈጻጸም መቶኛው ክንውን በተመዘገበባቸውና እቅዳቸው ከዜሮ በላይ በሆኑ ሪፖርቶች ይሰላል። ለማስላት የሚበቃ መረጃ ሳይኖር `N/A` ይታያል።
- **በሁለት ስልኮች አረጋግጥ**። ሁለቱም **የጋራ የሚኒስትሪ መዝገብ** እንደሚያሳዩ ተመልከት። በመጀመሪያው አንድ የሙከራ ሠራተኛ ይመዝገብ። በሁለተኛው እንደ አስተዳዳሪ አጽድቀው። ሠራተኛው አንድ ሪፖርትና አንድ እቅድ ይላክ። ሁለቱንም አጽድቅ። በሠራተኛው ስልክ **አድስ** ሲጫን **የጸደቀ** እና የገምጋሚው ስም ይታያሉ።
