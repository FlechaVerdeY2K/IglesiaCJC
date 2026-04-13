export type Libro = {
  id: string;       // used in URL params
  api: string;      // English name (kept for reference)
  num: number;      // book number 1-66 (for bolls.life API)
  nombre: string;   // Spanish display name
  abr: string;      // abbreviation
  caps: number;     // chapter count
  t: "AT" | "NT";
};

export const VERSIONES = [
  { id: "RV1960", nombre: "Reina-Valera 1960" },
  { id: "NVI",    nombre: "Nueva Versión Internacional" },
  { id: "NTV",    nombre: "Nueva Traducción Viviente" },
  { id: "LBLA",   nombre: "La Biblia de las Américas" },
];

export const DEFAULT_VERSION = "RV1960";

export const LIBROS: Libro[] = [
  // ── Antiguo Testamento ──────────────────────────────────────────
  { id: "genesis",         num: 1,  api: "genesis",        nombre: "Génesis",          abr: "Gén",  caps: 50,  t: "AT" },
  { id: "exodo",           num: 2,  api: "exodus",          nombre: "Éxodo",            abr: "Éx",   caps: 40,  t: "AT" },
  { id: "levitico",        num: 3,  api: "leviticus",       nombre: "Levítico",         abr: "Lev",  caps: 27,  t: "AT" },
  { id: "numeros",         num: 4,  api: "numbers",         nombre: "Números",          abr: "Núm",  caps: 36,  t: "AT" },
  { id: "deuteronomio",    num: 5,  api: "deuteronomy",     nombre: "Deuteronomio",     abr: "Deut", caps: 34,  t: "AT" },
  { id: "josue",           num: 6,  api: "joshua",          nombre: "Josué",            abr: "Jos",  caps: 24,  t: "AT" },
  { id: "jueces",          num: 7,  api: "judges",          nombre: "Jueces",           abr: "Jue",  caps: 21,  t: "AT" },
  { id: "rut",             num: 8,  api: "ruth",            nombre: "Rut",              abr: "Rut",  caps: 4,   t: "AT" },
  { id: "1samuel",         num: 9,  api: "1samuel",         nombre: "1 Samuel",         abr: "1Sam", caps: 31,  t: "AT" },
  { id: "2samuel",         num: 10, api: "2samuel",         nombre: "2 Samuel",         abr: "2Sam", caps: 24,  t: "AT" },
  { id: "1reyes",          num: 11, api: "1kings",          nombre: "1 Reyes",          abr: "1Rey", caps: 22,  t: "AT" },
  { id: "2reyes",          num: 12, api: "2kings",          nombre: "2 Reyes",          abr: "2Rey", caps: 25,  t: "AT" },
  { id: "1cronicas",       num: 13, api: "1chronicles",     nombre: "1 Crónicas",       abr: "1Cr",  caps: 29,  t: "AT" },
  { id: "2cronicas",       num: 14, api: "2chronicles",     nombre: "2 Crónicas",       abr: "2Cr",  caps: 36,  t: "AT" },
  { id: "esdras",          num: 15, api: "ezra",            nombre: "Esdras",           abr: "Esd",  caps: 10,  t: "AT" },
  { id: "nehemias",        num: 16, api: "nehemiah",        nombre: "Nehemías",         abr: "Neh",  caps: 13,  t: "AT" },
  { id: "ester",           num: 17, api: "esther",          nombre: "Ester",            abr: "Est",  caps: 10,  t: "AT" },
  { id: "job",             num: 18, api: "job",             nombre: "Job",              abr: "Job",  caps: 42,  t: "AT" },
  { id: "salmos",          num: 19, api: "psalms",          nombre: "Salmos",           abr: "Sal",  caps: 150, t: "AT" },
  { id: "proverbios",      num: 20, api: "proverbs",        nombre: "Proverbios",       abr: "Prov", caps: 31,  t: "AT" },
  { id: "eclesiastes",     num: 21, api: "ecclesiastes",    nombre: "Eclesiastés",      abr: "Ecl",  caps: 12,  t: "AT" },
  { id: "cantares",        num: 22, api: "songofsolomon",   nombre: "Cantares",         abr: "Cant", caps: 8,   t: "AT" },
  { id: "isaias",          num: 23, api: "isaiah",          nombre: "Isaías",           abr: "Is",   caps: 66,  t: "AT" },
  { id: "jeremias",        num: 24, api: "jeremiah",        nombre: "Jeremías",         abr: "Jer",  caps: 52,  t: "AT" },
  { id: "lamentaciones",   num: 25, api: "lamentations",    nombre: "Lamentaciones",    abr: "Lam",  caps: 5,   t: "AT" },
  { id: "ezequiel",        num: 26, api: "ezekiel",         nombre: "Ezequiel",         abr: "Ez",   caps: 48,  t: "AT" },
  { id: "daniel",          num: 27, api: "daniel",          nombre: "Daniel",           abr: "Dan",  caps: 12,  t: "AT" },
  { id: "oseas",           num: 28, api: "hosea",           nombre: "Oseas",            abr: "Os",   caps: 14,  t: "AT" },
  { id: "joel",            num: 29, api: "joel",            nombre: "Joel",             abr: "Jl",   caps: 3,   t: "AT" },
  { id: "amos",            num: 30, api: "amos",            nombre: "Amós",             abr: "Am",   caps: 9,   t: "AT" },
  { id: "abdias",          num: 31, api: "obadiah",         nombre: "Abdías",           abr: "Abd",  caps: 1,   t: "AT" },
  { id: "jonas",           num: 32, api: "jonah",           nombre: "Jonás",            abr: "Jon",  caps: 4,   t: "AT" },
  { id: "miqueas",         num: 33, api: "micah",           nombre: "Miqueas",          abr: "Mi",   caps: 7,   t: "AT" },
  { id: "nahum",           num: 34, api: "nahum",           nombre: "Nahúm",            abr: "Nah",  caps: 3,   t: "AT" },
  { id: "habacuc",         num: 35, api: "habakkuk",        nombre: "Habacuc",          abr: "Hab",  caps: 3,   t: "AT" },
  { id: "sofonias",        num: 36, api: "zephaniah",       nombre: "Sofonías",         abr: "Sof",  caps: 3,   t: "AT" },
  { id: "hageo",           num: 37, api: "haggai",          nombre: "Hageo",            abr: "Hag",  caps: 2,   t: "AT" },
  { id: "zacarias",        num: 38, api: "zechariah",       nombre: "Zacarías",         abr: "Zac",  caps: 14,  t: "AT" },
  { id: "malaquias",       num: 39, api: "malachi",         nombre: "Malaquías",        abr: "Mal",  caps: 4,   t: "AT" },
  // ── Nuevo Testamento ──────────────────────────────────────────────
  { id: "mateo",           num: 40, api: "matthew",         nombre: "Mateo",            abr: "Mt",   caps: 28,  t: "NT" },
  { id: "marcos",          num: 41, api: "mark",            nombre: "Marcos",           abr: "Mc",   caps: 16,  t: "NT" },
  { id: "lucas",           num: 42, api: "luke",            nombre: "Lucas",            abr: "Lc",   caps: 24,  t: "NT" },
  { id: "juan",            num: 43, api: "john",            nombre: "Juan",             abr: "Jn",   caps: 21,  t: "NT" },
  { id: "hechos",          num: 44, api: "acts",            nombre: "Hechos",           abr: "Hch",  caps: 28,  t: "NT" },
  { id: "romanos",         num: 45, api: "romans",          nombre: "Romanos",          abr: "Rom",  caps: 16,  t: "NT" },
  { id: "1corintios",      num: 46, api: "1corinthians",    nombre: "1 Corintios",      abr: "1Co",  caps: 16,  t: "NT" },
  { id: "2corintios",      num: 47, api: "2corinthians",    nombre: "2 Corintios",      abr: "2Co",  caps: 13,  t: "NT" },
  { id: "galatas",         num: 48, api: "galatians",       nombre: "Gálatas",          abr: "Gál",  caps: 6,   t: "NT" },
  { id: "efesios",         num: 49, api: "ephesians",       nombre: "Efesios",          abr: "Ef",   caps: 6,   t: "NT" },
  { id: "filipenses",      num: 50, api: "philippians",     nombre: "Filipenses",       abr: "Fil",  caps: 4,   t: "NT" },
  { id: "colosenses",      num: 51, api: "colossians",      nombre: "Colosenses",       abr: "Col",  caps: 4,   t: "NT" },
  { id: "1tesalonicenses", num: 52, api: "1thessalonians",  nombre: "1 Tesalonicenses", abr: "1Ts",  caps: 5,   t: "NT" },
  { id: "2tesalonicenses", num: 53, api: "2thessalonians",  nombre: "2 Tesalonicenses", abr: "2Ts",  caps: 3,   t: "NT" },
  { id: "1timoteo",        num: 54, api: "1timothy",        nombre: "1 Timoteo",        abr: "1Ti",  caps: 6,   t: "NT" },
  { id: "2timoteo",        num: 55, api: "2timothy",        nombre: "2 Timoteo",        abr: "2Ti",  caps: 4,   t: "NT" },
  { id: "tito",            num: 56, api: "titus",           nombre: "Tito",             abr: "Tit",  caps: 3,   t: "NT" },
  { id: "filemon",         num: 57, api: "philemon",        nombre: "Filemón",          abr: "Flm",  caps: 1,   t: "NT" },
  { id: "hebreos",         num: 58, api: "hebrews",         nombre: "Hebreos",          abr: "Heb",  caps: 13,  t: "NT" },
  { id: "santiago",        num: 59, api: "james",           nombre: "Santiago",         abr: "Stg",  caps: 5,   t: "NT" },
  { id: "1pedro",          num: 60, api: "1peter",          nombre: "1 Pedro",          abr: "1Pe",  caps: 5,   t: "NT" },
  { id: "2pedro",          num: 61, api: "2peter",          nombre: "2 Pedro",          abr: "2Pe",  caps: 3,   t: "NT" },
  { id: "1juan",           num: 62, api: "1john",           nombre: "1 Juan",           abr: "1Jn",  caps: 5,   t: "NT" },
  { id: "2juan",           num: 63, api: "2john",           nombre: "2 Juan",           abr: "2Jn",  caps: 1,   t: "NT" },
  { id: "3juan",           num: 64, api: "3john",           nombre: "3 Juan",           abr: "3Jn",  caps: 1,   t: "NT" },
  { id: "judas",           num: 65, api: "jude",            nombre: "Judas",            abr: "Jud",  caps: 1,   t: "NT" },
  { id: "apocalipsis",     num: 66, api: "revelation",      nombre: "Apocalipsis",      abr: "Ap",   caps: 22,  t: "NT" },
];

export function getLibro(id: string) {
  return LIBROS.find(l => l.id === id) ?? LIBROS.find(l => l.id === "juan")!;
}

// bolls.life supports CORS — call directly from the browser
export function bibleApiUrl(libroId: string, capitulo: number, version = DEFAULT_VERSION) {
  const libro = getLibro(libroId);
  return `https://bolls.life/get-text/${version}/${libro.num}/${capitulo}/`;
}
