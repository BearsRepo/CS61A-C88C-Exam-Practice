// Verified test cases for SQL questions (Run Code, data/sql_runner.js), keyed by PROBLEMS id.
//
// Each case runs on a fresh SQLite database:
//   data     SQL that creates and fills the tables (optional: without it, the question's own tables, sqlSetup in
//            final_questions.js, are used)
//   input    a query run after the student's SQL whose result is checked (e.g. SELECT * FROM big), or '' to check the
//            result of the student's own query
//   columns  column names shown with the expected rows
//   expect   the expected rows; `ordered: true` compares them in order, otherwise as a multiset
//   origin   'exam' (the example result printed in the exam) or 'added' (written for this site)
// The exams show only some rows ("Not all rows are shown"), so added cases use data sets built to tell right answers
// from plausible wrong ones (ties, exactly 20 students, a TA with two discussions, ...).
//
// Validation (tests/verify_sql_bank.js): every case passes with the official answer and every accepted alternative,
// and the suite fails for every wrong multiple-choice option and listed plausible wrong answer. A select-all blank
// is checked one option at a time: each correct option alone passes and each wrong one alone fails. (Run Code does the
// same when a student checks several options: each one is run and tested on its own.)
window.CS61A_SQL_TESTS = (function () {
  const FA25_TABLES = `CREATE TABLE discussions(id, ta, room);
INSERT INTO discussions VALUES (1, 'Rhys', 'VLSB203'), (2, 'Amr', 'Evans2'), (0, 'Janet', 'Soda310'), (12, 'Caleb', 'Cory241'), (3, 'Amr', 'Wheeler150');
CREATE TABLE students(name, discussion_id, keyword);`;
  // n students named <prefix>1..n in discussion d with keyword k (a recursive WITH, so the data stays short)
  const many = (n, prefix, d, k) => `INSERT INTO students
  WITH RECURSIVE i(n) AS (SELECT 1 UNION SELECT n + 1 FROM i WHERE n < ${n})
  SELECT '${prefix}' || n, ${d}, '${k}' FROM i;`;

  const suites = {
    'fa25f-8a': {
      cases: [
        { name: 'The rows printed in the exam', origin: 'exam', input: '', columns: ['keyword', 'total'], expect: [['tortilla', 3]] },
        { name: 'The most frequent keyword comes first alphabetically', origin: 'added', input: '', columns: ['keyword', 'total'], expect: [['apple', 4]],
          data: `CREATE TABLE students(name, discussion_id, keyword);
INSERT INTO students VALUES ('A', 0, 'apple'), ('B', 0, 'zebra'), ('C', 1, 'apple'), ('D', 1, 'mango'),
  ('E', 2, 'apple'), ('F', 2, 'zebra'), ('G', 3, 'apple');
CREATE TABLE discussions(id, ta, room);
INSERT INTO discussions VALUES (0, 'Janet', 'Soda310'), (1, 'Rhys', 'VLSB203'), (2, 'Amr', 'Evans2'), (3, 'Caleb', 'Cory241');` },
        { name: 'Only one keyword', origin: 'added', input: '', columns: ['keyword', 'total'], expect: [['unit2', 2]],
          data: `CREATE TABLE students(name, discussion_id, keyword);
INSERT INTO students VALUES ('Mia', 1, 'unit2'), ('Lu', 1, 'unit2');
CREATE TABLE discussions(id, ta, room);
INSERT INTO discussions VALUES (1, 'Rhys', 'VLSB203');` },
      ],
    },
    'fa25f-8b': {
      cases: [
        { name: 'The rows printed in the exam (no discussion has more than 20 students)', origin: 'exam', input: 'SELECT ta, id FROM big;', columns: ['ta', 'id'], expect: [] },
        { name: 'Exactly 20 students is not more than 20', origin: 'added', input: 'SELECT ta, id FROM big;', columns: ['ta', 'id'], expect: [['Rhys', 1]],
          data: `${FA25_TABLES}
${many(21, 'R', 1, 'tortilla')}
${many(20, 'A', 2, 'kickstart')}
${many(3, 'J', 0, 'unit2')}` },
        { name: 'Two big discussions, and a TA whose two discussions together have more than 20', origin: 'added', input: 'SELECT ta, id FROM big;', columns: ['ta', 'id'], expect: [['Rhys', 1], ['Caleb', 12]],
          data: `${FA25_TABLES}
${many(25, 'R', 1, 'tortilla')}
${many(22, 'C', 12, 'kickstart')}
${many(15, 'A', 2, 'unit2')}
${many(15, 'W', 3, 'unit2')}` },
      ],
    },
    'sp25f-8a': {
      cases: [
        { name: 'The tables printed in the exam', origin: 'exam', input: '', columns: ['total'], expect: [[3070]] },
        { name: 'Other kinds and sizes', origin: 'added', input: '', columns: ['total'], expect: [[12.5]],
          data: `CREATE TABLE who(name, size, kind);
INSERT INTO who VALUES ('fern', 10.0, 'plant'), ('pebble', 5.0, 'rock'), ('moss', 2.5, 'plant');
CREATE TABLE kinds(living, what);
INSERT INTO kinds VALUES ('yes', 'plant'), ('no', 'rock');` },
      ],
    },
    'sp25f-8b': {
      cases: [
        { name: 'The tables printed in the exam', origin: 'exam', input: '', columns: ['name', 'COUNT(*)'],
          expect: [['bombardiro crocodillo', 1], ['brr brr patapim', 2], ['capuchino assassino', 2], ['chimpanzini bananini', 2], ['lirili larila', 1], ['tralalero tralala', 2]] },
        { name: 'Exactly half the size, and equal sizes', origin: 'added', input: '', columns: ['name', 'COUNT(*)'],
          expect: [['big', 2], ['half', 2], ['twin', 2]],
          data: `CREATE TABLE who(name, size, kind);
INSERT INTO who VALUES ('big', 100.0, 'mammal'), ('twin', 100.0, 'mammal'), ('half', 50.0, 'reptile'), ('tiny', 10.0, 'object');
CREATE TABLE kinds(living, what);
INSERT INTO kinds VALUES ('yes', 'mammal'), ('yes', 'reptile'), ('no', 'object');` },
      ],
    },
    'fa24f-8': {
      cases: [
        { name: 'The tables printed in the exam', origin: 'exam', input: '', columns: ['name', 'job'],
          expect: [['vander', 'barkeep'], ['silco', 'chembaron'], ['ekko', 'firelight'], ['jinx', 'rebel']] },
        { name: 'A job shared with someone outside the council’s regions still counts as unique', origin: 'added', input: '', columns: ['name', 'job'],
          expect: [['ana', 'enforcer'], ['cid', 'baker']],
          data: `CREATE TABLE who(name, region, job);
INSERT INTO who VALUES ('ana', 'zaun', 'enforcer'), ('bo', 'noxus', 'enforcer'), ('cid', 'piltover', 'baker'),
  ('dee', 'zaun', 'scientist'), ('eli', 'piltover', 'scientist');
CREATE TABLE gov(place, ruler);
INSERT INTO gov VALUES ('noxus', 'triumvirate'), ('zaun', 'council'), ('piltover', 'council');` },
      ],
    },
    'sp24f-3d': {
      cases: [
        { name: 'The dominos table printed in the exam', origin: 'exam', input: '', columns: ['id', 'm', 'n', 'COUNT(*)'],
          expect: [[0, 3, 2, 2], [2, 6, 3, 3], [4, 3, 2, 2], [5, 2, 6, 1]] },
        { name: 'A double (2-2) and a match on either number', origin: 'added', input: '', columns: ['id', 'm', 'n', 'COUNT(*)'],
          expect: [[0, 1, 2, 2], [1, 2, 2, 2], [2, 5, 2, 2], [3, 7, 5, 1]],
          data: `CREATE TABLE dominos AS
  SELECT 0 AS id, 1 AS m, 2 AS n UNION
  SELECT 1      , 2     , 2      UNION
  SELECT 2      , 5     , 2      UNION
  SELECT 3      , 7     , 5;` },
      ],
    },
    'fa23f-8': {
      cases: [
        { name: 'The tables printed in the exam', origin: 'exam', input: '', columns: ['flavor', 'total'],
          expect: [['chocolate', 12], ['cinnamon', 9], ['vanilla', 6]] },
        { name: 'The cheaper dough listed last, and a flavor with one dough', origin: 'added', input: '', columns: ['flavor', 'total'],
          expect: [['glazed', 5], ['jelly', 8]],
          data: `CREATE TABLE donuts(kind, flavor);
INSERT INTO donuts VALUES ('raised', 'glazed'), ('old', 'glazed'), ('cake', 'glazed'), ('raised', 'jelly');
CREATE TABLE prices(dough, price);
INSERT INTO prices VALUES ('raised', 4), ('old', 3), ('cake', 1);
CREATE TABLE quantity(choice, k);
INSERT INTO quantity VALUES ('glazed', 5), ('jelly', 2);` },
      ],
    },
    'sp23f-7': {
      cases: [
        { name: 'The tables printed in the exam', origin: 'exam', input: '', columns: ['course', 'seats'], expect: [['61A', 1600]] },
        { name: 'A course in three rooms, one in a single room, and an unused room', origin: 'added', input: '', columns: ['course', 'seats'],
          expect: [['61C', 1640], ['16A', 1600]],
          data: `CREATE TABLE finals(hall, course);
INSERT INTO finals VALUES ('RSF', '61C'), ('Wheeler', '61C'), ('310 Soda', '61C'), ('Dwinelle', '70'),
  ('RSF', '16A'), ('Wheeler', '16A');
CREATE TABLE sizes(room, seats);
INSERT INTO sizes VALUES ('RSF', 900), ('Wheeler', 700), ('310 Soda', 40), ('Dwinelle', 300), ('Cory', 100);` },
      ],
    },
    'fa22f-4c': {
      cases: [
        { name: 'The table printed in the exam', origin: 'exam', input: '', columns: ['num', 'num'], expect: [[299, 1721]] },
        { name: 'Other numbers, with the pair at the ends', origin: 'added', input: '', columns: ['num', 'num'], expect: [[20, 2000]],
          data: `CREATE TABLE s AS
  SELECT 2000 as num UNION SELECT 500 UNION SELECT 1000 UNION SELECT 7 UNION SELECT 20;` },
      ],
    },
    'fa22f-9': {
      cases: [
        { name: 'The tables printed in the exam (rows in order of total attack)', origin: 'exam', input: 'SELECT * FROM Attack;', ordered: true, columns: ['Name', 'TotalAttack'],
          expect: [['Maushold', 160], ['Farigiraf', 170], ['Cyclizard', 180], ['Meoscadera', 220], ['Rattata', 290]] },
        { name: 'Two Pokemon that share a move, listed in a different order', origin: 'added', input: 'SELECT * FROM Attack;', ordered: true, columns: ['Name', 'TotalAttack'],
          expect: [['Pichu', 15], ['Eevee', 105]],
          data: `CREATE TABLE Pokemon(Name, Type1, Type2, Move1, Move2, BaseAttack, BaseDefense);
INSERT INTO Pokemon VALUES ('Eevee', 'Normal', 'None', 'Bite', 'Tackle', 50, 50), ('Pichu', 'Electric', 'None', 'Tackle', 'Charm', 5, 5);
CREATE TABLE Moves(Name, MoveAttack, MoveDefense);
INSERT INTO Moves VALUES ('Tackle', 10, 0), ('Charm', 0, 10), ('Bite', 45, 5);` },
      ],
    },
    'fa21f-5c': {
      cases: [
        { name: 'The study guide’s dogs and parents tables', origin: 'exam', input: '', columns: ['parent'], expect: [['Abraham'], ['Fillmore']] },
        { name: 'A parent with two short-furred children, and one with none', origin: 'added', input: '', columns: ['parent'], expect: [['Bo']],
          data: `CREATE TABLE parents(parent, child);
INSERT INTO parents VALUES ('Ace', 'Bo'), ('Ace', 'Cy'), ('Bo', 'Di'), ('Bo', 'Ed'), ('Cy', 'Fy');
CREATE TABLE dogs(name, fur, height);
INSERT INTO dogs VALUES ('Ace', 'short', 30), ('Bo', 'short', 30), ('Cy', 'short', 30), ('Di', 'short', 30), ('Ed', 'long', 30), ('Fy', 'curly', 30);` },
      ],
    },
    'fa20f-4c': {
      cases: [
        { name: 'The llama family from the exam', origin: 'exam', input: '', columns: ['parent'], expect: [['Finley'], ['Frankie']] },
        { name: 'A smaller family with one multigenerational llama', origin: 'added', input: '', columns: ['parent'], expect: [['P']],
          data: `CREATE TABLE family(parent, child);
INSERT INTO family VALUES ('P', 'C1'), ('Q', 'C1'), ('P', 'C2'), ('C2', 'G'), ('Q', 'G'), ('R', 'C2');` },
        { name: 'P and P’s child C are both parents of Y (one row per matching combination)', origin: 'added', input: '', columns: ['parent'], expect: [['P'], ['P']],
          data: `CREATE TABLE family(parent, child);
INSERT INTO family VALUES ('P', 'C'), ('C', 'Y'), ('P', 'Y');` },
      ],
    },
    // ── Data C88C Fall 2024 Final ──
    'c88-fa24f-2a': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["brand"], expect: [["Bibigo Mandu"], ["Surasang Gyoza"], ["Trader Joe's Soup Dumplings"]], ordered: true },
        { name: "Heaviest pack or biggest count is not the thickest dumpling", origin: 'added', input: "", columns: ["brand"], expect: [["Tiny"], ["Thick"], ["Mid"]], ordered: true, data: `CREATE TABLE dumplings(brand, weight, count);
INSERT INTO dumplings VALUES ('Heavy', 40.0, 40.0), ('Thick', 30.0, 10.0), ('Tiny', 4.0, 1.0), ('Mid', 20.0, 10.0), ('Many', 50.0, 100.0);
CREATE TABLE prices(brand, storeA, storeB);
INSERT INTO prices VALUES ('Heavy', 9.0, 8.0), ('Thick', 5.0, 6.0), ('Tiny', 2.0, 1.5), ('Mid', 4.0, 4.0), ('Many', 10.0, 2.0);` },
      ],
    },
    'c88-fa24f-2b': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["brand"], expect: [["Wei Chuan Pork and Cabbage"], ["Bibigo Mandu"], ["Twin Marquis"], ["Mila Soup Dumpling"]], ordered: true },
        { name: "Equal prices are not cheaper; cost per ounce, not price, sets the order", origin: 'added', input: "", columns: ["brand"], expect: [["Many"], ["Heavy"], ["Tiny"]], ordered: true, data: `CREATE TABLE dumplings(brand, weight, count);
INSERT INTO dumplings VALUES ('Heavy', 40.0, 40.0), ('Thick', 30.0, 10.0), ('Tiny', 4.0, 1.0), ('Mid', 20.0, 10.0), ('Many', 50.0, 100.0);
CREATE TABLE prices(brand, storeA, storeB);
INSERT INTO prices VALUES ('Heavy', 9.0, 8.0), ('Thick', 5.0, 6.0), ('Tiny', 2.0, 1.5), ('Mid', 4.0, 4.0), ('Many', 10.0, 2.0);` },
      ],
    },
    // ── Data C88C Fall 2025 and Spring 2025 Finals ──
    'c88-fa25f-9a': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["name", "rent", "location", "single", "distance"], expect: [["Standard", 1400, "South", 0, 0.2], ["Modera", 1300, "North", 0, 0.6], ["Edgewater", 2500, "San Francisco", 0, 13.9], ["NEMA", 2800, "San Francisco", 1, 11.7], ["Blake", 1200, "Downtown", 1, 1.0], ["Panoramic", 1100, "South", 0, 0.5], ["Hearst", 800, "North", 1, 0.6]] },
      ],
    },
    'c88-fa25f-9b': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["staff_name", "in_state", "apartment_name", "budget_surplus"], expect: [["Alicia", 0, "Identity", 200], ["Dhruv", 0, "Dwight", 0], ["Grace B", 1, "Berk", 300], ["Grace X", 0, "Identity", 1000], ["Grace X", 0, "Blake", 700], ["Maryam", 1, "Modera", 700], ["Mike Baller", 1, "NEMA", 200], ["Mira", 1, "Berk", 200], ["Orazaly", 0, "Hearst", 300], ["Rebecca", 1, "Dwight", 500], ["Reema", 1, "Hearst", 350], ["Thompson", 0, "Panoramic", 200]], ordered: true },
      ],
    },
    'c88-fa25f-9c': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["in_state", "average_budget_surplus"], expect: [[0, 392.0], [1, 367.5]] },
      ],
    },
    'c88-sp25f-8a': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["pid", "name", "start", "end"], expect: [["0182", "Mira", "San Francisco", "Honolulu"], ["1029", "Ramya", "San Francisco", "Vancouver"], ["2718", "Alicia", "Taipei", "Irvine"], ["3413", "Dhruv", "Chicago", "Honolulu"], ["3791", "Edwin", "San Diego", "Seoul"], ["6371", "Isabelle", "Los Angeles", "San Francisco"], ["8888", "Ethan", "San Francisco", "Bali"], ["9201", "John Amongus", "Philadelphia", "Phoenix"]] },
        { name: "A round trip is left out", origin: 'added', input: "", columns: ["pid", "name", "start", "end"], expect: [["1", "Ana", "San Francisco", "X"], ["2", "Ben", "San Francisco", "Y"], ["3", "Cal", "Oakland", "Z"], ["4", "Dee", "San Francisco", "W"], ["6", "Fay", "Oakland", "V"], ["7", "Gus", "Oakland", "U"], ["8", "Hal", "Oakland", "T"]], data: `CREATE TABLE first_flight(pid, name, airline, start, end, international, duration);
INSERT INTO first_flight VALUES ('1', 'Ana', 'Alpha', 'San Francisco', 'B', FALSE, 1), ('2', 'Ben', 'Alpha', 'San Francisco', 'C', TRUE, 5),
  ('3', 'Cal', 'Beta', 'Oakland', 'D', TRUE, 9), ('4', 'Dee', 'Alpha', 'San Francisco', 'E', TRUE, 2),
  ('5', 'Eve', 'Beta', 'Oakland', 'F', FALSE, 3), ('6', 'Fay', 'Gamma', 'Oakland', 'G', FALSE, 4),
  ('7', 'Gus', 'Gamma', 'Oakland', 'H', FALSE, 4), ('8', 'Hal', 'Gamma', 'Oakland', 'I', FALSE, 4);
CREATE TABLE second_flight(pid, start, end, international, duration);
INSERT INTO second_flight VALUES ('1', 'B', 'X', FALSE, 1), ('2', 'C', 'Y', FALSE, 0.5), ('3', 'D', 'Z', FALSE, 1), ('4', 'E', 'W', TRUE, 10),
  ('5', 'F', 'Oakland', FALSE, 1), ('6', 'G', 'V', FALSE, 1), ('7', 'H', 'U', FALSE, 1), ('8', 'I', 'T', FALSE, 1);` },
      ],
    },
    'c88-sp25f-8b': {
      cases: [
        { name: "The rows printed in the exam (Ramya and Reema tie, so any order is accepted)", origin: 'exam', input: "", columns: ["name", "trip_length"], expect: [["Ethan", 18.5], ["Mira", 15], ["Grace X", 11.0], ["Lia", 9.0], ["Ramya", 3], ["Reema", 3.0]] },
        { name: "Longest trip first; only trips starting in San Francisco", origin: 'added', input: "", columns: ["name", "trip_length"], expect: [["Dee", 12], ["Ben", 5.5], ["Ana", 2]], ordered: true, data: `CREATE TABLE first_flight(pid, name, airline, start, end, international, duration);
INSERT INTO first_flight VALUES ('1', 'Ana', 'Alpha', 'San Francisco', 'B', FALSE, 1), ('2', 'Ben', 'Alpha', 'San Francisco', 'C', TRUE, 5),
  ('3', 'Cal', 'Beta', 'Oakland', 'D', TRUE, 9), ('4', 'Dee', 'Alpha', 'San Francisco', 'E', TRUE, 2),
  ('5', 'Eve', 'Beta', 'Oakland', 'F', FALSE, 3), ('6', 'Fay', 'Gamma', 'Oakland', 'G', FALSE, 4),
  ('7', 'Gus', 'Gamma', 'Oakland', 'H', FALSE, 4), ('8', 'Hal', 'Gamma', 'Oakland', 'I', FALSE, 4);
CREATE TABLE second_flight(pid, start, end, international, duration);
INSERT INTO second_flight VALUES ('1', 'B', 'X', FALSE, 1), ('2', 'C', 'Y', FALSE, 0.5), ('3', 'D', 'Z', FALSE, 1), ('4', 'E', 'W', TRUE, 10),
  ('5', 'F', 'Oakland', FALSE, 1), ('6', 'G', 'V', FALSE, 1), ('7', 'H', 'U', FALSE, 1), ('8', 'I', 'T', FALSE, 1);` },
      ],
    },
    'c88-sp25f-8c': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["airline", "COUNT(*)"], expect: [["United", 3]] },
        { name: "Exactly 2 international flights is enough", origin: 'added', input: "", columns: ["airline", "COUNT(*)"], expect: [["Alpha", 2]], data: `CREATE TABLE first_flight(pid, name, airline, start, end, international, duration);
INSERT INTO first_flight VALUES ('1', 'Ana', 'Alpha', 'San Francisco', 'B', FALSE, 1), ('2', 'Ben', 'Alpha', 'San Francisco', 'C', TRUE, 5),
  ('3', 'Cal', 'Beta', 'Oakland', 'D', TRUE, 9), ('4', 'Dee', 'Alpha', 'San Francisco', 'E', TRUE, 2),
  ('5', 'Eve', 'Beta', 'Oakland', 'F', FALSE, 3), ('6', 'Fay', 'Gamma', 'Oakland', 'G', FALSE, 4),
  ('7', 'Gus', 'Gamma', 'Oakland', 'H', FALSE, 4), ('8', 'Hal', 'Gamma', 'Oakland', 'I', FALSE, 4);
CREATE TABLE second_flight(pid, start, end, international, duration);
INSERT INTO second_flight VALUES ('1', 'B', 'X', FALSE, 1), ('2', 'C', 'Y', FALSE, 0.5), ('3', 'D', 'Z', FALSE, 1), ('4', 'E', 'W', TRUE, 10),
  ('5', 'F', 'Oakland', FALSE, 1), ('6', 'G', 'V', FALSE, 1), ('7', 'H', 'U', FALSE, 1), ('8', 'I', 'T', FALSE, 1);` },
      ],
    },
    // ── Data C88C Spring 2024 Final ──
    'c88-sp24f-10a': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["name", "msg_pref"], expect: [["Karim", "messenger"], ["Sean", "instagram"], ["Ethan", "slack"], ["Nicholas", "text"]] },
      ],
    },
    'c88-sp24f-10b': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["name", "snack_pref"], expect: [["Angela", "fruit"], ["John", "fruit"], ["Michelle", "chips"], ["Richik", "fruit"], ["Satleen", "chips"]], ordered: true },
        { name: "Names stored out of order", origin: 'added', input: "", columns: ["name", "snack_pref"], expect: [["Amy", "chips"], ["Bo", "chips"], ["Cy", "fruit"], ["Di", "fruit"], ["Max", "cookies"], ["Zed", "fruit"]], ordered: true, data: `CREATE TABLE staff(name, drink_pref, msg_pref, snack_pref, fav_game);
INSERT INTO staff VALUES ('Zed', 'tea', 'text', 'fruit', 'Big'), ('Yan', 'soda', 'email', 'chips', 'Small'), ('Amy', 'soda', 'slack', 'chips', 'Big'),
  ('Max', 'tea', 'text', 'cookies', 'Huge'), ('Bo', 'soda', 'text', 'chips', 'Huge'), ('Cy', 'soda', 'text', 'fruit', 'Huge'), ('Di', 'tea', 'text', 'fruit', 'Big');
CREATE TABLE games(name, company, genre, max_players);
INSERT INTO games VALUES ('Big', 'Riot', 'Zany', 10), ('Small', 'Riot', 'Arcade', 2), ('Huge', 'Mojang', 'Arcade', 50);` },
      ],
    },
    'c88-sp24f-10c': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["genre", "total_staff"], expect: [["Party", 6], ["Indie", 5], ["FPS", 2], ["Moba", 2]], ordered: true },
        { name: "The bigger genre comes first even though its name is later", origin: 'added', input: "", columns: ["genre", "total_staff"], expect: [["Arcade", 4], ["Zany", 3]], ordered: true, data: `CREATE TABLE staff(name, drink_pref, msg_pref, snack_pref, fav_game);
INSERT INTO staff VALUES ('Zed', 'tea', 'text', 'fruit', 'Big'), ('Yan', 'soda', 'email', 'chips', 'Small'), ('Amy', 'soda', 'slack', 'chips', 'Big'),
  ('Max', 'tea', 'text', 'cookies', 'Huge'), ('Bo', 'soda', 'text', 'chips', 'Huge'), ('Cy', 'soda', 'text', 'fruit', 'Huge'), ('Di', 'tea', 'text', 'fruit', 'Big');
CREATE TABLE games(name, company, genre, max_players);
INSERT INTO games VALUES ('Big', 'Riot', 'Zany', 10), ('Small', 'Riot', 'Arcade', 2), ('Huge', 'Mojang', 'Arcade', 50);` },
      ],
    },
    'c88-sp24f-10d': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["fav_game", "drink_pref", "staff_count"], expect: [["Mario Party", "soda", 3], ["Valorant", "water", 2]], ordered: true },
        { name: "Only pairs with more than one person", origin: 'added', input: "", columns: ["fav_game", "drink_pref", "staff_count"], expect: [["Huge", "soda", 2], ["Big", "tea", 2]], data: `CREATE TABLE staff(name, drink_pref, msg_pref, snack_pref, fav_game);
INSERT INTO staff VALUES ('Zed', 'tea', 'text', 'fruit', 'Big'), ('Yan', 'soda', 'email', 'chips', 'Small'), ('Amy', 'soda', 'slack', 'chips', 'Big'),
  ('Max', 'tea', 'text', 'cookies', 'Huge'), ('Bo', 'soda', 'text', 'chips', 'Huge'), ('Cy', 'soda', 'text', 'fruit', 'Huge'), ('Di', 'tea', 'text', 'fruit', 'Big');
CREATE TABLE games(name, company, genre, max_players);
INSERT INTO games VALUES ('Big', 'Riot', 'Zany', 10), ('Small', 'Riot', 'Arcade', 2), ('Huge', 'Mojang', 'Arcade', 50);` },
      ],
    },
    // ── Data C88C Spring 2023 Final ──
    'c88-sp23f-13a': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["name", "year"], expect: [["Jade", "Freshman"]] },
      ],
    },
    'c88-sp23f-13b': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["animal", "avg_age"], expect: [["Prairie Dog", 20.0], ["Cat", 19.5], ["Capybara", 19.0], ["Frog", 18.0]], ordered: true },
      ],
    },
    'c88-sp23f-13c': {
      cases: [
        { name: "The rows printed in the exam (bark and meow tie, so either order is accepted)", origin: 'exam', input: "", columns: ["sound", "COUNT(*)"], expect: [["ribbit", 1], ["bark", 2], ["meow", 2]] },
        { name: "Smallest count first", origin: 'added', input: "", columns: ["sound", "COUNT(*)"], expect: [["meow", 2], ["hoot", 3]], ordered: true, data: `CREATE TABLE friends(name, age, year, animal);
INSERT INTO friends VALUES ('A', 20, 'Senior', 'Owl'), ('B', 22, 'Senior', 'Owl'), ('C', 19, 'Junior', 'Owl'), ('D', 18, 'Freshman', 'Cat'), ('E', 18, 'Freshman', 'Cat');
CREATE TABLE animals(animal, sound, size, color);
INSERT INTO animals VALUES ('Cat', 'meow', 'small', 'black'), ('Owl', 'hoot', 'small', 'brown');` },
      ],
    },
    // ── Data C88C Fall 2023 Final ──
    'c88-fa23f-11c': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["name", "food_order"], expect: [["Rebecca", "rice"], ["Miha", "chicken"], ["Christy", "soup"], ["Ramya", "tofu"], ["Ananyaa", "tofu"]] },
      ],
    },
    'c88-fa23f-11d': {
      cases: [
        { name: "The rows printed in the exam (Lakers, Mavericks and Warriors tie, so any order of them is accepted)", origin: 'exam', input: "", columns: ["team", "total_staff"], expect: [["Clippers", 3], ["Lakers", 2], ["Mavericks", 2], ["Warriors", 2], ["Suns", 1]] },
        { name: "Most popular team first", origin: 'added', input: "", columns: ["team", "total_staff"], expect: [["Bees", 3], ["Cats", 2], ["Ants", 1]], ordered: true, data: `CREATE TABLE staff(name, number, frequent_word, food_order, fav_player);
INSERT INTO staff VALUES ('A', 1, 'x', 'rice', 'P1'), ('B', 1, 'x', 'rice', 'P2'), ('C', 1, 'x', 'rice', 'P2'), ('D', 1, 'x', 'rice', 'P2'), ('E', 1, 'x', 'rice', 'P3'), ('F', 1, 'x', 'rice', 'P3');
CREATE TABLE players(name, team, juice, food_order);
INSERT INTO players VALUES ('P1', 'Ants', 'apple', 'rice'), ('P2', 'Bees', 'grape', 'soup'), ('P3', 'Cats', 'apple', 'rice');` },
      ],
    },
    // ── Data C88C Fall 2023 Final (Q11(b), corrected by the official errata) ──
    'c88-fa23f-11b': {
      cases: [
        { name: "The rows printed in the exam", origin: 'exam', input: "", columns: ["name", "fav_player"], expect: [["Ananyaa", "Kawhi Leonard"], ["Christy", "Stephen Curry"], ["Lily", "Lebron James"], ["Michelle", "Luka Doncic"]], ordered: true },
        { name: "Names stored out of order; another player with the same food order does not count", origin: 'added', input: "", columns: ["name", "fav_player"], expect: [["Max", "P2"], ["Zoe", "P1"]], ordered: true, data: `CREATE TABLE staff(name, number, frequent_word, food_order, fav_player);
INSERT INTO staff VALUES ('Zoe', 1, 'x', 'soup', 'P1'), ('Amy', 1, 'x', 'rice', 'P1'), ('Max', 1, 'x', 'rice', 'P2'), ('Bo', 1, 'x', 'soup', 'P2');
CREATE TABLE players(name, team, juice, food_order);
INSERT INTO players VALUES ('P1', 'Ants', 'apple', 'soup'), ('P2', 'Bees', 'grape', 'rice'), ('P3', 'Cats', 'apple', 'soup');` },
      ],
    },
  };
  return { version: 1, suites };
})();
