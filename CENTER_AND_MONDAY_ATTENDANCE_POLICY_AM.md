# GAIUS Nexus — የሰኞና የማዕከላት ፕሮግራም ልዩነት (v11.2.3)

## የተረጋገጠ የሚና መርህ
**ሰኞ የStaff Program / Monday Attendance:** ዳይሬክተሮች፣ HQ department leaders እና የHQ staff አባላት ብቻ። የማዕከል መሪ፣ የማዕከል የክፍል መሪ እና እጩ መሪዎች በዚህ የመገኘት ዝርዝር ውስጥ **አይገቡም**። የተለየ Admin flag መኖር ይህን የመርሃ ግብር ወሰን አይሻርም። የሰኞ መገኘትን መመዝገብ የDirector ወይም ፈቃድ ያለው የHQ attendance officer ሥራ ነው፤ ሁሉም staff ሌላ ሰውን ለመመዝገብ አይችልም።

**ለማዕከላት የተለየ ሥርዓት:** የማዕከላት መሪዎችና የክፍል መሪዎች የራሳቸውን የ6-ወር ዕቅድ፣ ወርሃዊ ሪፖርት፣ እና የማዕከል መሪዎች መገኘት በ`Center plans & reports` ያያሉ። የመገኘት ምድቦች፦
- **Sunday main program / የእሁድ ዋና ፕሮግራም:** ቀኑ እሁድ መሆኑ በBackend ይረጋገጣል።
- **Other meeting day / ሌላ የስብሰባ ቀን:** ቀን እና የስብሰባ ስም መሙላት አለበት።
- በቀድሞው ኮድ የነበሩ የBiweekly እና Special ምድቦች አልተሰረዙም።

## የመዳረሻ ሰንጠረዥ
| ሚና | Monday attendance | Center plans/reports | Center Sunday/other-day attendance |
|---|---|---|---|
| Country / International Director | አዎ፣ የHQ ሰኞ መርሃ ግብር | ሁሉንም ማዕከላት በማዕከል ማጣሪያ | ሁሉንም ማዕከላት |
| HQ Department Leader | አዎ | አይደለም፣ የHQ ሥራ ብቻ | አይደለም |
| HQ/General Staff | አዎ፣ ራሱን እና የተፈቀደውን | አይደለም፤ የግል ዕቅድ/ሪፖርት አለ | አይደለም |
| Center Leader | አይደለም | የራሱ ማዕከል፤ ሌሎች ረቂቆች አይታዩም | የራሱን ማዕከል መሪዎች ይመዘግባል |
| Center Department Leader | አይደለም | የራሱ ማዕከልና ክፍል | በራሱ ክፍል ለሚገኙ መሪዎች |
| Potential Center Leader | አይደለም | የራሱ ማዕከል ዕቅድ/ሪፖርት | ተሳታፊ ብቻ |
| Potential Department Leader | አይደለም | የራሱ ማዕከልና ክፍል ዕቅድ/ሪፖርት | ተሳታፊ ብቻ |

ያልተላከ ረቂቅ ለባለቤቱ ብቻ ነው። የተላኩ መዝገቦች ለተመደቡ ሚናዎች በBackend authorization ይታያሉ። የሌላ ማዕከል `scopeId` በማስገባት የሌላ ማዕከል መረጃ ማግኘት አይፈቀድም።

## ለProduction የሚቀረው
ይህ የRole-scope ለውጥ በ`feature/center-planning-and-separated-attendance-20261121` Branch ላይ ነው። የተሟላ Database Backup/Staging Restore እና የእውነተኛ iPhone/role UAT ከመካሄዳቸው በፊት ወደ Production አይዋሃድም። የቀድሞ መዝገቦች አልተሰረዙም።
