# GAIUS Nexus — የPrivate Files / Cloudflare R2 ማዋቀር

የGitHub Pages ይዘት በይፋ ስለሚታይ **የግል Word/PDF/PPT እና ሌሎች ሰነዶችን GitHub repository ላይ አትጫኑ**።

## 1. የR2 Bucket ፍጠር
1. Cloudflare Dashboard → R2 Object Storage → Create bucket
2. ምሳሌ ስም: `gaius-nexus-private-media` (የተፈጠረውን ትክክለኛ ስም መዝግቡ)
3. Public bucket access / custom public domain **አታብሩ**።
4. የማከማቻ ክፍያ/መጠን ገደቦችን በCloudflare ላይ አረጋግጡ።

## 2. ከCloudflare Worker ጋር አገናኝ
Cloudflare → Workers & Pages → `gaius-nexus-api` → Settings → Bindings → Add binding → R2 bucket:
- **Variable name:** `MEDIA_BUCKET`
- **Bucket:** ከላይ የፈጠሩት የግል bucket
- Save and deploy.

**Deployment caveat:** CI deploys Worker with `wrangler.jsonc`; dashboard-only bindings may not survive subsequent deployment. Once the real bucket exists, also add the matching `r2_buckets` entry to `wrangler.jsonc`:
```json
"r2_buckets": [
  { "binding": "MEDIA_BUCKET", "bucket_name": "YOUR_ACTUAL_PRIVATE_BUCKET_NAME" }
]
```
እዚህ ያለውን placeholder በሚኖረው ትክክለኛ የbucket ስም ቀይሩ፤ bucket ከመፈጠሩ በፊት ይህን ወደ Production አታስገቡ።

## 3. የሰነድ ፈቃድ ሞዴል
- **Director:** የድርጅት ሰነዶችን ይከታተላል፤ የሌላ Director የግል ሰነዶች አይከፈቱለትም።
- **HQ Leader:** በተመደበበት HQ Department ሰነዶች ብቻ። ለ9ኙ HQ የReports ማየት መብት መኖሩ የሌላ ክፍል የFile መዳረሻ አይሰጥም።
- **Center:** የራሱን center/department ሰነዶች ብቻ።
- **Staff:** የራሱ ሰነዶች እና በአስተዳዳሪ በግልጽ የተፈቀዱ ብቻ።
- **Pending uploads:** ለአስገቢውና ለተፈቀዱ ገምጋሚዎች ብቻ እስኪጸድቁ ድረስ።

የፈቃድ ማረጋገጫ በBackend ላይ መሆን አለበት፤ UI ማስደበቅ ብቻ በቂ አይደለም። ለFile bytes የሚወጣ ቀጥተኛ የPublic R2 URL አትፍጠሩ።

## 4. የሚደገፉ ፋይሎች
PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, JPG/JPEG, PNG, WEBP, GIF, TXT, CSV, ZIP, MP4. ነባሩ የፋይል መጠን ገደብ 10 MiB ነው። እንደ HTML, SVG, JS, EXE ያሉ በአሳሽ ሊፈጸሙ የሚችሉ ፋይሎችን አይቀበሉ።

## 5. የQA ሙከራ
ለDirector, HQ, Center እና General Staff በተለያዩ መለያዎች upload, listing, preview/download, approve/reject እና cross-scope 403 denial ፈትሹ። እስኪጠናቀቅ ድረስ በሚስጥር የሚያዙ የምክር፣ የሠራተኛ ወይም የክብካቤ ሰነዶችን አትጫኑ።
