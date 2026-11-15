import {
  BD_ADMIN_LABELS_MAP,
  BD_DISTRICTS_MAP,
  BD_UPAZILAS_MAP,
} from "./bdGeocodeMap";

// Map of common Bengali conjuncts / compound letters to Roman phonetic equivalents
const CONJUNCTS_MAP: Record<string, string> = {
  "ক্ষ": "ksh",
  "জ্ঞ": "gya",
  "ষ্ণ": "shn",
  "ঙ্ক": "nk",
  "ঙ্গ": "ng",
  "ঙ্ঘ": "ngh",
  "চ্চ": "cch",
  "চ্ছ": "cchh",
  "জ্জ": "jj",
  "ঝঝ": "jjh",
  "ট্ট": "tt",
  "টফ": "tf",
  "ণ্ট": "nt",
  "ণ্ঠ": "nth",
  "ণ্ড": "nd",
  "ত্ত": "tt",
  "ত্থ": "tth",
  "ত্ন": "tn",
  "ত্ম": "tm",
  "ত্য": "ty",
  "ত্র": "tr",
  "ত্ব": "tw",
  "থ্য": "thy",
  "দ্দ": "dd",
  "দ্ধ": "ddh",
  "দ্ব": "dw",
  "দ্ভ": "dbh",
  "দ্ম": "dm",
  "ধ্য": "dhy",
  "ধ্ব": "dhw",
  "ন্ত": "nt",
  "ন্থ": "nth",
  "ন্দ": "nd",
  "ন্ধ": "ndh",
  "ন্ন": "nn",
  "প্ত": "pt",
  "প্প": "pp",
  "ব্দ": "bd",
  "ব্ধ": "bdh",
  "ব্ব": "bb",
  "ম্ব": "mb",
  "ম্ভ": "mbh",
  "ম্ম": "mm",
  "ল্ক": "lk",
  "ল্গ": "lg",
  "ল্ট": "lt",
  "ল্ড": "ld",
  "ল্প": "lp",
  "ল্ফ": "lf",
  "ল্ব": "lb",
  "ল্ম": "lm",
  "ল্ল": "ll",
  "ষ্ক": "shk",
  "ষ্ট": "sht",
  "ষ্ঠ": "shth",
  "ষ্প": "shp",
  "ষ্ফ": "shf",
  "স্ক": "sk",
  "স্ত": "st",
  "স্থ": "sth",
  "স্ন": "sn",
  "স্প": "sp",
  "স্ফ": "sf",
  "স্ম": "sm",
  "স্য": "sy",
  "স্র": "sr",
  "স্ব": "sw",
  "স্ল": "sl",
  "হ্ন": "hn",
  "হ্ম": "hm",
  "হ্ল": "hl",
  "হৃ": "hri",
};

// Independent vowels
const VOWELS_MAP: Record<string, string> = {
  "অ": "o",
  "আ": "a",
  "ই": "i",
  "ঈ": "i",
  "উ": "u",
  "ঊ": "u",
  "ঋ": "ri",
  "এ": "e",
  "ঐ": "oi",
  "ও": "o",
  "ঔ": "ou",
};

// Vowel signs (Kar)
const KAR_MAP: Record<string, string> = {
  "া": "a",
  "ি": "i",
  "ী": "i",
  "ু": "u",
  "ূ": "u",
  "ৃ": "ri",
  "ে": "e",
  "ৈ": "oi",
  "ো": "o",
  "ৌ": "ou",
};

// Single consonants
const CONSONANTS_MAP: Record<string, string> = {
  "ক": "k",
  "খ": "kh",
  "গ": "g",
  "ঘ": "gh",
  "ঙ": "ng",
  "চ": "ch",
  "ছ": "chh",
  "জ": "j",
  "ঝ": "jh",
  "ঞ": "n",
  "ট": "t",
  "ঠ": "th",
  "ড": "d",
  "ঢ": "dh",
  "ণ": "n",
  "ত": "t",
  "থ": "th",
  "দ": "d",
  "ধ": "dh",
  "ন": "n",
  "প": "p",
  "ফ": "f",
  "ব": "b",
  "ভ": "bh",
  "ম": "m",
  "য": "y",
  "র": "r",
  "ল": "l",
  "শ": "sh",
  "ষ": "sh",
  "স": "s",
  "হ": "h",
  "ড়": "r",
  "ঢ়": "rh",
  "য়": "y",
  "ৎ": "t",
  "ং": "ng",
  "ঃ": "h",
  "ঁ": "n",
};

// Pre-compiled combined dictionary: administrative labels + districts + upazilas
// Sorted by key length descending so longer compound phrases match first
const COMBINED_GEO_DICTIONARY: Array<[string, string]> = [
  ...Object.entries(BD_ADMIN_LABELS_MAP),
  ...Object.entries(BD_DISTRICTS_MAP),
  ...Object.entries(BD_UPAZILAS_MAP),
].sort((a, b) => b[0].length - a[0].length);

/**
 * Normalizes Bengali digits (০-৯) to ASCII digits (0-9).
 */
export function normalizeBengaliDigits(text: string): string {
  return text.replace(/[\u09E6-\u09EF]/g, (ch) =>
    String(ch.charCodeAt(0) - 0x09e6),
  );
}

/**
 * Phonetically transliterates a single Bengali word to Roman English characters.
 */
export function transliterateBengaliWord(word: string): string {
  // If word is already Latin or digits or punctuation, keep it
  if (!/[\u0980-\u09FF]/.test(word)) {
    return word;
  }

  // Check exact match in dictionary first
  for (const [bn, en] of COMBINED_GEO_DICTIONARY) {
    if (word === bn) return en;
  }

  let result = "";
  let i = 0;
  const len = word.length;

  while (i < len) {
    // 1. Check for 3-char or 2-char conjuncts
    if (i + 2 < len) {
      const sub3 = word.slice(i, i + 3);
      if (CONJUNCTS_MAP[sub3]) {
        result += CONJUNCTS_MAP[sub3];
        i += 3;
        continue;
      }
    }

    if (i + 1 < len) {
      const sub2 = word.slice(i, i + 2);
      if (CONJUNCTS_MAP[sub2]) {
        result += CONJUNCTS_MAP[sub2];
        i += 2;
        continue;
      }
    }

    const ch = word[i]!;

    // 2. Ref (র্) -> 'r' before consonant
    if (ch === "র" && i + 1 < len && word[i + 1] === "্") {
      result += "r";
      i += 2;
      continue;
    }

    // 3. Independent vowel
    if (VOWELS_MAP[ch]) {
      result += VOWELS_MAP[ch];
      i++;
      continue;
    }

    // 4. Vowel sign (Kar)
    if (KAR_MAP[ch]) {
      result += KAR_MAP[ch];
      i++;
      continue;
    }

    // 5. Virama / Hasant
    if (ch === "্") {
      i++;
      continue;
    }

    // 6. Consonant
    if (CONSONANTS_MAP[ch]) {
      const romanConsonant = CONSONANTS_MAP[ch]!;
      result += romanConsonant;

      // Lookahead: does the next character suppress the inherent vowel?
      const nextCh = i + 1 < len ? word[i + 1] : "";
      const isNextKar = Boolean(nextCh && KAR_MAP[nextCh]);
      const isNextVirama = nextCh === "্";
      const isEnd = i + 1 >= len;

      // If followed by no vowel sign and not at the end of word or before virama,
      // sometimes an inherent 'a' or 'o' is appropriate for syllable clarity
      if (!isNextKar && !isNextVirama && !isEnd) {
        const nextNext = i + 2 < len ? word[i + 2] : "";
        if (nextCh in CONSONANTS_MAP && nextNext in KAR_MAP) {
          result += "a";
        }
      }

      i++;
      continue;
    }

    // Unknown or symbol: preserve
    result += ch;
    i++;
  }

  // Capitalize first letter
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * Two-layer Bengali address transliterator:
 * 1. Dictionary lookup for administrative labels, districts, and upazilas
 * 2. Phonetic transliteration for remaining Bengali tokens
 */
export function transliterateBengaliAddress(rawBengaliAddress: string): string {
  if (!rawBengaliAddress || typeof rawBengaliAddress !== "string") {
    return "";
  }

  // Step 1: Remove "ঠিকানা:" prefix if present
  let text = rawBengaliAddress
    .replace(/^.*?ঠিকানা\s*[:.\-]?\s*/i, "")
    .trim();

  // Normalize Bengali digits (০-৯) to 0-9
  text = normalizeBengaliDigits(text);

  // Step 2: Layer 1 - Dictionary lookup for administrative terms & known places
  // Replace known phrases with distinct placeholders or direct English equivalents
  for (const [bnPhrase, enReplacement] of COMBINED_GEO_DICTIONARY) {
    if (text.includes(bnPhrase)) {
      // Use word boundary or exact match
      const regex = new RegExp(bnPhrase, "g");
      text = text.replace(regex, ` ${enReplacement} `);
    }
  }

  // Step 3: Layer 2 - Token-by-token phonetic transliteration for remaining Bengali words
  const tokens = text.split(/([\s,:\-\/()]+)/);
  const transliteratedTokens = tokens.map((token) => {
    if (/[\u0980-\u09FF]/.test(token)) {
      return transliterateBengaliWord(token);
    }
    return token;
  });

  let result = transliteratedTokens.join("");

  // Step 4: Clean up punctuation, redundant spaces, and structure
  result = result
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/,\s*,+/g, ",")
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "")
    .trim();

  return result;
}
