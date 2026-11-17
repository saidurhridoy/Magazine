// Bilingual seed content for Inkwell. Every string exists in English and Bengali.
// Tokens: {place} / {place_bn} (nominative) / {loc_bn} (locative, e.g. "ঢাকায়").

export const PLACES = [
  { en: 'Dhaka', bn: 'ঢাকা', loc: 'ঢাকায়' },
  { en: 'Chattogram', bn: 'চট্টগ্রাম', loc: 'চট্টগ্রামে' },
  { en: 'Sylhet', bn: 'সিলেট', loc: 'সিলেটে' },
  { en: 'Kuakata', bn: 'কুয়াকাটা', loc: 'কুয়াকাটায়' },
  { en: 'Tanguar Haor', bn: 'টাঙ্গুয়ার হাওর', loc: 'টাঙ্গুয়ার হাওরে' },
  { en: 'the Sundarbans', bn: 'সুন্দরবন', loc: 'সুন্দরবনে' },
  { en: 'Rajshahi', bn: 'রাজশাহী', loc: 'রাজশাহীতে' },
  { en: 'Bandarban', bn: 'বান্দরবান', loc: 'বান্দরবানে' },
  { en: 'Srimangal', bn: 'শ্রীমঙ্গল', loc: 'শ্রীমঙ্গলে' },
  { en: 'Khulna', bn: 'খুলনা', loc: 'খুলনায়' },
  { en: 'Old Dhaka', bn: 'পুরান ঢাকা', loc: 'পুরান ঢাকায়' },
  { en: "Cox's Bazar", bn: 'কক্সবাজার', loc: 'কক্সবাজারে' },
];

export const AUTHORS = [
  'Nadia Chowdhury', 'Shafiq Rahman', 'Mahmuda Khatun', 'Imran Kabir', 'Tahmina Sultana',
  'Rezaul Karim', 'Sabrina Haque', 'Ashraful Alam', 'Lamia Ferdous', 'Kamrul Hasan',
  'Fahmida Nabi', 'Zubair Siddiqui',
];

export const CATEGORIES = [
  { slug: 'design', name_en: 'Design', name_bn: 'নকশা', color: '#b45309' },
  { slug: 'travel', name_en: 'Travel', name_bn: 'ভ্রমণ', color: '#0f766e' },
  { slug: 'technology', name_en: 'Technology', name_bn: 'প্রযুক্তি', color: '#4338ca' },
  { slug: 'culture', name_en: 'Culture', name_bn: 'সংস্কৃতি', color: '#be123c' },
  { slug: 'food', name_en: 'Food', name_bn: 'খাদ্য', color: '#c2410c' },
  { slug: 'business', name_en: 'Business', name_bn: 'ব্যবসা', color: '#1e3a8a' },
];

export const GENERIC_PARAGRAPHS = [
  {
    en: 'Spend a morning in {place} and the first thing you notice is how much is happening at once. Tea stalls open before the shops do, rickshaw bells answer each other across the lanes, and conversations move freely between Bangla and English without anyone remarking on it.',
    bn: '{loc_bn} একটি সকাল কাটালেই প্রথমে চোখে পড়ে একসঙ্গে কত কিছু ঘটছে। দোকান খোলার আগেই চায়ের দোকান খুলে যায়, গলিতে গলিতে রিকশার বেল একে অন্যকে সাড়া দেয়, আর আলাপ অনায়াসে বাংলা থেকে ইংরেজিতে যায়, আবার ফিরে আসে।',
  },
  {
    en: 'The people we spoke to were not interested in nostalgia for its own sake. What they wanted was continuity: a way to carry forward what their parents knew while making room for what their children will need. That tension runs through almost every story in this issue.',
    bn: 'যাঁদের সঙ্গে আমরা কথা বলেছি, তাঁরা নিছক স্মৃতিকাতরতায় আগ্রহী নন। তাঁরা চান ধারাবাহিকতা: বাবা-মায়ের জানা বিষয়গুলো এগিয়ে নেওয়া, আবার সন্তানদের যা লাগবে তার জন্যও জায়গা রাখা। এই সংখ্যার প্রায় প্রতিটি লেখায় সেই টানাপোড়েন আছে।',
  },
  {
    en: 'Numbers tell part of the story. Over the past five years, the number of small studios and independent businesses registered around {place} has roughly doubled, and most of them employ fewer than ten people. Their founders describe the work as slow, stubborn and deeply local.',
    bn: 'সংখ্যা গল্পের একটা অংশ বলে। গত পাঁচ বছরে {place_bn} ঘিরে নিবন্ধিত ছোট স্টুডিও ও স্বাধীন ব্যবসার সংখ্যা প্রায় দ্বিগুণ হয়েছে, আর তাদের বেশিরভাগেই কর্মী দশজনের কম। প্রতিষ্ঠাতারা এই কাজকে বলেন ধীর, একরোখা আর গভীরভাবে স্থানীয়।',
  },
  {
    en: 'Monsoon changes everything here. Roads that are dusty in March become rivers by July, schedules bend around the rain, and a surprising amount of planning simply waits for the water to go down. Nobody pretends otherwise, and the honesty is refreshing.',
    bn: 'বর্ষা এখানে সব বদলে দেয়। মার্চে যে রাস্তা ধুলোয় ঢাকা, জুলাইয়ে তা নদী হয়ে যায়; সময়সূচি বৃষ্টির সঙ্গে বাঁক নেয়, আর অনেক পরিকল্পনা কেবল পানি নামার অপেক্ষায় থাকে। কেউ অন্য রকম ভান করে না, আর সেই সততাটুকুই স্বস্তির।',
  },
  {
    en: 'If there is a lesson, it is that good work rarely announces itself. It shows up in the details: a joint that does not wobble, a sentence that does not waste your time, a price that respects the person paying it. We tried to report with the same care.',
    bn: 'যদি কোনো শিক্ষা থাকে, তা হলো ভালো কাজ সাধারণত নিজের ঢাক নিজে পেটায় না। তা ধরা পড়ে খুঁটিনাটিতে: যে জোড় নড়বড়ে নয়, যে বাক্য আপনার সময় নষ্ট করে না, যে দাম ক্রেতাকে সম্মান করে। আমরাও একই যত্নে প্রতিবেদন করার চেষ্টা করেছি।',
  },
  {
    en: 'By evening the light turns the colour of strong tea and the city exhales. It is the best hour to listen. Ask anyone in {place} what they would change, and most will tell you; ask what they would keep, and the conversation lasts until the azan.',
    bn: 'সন্ধ্যায় আলো কড়া চায়ের রং নেয়, শহর যেন একটু শ্বাস ফেলে। শোনার জন্য এটাই সেরা সময়। {loc_bn} কাউকে জিজ্ঞেস করুন কী বদলাতে চান, বেশিরভাগই বলবেন; জিজ্ঞেস করুন কী রেখে দিতে চান, আলাপ চলবে আজান পর্যন্ত।',
  },
  {
    en: 'None of this is finished. The people in these pages are still experimenting, still arguing, still getting some things wrong. That is precisely why we wanted to write about them now, while the shape of the thing is still being decided.',
    bn: 'এর কিছুই শেষ হয়ে যায়নি। এই পাতার মানুষেরা এখনো পরীক্ষা করছেন, তর্ক করছেন, কিছু ভুলও করছেন। ঠিক সে কারণেই আমরা এখনই তাঁদের নিয়ে লিখতে চেয়েছি, যখন বিষয়টির আকার এখনো ঠিক হচ্ছে।',
  },
  {
    en: 'Getting there is half the education. Take the early train, sit by the window, and watch the country rearrange itself: paddy, then jute, then a river wide enough to look like the sea, then paddy again. Bring a flask and patience.',
    bn: 'সেখানে পৌঁছানোটাই অর্ধেক শিক্ষা। ভোরের ট্রেন ধরুন, জানালার পাশে বসুন, আর দেখুন দেশটা কীভাবে নিজেকে সাজায়: ধানক্ষেত, তারপর পাট, তারপর সমুদ্রের মতো চওড়া এক নদী, তারপর আবার ধান। সঙ্গে রাখুন ফ্লাস্ক আর ধৈর্য।',
  },
];

// One content pool per publication slug.
export const POOLS = {
  noksha: {
    titles: [
      ['The Brick Grammar of Louis Kahn', 'লুই কানের ইটের ব্যাকরণ'],
      ['Courtyards Are Coming Back', 'ফিরে আসছে উঠোন'],
      ['A Chair Made From Water Hyacinth', 'কচুরিপানার চেয়ার'],
      ['Jali Screens and the Physics of Shade', 'জালি দেয়াল ও ছায়ার বিজ্ঞান'],
      ['Designing for Flood, Not Against It', 'বন্যার বিরুদ্ধে নয়, বন্যার সঙ্গে নকশা'],
      ['The Typeface That Speaks Bangla', 'যে টাইপফেস বাংলায় কথা বলে'],
      ['Terracotta, Rebuilt', 'নতুন করে পোড়ামাটি'],
      ['Small Apartments, Generous Rooms', 'ছোট ফ্ল্যাট, উদার ঘর'],
    ],
    templates: [
      ['Rooftop Gardens of {place}', '{place_bn}-এর ছাদবাগান'],
      ['A Studio Visit in {place}', '{loc_bn} এক স্টুডিও ভ্রমণ'],
      ['How {place} Builds in Brick', '{place_bn} কীভাবে ইটে গড়ে'],
    ],
    paragraphs: [
      {
        en: 'Brick is the honest material of the delta. It is fired from the same silt the rivers deliver every year, it ages without complaint, and in the right hands it can be as expressive as stone. The architects in this story treat it less as a finish than as a language.',
        bn: 'ইট হলো ব-দ্বীপের সৎ উপাদান। নদী প্রতি বছর যে পলি বয়ে আনে, তা থেকেই ইট পোড়ানো হয়; বয়সের সঙ্গে সে অভিযোগ করে না, আর দক্ষ হাতে পাথরের মতোই প্রকাশময় হয়ে ওঠে। এই লেখার স্থপতিরা ইটকে আস্তর নয়, ভাষা হিসেবে দেখেন।',
      },
      {
        en: 'Cross-ventilation is not a style here; it is survival. A well-placed opening on the south face and a taller one on the north can drop the indoor temperature by several degrees without a single fan turning. The best new houses are rediscovering what old ones knew.',
        bn: 'আড়াআড়ি বাতাস চলাচল এখানে কোনো স্টাইল নয়, টিকে থাকার উপায়। দক্ষিণ দেয়ালে ঠিক জায়গায় একটি জানালা আর উত্তরে একটু উঁচু আরেকটি জানালা থাকলে একটি পাখাও না ঘুরিয়ে ঘরের তাপমাত্রা কয়েক ডিগ্রি কমানো যায়। সেরা নতুন বাড়িগুলো পুরোনো বাড়ির জানা কথাই আবার আবিষ্কার করছে।',
      },
      {
        en: 'The furniture makers we met work with what grows nearby: cane from Sylhet, mango wood from Rajshahi, hyacinth pulled from ponds that would otherwise choke. Their pieces are lighter than imported ones and far easier to repair, which matters in a humid climate.',
        bn: 'আমাদের দেখা আসবাব নির্মাতারা কাজ করেন আশপাশে যা জন্মায় তা দিয়ে: সিলেটের বেত, রাজশাহীর আমকাঠ, পুকুর থেকে তোলা কচুরিপানা যা না তুললে পুকুর দম আটকে মরত। তাঁদের আসবাব আমদানি করা আসবাবের চেয়ে হালকা আর মেরামত করা অনেক সহজ, আর্দ্র আবহাওয়ায় যা খুব জরুরি।',
      },
      {
        en: 'Good design in a dense city is mostly about thresholds: the verandah, the stair landing, the shaded step where neighbours stop to talk. Remove them for the sake of floor area and you remove the reasons people feel at home.',
        bn: 'ঘন শহরে ভালো নকশা মূলত চৌকাঠের ব্যাপার: বারান্দা, সিঁড়ির চাতাল, ছায়াঘেরা ধাপ যেখানে প্রতিবেশীরা থেমে গল্প করেন। মেঝের আয়তন বাড়াতে এগুলো বাদ দিলে মানুষের ঘরোয়া অনুভূতির কারণগুলোই বাদ পড়ে যায়।',
      },
    ],
    themes: [['The Brick Issue', 'ইট সংখ্যা'], ['Living With Water', 'জলের সঙ্গে বসবাস'], ['Craft & Furniture', 'কারুশিল্প ও আসবাব']],
  },

  'pothe-prantore': {
    titles: [
      ['Three Days on Tanguar Haor', 'টাঙ্গুয়ার হাওরে তিন দিন'],
      ['The Last Ferry to Kuakata', 'কুয়াকাটার শেষ ফেরি'],
      ['Walking the Tea Estates at Dawn', 'ভোরে চা-বাগানে হাঁটা'],
      ['A Night Train to Sylhet', 'সিলেটগামী রাতের ট্রেন'],
      ['Clouds Below Nilgiri', 'নীলগিরির নিচে মেঘ'],
      ['Saint Martin in the Off-Season', 'অফ-সিজনে সেন্টমার্টিন'],
      ['Following the Padma Upstream', 'পদ্মার উজানে'],
      ['Where the Sundarbans Begin', 'যেখানে সুন্দরবন শুরু'],
    ],
    templates: [
      ['A Weekend in {place}', '{loc_bn} এক সপ্তাহান্ত'],
      ['What to Eat in {place}', '{loc_bn} কী খাবেন'],
      ['Slow Travel Through {place}', '{place_bn} ধরে ধীর ভ্রমণ'],
    ],
    paragraphs: [
      {
        en: 'We left before sunrise on a wooden houseboat, the engine coughing politely as the water widened into something closer to an inland sea. Hijal trees stood knee-deep in the flood, and fishermen were already hauling nets that glittered with small silver fish.',
        bn: 'সূর্য ওঠার আগেই আমরা একটি কাঠের হাউসবোটে রওনা দিলাম; ইঞ্জিন ভদ্রভাবে কাশছিল আর পানি চওড়া হতে হতে প্রায় এক অন্তর্দেশীয় সমুদ্র হয়ে উঠল। হিজলগাছ হাঁটুপানিতে দাঁড়িয়ে, জেলেরা ইতিমধ্যে জাল তুলছেন, তাতে ঝিকমিক করছে ছোট রুপালি মাছ।',
      },
      {
        en: 'The guesthouse had four rooms, a generator that ran from six to eleven, and the best dal we tasted all trip. The owner, a retired schoolteacher, drew us a map on the back of an envelope and refused to take money for the second pot of tea.',
        bn: 'অতিথিশালায় চারটি ঘর, সন্ধ্যা ছয়টা থেকে রাত এগারোটা পর্যন্ত চলা একটি জেনারেটর, আর পুরো ভ্রমণে খাওয়া সেরা ডাল। মালিক, একজন অবসরপ্রাপ্ত স্কুলশিক্ষক, খামের পেছনে আমাদের একটা মানচিত্র এঁকে দিলেন, আর দ্বিতীয় কেতলি চায়ের টাকা কিছুতেই নিলেন না।',
      },
      {
        en: 'Practical notes: carry cash in small notes, because mobile banking signals come and go. Book boats directly with the ghat rather than through agents, travel light, and pack a rain jacket even when the forecast says otherwise.',
        bn: 'কাজের কথা: ছোট নোটে নগদ টাকা রাখুন, কারণ মোবাইল ব্যাংকিংয়ের নেটওয়ার্ক আসে-যায়। দালালের বদলে সরাসরি ঘাট থেকে নৌকা ঠিক করুন, হালকা ব্যাগ নিন, আর আবহাওয়ার পূর্বাভাস যা-ই বলুক, একটা রেইনকোট সঙ্গে রাখুন।',
      },
      {
        en: 'At dusk the sky over the water turned from apricot to violet, and the only sounds were oars and a radio somewhere playing Abdul Alim. It is the kind of evening you try to photograph and then give up on, because the camera keeps missing the point.',
        bn: 'সন্ধ্যায় পানির ওপরের আকাশ খুবানি রং থেকে বেগুনি হয়ে গেল; শব্দ বলতে শুধু বৈঠার ছলাৎ আর কোথাও একটা রেডিওতে আব্দুল আলীমের গান। এমন সন্ধ্যার ছবি তুলতে চেষ্টা করে শেষে হাল ছেড়ে দিতে হয়, কারণ ক্যামেরা আসল ব্যাপারটাই ধরতে পারে না।',
      },
    ],
    themes: [['Monsoon Routes', 'বর্ষার পথ'], ['The Hill Tracts', 'পাহাড়ের ডাক'], ['Coastline', 'উপকূল']],
  },

  'byte-bangla': {
    titles: [
      ['Bangla Language Models Grow Up', 'বড় হচ্ছে বাংলা ভাষা মডেল'],
      ['Inside the Mobile Wallet Wars', 'মোবাইল ওয়ালেটের লড়াইয়ের ভেতরে'],
      ['Freelancers Who Built an Industry', 'ফ্রিল্যান্সাররা যেভাবে শিল্প গড়লেন'],
      ['The Quiet Rise of Local Cloud', 'দেশীয় ক্লাউডের নিঃশব্দ উত্থান'],
      ['Keyboards, Unicode and Bijoy', 'কিবোর্ড, ইউনিকোড ও বিজয়'],
      ['Solar Mini-Grids Go Digital', 'ডিজিটাল হচ্ছে সৌর মিনি-গ্রিড'],
      ['Teaching Code in Village Schools', 'গ্রামের স্কুলে কোডিং শেখানো'],
      ['A Field Guide to 5G Rollout', '৫জি চালুর মাঠ-নির্দেশিকা'],
    ],
    templates: [
      ["{place}'s Startup Scene", '{place_bn}-এর স্টার্টআপ জগৎ'],
      ['Hackathon Notes From {place}', '{place_bn} থেকে হ্যাকাথনের নোট'],
      ['Broadband Reaches {place}', '{loc_bn} পৌঁছাল ব্রডব্যান্ড'],
    ],
    paragraphs: [
      {
        en: 'For years, software in Bangla meant transliteration hacks and fonts that broke conjuncts. That is changing fast. Open datasets, better Unicode support in phones and a generation of engineers who grew up typing Bangla have pushed local language tools from novelty to necessity.',
        bn: 'বহু বছর ধরে বাংলায় সফটওয়্যার মানে ছিল প্রতিবর্ণীকরণের কৌশল আর এমন ফন্ট যা যুক্তাক্ষর ভেঙে দেয়। এখন তা দ্রুত বদলাচ্ছে। উন্মুক্ত ডেটাসেট, ফোনে উন্নত ইউনিকোড সমর্থন আর বাংলা টাইপ করে বড় হওয়া একদল প্রকৌশলী স্থানীয় ভাষার টুলকে শখ থেকে প্রয়োজনে পরিণত করেছেন।',
      },
      {
        en: 'Mobile financial services now reach tens of millions of people, many of whom have never held a bank card. The interesting engineering problems are no longer about payments themselves but about trust, fraud detection and designing for phones with very little storage.',
        bn: 'মোবাইল আর্থিক সেবা এখন কয়েক কোটি মানুষের কাছে পৌঁছেছে, যাঁদের অনেকে কখনো ব্যাংক কার্ড হাতে নেননি। আকর্ষণীয় প্রকৌশল সমস্যাগুলো এখন আর লেনদেন নিয়ে নয়, বরং আস্থা, প্রতারণা শনাক্তকরণ আর খুব কম স্টোরেজের ফোনের জন্য নকশা নিয়ে।',
      },
      {
        en: 'The founders we interviewed were blunt about the obstacles: payment gateways that take weeks to approve, talent poached by overseas remote jobs, and investors who still ask for a Silicon Valley comparison. Yet nearly all of them said they would not build anywhere else.',
        bn: 'আমাদের সাক্ষাৎকার নেওয়া প্রতিষ্ঠাতারা বাধাগুলো নিয়ে সোজাসাপ্টা বললেন: পেমেন্ট গেটওয়ে অনুমোদনে সপ্তাহের পর সপ্তাহ, বিদেশি রিমোট চাকরিতে মেধা চলে যাওয়া, আর এমন বিনিয়োগকারী যারা এখনো সিলিকন ভ্যালির তুলনা খোঁজেন। তবু প্রায় সবাই বললেন, তাঁরা অন্য কোথাও কিছু গড়তে চান না।',
      },
      {
        en: 'Connectivity remains uneven. A developer in Gulshan and one in a char village may use the same app, but they experience it through very different networks. The teams doing the best work test on cheap phones, on 2G, during load-shedding.',
        bn: 'সংযোগ এখনো অসম। গুলশানের একজন ডেভেলপার আর চরের গ্রামের একজন হয়তো একই অ্যাপ ব্যবহার করেন, কিন্তু খুবই ভিন্ন নেটওয়ার্কে। সেরা কাজ করা দলগুলো সস্তা ফোনে, ২জিতে, লোডশেডিংয়ের মধ্যে পরীক্ষা চালায়।',
      },
    ],
    themes: [['The AI Issue', 'এআই সংখ্যা'], ['Money on Mobile', 'মোবাইলে টাকা'], ['Builders', 'নির্মাতারা']],
  },

  shikor: {
    titles: [
      ['The Last Jamdani Weavers of Rupganj', 'রূপগঞ্জের শেষ জামদানি তাঁতিরা'],
      ['Baul Songs and the Art of Leaving', 'বাউল গান ও ছেড়ে যাওয়ার শিল্প'],
      ['Pohela Boishakh, Before the Crowds', 'ভিড়ের আগের পহেলা বৈশাখ'],
      ['Nakshi Kantha: Stitches as Memory', 'নকশিকাঁথা: সেলাইয়ে স্মৃতি'],
      ['Jatra Is Not Dead', 'যাত্রাপালা মরে যায়নি'],
      ['Letters From Lalon\u2019s Akhra', 'লালনের আখড়া থেকে চিঠি'],
      ['The Puppeteers of Brahmanbaria', 'ব্রাহ্মণবাড়িয়ার পুতুলনাচিয়েরা'],
      ['Language, Martyrs and February', 'ভাষা, শহীদ ও ফেব্রুয়ারি'],
    ],
    templates: [
      ['Festival Season in {place}', '{loc_bn} উৎসবের মৌসুম'],
      ['The Old Songs of {place}', '{place_bn}-এর পুরোনো গান'],
      ['Craft Villages Near {place}', '{place_bn}-এর কাছের কারুপল্লি'],
    ],
    paragraphs: [
      {
        en: 'A single jamdani sari can take two weavers three months. The pattern is never drawn; it lives in the weaver\u2019s memory and is counted out thread by thread, a technique so particular that UNESCO recognised it as intangible heritage.',
        bn: 'একটি জামদানি শাড়ি বুনতে দুজন তাঁতির তিন মাস লেগে যেতে পারে। নকশা কখনো আঁকা হয় না; তা থাকে তাঁতির স্মৃতিতে, সুতো গুনে গুনে বোনা হয়। কৌশলটি এতটাই বিশেষ যে ইউনেস্কো একে অধরা ঐতিহ্যের স্বীকৃতি দিয়েছে।',
      },
      {
        en: 'The singer tuned his ektara by ear and began without introduction. The song was about a bird in a cage, which is to say it was about the soul, which is to say it was about everyone in the courtyard, sitting very still.',
        bn: 'গায়ক কানে শুনে একতারা সুর করলেন, কোনো ভূমিকা ছাড়াই শুরু করলেন। গানটা খাঁচার পাখি নিয়ে, অর্থাৎ আত্মা নিয়ে, অর্থাৎ উঠোনে নিশ্চুপ বসে থাকা প্রত্যেক মানুষকে নিয়ে।',
      },
      {
        en: 'Grandmothers once stitched kanthas from worn-out saris, layering old cloth into something warm and new. Each motif \u2014 a fish, a lotus, a boat \u2014 carried a meaning the family understood, and many quilts were made as gifts for weddings and births.',
        bn: 'একসময় নানি-দাদিরা পুরোনো শাড়ি দিয়ে কাঁথা সেলাই করতেন, জীর্ণ কাপড় স্তরে স্তরে সাজিয়ে তৈরি হতো উষ্ণ নতুন কিছু। প্রতিটি মোটিফ, মাছ, পদ্ম, নৌকা, পরিবারের কাছে একটা অর্থ বহন করত, আর অনেক কাঁথা তৈরি হতো বিয়ে ও জন্মের উপহার হিসেবে।',
      },
      {
        en: 'Culture survives not because it is preserved behind glass but because people keep using it. The young artists in this issue remix folk forms on Instagram and in galleries alike, and the elders, mostly, approve.',
        bn: 'সংস্কৃতি টিকে থাকে কাচের আড়ালে সংরক্ষিত বলে নয়, মানুষ ব্যবহার করে চলে বলে। এই সংখ্যার তরুণ শিল্পীরা লোকজ রূপকে ইনস্টাগ্রামে আর গ্যালারিতে সমানভাবে নতুন করে সাজাচ্ছেন, আর প্রবীণেরা মোটের ওপর তাতে সায় দিচ্ছেন।',
      },
    ],
    themes: [['Threads', 'সুতো'], ['Songs of the Soil', 'মাটির গান'], ['Festivals', 'উৎসব']],
  },

  'dhaka-table': {
    titles: [
      ['The Kacchi Debate, Settled', 'কাচ্চি বিতর্কের মীমাংসা'],
      ['Hilsa Season, Explained', 'ইলিশের মৌসুম, খুলে বলা'],
      ['Twelve Bhortas Worth Knowing', 'জানার মতো বারোটি ভর্তা'],
      ['Iftar on Chawkbazar', 'চকবাজারের ইফতার'],
      ['The Science of Shorshe', 'সরিষার বিজ্ঞান'],
      ['Pitha Season Begins', 'শুরু হলো পিঠার মৌসুম'],
      ['A Love Letter to Fuchka', 'ফুচকার প্রতি প্রেমপত্র'],
      ['Mezban: Feeding a Thousand', 'মেজবান: হাজার মানুষের ভোজ'],
    ],
    templates: [
      ['Street Food in {place}', '{place_bn}-এর পথখাবার'],
      ['A Breakfast Crawl Through {place}', '{place_bn} জুড়ে সকালের নাশতা'],
      ['The Sweet Shops of {place}', '{place_bn}-এর মিষ্টির দোকান'],
    ],
    paragraphs: [
      {
        en: 'A proper kacchi is cooked sealed, raw marinated mutton at the bottom and parboiled rice above, the lid closed with dough so nothing escapes. When the seal is broken the steam carries saffron, ghee and kewra across the room.',
        bn: 'আসল কাচ্চি রান্না হয় মুখ বন্ধ করে: নিচে কাঁচা মশলামাখা খাসি, ওপরে আধসেদ্ধ চাল, আর ঢাকনা আটা দিয়ে আটকানো, যাতে কিছুই বেরোতে না পারে। মুখ খোলার মুহূর্তে ভাপের সঙ্গে জাফরান, ঘি আর কেওড়ার ঘ্রাণ পুরো ঘরে ছড়িয়ে পড়ে।',
      },
      {
        en: 'Mustard oil is the backbone of the Bengali kitchen. Heated until it just stops smoking, it loses its harsh edge and gains a nutty depth that no other fat can imitate. Grind mustard seed with green chilli and you have the base of half the country\u2019s fish dishes.',
        bn: 'সরিষার তেল বাঙালি রান্নাঘরের মেরুদণ্ড। ধোঁয়া ওঠা থামা পর্যন্ত গরম করলে এর ঝাঁঝ কমে গিয়ে আসে এক বাদামি গভীরতা, যা অন্য কোনো তেল নকল করতে পারে না। সরিষা আর কাঁচামরিচ বাটলেই পেয়ে যাবেন দেশের অর্ধেক মাছের তরকারির ভিত।',
      },
      {
        en: 'The cook would not give us exact measurements. "Andaj," she said, which means roughly by instinct, and then she let us watch. The secret, it turned out, was patience: onions browned slowly, spices bloomed one at a time, never rushed.',
        bn: 'রাঁধুনি আমাদের সঠিক মাপ দিলেন না। বললেন, "আন্দাজ", তারপর দেখতে দিলেন। পরে বোঝা গেল রহস্যটা ধৈর্যে: পেঁয়াজ ধীরে ধীরে বাদামি করা, মশলা একটা একটা করে ফোটানো, কখনো তাড়াহুড়ো নয়।',
      },
      {
        en: 'Prices have climbed with everything else, and a plate that cost ৳120 two years ago now runs closer to ৳180. The best vendors have responded not by cutting corners but by making less, better, and selling out by eight.',
        bn: 'সব কিছুর সঙ্গে দামও বেড়েছে; দুই বছর আগে যে প্লেট ছিল ১২০ টাকা, এখন তা প্রায় ১৮০ টাকা। সেরা বিক্রেতারা মান কমিয়ে নয়, বরং কম কিন্তু ভালো রান্না করে সাড়া দিয়েছেন, আর রাত আটটার মধ্যেই সব শেষ।',
      },
    ],
    themes: [['Rice & Fire', 'চাল ও আগুন'], ['The River Kitchen', 'নদীর হেঁশেল'], ['Winter Sweets', 'শীতের মিষ্টি']],
  },

  'delta-ledger': {
    titles: [
      ['After Garments: What Comes Next', 'পোশাকশিল্পের পর: এরপর কী'],
      ['The Remittance Economy, Mapped', 'রেমিট্যান্স অর্থনীতির মানচিত্র'],
      ['Chattogram Port and the Container Race', 'চট্টগ্রাম বন্দর ও কনটেইনার দৌড়'],
      ['LDC Graduation: A Field Guide', 'এলডিসি উত্তরণ: মাঠ-নির্দেশিকা'],
      ['Who Lends to Small Shops?', 'ছোট দোকানদের ঋণ দেয় কে?'],
      ['The Taka and the Dollar', 'টাকা ও ডলার'],
      ['Green Factories, Real Numbers', 'সবুজ কারখানা, আসল হিসাব'],
      ['Energy Bills and Industrial Growth', 'জ্বালানির বিল ও শিল্প প্রবৃদ্ধি'],
    ],
    templates: [
      ['The Economics of {place}', '{place_bn}-এর অর্থনীতি'],
      ['Investing in {place}', '{loc_bn} বিনিয়োগ'],
      ['Supply Chains Through {place}', '{place_bn} হয়ে সরবরাহ শৃঙ্খল'],
    ],
    paragraphs: [
      {
        en: 'Ready-made garments still account for the overwhelming majority of export earnings, which is both the country\u2019s great achievement and its greatest exposure. Diversification has been promised for two decades; the firms finally doing it are mostly mid-sized and privately held.',
        bn: 'রপ্তানি আয়ের সিংহভাগ এখনো তৈরি পোশাক থেকে আসে, যা একই সঙ্গে দেশের বড় অর্জন এবং সবচেয়ে বড় ঝুঁকি। দুই দশক ধরে বহুমুখীকরণের প্রতিশ্রুতি দেওয়া হয়েছে; যারা শেষ পর্যন্ত তা করছে, তারা বেশিরভাগই মাঝারি আকারের ব্যক্তিমালিকানাধীন প্রতিষ্ঠান।',
      },
      {
        en: 'Remittances behave less like a macroeconomic statistic than a family budget at national scale. They rise before Eid, dip when the exchange-rate gap widens, and fund an astonishing share of rural homes, schools and small businesses.',
        bn: 'রেমিট্যান্স যতটা না সামষ্টিক অর্থনীতির পরিসংখ্যান, তার চেয়ে বেশি জাতীয় পর্যায়ের পারিবারিক বাজেট। ঈদের আগে বাড়ে, বিনিময় হারের ফারাক বাড়লে কমে, আর গ্রামের বাড়ি, স্কুল ও ছোট ব্যবসার বিস্ময়কর অংশের অর্থ জোগায়।',
      },
      {
        en: 'Port congestion is a tax nobody voted for. Every extra day a container waits adds cost that eventually lands on the shelf price. Recent terminal upgrades have helped, but importers we spoke with still budget a week of slack into every shipment.',
        bn: 'বন্দরের জট এমন এক কর, যার পক্ষে কেউ ভোট দেয়নি। একটি কনটেইনার যত দিন বেশি অপেক্ষা করে, তত খরচ বাড়ে, যা শেষ পর্যন্ত পণ্যের দামে যোগ হয়। সাম্প্রতিক টার্মিনাল উন্নয়ন কাজে দিয়েছে, তবু আমদানিকারকেরা প্রতিটি চালানে এক সপ্তাহ বাড়তি সময় ধরে রাখেন।',
      },
      {
        en: 'For small enterprises, the binding constraint is rarely demand; it is working capital. A shopkeeper who could double sales with a ৳2 lakh line of credit often cannot get one without collateral, and so growth happens slowly, out of savings.',
        bn: 'ছোট উদ্যোগের জন্য আসল বাধা খুব কমই চাহিদা; বাধা হলো চলতি মূলধন। যে দোকানদার ২ লাখ টাকার ঋণসীমা পেলে বিক্রি দ্বিগুণ করতে পারতেন, জামানত ছাড়া তিনি প্রায়ই তা পান না, তাই প্রবৃদ্ধি আসে ধীরে, সঞ্চয় থেকে।',
      },
    ],
    themes: [['Export Futures', 'রপ্তানির ভবিষ্যৎ'], ['Capital', 'পুঁজি'], ['Infrastructure', 'অবকাঠামো']],
  },

  nodimatrik: {
    titles: [
      ['Seven Hundred Rivers', 'সাতশো নদী'],
      ['The Boatbuilders of Barishal', 'বরিশালের নৌকা নির্মাতারা'],
      ['Life on a Char', 'চরের জীবন'],
      ['The Meghna at Night', 'রাতের মেঘনা'],
      ['Floating Markets of the South', 'দক্ষিণের ভাসমান হাট'],
      ['Tigers, Honey and the Mangrove', 'বাঘ, মধু ও ম্যানগ্রোভ'],
      ['A Launch Called Hope', 'আশা নামের লঞ্চ'],
      ['Mapping a Moving Coast', 'চলমান উপকূলের মানচিত্র'],
    ],
    templates: [
      ['The Rivers Around {place}', '{place_bn}-এর চারপাশের নদী'],
      ['Ghat Life in {place}', '{place_bn}-এর ঘাটজীবন'],
      ['Floodwater Stories From {place}', '{place_bn} থেকে বন্যার গল্প'],
    ],
    paragraphs: [
      {
        en: 'Bangladesh is less a country with rivers than rivers with a country attached. Some seven hundred of them braid across the delta, shifting course every few years and taking villages with them, then giving land back somewhere downstream as a new char.',
        bn: 'বাংলাদেশ যতটা না নদীর দেশ, তার চেয়ে বেশি দেশসহ নদী। প্রায় সাতশো নদী ব-দ্বীপজুড়ে বেণীর মতো জড়িয়ে আছে; কয়েক বছর পরপর গতিপথ বদলায়, গ্রাম ভাসিয়ে নেয়, তারপর ভাটিতে কোথাও নতুন চর হিসেবে মাটি ফিরিয়ে দেয়।',
      },
      {
        en: 'The boatbuilder measures nothing with a tape. He sights along the keel, taps the planks and listens. His father built the same balam boats, and his grandfather before that; the design has barely changed because it barely needed to.',
        bn: 'নৌকা নির্মাতা কোনো ফিতা দিয়ে মাপেন না। তিনি তলির বরাবর চোখ রাখেন, তক্তায় টোকা দিয়ে শোনেন। তাঁর বাবা একই বালাম নৌকা বানাতেন, তার আগে দাদাও; নকশা প্রায় বদলায়নি, কারণ বদলানোর তেমন দরকারই পড়েনি।',
      },
      {
        en: 'In the mangrove, the tide decides everything. Honey collectors, the mawali, enter the forest in April with smoke and prayer, knowing that the same channels that carry them in also carry the tiger.',
        bn: 'ম্যানগ্রোভে জোয়ার-ভাটাই সব ঠিক করে। মৌয়ালরা এপ্রিলে ধোঁয়া আর দোয়া নিয়ে বনে ঢোকেন, জেনেই যে যে খাল তাঁদের ভেতরে নিয়ে যায়, সেই খাল বাঘকেও বয়ে আনে।',
      },
      {
        en: 'The overnight launch from Sadarghat is a city on water: families on mats, tea sellers, a man selling ballpoint pens, a television showing a cricket replay. By dawn the Kirtankhola appears, wide and silver, and everyone goes quiet.',
        bn: 'সদরঘাট থেকে রাতের লঞ্চ যেন পানির ওপর এক শহর: মাদুরে পরিবার, চা-বিক্রেতা, বলপেন বেচা এক লোক, টেলিভিশনে ক্রিকেটের রিপ্লে। ভোরে চওড়া রুপালি কীর্তনখোলা দেখা দেয়, আর সবাই চুপ হয়ে যায়।',
      },
    ],
    themes: [['Rivers', 'নদী'], ['The Mangrove', 'ম্যানগ্রোভ'], ['Boats', 'নৌকা']],
  },

  charulipi: {
    titles: [
      ['Rickshaw Art Goes to the Gallery', 'গ্যালারিতে রিকশাচিত্র'],
      ['Zainul Abedin\u2019s Famine Sketches', 'জয়নুল আবেদিনের দুর্ভিক্ষের চিত্রমালা'],
      ['Shakhari Bazar\u2019s Conch Carvers', 'শাঁখারীবাজারের শঙ্খশিল্পী'],
      ['Alpana and the Art of the Floor', 'আলপনা ও মেঝের শিল্প'],
      ['Calligraphy in Two Scripts', 'দুই লিপির ক্যালিগ্রাফি'],
      ['Painting the Monsoon', 'বর্ষার ছবি আঁকা'],
    ],
    templates: [
      ['Galleries of {place}', '{place_bn}-এর গ্যালারি'],
      ['Mural Walks in {place}', '{loc_bn} দেয়ালচিত্রের পথে'],
    ],
    paragraphs: [
      {
        en: 'Rickshaw painters work fast and freehand, enamel on tin, and their palette is unapologetically loud: film stars, peacocks, Taj Mahals and tigers. For decades critics ignored them. Now collectors queue for panels signed by the old masters of Old Dhaka.',
        bn: 'রিকশাচিত্রীরা দ্রুত, খালি হাতে, টিনের ওপর এনামেল রঙে আঁকেন, আর তাঁদের রং নির্লজ্জভাবে উজ্জ্বল: সিনেমার তারকা, ময়ূর, তাজমহল আর বাঘ। দশকের পর দশক সমালোচকেরা তাঁদের উপেক্ষা করেছেন। এখন পুরান ঢাকার প্রবীণ ওস্তাদদের সই করা প্যানেলের জন্য সংগ্রাহকেরা লাইন দেন।',
      },
      {
        en: 'Zainul drew the famine of 1943 in Chinese ink on cheap packing paper, because that was what he could afford. The sketches are almost unbearable to look at, and impossible to forget, and they founded a modern art movement.',
        bn: 'জয়নুল ১৯৪৩-এর দুর্ভিক্ষ এঁকেছিলেন সস্তা প্যাকিং কাগজে চায়নিজ কালিতে, কারণ সেটুকুই তাঁর সামর্থ্যে কুলাত। ছবিগুলোর দিকে তাকানো প্রায় অসহ্য, ভোলা অসম্ভব, আর এগুলো দিয়েই শুরু হয়েছিল এক আধুনিক শিল্প আন্দোলন।',
      },
      {
        en: 'Alpana is painted with rice paste on the floor before festivals and erased by the feet of guests. Its impermanence is the point: beauty offered, used and let go.',
        bn: 'উৎসবের আগে মেঝেতে চালের গুঁড়ির গোলায় আলপনা আঁকা হয়, আর অতিথিদের পায়ে পায়ে তা মুছে যায়। এর ক্ষণস্থায়িত্বই আসল কথা: সৌন্দর্য নিবেদন, ব্যবহার, তারপর ছেড়ে দেওয়া।',
      },
    ],
    themes: [['Folk & Fine', 'লোকজ ও চারু'], ['Ink', 'কালি']],
  },

  'startup-dhaka': {
    titles: [
      ['Seed Rounds in Taka', 'টাকায় সিড রাউন্ড'],
      ['The Founder\u2019s First Hire', 'প্রতিষ্ঠাতার প্রথম নিয়োগ'],
      ['Logistics Startups and the Last Mile', 'লজিস্টিক স্টার্টআপ ও শেষ মাইল'],
      ['Agritech Beyond the Pitch Deck', 'পিচ ডেকের বাইরে এগ্রিটেক'],
      ['Why Startups Fail in Year Two', 'দ্বিতীয় বছরে স্টার্টআপ কেন ব্যর্থ হয়'],
      ['Women Founders, Real Capital', 'নারী উদ্যোক্তা, আসল পুঁজি'],
    ],
    templates: [
      ['Co-working in {place}', '{loc_bn} কো-ওয়ার্কিং'],
      ['Angel Investors of {place}', '{place_bn}-এর অ্যাঞ্জেল বিনিয়োগকারী'],
    ],
    paragraphs: [
      {
        en: 'The typical Dhaka seed round is small by global standards and slow to close, often stitched together from diaspora angels, a local venture fund and the founder\u2019s own savings. Founders say the real scarcity is not money but patient money.',
        bn: 'বৈশ্বিক মাপে ঢাকার সাধারণ সিড রাউন্ড ছোট এবং বন্ধ হতে সময় লাগে; প্রায়ই প্রবাসী অ্যাঞ্জেল, একটি দেশীয় ভেঞ্চার ফান্ড আর প্রতিষ্ঠাতার নিজের সঞ্চয় জোড়া দিয়ে তৈরি হয়। প্রতিষ্ঠাতারা বলেন, আসল অভাব টাকার নয়, ধৈর্যশীল টাকার।',
      },
      {
        en: 'Last-mile delivery in a city of twenty million is an exercise in improvisation. Riders know which lanes flood, which buildings have guards who will hold a parcel, and which customers will only pay cash on delivery.',
        bn: 'দুই কোটি মানুষের শহরে শেষ মাইলের ডেলিভারি মানেই তাৎক্ষণিক বুদ্ধি। রাইডাররা জানেন কোন গলিতে পানি জমে, কোন ভবনের দারোয়ান পার্সেল রেখে দেবেন, আর কোন ক্রেতা শুধু ক্যাশ অন ডেলিভারিতেই টাকা দেবেন।',
      },
      {
        en: 'The startups that survive year two tend to share one habit: they talk to customers every week. It sounds obvious. It is also the first thing to go when a team gets busy raising money.',
        bn: 'যে স্টার্টআপগুলো দ্বিতীয় বছর পার করে, তাদের একটা অভ্যাস মেলে: প্রতি সপ্তাহে গ্রাহকের সঙ্গে কথা বলা। শুনতে সহজ। কিন্তু দল যখন তহবিল সংগ্রহে ব্যস্ত হয়ে পড়ে, তখন সবার আগে এটাই বাদ পড়ে।',
      },
    ],
    themes: [['Funding', 'তহবিল'], ['Operators', 'পরিচালকেরা']],
  },
};

export const MAGAZINES = [
  {
    slug: 'noksha', category: 'design', language: 'bn', status: 'published', price: 350,
    title_en: 'Noksha', title_bn: 'নকশা',
    tagline_en: 'Architecture, craft and the designed life', tagline_bn: 'স্থাপত্য, কারুশিল্প ও নকশার জীবন',
    description_en: 'A monthly Bengali-language magazine about how Bangladesh builds, furnishes and lives — from brick courtyards to water-hyacinth chairs.',
    description_bn: 'বাংলাদেশ কীভাবে গড়ে, সাজায় আর বাঁচে, তা নিয়ে মাসিক বাংলা পত্রিকা — ইটের উঠোন থেকে কচুরিপানার চেয়ার পর্যন্ত।',
    cover_color: '#7c2d12', cover_accent: '#fdba74', cover_style: 'arcs', publisher: 'Noksha Media Ltd.', image: 'noksha.jpg', cover_lang: 'bn',
  },
  {
    slug: 'pothe-prantore', category: 'travel', language: 'bn', status: 'published', price: 300,
    title_en: 'Pothe Prantore', title_bn: 'পথে প্রান্তরে',
    tagline_en: 'Slow travel across Bangladesh', tagline_bn: 'বাংলাদেশজুড়ে ধীর ভ্রমণ',
    description_en: 'Honest travel writing for people who want to see the whole country — haor, hills, coast and mangrove — with practical notes in every story.',
    description_bn: 'পুরো দেশ দেখতে চান যাঁরা, তাঁদের জন্য সৎ ভ্রমণ-লেখা — হাওর, পাহাড়, উপকূল আর ম্যানগ্রোভ — প্রতিটি লেখায় কাজের তথ্যসহ।',
    cover_color: '#064e3b', cover_accent: '#a7f3d0', cover_style: 'waves', publisher: 'Prantik Prokashon', image: 'pothe-prantore.jpg', cover_lang: 'bn',
  },
  {
    slug: 'byte-bangla', category: 'technology', language: 'both', status: 'published', price: 450,
    title_en: 'Byte Bangla', title_bn: 'বাইট বাংলা',
    tagline_en: 'Technology, startups and the Bangla internet', tagline_bn: 'প্রযুক্তি, স্টার্টআপ ও বাংলা ইন্টারনেট',
    description_en: 'Bilingual reporting on the people building Bangladesh\u2019s digital economy: mobile money, local-language AI, freelancers and founders.',
    description_bn: 'বাংলাদেশের ডিজিটাল অর্থনীতির নির্মাতাদের নিয়ে দ্বিভাষিক প্রতিবেদন: মোবাইল ব্যাংকিং, বাংলা ভাষার এআই, ফ্রিল্যান্সার ও উদ্যোক্তা।',
    cover_color: '#1e1b4b', cover_accent: '#22d3ee', cover_style: 'grid', publisher: 'Byte Bangla Digital', image: 'byte-bangla.jpg', cover_lang: 'both',
  },
  {
    slug: 'shikor', category: 'culture', language: 'bn', status: 'published', price: 250,
    title_en: 'Shikor', title_bn: 'শিকড়',
    tagline_en: 'Roots of Bengali culture', tagline_bn: 'বাঙালি সংস্কৃতির শিকড়',
    description_en: 'Jamdani, baul, jatra and nakshi kantha — a Bengali magazine for the living traditions of the delta and the people who carry them.',
    description_bn: 'জামদানি, বাউল, যাত্রা আর নকশিকাঁথা — ব-দ্বীপের জীবন্ত ঐতিহ্য আর তার ধারকদের নিয়ে বাংলা পত্রিকা।',
    cover_color: '#881337', cover_accent: '#fde68a', cover_style: 'circles', publisher: 'Shikor Trust', image: 'shikor.jpg', cover_lang: 'bn',
  },
  {
    slug: 'dhaka-table', category: 'food', language: 'both', status: 'published', price: 320,
    title_en: 'Dhaka Table', title_bn: 'ঢাকা টেবিল',
    tagline_en: 'How Bangladesh eats', tagline_bn: 'বাংলাদেশ কী খায়, কীভাবে খায়',
    description_en: 'Recipes, restaurants and food culture in Bangla and English — from Old Dhaka kacchi to Chattogram mezban.',
    description_bn: 'বাংলা ও ইংরেজিতে রেসিপি, রেস্তোরাঁ ও খাদ্যসংস্কৃতি — পুরান ঢাকার কাচ্চি থেকে চট্টগ্রামের মেজবান।',
    cover_color: '#431407', cover_accent: '#fb923c', cover_style: 'stripes', publisher: 'Table Media', image: 'dhaka-table.jpg', cover_lang: 'both',
  },
  {
    slug: 'delta-ledger', category: 'business', language: 'en', status: 'published', price: 450,
    title_en: 'The Delta Ledger', title_bn: 'দ্য ডেল্টা লেজার',
    tagline_en: 'Business and economics of Bangladesh', tagline_bn: 'বাংলাদেশের ব্যবসা ও অর্থনীতি',
    description_en: 'An English-language monthly on trade, capital and the companies shaping Bangladesh\u2019s next decade.',
    description_bn: 'বাণিজ্য, পুঁজি ও আগামী দশকের বাংলাদেশ গড়া প্রতিষ্ঠানগুলো নিয়ে ইংরেজি মাসিক।',
    cover_color: '#0c1a3a', cover_accent: '#facc15', cover_style: 'grid', publisher: 'Ledger Publications', image: 'delta-ledger.jpg', cover_lang: 'en',
  },
  {
    slug: 'nodimatrik', category: 'travel', language: 'both', status: 'published', price: 380,
    title_en: 'Nodimatrik', title_bn: 'নদীমাতৃক',
    tagline_en: 'A magazine of rivers', tagline_bn: 'নদীর পত্রিকা',
    description_en: 'Bilingual long-form about the rivers that make Bangladesh: boats, chars, launches, mangroves and the people who live with water.',
    description_bn: 'যে নদীগুলো বাংলাদেশ গড়েছে, তাদের নিয়ে দ্বিভাষিক দীর্ঘ লেখা: নৌকা, চর, লঞ্চ, ম্যানগ্রোভ আর জলের সঙ্গে বাঁচা মানুষ।',
    cover_color: '#0c4a6e', cover_accent: '#fcd34d', cover_style: 'waves', publisher: 'Nodi Press', image: 'nodimatrik.jpg', cover_lang: 'both',
  },
  {
    slug: 'charulipi', category: 'culture', language: 'bn', status: 'draft', price: 280,
    title_en: 'Charulipi', title_bn: 'চারুলিপি',
    tagline_en: 'Art, ink and image', tagline_bn: 'শিল্প, কালি ও ছবি',
    description_en: 'A forthcoming Bengali art quarterly: rickshaw painting, calligraphy, alpana and the masters of modern Bangladeshi art.',
    description_bn: 'আসন্ন বাংলা শিল্প-ত্রৈমাসিক: রিকশাচিত্র, ক্যালিগ্রাফি, আলপনা আর আধুনিক বাংলাদেশি শিল্পের দিকপালেরা।',
    cover_color: '#701a75', cover_accent: '#f0abfc', cover_style: 'circles', publisher: 'Charu Prokash', image: 'charulipi.jpg', cover_lang: 'bn', frequency: 'quarterly',
  },
  {
    slug: 'startup-dhaka', category: 'business', language: 'en', status: 'draft', price: 400,
    title_en: 'Startup Dhaka', title_bn: 'স্টার্টআপ ঢাকা',
    tagline_en: 'For founders and operators', tagline_bn: 'উদ্যোক্তা ও পরিচালকদের জন্য',
    description_en: 'A forthcoming English monthly for founders: funding, hiring, logistics and the practical craft of building companies in Bangladesh.',
    description_bn: 'উদ্যোক্তাদের জন্য আসন্ন ইংরেজি মাসিক: তহবিল, নিয়োগ, লজিস্টিকস আর বাংলাদেশে প্রতিষ্ঠান গড়ার বাস্তব কৌশল।',
    cover_color: '#111827', cover_accent: '#34d399', cover_style: 'stripes', publisher: 'Startup Dhaka Media', image: null, cover_lang: null,
  },
];

export const REVIEWS = [
  { rating: 5, lang: 'bn', body: 'প্রতিটি সংখ্যা যত্ন নিয়ে বানানো। ছবি আর লেখা দুটোই চমৎকার।' },
  { rating: 4, lang: 'en', body: 'Consistently thoughtful. I wish issues came out a little more often.' },
  { rating: 5, lang: 'en', body: 'Finally a magazine that treats Bangladeshi readers as adults. Worth every taka.' },
  { rating: 4, lang: 'bn', body: 'ভালো লেগেছে, তবে আরও কিছু লম্বা লেখা চাই।' },
  { rating: 3, lang: 'en', body: 'Strong reporting, though a few pieces felt rushed.' },
  { rating: 5, lang: 'bn', body: 'বাংলা টাইপোগ্রাফি অসাধারণ — পড়তে খুব আরাম।' },
  { rating: 4, lang: 'bn', body: 'দামের তুলনায় অনেক কিছু পাই। নিয়মিত পড়ি।' },
  { rating: 5, lang: 'en', body: 'The bilingual toggle is brilliant — I read in Bangla with my parents.' },
];

export const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
export const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const toBnDigits = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
