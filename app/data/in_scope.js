// What is in scope for the current exam. Edit this file each semester; questions.js and final_questions.js never change.
//
// The question bank is past CS 61A Midterm 2 and Final exams. In Fall 2026 the midterms are practice for CS 61A
// Midterm 3 and C88C Midterm 2, which cover about the same material, and the finals are practice for the final.
//
// Source for the midterms: Ed post #1237, "Midterm 3 Practice: Past Midterm 2 Exam Index"
//   https://edstem.org/us/courses/100850/discussion/8416140
// Out of scope this semester: mutating linked lists and trees, repr / __repr__, orders of growth, nonlocal.
// Finals: there is no Ed post for the final yet (2026-11-15). The final is expected to be about 2/3 Python and 1/3
// Gleam + SQL. The midterm rules above are applied to the finals ('inferred'), plus Scheme (replaced by Gleam) and
// async / coroutines (not on this semester's syllabus).
//
// Shape:
//   outOfScopeTopics – topic ids (from TOPICS in questions.js). The topic is shown as not in scope, and a question
//                      whose topics are all out of scope is hidden even if it is not listed below.
//   problems         – keyed by PROBLEMS id. Applies to every part of that problem. A note here is shown in the left
//                      pane: use it when the out-of-scope idea is in the question itself (its text or code).
//   questions        – keyed by QUESTIONS id (one part). Use this when only some parts are affected. A note here is
//                      shown beside that part's answer box: use it when the out-of-scope idea is in the answer.
// Each entry:
//   status: 'out'  – hidden from Practice and Exam mode (still kept in questions.js for later semesters)
//           'note' – still asked, with `note` shown next to it
//   reason / note    – why; shown to students for 'note'
//   source: 'ed'       – listed in the Ed post
//           'inferred' – the post does not cover this exam; the post's rules were applied by us
//
// Problem ids and part ids can look alike (problem 'sp25-3a' vs. part 'sp25-3a'), so keep them in their own maps.
// Check this file with: node tests/verify_in_scope.js

window.CS61A_SCOPE = {
  label: 'CS 61A Midterm 3 and Final / C88C Midterm 2 (Fall 2026)',
  source: 'https://edstem.org/us/courses/100850/discussion/8416140',
  outOfScopeTopics: ['efficiency', 'async', 'scheme'],

  problems: {
    // Spring 2023 Q2 uses __repr__ (the Ed post marks all of Q2)
    'sp23-2a': { status: 'out', reason: 'Uses __repr__', source: 'ed' },
    'sp23-2b': { status: 'out', reason: 'Uses __repr__', source: 'ed' },
    // Fall 2022 Q4(b): chop_head mutates the hydra tree
    'fa22-4b': { status: 'out', reason: 'Mutates a tree', source: 'inferred' },

    'fa25-3': { status: 'note', source: 'ed',
      note: 'The definition below says “repr string”. Here that just means what Python shows when it evaluates a tree (like `Tree(2, [Tree(20), Tree(22)])` on line 4), so the question is still in scope.' },
    'sp25-3a': { status: 'note', source: 'ed',
      note: 'The `Event` class defines a `__repr__` method, which is no longer taught. That method only decides how events look in the tests, so the rest of the question is in scope.' },
    'sp25-3b': { status: 'note', source: 'ed',
      note: 'The `Event` class (from part (a)) defines a `__repr__` method, which is no longer taught. That method only decides how events look in the tests, so the rest of the question is in scope.' },
    'fa23-3': { status: 'note', source: 'ed',
      note: 'The `Book` class defines a `__str__` method, which is no longer taught. Blank (f) depends on that method, so it was removed. The other blanks are in scope.' },
    'fa22-1': { status: 'note', source: 'inferred',
      note: 'The `Snake` class defines a `__str__` method, which is no longer taught. All you need to know: printing a `Snake` object shows its name.' },
    'sp24-1': { status: 'note', source: 'ed',
      note: 'Parts (a) and (b) use the `shake` function, which mutates a linked list (out of scope), so they were removed, along with part (d) (orders of growth). The remaining part (c) only uses the `cruel` function and is in scope.' },

    // Fall 2025 Final
    'fa25f-2c': { status: 'out', reason: 'Orders of growth', source: 'inferred' },
    'fa25f-5': { status: 'out', reason: 'Async / coroutines (not on this semester’s syllabus)', source: 'inferred' },
    'fa25f-6b': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa25f-6c': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa25f-9a': { status: 'out', reason: 'Scheme (replaced by Gleam; A+ question)', source: 'inferred' },
    'fa25f-7': { status: 'note', source: 'inferred',
      note: 'The `Student` and `DiscGroup` classes define `__str__` methods, which are no longer taught. All you need to know: printing an object shows the string its `__str__` returns, and `{self.group}` in an f-string puts in the group’s string.' },
    // Spring 2025 Final
    'sp25f-2c': { status: 'out', reason: 'Orders of growth', source: 'inferred' },
    'sp25f-4b': { status: 'out', reason: 'Mutates a tree', source: 'inferred' },
    'sp25f-7a': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'sp25f-7b': { status: 'out', reason: 'Scheme macros (replaced by Gleam)', source: 'inferred' },
    'sp25f-5': { status: 'note', source: 'inferred',
      note: 'The `Rower` class defines a `__str__` method, which is no longer taught. All you need to know: printing a rower (as `print(self, ...)` and `print(hank)` do) shows the string `__str__` returns. Blank (c) is inside that method, but it is an ordinary dictionary lookup.' },
    // Fall 2024 Final
    'fa24f-5c': { status: 'out', reason: 'Mutates a linked list', source: 'inferred' },
    'fa24f-5c-v': { status: 'out', reason: 'Mutates a linked list', source: 'inferred' },
    'fa24f-7a': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa24f-7b': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa24f-7b-iv': { status: 'out', reason: 'Scheme and orders of growth', source: 'inferred' },
    'fa24f-7c': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa24f-9a': { status: 'out', reason: 'Scheme macros (replaced by Gleam; A+ question)', source: 'inferred' },
    'fa24f-4b': { status: 'note', source: 'inferred',
      note: 'The `MissDict` class defines a `__str__` method, which is no longer taught. All you need to know: `print(double)` shows the string `__str__` returns.' },
    'fa24f-6b': { status: 'note', source: 'inferred',
      note: 'The second example prints a tree with the course `Tree` class’s `__str__` method (one label per line, indented by depth), which is no longer taught. The first example shows the same kind of tree with `repr`.' },
    // Spring 2024 Final
    'sp24f-4a': { status: 'out', reason: 'Mutates a linked list', source: 'inferred' },
    'sp24f-4b': { status: 'out', reason: 'Mutates a linked list (calls cycle)', source: 'inferred' },
    'sp24f-5b': { status: 'out', reason: 'Mutates a tree', source: 'inferred' },
    'sp24f-5b-iv': { status: 'out', reason: 'Orders of growth', source: 'inferred' },
    'sp24f-6': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'sp24f-6d': { status: 'out', reason: 'Scheme (replaced by Gleam; A+ question)', source: 'inferred' },
    'sp24f-7': { status: 'out', reason: 'Mutates a tree (A+ question)', source: 'inferred' },
    'sp24f-3a': { status: 'note', source: 'inferred',
      note: 'The `Domino` class defines a `__repr__` method, which is no longer taught. All you need to know: Python shows a domino using the string `__repr__` returns, so `Domino([3, 4])` is shown as `3-4`. Blank (e) writes that string.' },
    'sp24f-3b': { status: 'note', source: 'inferred',
      note: 'Dominos are shown as `5-2`, `3-4` and so on because of the `Domino` class’s `__repr__` method (from part (a)), which is no longer taught.' },
    'sp24f-3b-ii': { status: 'note', source: 'inferred',
      note: 'Dominos are shown as `5-2`, `4-3` and so on because of the `Domino` class’s `__repr__` method, which is no longer taught.' },
    'sp24f-3c': { status: 'note', source: 'inferred',
      note: '`repr(d)` calls the `Domino` class’s `__repr__` method (no longer taught): it gives a string like `\'3-4\'`. That is all you need for blanks (g) and (k).' },
    // Fall 2023 Final
    'fa23f-5': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa23f-6': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa23f-6d': { status: 'out', reason: 'Scheme (replaced by Gleam; A+ question)', source: 'inferred' },
    'fa23f-7': { status: 'out', reason: 'Scheme (replaced by Gleam)', source: 'inferred' },
    'fa23f-7d': { status: 'out', reason: 'Scheme interpreter (scheme_eval)', source: 'inferred' },
    'fa23f-9a': { status: 'out', reason: 'Scheme macros (replaced by Gleam; A+ question)', source: 'inferred' },
    'fa23f-3': { status: 'note', source: 'inferred',
      note: 'The `Expression` and `Word` classes define `__str__` methods, which are no longer taught. All you need to know: `print(e)` and `str(e)` use the string `__str__` returns, and `str(self.then)` calls the next word’s `__str__`.' },
  },

  questions: {
    // Fall 2025
    'fa25-1c': { status: 'out', reason: 'Orders of growth', source: 'ed' },
    // Spring 2025
    'sp25-2c': { status: 'out', reason: 'Orders of growth', source: 'ed' },
    // Fall 2024
    'fa24-2c': { status: 'out', reason: 'Orders of growth', source: 'ed' },
    // Spring 2024
    'sp24-1a': { status: 'out', reason: 'Mutates a linked list', source: 'ed' },
    'sp24-1b': { status: 'out', reason: 'Mutates a linked list', source: 'ed' },
    'sp24-1d': { status: 'out', reason: 'Orders of growth', source: 'ed' },
    'sp24-4aplus': { status: 'out', reason: 'Mutates a tree’s branches (A+ question)', source: 'ed' },
    // Fall 2023
    'fa23-3f': { status: 'out', reason: 'Answer choices use repr', source: 'ed' },
    'fa23-6c': { status: 'out', reason: 'Orders of growth', source: 'ed' },
    // Spring 2023
    'sp23-3a-iii': { status: 'out', reason: 'Orders of growth', source: 'ed' },
    'sp23-4e': { status: 'out', reason: 'Mutates a tree’s branches', source: 'ed' },
    // Fall 2022
    'fa22-1c': { status: 'note', source: 'inferred',
      note: 'This answer uses the `__str__` method: printing the `snek` object shows its name.' },
    'fa22-1d': { status: 'note', source: 'inferred',
      note: 'This answer uses the `__str__` method: `f"{self} crawled"` puts the snake’s name in the string.' },
    'fa22-5b-i': { status: 'out', reason: 'Orders of growth', source: 'inferred' },
    'fa22-5b-ii': { status: 'out', reason: 'Orders of growth', source: 'inferred' },
    // Fall 2021
    'fa21-4b-iii': { status: 'out', reason: 'Orders of growth', source: 'inferred' },
  },
};
