# GAIUS Nexus v11.2 — የተጠበቀ የሰነድ ማከማቻ ማዋቀር

## አስፈላጊ ልዩነት
GitHub Pages የApp ማሳያውን ብቻ ያስተናግዳል። የድርጅቱን የግል PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV, TXT, JPG, PNG, WEBP እና MP4 ፋይሎች በPublic Repository ላይ አትጫን። **Cloudflare R2 private bucket** እና **gaius-nexus-api Worker** ያስፈልጋሉ።

## በCloudflare Dashboard ላይ
1. R2 Object Storage ውስጥ **Create bucket** ምረጥ። ስሙ: `gaius-nexus-private` (ከዚህ የተለየ ስም ከመረጥክ በታች ቀይር)።
2. Public access **OFF** ይሁን። የbucket የይፋ አገናኝ/Custom Domain አትክፈት።
3. **Workers & Pages → gaius-nexus-api → Settings → Bindings → Add binding → R2 bucket** ሂድ።
4. Variable name: `MEDIA_BUCKET` ; R2 bucket: `gaius-nexus-private`. ለProduction አያይዝ፣ አስቀምጥና Deploy አድርግ።
5. የGitHub Actions የCloudflare Worker deployment ቅንብር ከGitHub በኋላ እንዳይደፈርስ፣ ከbucket መፍጠር በኋላ **wrangler.jsonc** ውስጥ ይህን አክል:

```json
"r2_buckets": [
  { "binding": "MEDIA_BUCKET", "bucket_name": "gaius-nexus-private" }
]
```

እንደ ምሳሌ፣ ከ`durable_objects` ክፍል በፊት ማስገባት ትችላለህ። **Bucket ከመኖሩ በፊት ይህን በProduction አትልቀቅ** — deployment ሊወድቅ ይችላል።

## የሥራ ሂደት
1. Director ተጠቃሚን ያጸድቃል እና የupload ፈቃድ ካስፈለገ `v11:upload_file` ይሰጣል።
2. ተጠቃሚው **Gaius Nexus → File uploads** በመግባት ፋይል ይመርጣል። ከ10 MB በላይ አይሆንም።
3. Worker ሚናን፣ scope እና file signature/MIME ይፈትሻል፤ ፋይሉን በprivate R2 ውስጥ ያስቀምጣል። Status = Pending.
4. Director ያጸድቃል/ይከለክላል፤ በ**Manage file access** ውስጥ የተመረጡ ሰዎችን ይፈቅዳል/ያስወግዳል። የሚደርሱት ከApproved በኋላ ብቻ ነው።
5. User በነባር HQ/Center Scope ወይም በግልጽ የAdmin ፈቃድ መሠረት ይመለከታል። የHQ ሪፖርት መዳረሻን አይቀይርም።
6. PDF እና ምስሎች በApp ውስጥ Preview አላቸው። Word/PPT/Excel ከመሣሪያው በሚደገፍ ፕሮግራም ይከፈታሉ።

## ለLogin ሎጎ
`icons/gaius-login.png` ውስጥ ከተጠቃሚው የተሰጠ ጥቁር ጀርባ ያለው የGAIUS ሎጎ በትንሽ የድር ፋይል መጠን ተቀምጧል። በLogin ገጽ ላይ ያ ይታያል፣ በApp ውስጥ ደግሞ የቀድሞው የApp Icon የምስል ፋይል (`icons/official-logo.jpg`) ይታያል።
