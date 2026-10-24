// Shared by Onboarding and Edit profile – these used to be copy-pasted in both pages.
// Values must match the backend enums exactly.

export const GENDER_OPTIONS = ["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"];

export const DATING_INTENT_OPTIONS = [
  "SERIOUS_RELATIONSHIP",
  "CASUAL_DATING",
  "FRIENDSHIP",
  "OPEN_TO_BOTH",
  "NOT_SURE_YET",
];

export const CONNECTION_OPTIONS = ["LONG_TERM", "SHORT_TERM", "OPEN_TO_BOTH", "NOT_SURE_YET"];
export const LONG_DISTANCE_OPTIONS = ["YES", "NO", "MAYBE"];

export const COMMUNICATION_OPTIONS = ["TEXT_A_LOT", "CALLS_OVER_TEXTS", "SLOW_REPLIES", "DEPENDS_ON_MOOD"];

export const LOVE_LANGUAGE_OPTIONS = [
  "WORDS_OF_AFFIRMATION",
  "ACTS_OF_SERVICE",
  "PHYSICAL_TOUCH",
  "QUALITY_TIME",
  "GIFTS",
];

export const CONFLICT_OPTIONS = ["TALK_IT_OUT_IMMEDIATELY", "TAKE_SPACE_FIRST", "AVOID_CONFRONTATION", "DEPENDS"];

export const DRINK_OPTIONS = ["NO", "OCCASIONALLY", "YES"];
export const SMOKE_OPTIONS = ["NO", "OCCASIONALLY", "YES"];
export const FOOD_OPTIONS = ["VEG", "NON_VEG", "EGGETARIAN", "VEGAN"];
export const SLEEP_OPTIONS = ["EARLY_BIRD", "NIGHT_OWL", "DEPENDS"];

export const PERSONALITY_OPTIONS = [
  "INTROVERT", "EXTROVERT", "AMBIVERT", "FUNNY", "DEEP_THINKER", "CALM",
  "ADVENTUROUS", "ROMANTIC", "CHAOTIC", "AMBITIOUS", "CURIOUS", "ARTISTIC",
];

export const CORE_VALUE_OPTIONS = [
  "HONESTY", "GROWTH", "LOYALTY", "RESPECT", "KINDNESS", "COMMUNICATION",
  "AMBITION", "PEACE", "FAMILY", "HUMOR", "BALANCE", "ADVENTURE",
];

export const INTEREST_OPTIONS = [
  "MUSIC", "TRAVEL", "GYM", "MOVIES", "FOOD", "COFFEE", "PHOTOGRAPHY", "BOOKS",
  "BEACH", "GAMING", "ART", "DANCE", "PETS", "SPORTS", "YOGA", "FASHION",
  "COOKING", "TECH", "HIKING", "THEATRE", "CRICKET",
];

export const DEALBREAKER_OPTIONS = [
  "DISHONESTY", "RUDENESS", "TOXICITY", "POOR_COMMUNICATION", "SMOKING", "DRINKING",
  "FLAKINESS", "JUDGMENTAL_BEHAVIOR", "CHEATING", "LACK_OF_AMBITION", "ARROGANCE",
  "NEEDINESS", "SECRETIVENESS", "DISRESPECT",
];

export const WRITE_MY_OWN = "WRITE_MY_OWN";

const OPENING_LINES = [
  "Say hi and tell me something small that made you smile today.",
  "Come with a good joke or a better playlist.",
  "I respect a bold opener.",
  "Start sweet, start funny, start however you like.",
  "I am usually nicer in person, but this is a solid start.",
  "If you can make me laugh, you already have my attention.",
  "A little curiosity goes a long way.",
  "Tell me your most underrated opinion.",
  "You can start with a compliment if you mean it.",
  "A good conversation beats a perfect line.",
  "I like people who know how to keep it light.",
];

// value and label were always identical, so build them from one list
export const OPENING_LINE_OPTIONS = [
  ...OPENING_LINES.map((line) => ({ value: line, label: line })),
  { value: WRITE_MY_OWN, label: "Write my own" },
];

export const MAX_PROMPTS = 3;
export const MAX_IMAGES = 6;

export const PROMPT_CATEGORIES = [
  {
    key: "love",
    label: "Relationships",
    prompts: [
      { id: "feel_loved", question: "The way I feel loved is…", placeholder: "How do you like to be cared for?" },
      { id: "green_flag", question: "A green flag I never ignore is…", placeholder: "What makes someone stand out in a good way?" },
      { id: "open_up", question: "I usually open up when…", placeholder: "What helps you feel comfortable with someone?" },
      { id: "boundary", question: "A boundary I protect is…", placeholder: "Something you take seriously." },
      { id: "connection_want", question: "The kind of connection I want is…", placeholder: "Describe what you are looking for." },
    ],
  },
  {
    key: "life",
    label: "Everyday life",
    prompts: [
      { id: "stressed", question: "When I am stressed, I…", placeholder: "How do you usually reset?" },
      { id: "weekend", question: "My weekend reset looks like…", placeholder: "Describe a typical slow weekend." },
      { id: "comfort", question: "My comfort habit is…", placeholder: "A small habit that feels like home." },
      { id: "routine", question: "A routine that keeps me sane is…", placeholder: "A daily or weekly habit you rely on." },
      { id: "misread", question: "People think I am ___, but I am actually ___", placeholder: "Something people often get wrong about you." },
    ],
  },
  {
    key: "values",
    label: "Values",
    prompts: [
      { id: "value_people", question: "I value people who…", placeholder: "What matters most in the people around you?" },
      { id: "biggest_thing", question: "The biggest thing I look for in someone is…", placeholder: "Your main non-negotiable." },
      { id: "safe", question: "A relationship feels safe when…", placeholder: "What makes a relationship feel healthy to you?" },
      { id: "dealbreaker_prompt", question: "A dealbreaker for me is…", placeholder: "What doesn't work for you?" },
      { id: "admire", question: "I admire people who…", placeholder: "Who do you look up to and why?" },
    ],
  },
  {
    key: "small",
    label: "Small things",
    prompts: [
      { id: "secretly_love", question: "I secretly love…", placeholder: "Something small and honest about you." },
      { id: "talk_about", question: "A random thing I could talk about for hours is…", placeholder: "Your favourite rabbit hole." },
      { id: "getting_better", question: "Something I am trying to get better at is…", placeholder: "A skill or habit you are working on." },
      { id: "song", question: "A song that feels like me is…", placeholder: "Artist and song name." },
      { id: "simple_joy", question: "My simple joy is…", placeholder: "The little thing that makes your day better." },
    ],
  },
];
