// Proposed catalog derived from GAIUS Ministry Manual, section IV, and existing v11 HQ model.
// Stable IDs match current v11 model. Summaries, not full private source documents.
const item=(id,am,en,purpose,deliverables)=>({id,am,en,purpose,deliverables});
export const HQ_CHARTERS=[
 item('admin-finance','አስተዳደርና ፋይናንስ','Administration and Finance','Manage administrative operations and finance.',['Budget','Expenditure','Assets','Procurement','Financial report']),
 item('followup','ክትትል','Follow-up','Support and empower members with centers.',['Center follow-up','Member retention','Action tracking']),
 item('coordination','አገልግሎት አስተባባሪ','Service Coordination','Coordinate ministry and center services; monitor plans and annual activities.',['Six-month plan review','Monthly reports','Service coordination','Corrective actions']),
 item('counseling','ምክር','Counseling','Provide counseling, develop counselors, create awareness and partnerships.',['Aggregate service counts','Referrals','Awareness','Training']),
 item('support','ድጋፍ ሰጪ','Support Team','Develop gifts and talents and connect members with professional networks.',['Talent development','Support connections','Outcomes']),
 item('establishment','የማዕከላት ምሥረታ','Centers Establishment','Study, prepare and communicate to establish centers.',['Feasibility','Readiness','Center establishment']),
 item('media-pr','ሚዲያና ሕዝብ ግንኙነት','Media and Public Relations','Manage domestic and international relations, communication media and ministry database.',['Partnerships','Media outputs','Reach','Communications']),
 item('research','ምርምርና ሥልጠና','Research and Training','Lead research and regular, seasonal and summer training.',['Studies','Training attendance','Learning outcomes','Materials']),
 {...item('monday-staff','የሰኞ ሠራተኞች ፕሮግራም','Monday Staff Program','Coordinate director and staff Monday programs.',['Agenda','Attendance','Decisions','Follow-up']),source:'existing v11 and user operational requirements'}
];
export const CENTER_CHARTERS=[
 item('c-admin','አስተዳደርና ፋይናንስ','Center Administration and Finance','Manage property, facilities, procurement, personnel and HQ finance liaison.',['Assets','Facilities','Budget','Purchases']),
 item('c-follow','ክትትል','Follow-up','Support members in church, education, family, relationships and talent development with confidentiality.',['Membership counts','Follow-up','Retention','Referrals']),
 item('c-coord','አገልግሎት አስተባባሪ','Service Coordination','Organize service units and coordinate leaders, staff and member entry criteria.',['Department plans','Service schedules','Report review']),
 item('charity','በጎ አድራጎት','Charity','Identify needs confidentially and organize charity programs.',['Aggregate beneficiaries','Support delivered','Community initiatives']),
 item('worship','ዝማሬና አምልኮ','Worship','Serve center programs and develop worship gifts.',['Programs','Rehearsals','Training']),
 item('evangelism','ወንጌል ስርጭት','Evangelism','Organize evangelistic programs and support members in outreach.',['Programs','Participation','Follow-up']),
 item('event','ዝግጅትና ገቢ ማሰባሰብ','Events and Fundraising','Coordinate schedules, special events and fundraising.',['Events','Campaigns','Income']),
 item('academics','አካዳሚክ እገዛ','Academic Assistance','Support education, tutoring and academic guidance.',['Tutorials','Aggregate education outcomes']),
 item('arts','አርትና ሥነ ጽሑፍ','Art and Literature','Develop artistic and literary gifts and programs.',['Productions','Talent development']),
 item('center-media','ሚዲያና ግንኙነት','Media and Communication Representative','Coordinate communications and provide event information to HQ.',['Communications','Media inputs']),
 item('center-research','ምርምርና ሥልጠና','Research and Training Representative','Conduct center research, coordinate training and maintain materials.',['Research','Training','Evaluation']),
 item('book-club','የንባብ ክበብ','Book Club','Encourage reading and track the center reading culture.',['Reading sessions','Participation'])
];
export const SHARED_CENTER_DUTIES=['Plan prayer sessions','Cooperate with service departments','Obtain center authorization for cross-center communication','Obtain HQ authorization for external institutional cooperation','Develop member gifts','Support center services'];
// Each charter should render in a scoped department dashboard after server authorization.
// Do not rely on this public catalog as authorization or publish actual center/member profiles.
