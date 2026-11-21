// GAIUS Ministry v11 content model. User-facing organizational names retain manual wording.
// Internal IDs are stable across later spelling/translation corrections.
export const HQ_UNITS = [
 {id:'admin-finance',am:'የአስተዳደር እና ፋይናንስ ክፍል',en:'Administration and Finance'},
 {id:'followup',am:'የክትትል (Follwup)',en:'Follow-up Department'},
 {id:'coordination',am:'አገልግሎት አስተባባሪ',en:'Coordination Department'},
 {id:'counseling',am:'የማማከር',en:'Counseling'},
 {id:'support',am:'ድጋፍ ሰጪ',en:'Support Team Department'},
 {id:'establishment',am:'የማዕከላት ምስረታና',en:'Department of Centers Establishment',unverified:true},
 {id:'media-pr',am:'ሚደያ እና ህዘብ ግንኙነት',en:'Media and Public Relation'},
 {id:'research',am:'የጥናት የምርምር እና ስልጠና',en:'Research and Training'},
 {id:'monday-staff',am:'የሰኞ ሠራተኞች ፕሮግራም',en:'Monday Staff Program'}
];
export const CENTER_UNITS = [
 {id:'c-admin',am:'የአስተዳደር እና ፋይናንስ የአገልግሎት ክፍል',en:'Center Administration and Finance'},
 {id:'c-follow',am:'ክትትል',en:'Follow-up'},
 {id:'c-coord',am:'የአገልግሎት አስተባባሪ',en:'Service Coordination'},
 {id:'charity',am:'የ”ቻሪቲ” አገልግሎት ክፍል',en:'Charity Department'},
 {id:'worship',am:'የዝማሬ አምልኮ አገልግሎት ክፍል',en:'Worship Team'},
 {id:'evangelism',am:'የወንጌል ስርጭት አገልግሎት ክፍል',en:'Department of Evangelism'},
 {id:'event',am:'የ”ኢቨንት” እና “ፈንድሬይዚንግ” አገልግሎት ክፍል',en:'Event and Fund-raising Team'},
 {id:'academics',am:'የ”አካዳሚክ” እገዛ የአገልግሎት ክፍል',en:'Academic Assistance Department'},
 {id:'arts',am:'የ”አርት” እና ስነ-ጽሁፍ አገልግሎት ክፍል',en:'Art and Literature Department'},
 {id:'center-media',am:'የሚዲያ እና የግንኙነት አገልግሎት ክፍል ወኪል',en:'Media and Communication Representative'},
 {id:'center-research',am:'የጥናት ምርምር እና የስልጠና አገልግሎት ክፍል ወኪል',en:'Research and Training Representative'},
 {id:'book-club',am:'“ቡክ ክለብ”',en:'Book Club'}
];
export const FOCUS=[['discipleship','ደቀመዝሙርነት','Discipleship'],['evangelism','የወንጌል ስርጭት','Evangelism'],['mission','ተልዕኳዊ','Mission'],['holistic','ሁለንተናዊ እድገት','Holistic Development']];
export const TEACHING_UNITS=['ወንጌል','ዕድገት','የእግዚአብሔር መንግስት','ቤተክርስትያን','ሰው ማን ነው','ተፅዕኖ ፈጣሪ ማንነት','ልዩ ልዩ ርዕሶች'];
// Fields: [id, Amharic, English, input type, required?]; text is free-form, not HTML.
export const V11_KINDS={
 centers:{am:'ማዕከላት',en:'Centers',fullOnly:true,fields:[['name','የማዕከል ስም','Center name','text',true],['level','የማዕከል ደረጃ','Center level','level',true],['location','አካባቢ','Location','text'],['leaderId','የማዕከል መሪ','Center leader','user'],['notes','ማስታወሻ','Notes','long']]},
 centerUnits:{am:'የማዕከላት ክፍሎች',en:'Center departments',fullOnly:true,fields:[['centerId','ማዕከል','Center','center',true],['department','ክፍል','Department','centerunit',true],['responsibleId','ኃላፊ','Lead','user'],['notes','ማስታወሻ','Notes','long']]},
 plans6:{am:'የ6 ወር እቅዶች',en:'Six-month plans',fields:[['title','የእቅድ ርዕስ','Plan title','text',true],['start','መነሻ ቀን','Start date','date',true],['end','መጨረሻ ቀን','End date','date',true],['focus','ዋና ትኩረት','Strategic focus','focus',true],['objective','ዓላማ','Objective','long',true],['activities','ተግባራት','Activities','long',true],['milestones','ወርሃዊ ምዕራፎች','Monthly milestones','long'],['kpi','የውጤት መለኪያ','Indicators','long'],['budget','በጀት','Budget','number'],['risks','ተግዳሮቶች','Risks','long']]},
 monthly:{am:'ወርሃዊ ሪፖርቶች',en:'Monthly reports',fields:[['title','ርዕስ','Title','text',true],['month','የሪፖርት ወር','Reporting month','month',true],['focus','የትኩረት ምድብ','Focus area','focus'],['activity','የተግባር ርዕስ','Activity','text',true],['planned','የታቀደ','Planned','number'],['achieved','የተከናወነ','Achieved','number'],['result','ዋና ውጤት','Key result','long',true],['challenge','ተግዳሮት','Challenge','long'],['action','የተወሰደ እርምጃ','Action taken','long'],['next','ቀጣይ እርምጃ','Next action','long'],['evidence','የማስረጃ መግለጫ','Evidence reference','text'],['fileId','የፎቶ/ሰነድ ID','Photo/document file ID','text']]},
 followups:{am:'የክትትል ሪፖርት',en:'Center follow-up',centerOnly:true,restricted:true,fields:[['week','የሳምንቱ ቀን','Week starting','date',true],['sundayProgram','የእሁድ ፕሮግራም ተሳታፊዎች','Sunday program participants','number',true],['volunteers','የበጎ ፈቃደኞች ብዛት','Volunteer count','number',true],['leadersPresent','የተገኙ መሪዎች','Leaders present','number'],['potentialPresent','የተገኙ እጩ መሪዎች','Potential leaders present','number'],['biweeklyPresent','የሁለት ሳምንት ስብሰባ ተገኙ','Biweekly meeting present','number'],['contact','የመሪው ስልክ','Leader contact','text'],['activity','የሳምንቱ ሥራ','Activities','long'],['challenge','ተግዳሮት','Challenges','long'],['next','ቀጣይ ክትትል','Next follow-up','long'],['due','የማጠናቀቂያ ቀን','Due date','date']]},
 centerAttendance:{am:'የማዕከል መሪዎች መገኘት',en:'Center leader attendance',centerOnly:true,restricted:true,fields:[['date','ቀን','Date','date',true],['eventType','የስብሰባ ዓይነት','Meeting type','meeting',true],['participantId','የተሳታፊ ሰው','Participant','user',true],['attendance','የመገኘት ሁኔታ','Attendance','attendance',true],['note','ማስታወሻ','Note','text']]},
 succession:{am:'ተተኪ መሪዎች',en:'Potential successors',restricted:true,fields:[['leaderId','የአሁኑ መሪ','Incumbent leader','user',true],['slot','ተተኪ ቁጥር','Successor slot','slot',true],['successorId','እጩ ተተኪ','Proposed successor','user',true],['mentorId','የሚያማክር','Mentor','user'],['responsibilities','የአሁኑ ኃላፊነቶች','Current responsibilities','long'],['futureRole','የሚዘጋጅለት ሚና','Proposed role','text'],['readiness','ዝግጁነት','Readiness','readiness'],['reviewDate','ግምገማ ቀን','Review date','date'],['note','ማስታወሻ','Notes','long']]},
 mentorship:{am:'የአማካሪነት ግንኙነት',en:'Mentorship',fields:[['mentorId','መካሪ','Mentor','user',true],['menteeId','የሚመከር','Mentee','user',true],['goal','የልማት ግብ','Development goal','long',true],['last','የመጨረሻው ስብሰባ','Last meeting','date'],['next','ቀጣይ ስብሰባ','Next meeting','date'],['note','የእድገት ማስታወሻ','Progress note','long']]},
 teaching:{am:'የትምህርት እቅድ',en:'Teaching schedule',fullOrPermission:'v11:teaching',fields:[['unit','ዋና ክፍል','Unit','teachingunit',true],['topic','የትምህርት ርዕስ','Topic','text',true],['teacherId','አስተማሪ','Teacher','user'],['date','ቀን','Date','date'],['venue','ቦታ','Venue','text'],['objective','የትምህርት ዓላማ','Objective','long'],['resources','ማጣቀሻዎች','Resources','long'],['reflection','የመካከለኛ ጊዜ ተግባር','Interactive element','long']]},
 manuals:{am:'ዋና ሰነዶች',en:'Master documents',fullOrPermission:'v11:edit_manual',restricted:true,fields:[['title','የሰነድ ርዕስ','Document title','text',true],['kind','የሰነድ ዓይነት','Document kind','manual',true],['body','ሙሉ የሰነድ ጽሑፍ','Full editable document','long',true],['versionNote','የማሻሻያ ማስታወሻ','Revision notes','text']]},
 documents:{am:'የሰነድ ልማት',en:'Document development',fields:[['title','የሰነድ ርዕስ','Title','text',true],['category','ዓይነት','Category','text',true],['summary','ማጠቃለያ','Summary','long'],['reviewerId','ገምጋሚ','Reviewer','user'],['due','ቀነ ገደብ','Deadline','date'],['fileId','የተጫነ ፋይል ID','Uploaded file ID','text']]},
 board:{am:'ቦርድና አማካሪዎች',en:'Board and advisory board',fullOnly:true,restricted:true,fields:[['name','ሙሉ ስም','Full name','text',true],['type','የቦርድ ዓይነት','Board type','board',true],['position','ኃላፊነት','Position','text'],['bio','አጭር መገለጫ','Short profile','long'],['expertise','ችሎታ','Expertise','text'],['contact','ስልክ','Contact','text'],['photoFileId','የፎቶ ፋይል ID','Photo file ID','text']]},
 advisoryMeetings:{am:'የአማካሪ ቦርድ ስብሰባ',en:'Advisory meetings',fullOnly:true,restricted:true,fields:[['member','የአባሉ ስም','Member','text',true],['date','የስብሰባ ቀን','Meeting date','date',true],['agenda','አጀንዳ','Agenda','long'],['decisions','ውሳኔዎች','Decisions','long'],['next','ቀጣይ እርምጃ','Follow-up','long'],['due','ቀጣይ ቀን','Next contact','date']]},
 committees:{am:'ንዑስ ኮሚቴዎች',en:'Subcommittees',fullOnly:true,fields:[['title','የኮሚቴ ስም','Committee name','text',true],['purpose','ዓላማ','Purpose','long',true],['leadId','ኃላፊ','Lead','user'],['members','አባላት','Members','long'],['goals','ግቦች','Goals','long'],['due','ቀነ ገደብ','Due','date']]},
 initiatives:{am:'ፕሮጀክቶች',en:'Projects',fields:[['title','ፕሮጀክት','Project title','text',true],['objective','ዓላማ','Objective','long',true],['leadId','ኃላፊ','Lead','user'],['committee','ኮሚቴ','Committee','text'],['milestones','ምዕራፎች','Milestones','long'],['budget','በጀት','Budget','number'],['due','መጨረሻ ቀን','Due','date']]},
 tasks:{am:'ሥራዎችና ውሳኔዎች',en:'Tasks and decisions',fields:[['title','ተግባር','Task','text',true],['description','መግለጫ','Description','long'],['assigneeId','ተጠሪ','Assignee','user'],['due','ቀነ ገደብ','Due date','date'],['priority','ቅድሚያ','Priority','priority'],['outcome','ውጤት','Outcome','long']]},
 updates:{am:'የGAIUS እንቅስቃሴ ዜና',en:'Ministry updates',fullOrPermission:'v11:publish',fields:[['title','የዜና ርዕስ','Title','text',true],['body','መግለጫ','Description','long',true],['date','ቀን','Date','date'],['fileId','የፎቶ/ቪዲዮ ፋይል ID','Media file ID','text']]}
};
// v11.1 schema extension: new operations are secured by the existing v11 Worker.
export const NEXUS_DEPARTMENT_FIELDS = {
 'media-pr': [
 ['contentType','የይዘት ዓይነት','Content type','text'],['platform','ፕላትፎርም','Platform','text'],
 ['posts','የታተሙ ፖስቶች','Posts','number'],['reach','የደረሰባቸው ሰዎች','Reach','number'],
 ['views','የታዩ ጊዜያት','Views','number'],['engagement','አጠቃላይ ተሳትፎ','Engagement','number'],
 ['newFollowers','አዲስ ተከታዮች','New followers','number'],['campaigns','ዘመቻዎች','Campaigns','long'],
 ['production','ቪዲዮ/ፎቶ ዝግጅት','Video / photo production','long'],['webUpdates','የድህረ-ገጽ ለውጦች','Website updates','long'],
 ['eventsCovered','የተዘገቡ ፕሮግራሞች','Events covered','long'],['publicationLinks','የታተሙ ሊንኮች','Publication links','long'],
 ['improvements','የሚመከር ማሻሻያ','Suggested improvements','long']],
 'followup': [
 ['centersContacted','የተገናኙ ማዕከላት','Centers contacted','number'],['leadersFollowed','ክትትል የተደረገላቸው መሪዎች','Leaders followed up','number'],
 ['callsVisits','ስልክ/ጉብኝት','Calls and visits','number'],['profilesUpdated','የታደሱ መገለጫዎች','Profiles updated','number'],
 ['escalations','ለውሳኔ የተላኩ','Escalations','long'],['outstanding','ያልተጠናቀቁ ክትትሎች','Outstanding actions','long']],
 'research': [['trainingTopic','የሥልጠና ርዕስ','Training topic','text'],['sessions','የሥልጠና ብዛት','Sessions','number'],['trainees','ሰልጣኞች','Trainees','number'],['materials','ሥልጠና ቁሳቁሶች','Materials','long'],['learning','የትምህርት ውጤት','Learning outcomes','long'],['feedback','ግብረመልስ','Feedback','long']],
 'counseling': [['sessions','የአገልግሎት ብዛት','Sessions','number'],['serviceCategory','አጠቃላይ የአገልግሎት ምድብ','Service categories','text'],['referrals','ወደ ሌላ አገልግሎት የተላኩ','Referrals','number'],['awareness','የግንዛቤ ፕሮግራሞች','Awareness activities','long']],
 'support': [['supportType','የድጋፍ ዓይነት','Support category','text'],['peopleReached','የደረሰላቸው ሰዎች','Number reached','number'],['resources','የተጠቀሙ ሀብቶች','Resources','long']],
 'admin-finance': [['procurement','ግዥና ሎጂስቲክስ','Procurement / logistics','long'],['plannedBudget','የታቀደ በጀት','Budget planned','number'],['spentBudget','ወጪ','Actual expenditure','number'],['financeEvidence','የፋይናንስ ማስረጃ','Finance evidence reference','text'],['pendingDecision','የሚጠብቅ ውሳኔ','Pending decisions','long']],
 'coordination': [['programs','የተስተባበሩ ፕሮግራሞች','Programs coordinated','number'],['unitsInvolved','የተሳተፉ ክፍሎች','Departments involved','long'],['centersInvolved','የተሳተፉ ማዕከላት','Participating centers','long']],
 'monday-staff': [['meetings','የሰኞ ስብሰባዎች','Monday meetings','number'],['staffPresent','የተገኙ ሠራተኞች','Staff present','number'],['absences','ያልተገኙ','Absences','number'],['decisions','የተወሰኑ ውሳኔዎች','Decisions','long'],['followup','የቀጣይ ክትትል ሥራዎች','Follow-up actions','long']],
 'establishment': [['proposedCenters','ታቅደው ያሉ ማዕከላት','Proposed centers','number'],['readiness','ዝግጁነት','Readiness assessment','long'],['leadersIdentified','የተለዩ መሪዎች','Leaders identified','number'],['venueResources','ቦታና ግብዓት','Venue and resources','long'],['pendingRequirements','ያልተሟሉ መስፈርቶች','Pending requirements','long']]
};
// Add common topical Excel-aligned fields. Distinct departmental forms determine visibility.
V11_KINDS.monthly.fields.push(
 ['activityDate','የተግባር ቀን','Activity date','date'],
 ['ethiopianYear','የኢትዮጵያ ዓመት','Ethiopian year (manual)','text'],
 ['ethiopianMonth','የኢትዮጵያ ወር','Ethiopian month (manual)','text'],
 ['indicatorUnit','የመለኪያ ክፍል','Indicator unit','text'],
 ['cause','የተግዳሮት ምክንያት','Cause of challenge','long'],
 ['due','የቀጣይ ተግባር ቀን','Next action due','date'],
 ['priority','ቅድሚያ','Priority','priority'],
 ['dataSource','የመረጃ ምንጭ','Data source','text'],
 ['description','ተጨማሪ ማብራሪያ','Description','long'],
 ['departmentType','የሪፖርት ክፍል','Department report type','text'],
 ...Object.values(NEXUS_DEPARTMENT_FIELDS).flat()
   .filter((f,i,arr)=>arr.findIndex(g=>g[0]===f[0])===i)
);
V11_KINDS.centers.fields.push(
 ['city','ከተማ','City','city'],
 ['visitEveryMonths','የጉብኝት ወር ርቀት','Visit interval (months)','number']
);
V11_KINDS.advisoryMeetings.fields.push(['engagementType','የስብሰባው ዓይነት','Engagement type','advisorytype']);
V11_KINDS.directorGoals={am:'የዳይሬክተር 16 የስልታዊ ግቦች',en:'Director strategic objectives',personalOnly:true,restricted:true,fields:[
 ['number','የእቅድ ተ.ቁ','Objective number','number',true],['title','ዋና ዕቅድ','Strategic objective','text',true],
 ['activities','ዓላማ / ዝርዝር ተግባር','Source activities','long',true],['originalMonths','በመጀመሪያው ሰነድ የተጻፉ ወራት','Original Ethiopian-month schedule','long',true],
 ['accountable','ዋና ተጠሪ','Accountable owner','text',true],['collaborators','ተባባሪዎች','Collaborators','long'],
 ['expected','የሚጠበቅ ውጤት','Expected results','long',true],['budget','የመጀመሪያ በጀት ብር','Original budget ETB','number',true],
 ['spent','የተወጣ በጀት','Actual expenditure ETB','number'],['progress','የተገኘ ውጤት','Actual progress','long'],
 ['challenge','ተግዳሮት','Challenges','long'],['next','ቀጣይ እርምጃ','Next action','long'],['evidence','ማስረጃ','Evidence reference','text'],['progressStatus','የእቅድ ሁኔታ','Progress status','progressStatus']
]};
V11_KINDS.visits={am:'የማዕከላት ጉብኝት',en:'Center visits',personalOnly:true,restricted:true,fields:[
 ['centerRecordId','የማዕከል መዝገብ','Center registry record','registrycenter',true],
 ['location','የጉብኝት ቦታ','Visit location','text',true],['plannedDate','የታቀደ ቀን','Planned date','date',true],
 ['purpose','የጉብኝት ዓላማ','Visit purpose','long',true],['visitor','ጎብኚ','Assigned visitor','text',true],
 ['actualDate','በተግባር የተጎበኘበት ቀን','Actual visit date','date'],['leadersMet','የተገናኙ መሪዎች','Leaders met','long'],
 ['observations','የታዩ ነገሮች','Key observations','long'],['improvements','ከቀድሞው የተሻሻለ','Progress since last visit','long'],
 ['challenges','ተግዳሮቶች','Challenges','long'],['decisions','ውሳኔዎች','Agreements','long'],
 ['actions','የእርምት ተግባሮች','Corrective actions','long'],['actionOwner','ተጠሪ','Responsible person','text'],
 ['due','የክትትል ቀን','Follow-up due','date'],['nextVisit','ቀጣይ ጉብኝት','Next visit','date'],
 ['evidence','የፎቶ/ሰነድ ማጣቀሻ','Evidence reference','text']
]};
// Shared center planning identifies a department without changing the center
// scope. Attendance is separate from Monday staff attendance records.
V11_KINDS.plans6.fields.push(['departmentType','የማዕከል ክፍል','Center department','text']);
V11_KINDS.centerAttendance.fields.push(
 ['meetingName','የሌላ ስብሰባ ስም','Other meeting name','text'],
 ['departmentType','የመሪው ክፍል','Participant department','text']
);
export const V11_KINDS_LIST=Object.keys(V11_KINDS);
