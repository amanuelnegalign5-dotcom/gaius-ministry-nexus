# የGAIUS Nexus የአስተዳዳሪ መመሪያ — የAudit ደረጃ

**የሥራ ሁኔታ:** ይህ የProduction ማዋቀሪያ ማረጋገጫ ሳይሆን የአስተዳዳሪዎች ማረጋገጫ ዝርዝር ነው። ሚስጥራዊ ኮዶችን፣ Password፣ API Secret፣ የResend ቁልፎችን በGitHub፣ በScreenshot ወይም በChat አታካፍል።

## 1. የGitHub የመጀመሪያ ማረጋገጫ
- Repository: `amanuelnegalign5-dotcom/gaius-ministry-nexus`; የመነሻ `main` Commit: `4aba3e25f36c0c42c7c5d2764057e5ce194ce4ee`።
- GitHub Actions የTest እና Deploy ሁኔታን ተመልከት። Tests አለፉ ማለት Live Accounts እና Backup ተፈትነዋል አይደለም።
- ከAudit Branch ወደ `main` ለመዋሃድ የሚስጥራዊ የመዳረሻ ደንብ ሲቀየር መጀመሪያ የድርጅቱን ፈቃድ አረጋግጥ።

## 2. Cloudflare / Durable Object
- `gaius-nexus-api` Worker በProduction ትክክለኛው `WORKSPACE` Durable Object እንዳገናኘ በCloudflare Dashboard አረጋግጥ።
- የProduction data export በPrivate መንገድ ውሰድ፤ Record Count እና SHA-256 ማስረጃ በግል አስቀምጥ።
- በተለየ Staging Worker ውስጥ Restore አድርግና የተጠቃሚ/Reports/Permissions ማስረጃ አረጋግጥ። ይህ ካልተደረገ የData Migration አትጀምር።

## 3. R2 ማከማቻ
- የPrivate R2 Bucket እና `MEDIA_BUCKET` Binding እንዳሉ በCloudflare ውስጥ አረጋግጥ። የPublic File Access አትክፈት።
- `wrangler.jsonc` በRepository ውስጥ R2 Binding አልያዘም፤ በDashboard ብቻ መኖሩ በማስረጃ መገምገም አለበት።
- Bucket መፈጠሩ እስኪረጋገጥ ድረስ ሙከራ ያልተደረገ የR2 Binding በProduction አትጨምር።

## 4. Security እና የተጠቃሚዎች ፈቃድ
- የ9 HQ Departments፣ Directors፣ Center Leaders እና Staff የAccess Control ሙከራን በStaging አድርግ።
- የDirector የግል ሰነድ ለሌላ Director በራስ-ሰር መታየት የለበትም።
- `index.html` ውስጥ ያሉ 6 የታሪክ ሪፖርቶች በPublic Source ሊታዩ ይችላሉ። የግል ይዘታቸውን በይፋ አትድገም፤ ከማስወገድ በፊት የBackup፣ የMigration እና የፈቃድ እርምጃ አድርግ።

## 5. Release Decision
- Security Tests + UAT + Data Restore + File Tests + Director Approval ከተሟሉ በኋላ ብቻ Production Release አድርግ።
- የRelease Status አሁን፦ **BLOCKED / NOT YET SIGNED OFF**።
