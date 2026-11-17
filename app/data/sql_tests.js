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
  };
  return { version: 1, suites };
})();
