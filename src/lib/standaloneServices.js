import { inflate } from "pako";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createWorker } from "tesseract.js";

GlobalWorkerOptions.workerSrc = workerSrc;

const API_BASE = (import.meta.env?.VITE_APP_API_BASE_URL || "").replace(/\/+$/, "");

const OUTBOX_KEY = "demo_standalone_outbox";
const UPLOADS_KEY = "demo_standalone_uploads";
const LEGAL_AID_APPLICATIONS_KEY = "demo_legal_aid_applications";
const CONFLICT_NAMES_KEY = "demo_conflict_names";
const LEGACY_PDFJS_MODULE_URL = "/pdfjs/legacy/build/pdf.mjs";
let diaryOcrWorkerPromise = null;
const PDFJS_BROWSER_OPTIONS = {
  disableWorker: true,
  useSystemFonts: true,
  isEvalSupported: false,
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
};

function createBarristerList(prefix, names, email = "", phone = "") {
  return names.map((name, index) => ({
    id: `${prefix}-${index + 1}`,
    name,
    email,
    phone,
  }));
}

function buildClerkBarristerList({ prefix, phone, names, email = "" }) {
  return createBarristerList(prefix, names, email, phone);
}

function createGreensListEmail(name = "") {
  return `${String(name)
    .toLowerCase()
    .replace(/\s+(sc|kc|qc|ac)$/i, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, "")}@greenslist.com.au`;
}

function createGreensBarristerList(names, phone) {
  return names.map((name, index) => ({
    id: `gr-${index + 1}`,
    name,
    email: createGreensListEmail(name),
    phone,
  }));
}

const CLERK_CONTACTS = {
  greens: { prefix: "gr", phone: "(03) 9225 7222" },
  chapmans: { prefix: "ch", phone: "(03) 9225 7666", email: "chapmanslist@vicbar.com.au" },
  devers: { prefix: "de", phone: "(03) 9225 8896", email: "dever@vicbar.com.au" },
  foleys: { prefix: "fo", phone: "(03) 9225 7777", email: "foleys@foleys.com.au" },
  listG: { prefix: "lg", phone: "(03) 9225 8558" },
  lennons: { prefix: "le", phone: "(03) 9225 7555" },
  holmes: { prefix: "ho", phone: "(03) 9225 6444", email: "holmeslist@vicbar.com.au" },
  meldrums: { prefix: "me", phone: "(03) 9225 7444", email: "meldrums@vicbar.com.au" },
  parnells: { prefix: "pa", phone: "(03) 9225 7000", email: "matt@parnellsbarristers.com.au" },
  svenson: { prefix: "sv", phone: "(03) 9225 7333", email: "clerks@svenson.com.au" },
};

const CLERK_FALLBACK_CONTACTS = {
  getGreensListBarristers: { email: "", phone: CLERK_CONTACTS.greens.phone },
  getChapmansList: { email: CLERK_CONTACTS.chapmans.email, phone: CLERK_CONTACTS.chapmans.phone },
  getDeversListBarristers: { email: CLERK_CONTACTS.devers.email, phone: CLERK_CONTACTS.devers.phone },
  getFoleysListBarristers: { email: CLERK_CONTACTS.foleys.email, phone: CLERK_CONTACTS.foleys.phone },
  getListGBarristers: { email: "", phone: CLERK_CONTACTS.listG.phone },
  getLennonsListBarristers: { email: "", phone: CLERK_CONTACTS.lennons.phone },
  getHolmesListBarristers: { email: CLERK_CONTACTS.holmes.email, phone: CLERK_CONTACTS.holmes.phone },
  getMeldrumsListBarristers: { email: CLERK_CONTACTS.meldrums.email, phone: CLERK_CONTACTS.meldrums.phone },
  getParnellsBarristers: { email: CLERK_CONTACTS.parnells.email, phone: CLERK_CONTACTS.parnells.phone },
  getSvensonsBarristers: { email: CLERK_CONTACTS.svenson.email, phone: CLERK_CONTACTS.svenson.phone },
};

const GREENS_LIST_NAMES = ["Tiphanie Acreman","Joseph Acutt","Neil Adams SC","Nussen Ainsworth","Yusur Al-Azzawi","Lachlan Allan","Jonathon Allan","Todd Allen","Lisa Andrews","Richard Antill","Karen Argiropoulos SC","David Bailey","Melanie Baker KC","Damian Ballan","Martha Banda","Csaba Baranyai","Prudence Barker","Anita Bartfeld","Michael Bearman","Anthony Beck-Godoy","Andrew Beckwith","Miguel Belmar","Felicity Bentley","Antony Berger","Ashleigh Best","Sam Bird","John Bolton","Catherine Boston SC","Paul Bourke","Joseph Bourke","Kieran Bowling","Nick Boyd-Caine","Joshua Bridgett","Michelle Britbart KC","Mitch Brogden","Neil Brown KC","Lauren Burke","Gavan Burns","Mark Burton","Rena Burton","Julie Buxton","Domenic Cafari","Peter Caillard","Olivia Cameron","James Cameron","Mark Campbell","David Carlile","Haydn Carmichael","David Carolan","Lachlan Carter","Deanna Caruso","Redmond Casey","Ella Casey","Sean Cash","Rachel Cashmore","Geoff Chancellor","Jessica Clark","Thomas Clark","Jack Cleveland","Eleanor Coates","Felicity Cockram","Georgina Coghlan KC","Fiona Connor","Dan Coombes","Debra Coombs","Carmendy Cooper","Adam Coote","Benedict Coxon","Adam Craig","Peter Crofts","Matthew Crowley","Marko Cvjeticanin","Joseph D'Abaco","Greg Davies KC","Sascha Dawson","Lucy Dawson","Andrea de Souza","Mark E Dean KC","Sheeana Dhanji","Daniel Diaz","Liam Dogger","Tim Donaghey","Patrick Doyle SC","Richard Edmunds","Tom Egan","Paul Ehrlich KC","Esther Faine-Vallantin","Emma Fargher","Katherine Farrell","Andrew Felkel","Shannon Finegan","Richard Fink","Matt Fisher","Megan Fitzgerald","Michael Flynn KC","Alex Fogarty","James Forsaith","Ariadne French","Benjamin Fry","Eli Fryar","Benjamin Gahan","Angus Galbraith","Nicholas Gallina","Michael Galvin KC","Erin Gardner","Maryann Gassert","Dr Felicity Gerry KC","Leisa Glass","Briana Goding","Nilanka Goonetillake","Robert Gordon","Timothy Graham","Mihal Greener","Julia Greenham","Georgina Grigoriou","Krystyna Grinberg","Nancy Grunwald","Kirsty Ha","Kirsti Halcomb","Paul Halley","Peter Hamilton","Ruth Hamnett","Campbell Hangay","Justin Hannebery KC","Brett Harding","Emma Harold","Joel Harris","Peter Harris","Ashleigh Harrold","Robert Hay KC","Ian Hill KC","Hannah Hofmann","Lindsay Hogan","Samantha Holmes","Eliza Holt","James Hooper","Samuel Hopper SC","Zoe Hough","Nicholas Howard","Stephanie Howson","Marion Isobel","Mark James","Julianne Jaques KC","Sam Jayasekara","Amy Johnstone","Vivienne Jones","Christie Jones","Ron Jorgensen","Jason Kane","Theo Kassimatis KC","Roslyn Kaye KC","Michael Keks","Philippa Kelly","Mathew Kenneally","Brian Kennedy","Philip Kennon KC","Rabea Khan","Lee Kimonides","Aimee Kinda","Mitchell King","Georgia King-Siem","Simone Kipen","Mitchell Kirk","Piotr Klank","Phoebe Knowles","Elefteria Konstantinou","Jonathan Korman","Gregory Lascaris","Angela Lee","Christopher Lees","Joshua Lessing","David Levin KC","Kevin Li","Khai-Yin Lim","Stephen Linden","Peter Little","David Lloyd","Anthony Lo Surdo SC FCIArb","Nunzio Lucarelli KC","Ryan Maguire","Eitan Makowski","Rhiannon Malone","Kieren Malone","John Maloney","Jonathan Manning","Anna Martin","Shanta Martin","Philip Marzella","Jonathan McCoy","Kyle McDonald","Kylie McInnes","Hannah McIvor","James McKay","Jim McKenna","Bruce McKenzie","Mitch McKenzie","Morgan McLay","Ann McMahon","Julian McMahon AC SC","Matthew Meng","Dean Merriman","Kieren Mihaly","Yuliya Mik","Simon Minahan","Travis Mitchell KC","Edward Moon","Andy Moore","Charles Morgan","Reegan Morison","Charles Morshead","Rutendo Muchinguri","Abhi Mukherjee","Gautam Mukherji","Toby Mullen","Adrian Muller","Nick Mutton","Shakti Nambiar","Geoffrey Nettle AC KC","Gisela Nip","Tim Noonan","Stephen O'Connell","David O'Doherty","Michael O'Haire","Patrick O'Halloran","John O'Halloran","Chris O'Neill","Conor O'Sullivan","Bill Orow","Kate Ottrey","Bryn Overend","Brad Parker","Peter Pascoe","Neale Paterson","Michael Pearce SC","Luke Perilli","Janine Perlman","Serge Petrovich","Thomas Pikusa","Simon Pitt KC","Joanne Poole","Sam Prendergast","Diana Price","Anthony Pyne","Martin Radzaj","Robert Redlich AM KC","Georgina Rhodes","Ed Richards","Mark Ridgeway","Bree Ridgeway","William Rimmer","John Riordan","David Risstrom","Lee Ristivojevic","Justin Rizzi","Abbie Roodenburg","Simon Rubenstein","James Ryan","Fiona Ryan SC","David Sanders","Paul Santamaria KC","Paul Scanlon KC","Meredith Schilling SC","Sanjay Schrapel","Frank Scully","Stephanie Scully","Bryony Seignior","Cassie Serpell","Stephen Sharpley KC","Jim Shaw","Emily Sheales","Kahlia Shenstone","Joshua Sheppard","Andrew Silver","Abilene Singh","Bridget Slocum","Paul Smallwood","Jeremy Smith","Tom Smyth","Fiona Spencer KC","Andrew Sprague","Tim Staindl","Drosso Stamboulakis","William Stark","Brett Stevens","Matthew Stirling","Taylah Stretton","John Styring","Georgia Suhren","Carolyn Symons","Keith Sypott","Rebecca Tambasco","Gavan Tellefson","Jayr Teng","James Tierney","Justin Tomlinson SC","Nick Tweedie SC","Vytas Valasinavicius","Nina Vallins","Tom Vasilopoulos","Andrew Verspaandonk"];

const CHAPMANS_LIST_NAMES = [
  "Barry Hess KC",
  "David Gilbertson KC",
  "David Robertson KC",
  "Francis Tiernan KC",
  "Ian Upjohn KC",
  "Michael Green SC",
  "Thomas Keely SC",
  "Adam Maloney",
  "Adrian Strauch",
  "Alan Ford",
  "Alexander Campbell",
  "Amanda Wynne",
  "Amit Malik",
  "Andrew Barnett",
  "Andrew Blair",
  "Andrew Imrie",
  "Andrew McKenry",
  "Anthony O'Donoghue",
  "Anthony Stavrinos",
  "Bernard Carr",
  "Bradley Wright",
  "Brian Lacy",
  "Cahal Fairfield",
  "Cameron Moir",
  "Catherine Jones Williams",
  "Chris Twidale",
  "Christopher Jensen",
  "Christopher O'Donnell",
  "Daniel Cole",
  "Dave Barton",
  "David Crocker",
  "David Downey",
  "David Kelsey-Sugg",
  "David Mence",
  "David Rofe",
  "Douglas James",
  "Dr. Ian Turnbull",
  "Dr. Rowena Cantley-Smith",
  "Dr. Vicky Priskich",
  "Elissa Taylor",
  "Elliott Young",
  "F John Morgan",
  "Frank Tallarida",
  "Gabrielle Fitzgibbon",
  "Geoff Herbert",
  "Gerald Parncutt",
  "Gregory Buchhorn",
  "Harry Redwood",
  "Hugh Fraser",
  "Jacob Fronistas O.A.M.",
  "James Kewley",
  "James Mitchell",
  "James Moutsias",
  "James Portelli",
  "James Samargis",
  "Jason Allen",
  "John Willis",
  "Julie Zhou",
  "Julien Lowy",
  "Ken Cheng",
  "Kim Baker",
  "Kim Cullen",
  "Kumar Kappadath",
  "Lindy Barrett",
  "Lyma Nguyen",
  "Margo Harris",
  "Marian C Clarkin",
  "Mark Lapirow",
  "Mark Leach",
  "Martin Pirrie",
  "Matthew Weinman",
  "Michael Gregurek",
  "Michael Reardon",
  "Michael Sanger",
  "Michelle Wilson",
  "Mitchell Latham",
  "Natalie Sheridan-Smith",
  "Neville Kenyon",
  "Nicholas Andreou",
  "Nicholas Bird",
  "Nick Doukas",
  "Nick Ferguson",
  "Nigel Leslie",
  "Oliver Scoullar-Greig",
  "Paul Stefanovic",
  "Paul McDermott",
  "Peter McDermott",
  "Ramon Fowler",
  "Reiko Okazaki",
  "Remi Cuce",
  "Robert Cochrane",
  "Robert Shepherd",
  "Rolf Sorensen",
  "Royce Deckker",
  "Ryan Mallia",
  "Sandra Karabidian",
  "Shaun Ryan",
  "Simon Bobko",
  "Simone Jacobson",
  "Stephen Chambers",
  "Steven Anger",
  "Steven Lowry",
  "Susan Porter",
  "Tim Huestis",
  "Tim White",
  "Timothy Sowden",
  "Veronika Drago",
];

const DEVERS_LIST_NAMES = [
  "Greg Ahern",
  "Raph Ajzensztat",
  "Matthew Albert",
  "Coral Alden",
  "Ross Allen",
  "Fiona Alpins",
  "Paul Anastassiou KC",
  "Adrian Anderson",
  "Johannes Angenent",
  "Jack Aquilina",
  "Grant Atkinson",
  "Fatmir Badali",
  "Adam Baker",
  "Andrea Bannon",
  "James Barber KC",
  "Brad Barr",
  "Edward Batrouney",
  "Kevin Bell The Hon. AM KC",
  "Georgia Berlic",
  "Chris Blanden KC",
  "Victoria Blidman",
  "Daniel Bongiorno SC",
  "Susan Borg",
  "Phillip Bornstein",
  "Stephanie C.B. Brenker",
  "Rebecca Brezzi",
  "Daniel Briggs",
  "Andrew Broadfoot KC",
  "David Brookes SC",
  "Louise Brown",
  "Margie Brown",
  "Spike Buchanan",
  "Darryl J. Burnett",
  "Kelly Butler",
  "Philip Cadman",
  "Chris Caleo KC",
  "Megan Cameron",
  "Roshena Campbell",
  "Sebastian Campbell",
  "Hannah Canham",
  "Audrey Capasso",
  "Tom Carmody",
  "Peter Cawthorn KC",
  "Rosie Cham",
  "Sarah Cherry",
  "Angus Christophersen",
  "Michael Clarke SC",
  "Allen Clayton-Greene",
  "Tom Clelland",
  "Andrew Clements KC",
  "Daniel Clough",
  "Toby Cogley",
  "Patrick Coleridge",
  "Nicola Collingwood",
  "David Collins KC",
  "Tim Connard",
  "Liam Connolly",
  "Paul Connor KC",
  "Gemma-Jane Cooper",
  "Michael Corrigan",
  "Jennifer Cowen",
  "Kathleen Crennan",
  "Susan Crennan The Hon. AC KC",
  "Sam Crock",
  "Philip Crutchfield KC",
  "Lachlan Currie",
  "Paul Czarnota",
  "Mark Goldblatt",
  "Emily Golshtein",
  "Timothy Gorton",
  "Jon Gottschall",
  "Simon Grant",
  "Malcolm Gray",
  "Gavan Griffith AO KC",
  "Astrid Haban-Beer",
  "Harriet Haig",
  "John Hall",
  "Colin Ham",
  "Paul A Hannan",
  "Robert Harper",
  "Greg Harris KC",
  "Mary Anne Hartley KC",
  "Sam Hay KC",
  "Paul Hayes KC",
  "Jack Heeley",
  "Ruby Heffernan",
  "Wayne Henwood",
  "Perry Herzfeld SC",
  "Erin Hill",
  "Justin Lipinski",
  "Karen Liu",
  "Gregory S. Lucas",
  "Christopher Lum",
  "Angus Mackenzie",
  "Sashi Maharaj KC",
  "Katie Manning",
  "Simon Marks KC",
  "David Martin",
  "Simon Martin",
  "Rachel Matson",
  "J. Paul McCaffrey",
  "Rebecca McCarthy",
  "James McComish",
  "Ian McDonald KC",
  "Hannah McGuire",
  "The Hon. Michael McInerney",
  "Banjo McLachlan",
  "Fiona McLeod AO SC",
  "Adrian McMillan",
  "Sarah McNaught",
  "Bruce McTaggart KC",
  "Dugald McWilliams SC",
  "Tim Puckey KC",
  "Charles Pym",
  "Tamara Quinn (nee Leane)",
  "Neil Y. Rattray",
  "Hamish Redd SC",
  "Sebastian Reid",
  "John B. Richards KC",
  "Emily Riordan",
  "Peter Riordan The Hon. KC",
  "Mark Robins KC",
  "Andrew Robinson",
  "Ross Robson The Hon. KC",
  "Maya Rozner",
  "Jesse Rudd",
  "Jeremy Ruskin KC",
  "Jade Ryan",
  "Patrick Santamaria",
  "Anthony Schlicht",
  "Georgina Schoff KC",
  "Harley Schumann",
  "Tim Scotter SC",
];

const FOLEYS_LIST_NAMES = [
  "Roger Gillard KC",
  "Philip Dunn KC",
  "O Paul Holdenson KC",
  "The Honourable Steven Strickland KC",
  "David Brown KC",
  "Bruce Walmsley KC",
  "Tim North OAM KC",
  "Fabian Dixon SC",
  "Andrew Panna KC",
  "Timothy Margetts KC",
  "Gavin Silbert KC",
  "Dr Ian Freckelton AO KC",
  "John Dickinson KC",
  "Samuel Horgan KC",
  "Dr Caroline Kenny KC",
  "David Brustman KC",
  "Michael Wilson SC",
  "Michael Wyles KC",
  "Peter Chadwick KC",
  "Daniel Masel SC",
  "Ian Coleman SC",
  "Geoffrey Dickson KC",
  "Susan Brennan SC",
  "Daniel Gurvich KC",
  "Her Honour Julie Condon KC",
  "Jonathan Evans KC",
  "Marcus Clarke KC",
  "William Lye OAM KC",
  "Juliet Forsyth SC",
  "Frank O'Loughlin KC",
  "Cam Truong KC",
  "Kate Mooney KC",
  "John Gurr KC",
  "Peter O'Farrell KC",
  "Peter Matthews SC",
  "Neill Hutton SC",
  "Michael Stanton SC",
  "Andrew de Wijn SC",
  "Matthew Verney KC",
  "Paul Chiappi SC",
  "Romesh Kumar SC",
  "Sarah Fisken SC",
  "Richard Weil",
  "Patrick Indovino",
  "Graeme McEwen",
  "Graeme Thompson",
  "Philip Barton",
  "His Honour Philip G Misso",
  "Simon Gillespie-Jones",
  "David Cordy",
  "Paul D'Arcy",
  "Samuel Tatarka OAM",
  "Antony Trood",
  "Trevor McLean",
  "William Gillies",
  "Daryl Brown",
  "Robert Barry",
  "Stephen Dewberry",
  "Rohan Hoult",
  "Andrew Donald",
  "Carmella Ben-Simon",
  "John Searle",
  "Anthony Rodbard-Bean",
  "David Colman",
  "Pierre Testart",
  "Bruce Shaw",
  "Marianne Barker",
  "Nicholas Gardiner",
  "Con Salpigtidis",
  "Nicholas Frenkel",
  "Mark McNamara",
  "Graeme Peake",
  "Rika Teicher",
  "Lachlan Wraith",
  "Mark Rinaldi",
  "Robert Peters",
  "David Klempfner",
  "Anthony Thomas",
  "Robyn Wheeler",
  "Shane Lethlean",
  "Jamie Singh",
  "Keith Nicholson",
  "Belle Lane",
  "Darren Bracken",
  "Bronia Tulloch",
  "Emma Swart",
  "Nicholas Harrington",
  "Anthony Klotz",
  "Melissa Mahady",
  "Rohan Millar",
  "David O'Brien",
  "Shivani Pillai",
  "Sandra MacDougall",
  "Laura Colla",
  "Andrew Dickenson",
];

const LIST_G_BARRISTERS_NAMES = [
  "Stewart Maiden KC",
  "Justin Bourke KC",
  "Jeremy Slattery KC",
  "Jenny Firkin KC",
  "Hamish Austin KC",
  "Malcolm Harding SC",
  "Nicholas De Young KC",
  "Martin Scott KC",
  "Tomo Boston KC",
  "Matthew Harvey KC",
  "Rachel Doyle SC",
  "Peter Willis SC",
  "William Edwards KC",
  "Richard Harris SC",
  "Andrew Cameron",
  "David Morgan",
  "Rebecca Davern",
  "Brendan Avallone",
  "Kane Loxley",
  "Tom Clarke",
  "Natalie Hickey",
  "Leigh Howard",
  "Nico Burmeister",
  "Andrew Pollock",
  "Jillian Williams",
  "Eugenia Levine",
  "Adam Segal",
  "Jennifer Collins",
  "Dean Luxton",
  "Dion Fahey",
  "Kess Dovey",
  "Rudi Kruse",
  "Laura Hilly",
  "Tom Warner",
  "Ben Ryde",
  "Albert Ounapuu",
  "Catherine Pase",
  "Andrew Crocker",
  "Marita Foley SC",
  "Daniel Preston",
  "Bruce Caine KC",
  "Colin Golvan AM KC",
  "Tom Cordiner KC",
  "Siobhan Ryan KC",
  "Ben Gardiner KC",
  "Luke Merrick KC",
  "Craig Smith SC",
  "Kate Beattie SC",
  "Stephen Rebikoff SC",
  "Andrew Sykes",
  "Marcus Fleming",
  "Clare Cunliffe",
  "Peter Creighton-Selvay",
  "Lucy Davis",
  "Melissa Marcus",
  "Amy Surkis",
  "Tidja Joseph",
  "William Liu",
  "Katie Gardiner",
  "Maxine Lange",
  "Jack Gracie",
  "Patrick O'Bryan-Gusah",
  "Jarrad Mathie",
  "Dan Miles",
  "Jessica Apel",
  "Tim Burn-Francis",
  "Stephanie Cheligoy",
  "Ned Marlow-Weir",
  "Edward Moore",
  "Jacob Waller",
  "Daniel Fawcett",
  "William Stone",
  "Gavin Rees",
  "Zoe Anderson",
  "Chris Fitzgerald",
  "Sophie Kearney",
  "Lara O'Rorke",
  "James Page",
  "Lisette Stevens",
  "Caitlin O'Neil",
  "Bianca Sacco",
  "Robert Marsh",
  "Joanna Davidson",
  "Paul Halley",
];

const LENNONS_LIST_NAMES = [
  "Bruce Anderson",
  "Emily Anderson",
  "Jonathon Allan",
  "Roisin Annesley KC",
  "Bill Baarini",
  "Simone Bailey",
  "Felicity Blair",
  "Rebecca Boyce",
  "Christine Boyle",
  "Kim Bradey",
  "Jonathan Brett KC",
  "Marietta Bylhouwer",
  "Manny Cao",
  "Steven Carson",
  "Jay Chandramohan",
  "Yi-Chuan Chen",
  "Duncan Chisholm",
  "Ray Ternes",
  "John Valiotis",
  "Stella Gold SC",
  "Kathy Karadimas",
  "Benjamin Reid",
  "Amy Johnstone",
];

const MELDRUMS_LIST_NAMES = [
  "Peter Morrissey SC",
  "Robert Richter KC",
  "Sally Flynn KC",
  "Adrian Bates",
  "Alan Herskope",
  "Alan L Hands",
  "Andrew Grant",
  "Andrew J Buckland",
  "Andrew Norris",
  "Anthony Frederick Krohn",
  "Ashley Richardson",
  "Bernard J. Sutherland",
  "Bill Guzzo",
  "Bruce Nibbs",
  "Cameron Baker",
  "Chris Glerum",
  "Chris Hooper",
  "Chris Pearson",
  "Chrisanthi (Chris) Paganis",
  "Chryssa Anagnostou",
  "Damian John Plummer",
  "Danielle Guesdon",
  "David Gray",
  "Deborah Bye",
];

const PARNELLS_LIST_NAMES = [
  "Christopher Carr SC",
  "Neil J Clelland KC",
  "Jason Gullaci SC",
  "David Hallowes SC",
  "Sharon E Lacy SC",
  "Garry H Livermore SC",
  "Colin Mandy SC",
  "Rishi Nathwani KC",
  "Ruth Shann SC",
  "Patrick Tehan OAM KC",
  "Megan Tittensor SC",
  "Tom Acutt",
  "Michael Allen",
  "James Anderson",
  "Nico Baarlink",
  "Jennifer Ball",
];

const SVENSONS_LIST_NAMES = [
  "Amanda Storey",
  "Annabelle Ballard",
  "Anne L O'Connell",
  "Anne Sheehan",
  "Anne-Louise Juneja",
  "Arna M Delle-Vergini",
  "Beth Warnock",
  "Bonnie Renou",
  "Caitrin Davis",
  "Carmel Morfuni",
  "Carmela Pezzimenti",
  "Carol McComish",
  "Caroline Graves",
  "Carolyn Sparke KC",
  "Christine Clough",
  "Daphne Foong",
  "Dee Brooker",
  "Dr Nadia Stojanova",
  "Dr Victoria Lambropoulos",
  "Eleanor Mallett KC",
  "Gemma Cafarella",
  "Geraldine F Gray",
  "Ingrid Braun",
  "Janine V Gleeson",
  "Jennifer Van Veldhuisen",
  "Jessica Sun Miller",
  "Joanna Dodd",
  "Joh Ollquist",
  "Jordana Cohen",
  "Karen J Le-Faucheur",
  "Karen J. Mak",
  "Karen Streckfuss",
  "Kate Stowell",
  "Kylie McInnes",
  "Kyriaki Vavoulis",
  "Lana Collaris",
  "Linden Woodfall",
  "Lydia Kinda",
  "Mary Anne Ryan",
  "Mayada Dib",
  "Michelle Bennett",
  "Michelle Jenkins",
  "Nicola Bowen",
  "Olivia Go (Olive)",
  "Rebecca Aoukar",
  "Regina Weiss",
  "Sagorika Platel",
  "Samantha Owen",
  "Sepideh Sadri",
  "Sharon Kermath",
  "Sitthana Theerathitiwong",
  "Stephanie Clancy",
  "Susan Aufgang",
  "Susannah R Portelli",
  "Temple Saville",
  "Ursula Stanisich",
  "Valentina Stoilkovska",
  "Veronica Holt",
  "Alan Blackman",
  "Andrew Crozier-Durham RFD",
  "Andrew J Kirkham AM, RFD, KC",
  "Angelo Bartzis",
  "David Pumpa",
  "Doug McLeod",
  "Douglas W Laidlaw CSC",
  "Garry Moffatt",
  "Graeme F. Hellyer",
  "James Cyngler",
  "James McIntyre",
  "Jason Korke",
  "John Hanna Karkar KC",
  "John Salamanca",
  "Jonathon Sprott",
  "Mark Hebblewhite",
  "Martin Garrett",
  "Nathan McComish",
  "Nicholas Jones",
  "Paul Duggan",
  "Paul J Rule",
  "Rodney M Garratt KC",
  "Robert Sadler",
  "Simon Loftus",
  "Vincent A Morfuni KC",
  "Mark Anthony Irving KC",
  "Gerard Nash KC",
  "Stephen Owen-Conway KC",
  "Chris Gunson SC",
  "Duncan Robertson",
  "Harry Lewis",
  "Nik Dragojlovic",
  "Trevor McKenna",
];

const HOLMES_LIST_NAMES = [
  "Martin Bartfeld AM KC",
  "Georgina Connelly SC",
  "Dermot Dann KC",
  "Helen Dellidis SC",
  "Colin Forrest SC",
  "Shaun Ginsbourg SC",
  "Chris Nehmy SC",
  "Timothy North SC",
  "Chris O'Grady KC",
  "Carmen Randazzo SC",
  "Peter Tree KC",
  "Minal Vohra SC",
  "Syd Williams KC",
  "Brent Young KC",
  "Peter Young AM KC",
  "Stephen Lindner",
  "J Damian Ellwood",
  "Steven Kuan",
  "Elizabeth Johnson",
  "Henry Aizen",
  "Patrick Casey",
  "Ian Crisp",
  "Rose Weinberg",
  "Peter Kistler",
  "Wayne Toohey",
  "Mark Wilson",
  "Richard Pirrie",
  "R Deborah Wiener",
  "Alan Marshall",
  "P Daniel Sweeney",
  "Elle Addams",
  "Mary Agresta",
  "Alexander Albert",
  "Renata Alexander",
  "Geoffrey Ambrose",
  "Sam Andrianakis",
  "Ragunath Appudurai",
  "Christopher Arnold",
  "Richard Backwell",
  "Adele Balkin",
  "Andrew Barbayannis",
  "Luke Barker",
  "Sally Bastick",
  "Raj Bhattacharya",
];

const CLERK_LISTS = {
  getListABarristers: [
    { id: "la-1", name: "Joseph Acutt", email: "joseph.acutt@lista.example", phone: "(03) 9225 7222" },
    { id: "la-2", name: "Lisa Andrews", email: "lisa.andrews@lista.example", phone: "(03) 9225 7222" },
    { id: "la-3", name: "Nick Boyd-Caine", email: "nick.boyd-caine@lista.example", phone: "(03) 9225 7222" },
  ],
  getGreensListBarristers: createGreensBarristerList(GREENS_LIST_NAMES, CLERK_CONTACTS.greens.phone),
  getChapmansList: buildClerkBarristerList({ prefix: CLERK_CONTACTS.chapmans.prefix, names: CHAPMANS_LIST_NAMES }),
  getDeversListBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.devers.prefix, names: DEVERS_LIST_NAMES }),
  getFoleysListBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.foleys.prefix, names: FOLEYS_LIST_NAMES }),
  getListGBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.listG.prefix, names: LIST_G_BARRISTERS_NAMES }),
  getLennonsListBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.lennons.prefix, names: LENNONS_LIST_NAMES }),
  getHolmesListBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.holmes.prefix, names: HOLMES_LIST_NAMES }),
  getMeldrumsListBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.meldrums.prefix, names: MELDRUMS_LIST_NAMES }),
  getParnellsBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.parnells.prefix, names: PARNELLS_LIST_NAMES }),
  getSvensonsBarristers: buildClerkBarristerList({ prefix: CLERK_CONTACTS.svenson.prefix, names: SVENSONS_LIST_NAMES }),
};

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function guessMimeCategory(type = "") {
  if (type.includes("pdf")) return "PDF";
  if (type.startsWith("image/")) return "image";
  if (type.includes("word") || type.includes("document")) return "document";
  return "file";
}

function getQuestionFromPrompt(prompt = "") {
  const lines = String(prompt || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/^(staff|user):/i.test(lines[i])) {
      return lines[i].replace(/^(staff|user):/i, "").trim();
    }
  }
  return String(prompt || "").trim();
}

function answerLegalQuestion(prompt = "") {
  const question = getQuestionFromPrompt(prompt).toLowerCase();
  if (question.includes("circuit fee")) return "Circuit fees usually depend on location, fee item, and whether the matter fits the relevant VLA schedule. Treat them as location-specific extras to confirm, not automatic additions.";
  if (question.includes("grant of aid")) return "Start with matter type, court, means, and merits. For criminal matters, check whether the matter fits a simplified grants pathway and whether any special circumstances strengthen eligibility.";
  if (question.includes("brief to counsel") || question.includes("backsheet")) return "For a backsheet, keep the court, appearance type, prosecutor, client identifiers, and instructions explicit, and confirm any list or grant-specific briefing requirement.";
  if (question.includes("bail")) return "For bail matters, focus on court level, basis for the application, urgency, and whether the grant pathway changes because of timing or complexity.";
  return "I can help with VLA workflow questions, grants, costs payable, briefing process, and practical next steps. Give me the matter type and the decision you need to make.";
}

function decodePdfString(value = "") {
  return value
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\000/g, "")
    .trim();
}

function uint8ArrayToLatin1String(bytes) {
  let output = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    output += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return output;
}

function latin1StringToUint8Array(value = "") {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function decodeBase64ToBytes(base64 = "") {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function extractTextOperatorsFromPdfText(text = "") {
  if (!text) return [];

  const tjMatches = [...text.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g)].map((item) =>
    decodePdfString(item[1])
  );
  const tjArrayMatches = [...text.matchAll(/\[(.*?)\]\s*TJ/gs)].flatMap((item) =>
    [...item[1].matchAll(/\(([^()]*(?:\\.[^()]*)*)\)/g)].map((inner) => decodePdfString(inner[1]))
  );
  const quoteMatches = [...text.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*['"]/g)].map((item) =>
    decodePdfString(item[1])
  );

  return [...tjMatches, ...tjArrayMatches, ...quoteMatches].filter(Boolean);
}

function extractPdfTextFromDataUrl(fileUrl = "") {
  const base64 = String(fileUrl).split(",")[1] || "";
  if (!base64) return "";

  const bytes = decodeBase64ToBytes(base64);
  const latin1 = uint8ArrayToLatin1String(bytes);
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const pieces = [];
  let match;

  while ((match = streamRegex.exec(latin1))) {
    const streamChunk = match[1] || "";
    try {
      const inflated = inflate(latin1StringToUint8Array(streamChunk));
      const text = new TextDecoder("latin1").decode(inflated);
      pieces.push(...extractTextOperatorsFromPdfText(text));
    } catch {
      pieces.push(...extractTextOperatorsFromPdfText(streamChunk));
    }
  }

  if (pieces.length === 0) {
    pieces.push(...extractTextOperatorsFromPdfText(latin1));
  }

  return pieces
    .filter(Boolean)
    .join("\n")
    .replace(/\s+\n/g, "\n")
    .trim();
}

async function getDiaryOcrWorker() {
  if (!diaryOcrWorkerPromise) {
    diaryOcrWorkerPromise = createWorker("eng").then(async (worker) => {
      await worker.setParameters({
        preserve_interword_spaces: "1",
      });
      return worker;
    });
  }
  return diaryOcrWorkerPromise;
}

async function extractPdfTextWithPdfJs(fileUrl = "") {
  const base64 = String(fileUrl).split(",")[1] || "";
  if (!base64) return "";

  const data = decodeBase64ToBytes(base64);
  const extractWithDocument = async (loadDocument) => {
    const loadingTask = loadDocument({
      data,
      ...PDFJS_BROWSER_OPTIONS,
    });
    const pdf = await loadingTask.promise;
    const pieces = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const strings = (content.items || []).map((item) => item?.str || "").filter(Boolean);
      pieces.push(...strings);
    }

    return pieces.join("\n").trim();
  };

  const primaryText = await extractWithDocument(getDocument).catch(() => "");
  if (primaryText) {
    return primaryText;
  }

  try {
    const legacyPdfJs = await import(/* @vite-ignore */ LEGACY_PDFJS_MODULE_URL);
    return await extractWithDocument(legacyPdfJs.getDocument);
  } catch {
    return "";
  }
}

async function extractPdfTextWithOcr(fileUrl = "") {
  const base64 = String(fileUrl).split(",")[1] || "";
  if (!base64) return "";

  const data = decodeBase64ToBytes(base64);
  const worker = await getDiaryOcrWorker();
  const extractWithDocument = async (loadDocument) => {
    const loadingTask = loadDocument({
      data,
      ...PDFJS_BROWSER_OPTIONS,
    });
    const pdf = await loadingTask.promise;
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) continue;

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const {
        data: { text = "" },
      } = await worker.recognize(canvas);

      if (text.trim()) {
        pageTexts.push(text);
      }
    }

    return pageTexts.join("\n").trim();
  };

  const primaryText = await extractWithDocument(getDocument).catch(() => "");
  if (primaryText) {
    return primaryText;
  }

  try {
    const legacyPdfJs = await import(/* @vite-ignore */ LEGACY_PDFJS_MODULE_URL);
    return await extractWithDocument(legacyPdfJs.getDocument);
  } catch {
    return "";
  }
}

function normalizeDiaryText(text = "") {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[\u2013\u2014]/g, " - ")
    .replace(/[\u2022\u00b7]/g, " ")
    .replace(/[â€“â€”]/g, " - ")
    .replace(/[â€¢Â·]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function isDateHeading(line = "") {
  return /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+[a-z]+\s+\d{1,2},?\s+\d{4}$/i.test(line.trim());
}

function isCourtHeading(line = "") {
  const value = line.trim();
  return /(magistrates'?\s+court|county\s+court|supreme\s+court|children'?s\s+court|court of appeal|drug court)/i.test(value);
}

function parseDiaryDate(line = "") {
  const match = line.match(/^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (!match) return "";
  const monthMap = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };
  const month = monthMap[match[1].toLowerCase()] || "";
  if (!month) return "";
  return `${String(match[2]).padStart(2, "0")}/${month}/${match[3]}`;
}

function cleanDiaryLine(line = "") {
  return String(line || "").replace(/\s+/g, " ").trim();
}

function isLikelyDiaryEntryStart(line = "") {
  return /^([A-Z][A-Za-z'' -]+|[A-Z'' -]+),\s*[A-Z][A-Za-z'' -]+/.test(line.trim());
}

function normalizeDiaryDashSpacing(line = "") {
  return String(line || "")
    .replace(/\s*[–—-]\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCourtName(line = "") {
  const normalized = cleanDiaryLine(line)
    .replace(/^(A REMANDS)\b.*/i, "$1")
    .replace(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}\/\d{2,4}.*$/i, "")
    .replace(/\bLocation:.*$/i, "")
    .replace(/\(All day\).*$/i, "")
    .replace(/[]/g, "")
    .trim();

  return normalized;
}

function isDiaryMetaLine(line = "") {
  const value = cleanDiaryLine(line);
  if (!value) return true;
  if (/^\d+\.$/.test(value)) return true;
  if (/^Location:?$/i.test(value)) return true;
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}\/\d{2,4}/i.test(value)) return true;
  if (/^(All day)$/i.test(value)) return true;
  if (/^(by|via|in person|to org)\b/i.test(value)) return true;
  if (/^[A-Z]{1,4}(?:\s*[;/]\s*[A-Z]{1,4})?\s+(?:by|via|in person|to org)\b/i.test(value)) return true;
  if (/^Counsel briefed\b/i.test(value)) return true;
  if (/^[A-Z]{1,4}[;/]\s*[A-Z]{1,4}$/i.test(value)) return true;
  return false;
}

function splitClientHeadAndTail(block = "") {
  const normalized = normalizeDiaryDashSpacing(block);
  const separatorIndex = normalized.indexOf(" - ");
  if (separatorIndex === -1) {
    return { head: normalized, tail: "" };
  }
  return {
    head: normalized.slice(0, separatorIndex).trim(),
    tail: normalized.slice(separatorIndex + 3).trim(),
  };
}

function parseDiaryEntryBlock(block = "", currentDate = "", currentCourt = "") {
  const normalized = normalizeDiaryDashSpacing(block).replace(/^\d+\.\s*/, "");
  if (!normalized) return null;

  const { head, tail } = splitClientHeadAndTail(normalized);
  if (!head) return null;

  let client_name = head;
  let grant_type = "";
  let appearance_type = "";

  let match = head.match(/^(.*?)(?:\s*\((VC|VU|VLA|L|V|pending)\))\s*$/i);
  if (match) {
    client_name = cleanDiaryLine(match[1]);
    grant_type = cleanDiaryLine(match[2]);
  } else {
    match = head.match(/^(.*?)(?:\s*\((VC|VU|VLA|L|V|pending)\))\s+(.+)$/i);
    if (match) {
      client_name = cleanDiaryLine(match[1]);
      grant_type = cleanDiaryLine(match[2]);
      appearance_type = cleanDiaryLine(match[3]);
    }
  }

  client_name = cleanDiaryLine(client_name).replace(/[()]+$/g, "").trim();
  if (!isLikelyDiaryEntryStart(client_name)) return null;

  const segments = tail
    .split(/\s+-\s+/)
    .map(cleanDiaryLine)
    .filter(Boolean);

  if (!appearance_type) {
    appearance_type = cleanDiaryLine(segments.shift() || "");
  }

  let lawyer_initials = "";
  let counsel_briefed = "";
  let outcomeSegments = [];

  const firstDetail = cleanDiaryLine(segments.shift() || "");
  if (looksLikeInitials(firstDetail)) {
    lawyer_initials = firstDetail;
  } else if (firstDetail) {
    const initialsWithTail = firstDetail.match(/^([A-Z]{1,8}(?:\/[A-Z]{1,8})?)\s+(.*)$/);
    if (initialsWithTail) {
      lawyer_initials = cleanDiaryLine(initialsWithTail[1]);
      if (initialsWithTail[2]) {
        outcomeSegments.push(cleanDiaryLine(initialsWithTail[2]));
      }
    } else if (/briefed/i.test(firstDetail)) {
      counsel_briefed = firstDetail;
    } else {
      outcomeSegments.push(firstDetail);
    }
  }

  for (const segment of segments) {
    if (!segment) continue;
    if (!counsel_briefed && /briefed/i.test(segment)) {
      counsel_briefed = segment;
      continue;
    }
    if (!lawyer_initials && looksLikeInitials(segment)) {
      lawyer_initials = segment;
      continue;
    }
    outcomeSegments.push(segment);
  }

  const outcome = cleanDiaryLine(outcomeSegments.join(" - "));
  const nextDateMatch =
    outcome.match(/\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/) ||
    outcome.match(/\b(\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\b/);
  const claimable = /^(vc|l|vla)$/i.test(grant_type);

  return {
    date: currentDate,
    client_name,
    grant_type,
    court: currentCourt,
    appearance_type,
    lawyer_initials,
    counsel_briefed,
    outcome,
    next_date: nextDateMatch ? nextDateMatch[1] : "",
    claimable,
    atlas_claim_type: claimable ? suggestAtlasClaimType(appearance_type, outcome) : "",
    notes: "",
  };
}

function extractDiaryEntryBlocksWithContext(text = "") {
  const lines = String(text || "")
    .split("\n")
    .map(cleanDiaryLine)
    .filter(Boolean);

  const entries = [];
  let currentDate = "";
  let currentCourt = "";
  let currentBlock = "";

  const flushCurrentBlock = () => {
    const parsed = parseDiaryEntryBlock(currentBlock, currentDate, currentCourt);
    if (parsed) {
      entries.push(parsed);
    }
    currentBlock = "";
  };

  for (const rawLine of lines) {
    const line = normalizeDiaryDashSpacing(rawLine);
    if (!line) continue;

    if (isDateHeading(line)) {
      flushCurrentBlock();
      currentDate = parseDiaryDate(line);
      continue;
    }

    if (isCourtHeading(line) || /\b(?:Magistrates'? Court|County Court|Supreme Court|Neighbourhood Justice Centre|Koori Court|A REMANDS)\b/i.test(line)) {
      flushCurrentBlock();
      currentCourt = extractCourtName(line);
      continue;
    }

    if (isDiaryMetaLine(line)) {
      continue;
    }

    const lineWithoutNumber = line.replace(/^\d+\.\s*/, "");
    if (isLikelyDiaryEntryStart(lineWithoutNumber)) {
      flushCurrentBlock();
      currentBlock = lineWithoutNumber;
      continue;
    }

    if (currentBlock) {
      currentBlock = `${currentBlock} ${lineWithoutNumber}`.trim();
    }
  }

  flushCurrentBlock();
  return entries;
}

function prepareDiaryLines(text = "") {
  const withEntryBreaks = String(text || "").replace(
    /(^|[\n ])((?:[A-Z][A-Za-z' -]+|[A-Z' -]+),\s*[A-Z][A-Za-z' -]+(?:\s*\([^)]+\))?\s*[\u2013-])/gm,
    (_match, prefix, entryStart) => `${prefix}\n${entryStart}`
  );

  return withEntryBreaks
    .split("\n")
    .map(cleanDiaryLine)
    .filter(Boolean);
}

function buildEntryBlocks(text = "") {
  const normalized = cleanDiaryLine(text);
  if (!normalized) return [];

  const entryStartRegex = /([A-Z][A-Za-z' -]+|[A-Z' -]+),\s*[A-Z][A-Za-z' -]+(?:\s*\([^)]+\))?\s*[\u2013-]/g;
  const matches = [...normalized.matchAll(entryStartRegex)];
  if (matches.length === 0) return [];

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? normalized.length : normalized.length;
    return cleanDiaryLine(normalized.slice(start, end));
  }).filter(Boolean);
}

function mergeDiaryLines(lines = []) {
  const merged = [];
  for (const rawLine of lines) {
    const line = cleanDiaryLine(rawLine);
    if (!line) continue;
    if (isDateHeading(line) || isCourtHeading(line) || isLikelyDiaryEntryStart(line)) {
      merged.push(line);
      continue;
    }
    if (merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${line}`.trim();
    } else {
      merged.push(line);
    }
  }
  return merged;
}

function suggestAtlasClaimType(appearanceType = "", outcome = "") {
  const appearance = String(appearanceType || "").toLowerCase();
  const outcomeText = String(outcome || "").toLowerCase();

  if (/adj|adjourn/.test(outcomeText) && /\bfor\b/.test(outcomeText)) {
    return "Confirm adj type";
  }
  if (appearance.includes("contest")) return "Contest hearing appearance";
  if (appearance.includes("sentence") || appearance.includes("return for sentence")) return "Appearance on sentence or adjournment";
  if (appearance.includes("bail")) return "Bail appearance fee";
  if (appearance.includes("committal mention")) return "Committal mention / case conference appearance";
  if (appearance.includes("arc review")) return "ARC Ã¢â‚¬â€œ Review Hearing";
  if (appearance.includes("case assessment")) return "Active Case Management Ã¢â‚¬â€œ case assessment hearing";
  if (appearance.includes("sentence indication")) return "Sentence indication";
  if (appearance.includes("plea")) return "Plea Ã¢â‚¬â€œ appearance fee (first day)";
  if (appearance.includes("trial")) return "Trial Ã¢â‚¬â€œ appearance fee (first day)";
  if (appearance.includes("direction") || appearance.includes("callover")) return "Directions hearing / mention / callover";
  if (appearance.includes("mention") || appearance.includes("adjourn")) return "Daily appearance fee";
  return "";
}

function looksLikeGrantType(value = "") {
  return /^(vc|vla|l|v|vu|pending)$/i.test(cleanDiaryLine(value));
}

function looksLikeInitials(value = "") {
  return /^[A-Z]{1,8}$/.test(cleanDiaryLine(value));
}

function parseDiaryEntry(line = "", currentDate = "", currentCourt = "") {
  const segments = line.split(/\s+[\u2013-]\s+/).map(cleanDiaryLine).filter(Boolean);
  if (segments.length < 2) return null;

  const headMatch = segments[0].match(/^([^()]+?)\s*(?:\(([^)]+)\))?$/);
  if (!headMatch) return null;

  const client_name = cleanDiaryLine(headMatch[1]);
  let grant_type = cleanDiaryLine(headMatch[2] || "");
  let appearance_type = "";
  let lawyer_initials = "";
  let outcome = "";

  let cursor = 1;
  if (!grant_type && looksLikeGrantType(segments[cursor])) {
    grant_type = cleanDiaryLine(segments[cursor]);
    cursor += 1;
  }

  appearance_type = cleanDiaryLine(segments[cursor] || "");
  cursor += 1;

  const initialsCandidate = segments[cursor] || "";
  if (looksLikeInitials(initialsCandidate)) {
    lawyer_initials = cleanDiaryLine(initialsCandidate);
    cursor += 1;
  } else {
    const initialsMatch = initialsCandidate.match(/^([A-Z]{1,8})\s+(.*)$/);
    if (initialsMatch) {
      lawyer_initials = cleanDiaryLine(initialsMatch[1]);
      outcome = cleanDiaryLine(initialsMatch[2]);
      cursor += 1;
    }
  }

  if (!outcome) {
    outcome = segments.slice(cursor).join(" - ");
  }

  if (!client_name || !appearance_type) return null;

  const nextDateMatch = outcome.match(/\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/);
  const claimable = /^(vc|l|vla)$/i.test(grant_type);

  return {
    date: currentDate,
    client_name,
    grant_type,
    court: currentCourt,
    appearance_type,
    lawyer_initials,
    counsel_briefed: "",
    outcome,
    next_date: nextDateMatch ? nextDateMatch[1] : "",
    claimable,
    atlas_claim_type: claimable ? suggestAtlasClaimType(appearance_type, outcome) : "",
    notes: "",
  };
}

async function extractDiaryEntriesFromPdf(fileUrl = "") {
  const pdfJsText = await extractPdfTextWithPdfJs(fileUrl).catch(() => "");
  let legacyText = "";
  if (!pdfJsText) {
    legacyText = await (async () => {
      try {
        const base64 = String(fileUrl).split(",")[1] || "";
        if (!base64) return "";
        const data = decodeBase64ToBytes(base64);
        const legacyPdfJs = await import(/* @vite-ignore */ LEGACY_PDFJS_MODULE_URL);
        const loadingTask = legacyPdfJs.getDocument({
          data,
          ...PDFJS_BROWSER_OPTIONS,
        });
        const pdf = await loadingTask.promise;
        const pieces = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pieces.push(...(content.items || []).map((item) => item?.str || "").filter(Boolean));
        }
        return pieces.join("\n").trim();
      } catch {
        return "";
      }
    })();
  }
  const streamText = extractPdfTextFromDataUrl(fileUrl);
  const ocrText = await extractPdfTextWithOcr(fileUrl).catch(() => "");

  const evaluateCandidate = (label, text = "") => {
    const normalized = normalizeDiaryText(text);
    const debug = {
      source: label,
      normalizedLength: normalized.length,
      contextEntriesCount: 0,
      mergedLineCount: 0,
      fallbackEntriesCount: 0,
    };

    if (!normalized) {
      return { label, normalized, entries: [], debug };
    }

    const contextEntries = extractDiaryEntryBlocksWithContext(normalized);
    debug.contextEntriesCount = contextEntries.length;
    if (contextEntries.length > 1) {
      return { label, normalized, entries: contextEntries, debug };
    }

    const mergedLines = mergeDiaryLines(prepareDiaryLines(normalized));
    debug.mergedLineCount = mergedLines.length;
    let currentDate = "";
    let currentCourt = "";
    const entries = [];

    for (const line of mergedLines) {
      if (isDateHeading(line)) {
        currentDate = parseDiaryDate(line);
        continue;
      }
      if (isCourtHeading(line)) {
        currentCourt = line;
        continue;
      }
      const entry = parseDiaryEntry(line, currentDate, currentCourt);
      if (entry) entries.push(entry);
    }

    if (entries.length <= 1) {
      const blockEntries = buildEntryBlocks(normalized)
        .map((block) => parseDiaryEntry(block, currentDate, currentCourt))
        .filter(Boolean);
      debug.fallbackEntriesCount = blockEntries.length;

      if (blockEntries.length > entries.length) {
        return { label, normalized, entries: blockEntries, debug };
      }
    }

    return { label, normalized, entries, debug };
  };

  const candidates = [
    evaluateCandidate("pdfjs", pdfJsText),
    evaluateCandidate("legacy", legacyText),
    evaluateCandidate("stream", streamText),
    evaluateCandidate("ocr", ocrText),
  ];

  const best = candidates
    .slice()
    .sort((a, b) => {
      if (b.entries.length !== a.entries.length) return b.entries.length - a.entries.length;
      return (b.normalized?.length || 0) - (a.normalized?.length || 0);
    })[0];

  const debug = {
    pdfJsTextLength: pdfJsText.length,
    legacyTextLength: legacyText.length,
    streamTextLength: streamText.length,
    ocrTextLength: ocrText.length,
    selectedSource: best?.label || "",
    normalizedLength: best?.debug?.normalizedLength || 0,
    contextEntriesCount: best?.debug?.contextEntriesCount || 0,
    mergedLineCount: best?.debug?.mergedLineCount || 0,
    fallbackEntriesCount: best?.debug?.fallbackEntriesCount || 0,
  };

  if (!best?.normalized) {
    return { entries: [], summary: "No readable text found in the uploaded PDF, even after OCR.", debug };
  }

  const entries = best.entries || [];
  const claimableCount = entries.filter((entry) => entry.claimable !== false).length;
  const usedOcr = best.label === "ocr";
  const summary = `Extracted ${entries.length} diary entr${entries.length === 1 ? "y" : "ies"}, including ${claimableCount} claimable entr${claimableCount === 1 ? "y" : "ies"}.${usedOcr ? " OCR was used for this PDF." : ""}`;
  return { entries, summary, debug };
}

function buildAddressSuggestions(input = "") {
  const query = String(input || "").trim();
  if (!query) return [];
  return [
    `${query}, Melbourne VIC 3000`,
    `${query}, Footscray VIC 3011`,
    `${query}, Dandenong VIC 3175`,
    `${query}, Broadmeadows VIC 3047`,
  ].map((description, index) => ({
    place_id: `standalone-address-${index + 1}`,
    description,
  }));
}

function readApplications() {
  return readStorage(LEGAL_AID_APPLICATIONS_KEY, []);
}

function writeApplications(applications) {
  writeStorage(LEGAL_AID_APPLICATIONS_KEY, applications);
}

export async function listLegalAidApplicationsStandalone(sort = "-updated_date", limit) {
  const applications = [...readApplications()];
  if (sort === "-updated_date") {
    applications.sort((a, b) => String(b.updated_date || "").localeCompare(String(a.updated_date || "")));
  }
  if (typeof limit === "number") {
    return applications.slice(0, limit);
  }
  return applications;
}

function readConflictNames() {
  const names = readStorage(CONFLICT_NAMES_KEY, [
    { id: "cn-1", name: "John Doe", category: "Opposing Party" },
    { id: "cn-2", name: "Jane Smith", category: "Former Client" },
    { id: "cn-3", name: "Robert Jones", category: "Witness for Prosecution" },
  ]);
  return names;
}

export async function listConflictNamesStandalone(sort, limit) {
  const names = readConflictNames();
  if (limit) {
    return names.slice(0, limit);
  }
  return names;
}

export async function getLegalAidApplicationStandalone(id) {
  const applications = readApplications();
  return applications.find((application) => application.id === id) || null;
}

export async function createLegalAidApplicationStandalone(payload = {}) {
  const applications = readApplications();
  const created = {
    id: createId("legal-aid-application"),
    ...payload,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  };
  applications.unshift(created);
  writeApplications(applications);
  return created;
}

export async function updateLegalAidApplicationStandalone(id, payload = {}) {
  const applications = readApplications();
  const index = applications.findIndex((application) => application.id === id);
  if (index === -1) {
    throw new Error("Application not found");
  }
  const updated = {
    ...applications[index],
    ...payload,
    id,
    updated_date: new Date().toISOString(),
  };
  applications[index] = updated;
  writeApplications(applications);
  return updated;
}

export async function sendFormEmailStandalone(payload = {}) {
  const outbox = readStorage(OUTBOX_KEY, []);
  const email = {
    id: createId("email"),
    mode: "standalone",
    type: "intake-form",
    to: payload.recipientEmail || "",
    cc: payload.ccEmail || "",
    subject: `Client Intake Form${payload.formName ? ` - ${payload.formName}` : ""}`,
    body: payload.message || "",
    attachment_name: `${payload.formName || "client-intake-form"}.pdf`,
    attachment_type: "application/pdf",
    attachment_base64: payload.pdfBase64 || null,
    saved_at: new Date().toISOString(),
  };
  outbox.unshift(email);
  writeStorage(OUTBOX_KEY, outbox.slice(0, 100));
  return { ok: true, mode: "standalone", outbox_id: email.id };
}

export async function submitApplicationEmailStandalone(payload = {}) {
  const outbox = readStorage(OUTBOX_KEY, []);
  const applicantName = `${payload.formData?.first_name || ""} ${payload.formData?.last_name || ""}`.trim();
  const email = {
    id: createId("email"),
    mode: "standalone",
    type: "legal-aid-application",
    to: "applications@lacw.example",
    cc: "",
    subject: `Legal Aid Application${applicantName ? ` - ${applicantName}` : ""}`,
    body: JSON.stringify({
      applicationId: payload.applicationId || null,
      applicantName,
      savedAt: new Date().toISOString(),
    }, null, 2),
    saved_at: new Date().toISOString(),
  };
  outbox.unshift(email);
  writeStorage(OUTBOX_KEY, outbox.slice(0, 100));
  return { ok: true, mode: "standalone", outbox_id: email.id };
}

export async function uploadFileStandalone(file) {
  const readerResult = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const upload = {
    id: createId("upload"),
    name: file.name,
    type: file.type,
    size: file.size,
    category: guessMimeCategory(file.type),
    file_url: readerResult,
    created_at: new Date().toISOString(),
  };
  return upload;
}

export async function parseLacwDiaryFileStandalone(file) {
  const fileUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  try {
    const response = await fetch(`${API_BASE}/api/parse-diary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileUrl }),
    });
    if (response.ok) {
      const result = await response.json();
      if (result?.entries) {
        result.debug = {
          ...(result.debug || {}),
          parserMode: "server",
        };
        return result;
      }
    }
  } catch (error) {
    console.warn(`Server parser unavailable: ${error?.message || "unknown error"}. Falling back to browser parser.`);
  }

  try {
    const fallbackResult = await extractDiaryEntriesFromPdf(fileUrl);
    fallbackResult.debug = {
      ...(fallbackResult.debug || {}),
      parserMode: "browser",
    };
    return fallbackResult;
  } catch (fallbackError) {
    throw new Error(`Diary parsing failed: ${fallbackError?.message || "unknown error"}`);
  }
}

export async function sendEmailStandalone({ to, cc = "", subject = "", body = "", attachment_name = null, attachment_type = null, attachment_base64 = null }) {
  const outbox = readStorage(OUTBOX_KEY, []);
  const email = {
    id: createId("email"),
    to,
    cc,
    subject,
    body,
    attachment_name,
    attachment_type,
    attachment_base64,
    mode: "standalone",
    saved_at: new Date().toISOString(),
  };
  outbox.unshift(email);
  writeStorage(OUTBOX_KEY, outbox.slice(0, 100));
  return { ok: true, mode: "standalone", outbox_id: email.id };
}

export async function invokeLlmStandalone(payload = {}) {
  if (payload?.response_json_schema) {
    const fileUrl = Array.isArray(payload?.file_urls) ? payload.file_urls[0] : "";
    return extractDiaryEntriesFromPdf(fileUrl);
  }
  return answerLegalQuestion(payload?.prompt || "");
}

export async function extractDataFromUploadedFileStandalone({ file_url, json_schema }) {
  // Standalone mock: simulate extraction
  return {
    status: "success",
    output: {
      victims: [
        { full_name: "John Doe", role: "Primary Victim" },
        { full_name: "Sarah Miller", role: "Complainant" }
      ],
      witnesses: [
        { full_name: "Officer Smith", role: "Arresting Officer" }
      ],
      other_parties: [
        { full_name: "Robert Jones", role: "Co-accused" }
      ]
    }
  };
}

export async function invokeFunctionStandalone(name, payload = {}) {
  if (name === "sendFormEmail") {
    return sendFormEmailStandalone(payload);
  }
  if (name === "submitApplicationEmail") {
    return submitApplicationEmailStandalone(payload);
  }
  if (name === "addressAutocomplete") {
    return { suggestions: buildAddressSuggestions(payload?.input) };
  }
  const barristers = CLERK_LISTS[name];
  if (barristers) {
    return {
      barristers,
      fallbackContact: CLERK_FALLBACK_CONTACTS[name] || null,
    };
  }
  return { ok: true, mode: "standalone", message: `No local function handler is configured for ${name}.` };
}

