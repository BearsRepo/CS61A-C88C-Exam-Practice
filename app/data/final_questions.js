// Past CS 61A FINAL exams, added to the question bank in questions.js (load this file right after it).
//
// Content source: CS 61A Final of Fall 2025, Spring 2025, Fall 2024, Spring 2024, Fall 2023, Spring 2023, Fall 2022, Fall 2021 and Fall 2020 (exam + official solutions, final/ in the repo),
// transcribed for a personal/prototype build. Verify course-material permissions before publishing.
//
// Same shapes as questions.js (EXAMS, PROBLEMS, QUESTIONS, ANSWER_KEY), plus:
//   EXAMS[id].kind  – 'final' (questions.js marks its exams 'mt2'); Exam Mode lists full exams by kind.
//   PROBLEMS[id].lang – 'sql' for SQL questions. They stay part of their exam (a full past final keeps its SQL
//                       question in place) and are the SQL bank in Practice Mode; Python sets never include them.
//   PROBLEMS[id].sqlSetup – SQL that creates the tables printed with an SQL question (the rows the exam shows).
//                       Run Code runs it before the student's query; tests in data/sql_tests.js bring their own data.
//
// Every question of both PDFs is transcribed, including the ones out of scope this semester (Scheme, order of
// growth, async, tree mutation); data/in_scope.js hides those, as it does for the midterms. The Scheme code is shown
// with the Python editor because nothing in scope uses it.
//
// Ids: exams fa25f / sp25f; problems `<exam>-<question number><sub-question>`; parts `<exam>-<question><blank>`
// (blank letters restart at each numbered question, as in the PDFs). Problem and part ids can look alike.
(function () {
  const B = window.CS61A_BANK;
  const code = (s) => s.replace(/^\n/, '').replace(/\s+$/, '');

  // complete: every question of the PDF is transcribed. Fall 2025 and Spring 2025 total 75 points (A+ questions are 0 points).
  const EXAMS = {
    fa25f: { id: 'fa25f', label: 'Fall 2025 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    sp25f: { id: 'sp25f', label: 'Spring 2025 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
  };

  const FA25_STUDENTS = code(`
students:
| name      | discussion_id | keyword   |
|-----------|---------------|-----------|
| Chris     | 2             | kickstart |
| Pranav    | 0             | tortilla  |
| Sebastian | 0             | tortilla  |
| Lavanya   | 2             | kickstart |
| Mia       | 1             | unit2     |
| Mahanth   | 0             | tortilla  |
| ...       |               |           |

discussions:
| id | ta    | room    |
|----|-------|---------|
| 1  | Rhys  | VLSB203 |
| 2  | Amr   | Evans2  |
| 0  | Janet | Soda310 |
| ...|       |         |
`);
  const FA25_SETUP = code(`
CREATE TABLE students(name, discussion_id, keyword);
INSERT INTO students VALUES
  ('Chris', 2, 'kickstart'), ('Pranav', 0, 'tortilla'), ('Sebastian', 0, 'tortilla'),
  ('Lavanya', 2, 'kickstart'), ('Mia', 1, 'unit2'), ('Mahanth', 0, 'tortilla');
CREATE TABLE discussions(id, ta, room);
INSERT INTO discussions VALUES (1, 'Rhys', 'VLSB203'), (2, 'Amr', 'Evans2'), (0, 'Janet', 'Soda310');
`);
  const SP25_TABLES = code(`
who:
| name                 | size   | kind    |
|----------------------|--------|---------|
| tralalero tralala    | 800.0  | reptile |
| bombardiro crocodillo| 600.0  | reptile |
| lirili larila        | 1500.0 | mammal  |
| capuchino assassino  | 60.0   | object  |
| brr brr patapim      | 80.0   | mammal  |
| chimpanzini bananini | 90.0   | mammal  |
| tung tung tung sahur | 200.0  | object  |

kinds:
| living | what    |
|--------|---------|
| yes    | mammal  |
| yes    | reptile |
| no     | object  |
`);
  const SP25_SETUP = code(`
CREATE TABLE who(name, size, kind);
INSERT INTO who VALUES
  ('tralalero tralala', 800.0, 'reptile'), ('bombardiro crocodillo', 600.0, 'reptile'),
  ('lirili larila', 1500.0, 'mammal'), ('capuchino assassino', 60.0, 'object'),
  ('brr brr patapim', 80.0, 'mammal'), ('chimpanzini bananini', 90.0, 'mammal'),
  ('tung tung tung sahur', 200.0, 'object');
CREATE TABLE kinds(living, what);
INSERT INTO kinds VALUES ('yes', 'mammal'), ('yes', 'reptile'), ('no', 'object');
`);

  const PROBLEMS = {
    // ───────────────────────────── Fall 2025 Final ─────────────────────────────
    'fa25f-1': {
      exam: 'fa25f', number: '1', title: 'What Would Python Display?', points: 5,
      intro: 'Assume the following code has been executed.',
      code: code(`
square = lambda x: x * x

def times(a, b, c):
    x = a
    f = lambda y: x * y
    x = b
    g = (lambda q: lambda r: q * r)(x)
    x = c
    print(f(g(x)))

def delay(s):
    last = None
    for x in s:
        if last:
            print(x)
            return last
        last = x

w = [print, abs, square, print]
`),
      outro: 'Write the output that would be displayed by evaluating each expression below. If an error occurs, write *ERROR*, but also write any output that is displayed before the error occurs.\n\nExample: For `print(square(5))` you should answer 25.',
    },
    'fa25f-2': {
      // The PDF's Q2 is 5 points: (a) 2 + (b) 2 + (c) 1. Part (c) is its own problem (fa25f-2c, below).
      exam: 'fa25f', number: '2', title: 'Do You Copy?', points: 4,
      intro: 'Draw an environment diagram to answer the following questions. Only the questions will be scored.',
      code: code(`
def copy(s):
    return s[:1] + s[1:]
inner = [5, [6]]
first = copy(inner)
second = inner[1]
inner[0] = 7
inner.append(7)
inner[1].append(7)
inner[1] = 8
print(first)
print(second)
`),
      lineNumbers: true,
    },
    'fa25f-2c': {
      exam: 'fa25f', number: '2(c)', title: 'Do You Copy? — order of growth', points: 1,
      intro: 'What is the order of growth of the time it takes to evaluate `[sum(s[:i]) for i in range(len(s))]` in terms of the length of `s` for a list of numbers `s`. The `sum` function takes linear time in the length of its input. Slicing a list takes linear time in the length of the slice. Creating a `range` and calling `len` on a list both take constant time (one step each).',
      code: code(`
[sum(s[:i]) for i in range(len(s))]
`),
    },
    'fa25f-3a': {
      exam: 'fa25f', number: '3(a)', title: 'Math Placement Exam — is_equation', points: 5,
      intro: '**Definition.** An *equation* is a list of numbers and operators. A *number* is either an integer or a `?`. An *operator* is either `+`, `-`, or `=`. Equations start and end with a number, alternate between numbers and operators, and contain exactly one `=`.\n\nImplement `is_equation`, which takes a list `s`. It returns whether `s` is an equation.',
      code: code(`
def is_equation(s):
    """Return whether the list s contains a well-formed equation.
    >>> is_equation([7, '+', 2, '=', '?', '+', 6])
    True
    >>> is_equation([-7, '+', '?', '=', '?', '-', 6])
    True
    >>> is_equation([-7, '+', 2, '=', '?', '-'])          # No number at the end
    False
    >>> is_equation(['-', 7, '+', 2, '=', '?', '-', 6])   # No number at the start
    False
    >>> is_equation([-7, '+', 2, '?', '+', 6, '=', 9])    # Two adjacent numbers (2 and ?)
    False
    >>> is_equation([-7, '+', 2, '+', '-', 6, '=', 9])    # Two adjacent operators (+ and -)
    False
    >>> is_equation([-7, '+', 2, '=', '?', '=', 6])       # More than one =
    False
    """
    number, equals = True, 0
    for x in s:
        ok = (number and (⟦a⟧)) or (⟦b⟧ ['+', '-', '='])
        if not ok:
            return False
        if x == '=':
            equals += 1
        number = not number
    return ⟦c⟧
`),
    },
    'fa25f-3b': {
      exam: 'fa25f', number: '3(b)', title: 'Math Placement Exam — evaluate', points: 5,
      intro: '**Definition.** A list of integers `answers` *satisfies* an equation if there is one integer per placeholder `?` in the equation, and after replacing each `?` with the corresponding integer from `answers`, the expression on the left of `=` has an equal value to the expression on the right of `=`.\n\nImplement `tally` to complete the implementation of `evaluate`. The `evaluate` function takes an `equation` and a list of integers called `answers` that contains one value for each `?` in the `equation`. It returns `True` if `answers` satisfies the `equation` and `False` otherwise.\n\nThe `count` method of a list takes a value and returns the number of items in the list that are equal to the value.',
      code: code(`
def evaluate(equation, answers):
    """Return whether the equation is true once each ? is filled by the corresponding answer.

    >>> evaluate([7, '-', 2, '=', '?', '+', 4], [1])       # 7 - 2 == 1 + 4
    True
    >>> evaluate([7, '-', 2, '=', '?', '-', 4], [3])       # 7 - 2 != 3 - 4
    False
    >>> evaluate([7, '-', 2, '=', 1, '+', 4], [])          # 7 - 2 == 1 + 4
    True
    >>> evaluate([7, '-', '?', '=', '?', '-', 4], [2, 9])  # 7 - 2 == 9 - 4
    True
    """
    assert is_equation(equation) and len(answers) == equation.count('?')
    eq_iter, ans_iter = iter(equation), iter(answers)
    return tally(eq_iter, ans_iter) == tally(eq_iter, ans_iter)

def tally(eq, ans):
    """A helper function for evaluate that computes the value of one side of an equation,
       stopping either at an = sign or the end of the equation."""
    number, total = True, 0
    multiplier = 1  # should always be either 1 or -1
    for x in eq:
        if ⟦d⟧:
            if x == '?':
                ⟦e⟧
            total += multiplier * x
        else:
            if x == '=':
                ⟦f⟧
            else:
                multiplier = ⟦g⟧[x]  # Hint: use a dictionary
        number = not number
    return total
`),
    },
    'fa25f-3c': {
      exam: 'fa25f', number: '3(c)', title: 'Math Placement Exam — feasible', points: 6,
      intro: 'Implement `feasible`, which takes an `equation` and a range of integers called `allowed`. It returns `True` if it’s possible to satisfy the `equation` using numbers from `allowed` and `False` otherwise. In other words, it returns whether it is possible to replace each `?` in the equation with some number from `allowed` such that the expressions to the left and right of `=` are indeed equal. The same number can replace more than one `?`. Assume `evaluate` is implemented correctly. You may call `evaluate`.',
      code: code(`
def feasible(eq, allowed=range(0, 10)):
    """Return whether it's possible to satisfy the equation eq using numbers from allowed.

    >>> feasible([7, '+', 2, '=', '?', '+', 6])    # the ? could be 3
    True
    >>> feasible(['?', '+', 2, '=', '?', '+', 6])  # the first ? could be 7 and the second 3
    True
    >>> feasible([-7, '+', 2, '=', '?', '+', 6])
    False
    >>> feasible(['?', '+', 5, '=', '?', '-', 6])
    False
    >>> feasible(['?', '+', 5, '=', '?', '-', 6], range(-10, 10))  # -5 and 6, for example
    True
    """
    if '?' not in eq:
        return ⟦h⟧
    n = min([i for i in range(len(eq)) if ⟦i⟧])  # index of the first ?
    return any([⟦j⟧ for x in allowed])
`),
    },
    'fa25f-3d': {
      exam: 'fa25f', number: '3(d)', title: 'Math Placement Exam — solve', points: 5,
      intro: 'Implement `solve`, which takes an `equation` and a range of integers called `allowed`. It returns an iterator over lists of integers, and each of these lists *satisfies* the equation. You may call `evaluate` and `feasible`.',
      code: code(`
def print_all(t):
    for x in t:
        print(x)

def solve(equation, allowed=range(0, 10)):
    """Return an iterator over all answer lists that satisfy an equation.

    >>> print_all(solve([7, '+', 2, '=', '?', '+', 6]))
    [3]
    >>> print_all(solve(['?', '-', 2, '=', '?', '+', 6]))
    [8, 0]
    [9, 1]
    >>> print_all(solve(['?', '=', '?', '+', '?'], range(1, 4)))
    [2, 1, 1]
    [3, 1, 2]
    [3, 2, 1]
    """
    def candidates(n):
        """Yield all possible answer lists with n values."""
        if n == 0:
            yield []
        else:
            for first in allowed:
                for rest in ⟦k⟧:
                    yield ⟦l⟧
    blanks = equation.count('?')  # the number of ? in equation
    return ⟦m⟧(⟦n⟧, candidates(blanks))
`),
    },
    'fa25f-4a': {
      exam: 'fa25f', number: '4(a)', title: 'Trim the Tree — sums', points: 5,
      intro: 'Implement `sums`, which takes a `Tree` of integers `t`. It returns a dictionary in which each node of `t` is a key and the corresponding value is the sum of the labels of the tree rooted at that node.\n\nThe `Tree` class appears on the left side of Page 2 of the Midterm 2 study guide.',
      code: code(`
def sums(t):
    """Return a dictionary from nodes to their label sums.

    >>> t = Tree(2, [Tree(4, [Tree(5)]), Tree(3), Tree(5, [Tree(6), Tree(7)])])
    >>> d = sums(t)
    >>> nodes = [t, t.branches[0], t.branches[0].branches[0], t.branches[2]]
    >>> [d[n] for n in nodes]
    [32, 9, 5, 18]
    """
    result = {}
    def insert(t):
        for b in t.branches:
            ⟦a⟧
        result[t] = ⟦b⟧
    insert(t)
    return result
`),
    },
    'fa25f-4b': {
      exam: 'fa25f', number: '4(b)', title: 'Trim the Tree — one_cut', points: 5,
      intro: 'Implement `one_cut`, which takes a `Tree` of integers `t` and a number `n`. It returns a new tree that has the same labels and structure as `t` but with **one** sub-tree excluded. In other words, the returned tree looks like `t` with a non-root node and its descendents removed. Exclude the non-root node that makes the sum of the remaining labels of the tree as close to `n` as possible (in absolute value). Do not mutate `t`. Assume `t` has at least 2 nodes.',
      code: code(`
def one_cut(t, n):
    """Return a tree like t but omit a node so that the sum of remaining labels is close to n.

    >>> t = Tree(2, [Tree(4, [Tree(5)]), Tree(3), Tree(5, [Tree(6), Tree(7)])])  # sums to 32
    >>> one_cut(t, 30)  # cuts just the 3 to get 29
    Tree(2, [Tree(4, [Tree(5)]), Tree(5, [Tree(6), Tree(7)])])
    >>> one_cut(t, 26)  # cuts just the 6 to get 26
    Tree(2, [Tree(4, [Tree(5)]), Tree(3), Tree(5, [Tree(7)])])
    >>> one_cut(t, 15)  # cuts the 5 node with 6 and 7 below it to get 14
    Tree(2, [Tree(4, [Tree(5)]), Tree(3)])
    >>> one_cut(t, 1)   # 14 is the smallest possible sum after one cut
    Tree(2, [Tree(4, [Tree(5)]), Tree(3)])
    """
    d = sums(t)
    total = d.pop(t)  # remove the root node from the dictionary; total is the sum of its labels
    target = min(d.keys(), key=lambda node: ⟦c⟧)
    def cut(t):
        ⟦d⟧
    ⟦e⟧
`),
    },
    'fa25f-5': {
      exam: 'fa25f', number: '5', title: 'Downloads', points: 4,
      intro: 'The coroutine function `download` fetches a file with the given name. Its implementation is not shown.',
      code: code(`
async def download(filename: str):
    ...

class Downloader():
    def __init__(self, filenames):
        self.filenames = filenames
        self.current_index = 0

    async def download_files(self):
        while self.current_index < len(self.filenames):
            filename = self.filenames[self.current_index]
            self.current_index += 1
            await download(filename)

    async def download_all(self):
        await asyncio.gather(self.download_files(), self.download_files())

d = Downloader(["a", "b", "c", "d"])
asyncio.run(d.download_all())
`),
    },
    'fa25f-6a': {
      exam: 'fa25f', number: '6(a)', title: 'Scheme VS Python — match (Python)', points: 5,
      intro: 'Implement `match`, which takes a linked list of numbers `s` (a `Link` instance or `Link.empty`) and a positive integer `k`. It returns the number of pairs of equal elements that are `k` positions apart in `s`. **Hint:** You may use multiple assignment in your solution: `___ , ___ = ___ , ___`\n\nThe `Link` class appears on the left side of Page 2 of the Midterm 2 study guide.',
      code: code(`
def match(s, k):
    """Return how many pairs of values in linked list s that are k positions apart are equal.
    >>> nums = Link(3, Link(1, Link(4, Link(1, Link(5, Link(2, Link(5, Link(3, Link(5)))))))))
    >>> match(nums, 2)  # 1 and 1; 5 and 5; 5 and 5
    3
    >>> {k: match(nums, k) for k in range(1, 8)}  # k=4: 5 and 5; k=7: 3 and 3
    {1: 0, 2: 3, 3: 0, 4: 1, 5: 0, 6: 0, 7: 1}
    """
    t, count = s, 0
    ⟦a⟧:
        if t is not Link.empty:
            ⟦b⟧
    while t is not Link.empty:
        if ⟦c⟧:
            count += 1
        ⟦d⟧
    return count
`),
    },
    'fa25f-6b': {
      exam: 'fa25f', number: '6(b)', title: 'Scheme VS Python — zip-map (Scheme)', points: 5,
      intro: 'Implement `zip-map`, a Scheme procedure that takes a two-argument procedure `f` and lists `s` and `t`. It returns a list containing the results of calling `f` on pairs of values from `s` and `t` that appear in the same position (index) within `s` and `t`. For example, the first value in the returned list is the return value of calling `f` on the first value in `s` and the first value in `t`. The length of the returned list is the minimum of the length of `s` and the length of `t`.',
      code: code(`
;;; Return a list of results from calling f on pairs of co-indexed values from s and t
;;;
;;; scm> (zip-map + '(10 30 20 40) '(5 6 7))
;;; (15 36 27)
;;; scm> (zip-map list '(10 30 20 40) '(9 8 7 6 5 4))
;;; ((10 9) (30 8) (20 7) (40 6))
(define (zip-map f s t)
  (if (or (null? s) (null? t)) nil
    (⟦e⟧ ⟦f⟧ ⟦g⟧)))
`),
    },
    'fa25f-6c': {
      exam: 'fa25f', number: '6(c)', title: 'Scheme VS Python — match (Scheme)', points: 5,
      intro: 'Implement `match`, a Scheme procedure that takes a list of numbers `s` and a positive integer `k`. It returns the number of pairs of equal elements that are `k` positions apart in `s`. You may call `advance` and `zip-map`.',
      code: code(`
;;; Return the elements of list s starting at index k
(define (advance s k) (if (or (zero? k) (null? s)) s (advance (cdr s) (- k 1))))

;;; Return how many pairs of values in list s which are k positions apart are equal
;;; scm> (define nums '(3 1 4 1 5 2 5 3 5))
;;; nums
;;; scm> (match nums 2)
;;; 3
;;; scm> (map (lambda (k) (list k ': (match nums k))) '(1 2 3 4 5 6 7))
;;; ((1 : 0) (2 : 3) (3 : 0) (4 : 1) (5 : 0) (6 : 0) (7 : 1))
(define (match s k)
  (⟦h⟧ (⟦i⟧ (lambda (a b) ⟦j⟧) s ⟦k⟧)))
`),
    },
    'fa25f-7': {
      exam: 'fa25f', number: '7', title: 'Students', points: 9,
      intro: 'A student has a `name` (a `str`) and a discussion `group` (a `DiscGroup` instance). Each student is placed into a discussion group based on a `keyword` (a `str`) supplied by the student. When a `Student` instance is created, that student is placed into an existing discussion group that has fewer than 6 students and that has the same `keyword` that the student supplied. If the student cannot be placed into any existing group, the student will be placed into a new discussion group. Each discussion group (a `DiscGroup` instance) has a unique integer `id`, starting at 0 for the first discussion group created and counting up, as well as a list of `Student` instances called `students` and a `keyword` (a `str`).',
      code: code(`
class Student():
    """A student has a name and a keyword that is used to place them in a discussion group.
    >>> chris = Student("Chris", "kickstart")
    >>> pranav = Student("Pranav", "tortilla")
    >>> sebastian = Student("Sebastian", "tortilla")
    >>> print(chris)
    Student Chris is in Disc 0: kickstart (['Chris'])
    >>> print(pranav)
    Student Pranav is in Disc 1: tortilla (['Pranav', 'Sebastian'])
    >>> print(sebastian)
    Student Sebastian is in Disc 1: tortilla (['Pranav', 'Sebastian'])
    """
    def __init__(self, name, keyword):
        """Initialize the student and place them in a discussion group."""
        self.name = name
        self.group = ⟦a⟧
        for group in ⟦b⟧:
            if group.keyword == keyword and len(group.students) < 6:
                self.group = ⟦c⟧
        if not self.group:
            self.group = ⟦d⟧
        ⟦e⟧

    def __str__(self):
        return f"Student {self.name} is in {self.group}"

class DiscGroup():
    groups = []  # All of the DiscGroup instances

    def __init__(self, keyword):
        self.students = []  # All of the students in this DiscGroup
        self.keyword = keyword
        self.id = ⟦f⟧
        ⟦g⟧

    def __str__(self):
        return f"Disc {self.id}: {self.keyword} ({[s.name for s in self.students]})"
`),
    },
    'fa25f-8a': {
      exam: 'fa25f', number: '8(a)', title: 'Students in SQL — most frequent keyword', points: 3, lang: 'sql',
      intro: 'The `students` table has one row per student and columns for their `name` (string), the `discussion_id` (int) of their discussion, and a `keyword` (string) chosen by the student. The keyword was used to place the student in a discussion with other students who selected the same keyword.\n\nThe `discussions` table has one row per discussion and columns for the discussion’s unique `id` (int), the `ta` (string) who leads the discussion, and the `room` (string) where the discussion is located.\n\nThe first few rows in each table are shown below. **Not all rows are shown.**\n\n```\n' + FA25_STUDENTS + '\n\nExample result, part (a):\n| keyword  | total |\n|----------|-------|\n| tortilla | 3     |\n```\n\nSelect the most frequently used `keyword`, and the `total` number of students with that `keyword`. Assume there is one keyword used more than any other (no ties).',
      sqlSetup: FA25_SETUP,
      code: code(`
SELECT keyword, ⟦a⟧ AS total FROM students ⟦b⟧
`),
    },
    'fa25f-8b': {
      exam: 'fa25f', number: '8(b)', title: 'Students in SQL — big discussions', points: 3, lang: 'sql',
      intro: 'The `students` and `discussions` tables are the same as in part (a). **Not all rows are shown.**\n\n```\n' + FA25_STUDENTS + '\n\nExample big result, part (b):\n| ta    | id |\n|-------|----|\n| Rhys  | 1  |\n| Caleb | 12 |\n```\n\nCreate a new table `big` with one row for each discussion that has more than 20 students. The columns give the `ta` name and discussion `id` for each of these discussions.\n\nThe first row of the example `big` result indicates that the discussion with ID 1 taught by Rhys has more than 20 students in it (even though only 1 of these students is shown in the example rows of the `students` table).',
      sqlSetup: FA25_SETUP,
      code: code(`
CREATE TABLE big AS
    SELECT ta, id FROM students JOIN discussions ⟦c⟧;
`),
    },
    'fa25f-9a': {
      exam: 'fa25f', number: '9(a)', title: 'Final Boss — preorder (A+, Scheme)', points: 0,
      intro: 'This A+ question is not worth any points.\n\n**Definition.** An *infix expression* is a list that begins and ends with an integer and alternates between integers and operators, where each operator is either `+` or `-`. For example, `(7 + 2 - 1 + 3 - 6 + 8 - 1 + 4)`.\n\nFill in the blank to implement `preorder`, which takes an infix expression `expr` and returns a call to `+` on all of the integers from `expr`. Each subtracted number in `expr` should appear within a one-argument call to `-`.',
      code: code(`
;;; Convert an infix expression to a valid Scheme expression with the same value.
;;; scm> (preorder '(7 + 2 - 1 + 3 - 6 + 8 - 1 + 4))
;;; (+ 7 2 (- 1) 3 (- 6) 8 (- 1) 4)
;;; scm> (preorder '(-7 - -1 - 2 - -3))
;;; (+ -7 (- -1) (- 2) (- -3))
(define (preorder expr)
  (define (rest expr f)
    (define (helper s)
      (cond ((null? s) nil)
            ((eq? (car s) '+) (helper (cdr s)))
            ((eq? (car s) '-) (f helper s))
            (else             (cons (car s) (helper (cdr s))))))
    (helper expr))
  ⟦A+⟧)
`),
    },
    'fa25f-9b': {
      exam: 'fa25f', number: '9(b)', title: 'Final Boss — two_cut (A+)', points: 0,
      intro: 'This A+ question is not worth any points.\n\nImplement `two_cut`, which takes a `Tree` of **positive** integers `t` with at least 3 nodes and an integer `n`. It returns a new tree like `t` but with **2** non-root nodes (and their descendents) removed. It’s ok if one of the removed nodes is a descendent of the other. Remove the two non-root nodes that change the label sum of the tree to be as close to `n` as possible (in absolute value). Do not mutate `t`. You may call `one_cut` from 4(b) but not `sums`.',
      code: code(`
def g(t):
    return t.label + sum([g(b) for b in t.branches])

def two_cut(t, n):
    """Return a tree like t but omit 2 nodes so that the sum of remaining labels is close to n.
    >>> t = Tree(2, [Tree(4, [Tree(5)]), Tree(3, [Tree(1)]), Tree(5, [Tree(6), Tree(7)])])
    >>> two_cut(t, 30)  # cut 1 and then 3; result sums to 29
    Tree(2, [Tree(4, [Tree(5)]), Tree(5, [Tree(6), Tree(7)])])
    >>> two_cut(t, 12)  # cut 3 and then 5; result sums to 11
    Tree(2, [Tree(4, [Tree(5)])])
    >>> two_cut(t, 6)   # cut 4 and then 5; result sums to 6
    Tree(2, [Tree(3, [Tree(1)])])
    """
    return ⟦A+⟧
`),
    },

    // ───────────────────────────── Spring 2025 Final ─────────────────────────────
    'sp25f-1': {
      exam: 'sp25f', number: '1', title: 'What Would Python Display?', points: 5,
      intro: 'Assume the following code has been executed.',
      code: code(`
nest = [[[x, y] for x in range(y, 3)] for y in range(1, 3)]

def dip(s):
    if s:
        for x in dip(s[1:]):
            yield x + 1
        yield s[0]
`),
      outro: 'Write the output that would be displayed by printing the result of each expression. If an error occurs, write *ERROR*.',
    },
    'sp25f-2': {
      // The PDF's Q2 is 7 points: (a) 2 + (b) 3 + (c) 1 + (d) 1. Parts (c) and (d) are their own problem (sp25f-2c).
      exam: 'sp25f', number: '2', title: 'Square Bears on Stairs', points: 5,
      intro: 'Complete the environment diagram to answer the following questions. Only the questions will be scored.',
      figure: { src: 'assets/sp25-final-q2.png', width: 490, height: 263, alt: 'From the exam: the code with line numbers 1 to 11, and a blank environment diagram. The Global frame has five blank bindings. Frames f1 and f2 each have a blank name and blank parent, two blank bindings and a blank Return value.', slots: [[340, 19, 86], [437, 19, 43], [340, 36, 86], [437, 36, 43], [340, 53, 85], [436, 53, 44], [340, 71, 86], [437, 71, 43], [340, 90, 86], [437, 90, 43], [308, 121, 50], [410, 121, 50], [340, 137, 86], [437, 137, 43], [340, 156, 86], [437, 156, 43], [437, 175, 43], [308, 201, 50], [410, 201, 50], [340, 217, 86], [437, 217, 43], [340, 236, 85], [437, 236, 43], [437, 255, 43]] },
      code: code(`
stairs = [2, [3, [4, 5]]]
squares = [[9], [16], [25]]
where = lambda i: squares[i]

def bears(squares):
    stairs[1].append(squares[1].pop())
    squares[2] = 36
    print(where(1))
    print(stairs[1])

bears(stairs[1] + squares[1])
`),
      lineNumbers: true,
    },
    'sp25f-2c': {
      exam: 'sp25f', number: '2(c)', title: 'Square Bears on Stairs — order of growth', points: 2,
      intro: 'Answer the questions about `skipsum` below.',
      code: code(`
def skipsum(s):
    if len(s) <= 2:
        return max(s + [0])
    return max(s[0] + skipsum(s[2:]), s[1] + skipsum(s[3:]))
`),
    },
    'sp25f-3': {
      exam: 'sp25f', number: '3', title: 'Swap Meet', points: 6,
      intro: 'Implement `swap`, which takes a list `s` and non-negative numbers `t` and `u`. It returns a list with the same elements as `s`, but with the elements at indices `t` and `u` swapped. Hint: `(a + b) - a == b` for any integers `a` and `b`.',
      code: code(`
def swap(s, t, u):
    """Return a new list like s but with the elements at positions t and u swapped.
    >>> letters = ['p', 'q', 'r', 's']
    >>> swap(letters, 0, 2)
    ['r', 'q', 'p', 's']
    >>> letters
    ['p', 'q', 'r', 's']
    """
    assert min(t, u) >= 0 and max(t, u) < len(s)
    def select(i):
        if ⟦a⟧:
            return ⟦b⟧
        else:
            return ⟦c⟧
    return [select(x) for x in ⟦d⟧]
`),
    },
    'sp25f-4a': {
      exam: 'sp25f', number: '4(a)', title: 'Tree Spree — offspring', points: 5,
      intro: 'Implement `offspring`, which takes a `Tree` instance `t` and a value `x`. It returns a list of the labels of the nodes in `t` that are children of nodes labeled `x`. The returned list can have any order.\n\nThe `Tree` class appears on the left side of Page 2 of the Midterm 2 study guide.',
      code: code(`
def offspring(t, x):
    """List the labels of all nodes whose parents are labeled x.

    >>> a = Tree(5, [Tree(6, [Tree(7), Tree(8)]), Tree(9, [Tree(10)])])
    >>> sorted(offspring(a, 6))
    [7, 8]
    >>> b = Tree(3, [Tree(5, [Tree(3, [Tree(3), Tree(5)])]), Tree(7, [Tree(3)])])
    >>> sorted(offspring(b, 3))
    [3, 5, 5, 7]
    """
    result = []
    for b in t.branches:
        if ⟦a⟧:
            result.append(⟦b⟧)
        result.⟦c⟧
    return result
`),
    },
    'sp25f-4b': {
      exam: 'sp25f', number: '4(b)', title: 'Tree Spree — graft', points: 6,
      intro: 'Implement `graft`, which takes two `Tree` instances `t` and `u` and a value `x`. All labels in `t` and `u` are unique, and `x` is a label in `t`. It mutates `t`, replacing the node labeled `x` with `u`, so that `u` is now a node in `t`, and the node labeled `x` along with all of its descendants are removed from `t`.\n\n**Hint:** The `index` method of a list takes a value `x` and returns the index of the first occurence of `x` in the list. `[\'a\', \'b\', \'c\'].index(\'b\')` evaluates to 1.',
      code: code(`
def graft(t, u, x):
    """Mutate Tree t so that the node rooted at label x is replaced by Tree u.

    >>> lemon = Tree(13, [Tree(14), Tree(15)])
    >>> lime = Tree(1, [Tree(2, [Tree(3), Tree(4, [Tree(5)])]), Tree(6, [Tree(7)])])
    >>> graft(lime, lemon, 4)
    >>> lime
    Tree(1, [Tree(2, [Tree(3), Tree(13, [Tree(14), Tree(15)])]), Tree(6, [Tree(7)])])
    >>> lime.branches[0].branches[1] is lemon
    True
    """
    s = ⟦d⟧
    if x in s:
        ⟦e⟧
    else:
        for b in t.branches:
            ⟦f⟧
`),
    },
    'sp25f-5': {
      exam: 'sp25f', number: '5', title: 'Row, Row, Row Your Boat', points: 12,
      intro: 'Each `Boat` has a `number`. Each `Rower` has a `name`. The `add` method of a `Boat` takes a list of `Rower` instances called `folks`. Then, for each `Rower` in `folks`, if they can `sit` in the `Boat`, they are assigned the lowest non-negative seat number that hasn’t yet been assigned for that boat (starting at 0). The seat number for each `Rower` is stored in the `where` attribute of their boat: a dictionary whose keys are `Rower` instances and whose values are non-negative integers. The `sit` method of a `Rower` returns `True` if that `Rower` doesn’t already have a seat, and prints a message otherwise.\n\nA `Captain` is a `Rower` that won’t sit in a boat with another `Captain`. The `sit` method of the `Captain` class first checks for another captain in the boat and prints a message and returns `None` if there is one, then checks that the `Captain` doesn’t already have a seat in a boat (and prints a message and returns `None` if they do), and finally claims the boat so that no other captain will sit there (and returns `True`).',
      code: code(`
class Boat:
    """A boat full of rowers.
    >>> bella, finn, hank = Rower('Bella'), Captain('Finn'), Captain('Hank')
    >>> Boat(5).add([Rower('Ace'), bella, Rower('Charlie'), finn, Rower('Ginger')])
    >>> Boat(7).add([Rower('Daisy'), finn, hank, bella, Captain('Ellie')])
    Finn in Boat 5 Seat 3 already has a seat!
    Bella in Boat 5 Seat 1 already has a seat!
    Ellie won't sit. Hank is captain of Boat 7!
    >>> print(hank)
    Hank in Boat 7 Seat 1
    """
    def __init__(self, number):
        self.number = number  # The number of the boat
        self.where = {}       # A dict from Rowers to seat numbers
    def add(self, folks):
        for p in folks:
            if p.sit( ⟦a⟧ ):
                ⟦b⟧  # Assign them the lowest available seat number
class Rower:
    """A Rower in a Boat."""
    def __init__(self, name):
        self.name = name
        self.boat = None
    def sit(self, boat):
        if self.boat is None:
            self.boat = boat
            return True
        print(self, 'already has a seat!')
    def __str__(self):
        return f'{self.name} in Boat {self.boat.number} Seat { ⟦c⟧ }'
class Captain(Rower):
    """A captain will not sit in a boat that already has a captain."""
    claimed = {}
    def sit(self, boat):
        if boat not in Captain.claimed:
            if ⟦d⟧ :
                ⟦e⟧  # Claim the boat
                return True
        else:
            print(f"{self.name} won't sit. { ⟦f⟧ } is captain of Boat {boat.number}!")
`),
    },
    'sp25f-6a': {
      exam: 'sp25f', number: '6(a)', title: 'Arithmetic — can_equal', points: 8,
      intro: 'Implement `can_equal`, which takes a string `digits` containing a sequence of digits from 1 to 9 (no zeros) and an integer `n`. It returns `True` if there is a way to add zero or more `+` and `-` symbols to `digits` to form an expression that evaluates to `n`.\n\n**Hint:** The built-in `int` can be called on a string to convert it to an integer. For example, `int(\'-42\')` returns -42.',
      code: code(`
def can_equal(digits, n):
    """Whether adding + and - symbols to digits can form an expression that evaluates to n.

    >>> can_equal('45332', 14)   # 45-33+2 = 14
    True
    >>> can_equal('45332', 527)  # -4+533-2 = 527
    True
    >>> can_equal('45332', 38)   # 4+5-3+32 = 38
    True
    >>> can_equal('45332', 287)  # -45+332 = 287
    True
    >>> can_equal('45332', -287) # 45-332 = -287
    True
    >>> can_equal('45332', 45)   # Impossible
    False
    >>> can_equal('45332', 39)   # Impossible
    False
    """
    if ⟦a⟧ :
        return True
    for k in range(1, ⟦b⟧ ):
        if ⟦c⟧ ([can_equal( ⟦d⟧ , n - sign * ⟦e⟧ ) for sign in [1, -1]]):
            return True
    return ⟦f⟧
`),
    },
    'sp25f-6b': {
      exam: 'sp25f', number: '6(b)', title: 'Arithmetic — join_link and to_link', points: 4,
      intro: 'The `Link` class appears on the left side of Page 2 of the Midterm 2 study guide.\n\n**i.** Fill in blank (g) to implement `join_link`, a function that takes a linked list of strings `s`. It returns a string that contains all of the characters in all of the strings in `s` in order.\n\n**ii.** Fill in blank (h) to implement `to_link`, a function that takes a finite iterator `t`. It returns a linked list containing all of the values that `t` iterates over.',
      code: code(`
def join_link(s):
    """Return a string that concatenates all of the strings in linked list s.

    >>> join_link(Link('cs', Link('6', Link('1a'))))
    'cs61a'
    """
    if s is Link.empty:
        return ''
    return ⟦g⟧

def to_link(t):
    """Return a linked list containing the values in iterator t.

    >>> to_link(iter([3, 5, 7, 9]))
    Link(3, Link(5, Link(7, Link(9))))
    """
    try:
        return ⟦h⟧
    except StopIteration:
        return Link.empty
`),
    },
    'sp25f-6c': {
      exam: 'sp25f', number: '6(c)', title: 'Arithmetic — terms', points: 6,
      intro: 'Implement `terms`, a generator function that takes a string `digits` containing digits from 1 to 9 and an integer `n` for which `can_equal(digits, n)` returns `True`. It yields integers whose digits are the contents of `digits` and that sum to `n`. If there is more than one such sequence of numbers, yield any one of them. You may call `can_equal`, `join_link`, and `to_link`.',
      code: code(`
def terms(digits, n):
    """Yield the numbers in an expression that demonstrates can_equal(digits, n) is True.

    >>> list(terms('45332', 38))   # 4+5-3+32 = 38
    [4, 5, -3, 32]
    >>> list(terms('45332', 527))  # -4+533-2 = 527
    [-4, 533, -2]
    """
    assert can_equal(digits, n)
    digits = to_link(iter(digits))  # Create a linked list over one-digit strings
    first = 0
    while digits:
        first = ⟦i⟧
        rest = ⟦j⟧
        if can_equal(rest, n - first):
            yield first
            first, n = 0, n - first
        elif can_equal(rest, n + first):
            ⟦k⟧
            first, n = 0, n + first
        digits = digits.rest
`),
    },
    'sp25f-7a': {
      exam: 'sp25f', number: '7(a)', title: 'Finally Some Scheme — except-last', points: 6,
      intro: 'Implement `except-last`, a procedure that takes a list `s` and returns a list with all of the elements of `s` except the last one. If there is no last element because `s` is empty, return `nil`.\n\nThen fill in blank (c) to implement `except-last-k`, which takes a non-negative integer `k` and a list `s`. It returns a list with all of the elements of `s` except the last `k` elements. If there are `k` or fewer elements, return `nil`. You may call `except-last`.',
      code: code(`
;;; Return all but the last element of s in a list.
;;;
;;; scm> (except-last nil)
;;; ()
;;; scm> (except-last '(2))
;;; ()
;;; scm> (except-last '(2 3 4 5))
;;; (2 3 4)
;;; scm> (except-last '(2 (3 3) 4 (5 6)))
;;; (2 (3 3) 4)

(define (except-last s)
  (if ⟦a⟧ nil
    (cons (car s) ⟦b⟧ )))

(define (except-last-k k s)
  (if (= k 0) s ⟦c⟧ ))
`),
    },
    'sp25f-7b': {
      exam: 'sp25f', number: '7(b)', title: 'Finally Some Scheme — mystery macro', points: 4,
      intro: 'Assume the following code had been evaluated and that `except-last` is implemented correctly.',
      code: code(`
(define-macro (mystery expr other)
  (append (except-last expr) (list other)))
`),
      outro: 'What would Scheme display as the value of the following expression? Write *ERROR* if an error occurs.',
    },
    'sp25f-8a': {
      exam: 'sp25f', number: '8(a)', title: 'WHERE Brainrot=\'Italian\' — total living size', points: 3, lang: 'sql',
      intro: 'The `who` table has one row per character with its `name` (a unique string), `size` (a number), and `kind` (a string). The `kinds` table has one row per kind that shows whether it’s `living` (`\'yes\'` or `\'no\'`) and `what` kind it is (a unique string).\n\n```\n' + SP25_TABLES + '\n\nResult, part (a):\n| total  |\n|--------|\n| 3070.0 |\n```\n\nFill in blank (a) to create a one-row, one-column table containing the `total` size of all characters that have a `living` kind.',
      sqlSetup: SP25_SETUP,
      code: code(`
SELECT SUM(size) AS total FROM ⟦a⟧ ;
`),
    },
    'sp25f-8b': {
      exam: 'sp25f', number: '8(b)', title: 'WHERE Brainrot=\'Italian\' — battles', points: 3, lang: 'sql',
      intro: 'The `who` and `kinds` tables are the same as in part (a).\n\n```\n' + SP25_TABLES + '\n\nResult, part (b):\n| name                  | number |\n|-----------------------|--------|\n| bombardiro crocodillo | 1      |\n| brr brr patapim       | 2      |\n| capuchino assassino   | 2      |\n| chimpanzini bananini  | 2      |\n| lirili larila         | 1      |\n| tralalero tralala     | 2      |\n```\n\nTwo characters can battle if the smaller one is at least half the size of the larger one (or they are the same size). Fill in blank (b) to create a table with one row per character that has two columns: the character’s `name` and the `number` of other characters it can battle. For example, `lirili larila` can only battle `tralalero tralala` because all other characters are too small. Do not include rows for characters that cannot battle any other characters.',
      sqlSetup: SP25_SETUP,
      code: code(`
SELECT a.name, COUNT(*) FROM who AS a, who AS b WHERE a.name != b.name AND ⟦b⟧ GROUP BY a.name;
`),
    },
    'sp25f-9a': {
      exam: 'sp25f', number: '9(a)', title: 'A+ — swap', points: 0,
      intro: 'This A+ question is not worth any points.\n\nFill in the blank to implement `swap`, which takes a list `s` and non-negative numbers `t` and `u`. It returns a list with the same elements as `s`, but with the elements at indices `t` and `u` swapped. Do not write `if`, `and`, `or`, or `lambda`. You may not call functions from elsewhere on the exam. **Hint:** Try using a dictionary.',
      code: code(`
def swap(s, t, u):
    """Return a new list like s but with the elements at positions t and u swapped.
    >>> letters = ['p', 'q', 'r', 's']
    >>> swap(letters, 0, 2)
    ['r', 'q', 'p', 's']
    >>> letters
    ['p', 'q', 'r', 's']
    """
    return [ ⟦A+⟧ for x in range(len(s)) ]
`),
    },
    'sp25f-9b': {
      exam: 'sp25f', number: '9(b)', title: 'A+ — equal', points: 0,
      intro: 'This A+ question is not worth any points.\n\nFill in the blank to implement `equal`, which takes a string `digits` containing digits from 1 to 9 and an integer `n` for which `can_equal(digits, n)` returns `True`. It returns a string `s` containing all of `digits` and zero or more `+` or `-` symbols such that `eval(s) == n`. You may call `eval` and `can_equal`. If there is more than one possible return value, return any of them. **Important:** For credit, your implementation must ensure that the generator returned by `f` only yields as many values as necessary for correctness (and no more).',
      code: code(`
def equal(digits, n):
    """Return a string containing digits and + and - that evaluates to n.

    >>> equal('45332', 527)
    '-4+533-2'
    >>> equal('45332', 38)
    '4+5-3+32'
    """
    assert can_equal(digits, n)
    def f(digits):
        yield digits
        yield '-' + digits
        for k in range(1, len(digits)):
            for rest in f(digits[k:]):
                yield digits[:k] + '+' + rest
                yield digits[:k] + '-' + rest
                yield '-' + digits[:k] + '+' + rest
                yield '-' + digits[:k] + '-' + rest
    return ⟦A+⟧
`),
    },
  };

  const ORDER_OF_GROWTH = ['logarithmic', 'linear', 'quadratic', 'exponential'];
  const DISC_CHOICES = ['None', 'group', 'DiscGroup(keyword)', 'DiscGroup(self.keyword)', 'DiscGroup(self, keyword)'];

  const QUESTIONS = [
    // Fall 2025 Final — Q1
    { id: 'fa25f-1a', problem: 'fa25f-1', label: '(a)', points: 2, topics: ['hof', 'env'], difficulty: 'medium',
      type: 'short_answer', prompt: '`times(2, 3, 10)`' },
    { id: 'fa25f-1b', problem: 'fa25f-1', label: '(b)', points: 3, topics: ['hof', 'iterators'], difficulty: 'hard',
      type: 'short_answer', prompt: '`print(delay(map(lambda f: f(-2), w)))`' },
    // Fall 2025 Final — Q2
    { id: 'fa25f-2a', problem: 'fa25f-2', label: '(a)', points: 2, topics: ['lists', 'env'], difficulty: 'medium',
      type: 'single_choice', mono: true, prompt: 'What is displayed by `print(first)` on line 10?',
      choices: ['[5, [6]]', '[5, [6], 7]', '[5, [6], 7, 7]', '[5, [6, 7]]', '[5, [6, 7], 7]', '[7, [6], 7]', '[7, [6, 7]]', '[7, [6, 7], 7]', '[7, 8]', '[7, 8, 7]', '[[6]]', '[[6, 7]]', '[[6], 7]', '[[6, 7], 7]', '[8]', '[8, 7]'] },
    { id: 'fa25f-2b', problem: 'fa25f-2', label: '(b)', points: 2, topics: ['lists', 'env'], difficulty: 'medium',
      type: 'single_choice', mono: true, prompt: 'What is displayed by `print(second)` on line 11?',
      choices: ['8', '[6]', '[[6]]', '[6, 7]', '[[6, 7]]', '[[6], 7]', '[8]', '[8, 7]'] },
    { id: 'fa25f-2c', problem: 'fa25f-2c', label: '(c)', points: 1, topics: ['efficiency'], difficulty: 'medium',
      type: 'single_choice', prompt: 'What is the order of growth of the time it takes to evaluate `[sum(s[:i]) for i in range(len(s))]` in terms of the length of `s`?',
      choices: ORDER_OF_GROWTH },
    // Fall 2025 Final — Q3
    { id: 'fa25f-3a', problem: 'fa25f-3a', label: 'i.', points: 1, topics: ['fundamentals'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
      choices: ['isinstance(x, int) or x == ?', 'isinstance(x, int) and x == ?', "isinstance(x, int) or x == '?'", "isinstance(x, int) and x == '?'"] },
    { id: 'fa25f-3b', problem: 'fa25f-3a', label: 'ii.', points: 2, topics: ['fundamentals', 'lists'], difficulty: 'medium', blank: 'b',
      type: 'short_answer', prompt: 'Fill in blank (b).' },
    { id: 'fa25f-3c', problem: 'fa25f-3a', label: 'iii.', points: 2, topics: ['fundamentals'], difficulty: 'medium', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c).' },
    { id: 'fa25f-3d', problem: 'fa25f-3b', label: 'i.', points: 1, topics: ['iterators'], difficulty: 'easy', blank: 'd',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
      choices: ['number', 'not number', 'isinstance(x, int)', 'not isinstance(x, int)'] },
    { id: 'fa25f-3e', problem: 'fa25f-3b', label: 'ii.', points: 1, topics: ['iterators'], difficulty: 'easy', blank: 'e',
      type: 'short_answer', prompt: 'Fill in blank (e).' },
    { id: 'fa25f-3f', problem: 'fa25f-3b', label: 'iii.', points: 1, topics: ['iterators'], difficulty: 'medium', blank: 'f',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (f).',
      choices: ['return total', 'return sum(ans)', 'return sum(eq)', 'total += sum(ans)', 'total += sum(eq)', 'total += tally(eq, ans)', 'total -= tally(eq, ans)'] },
    { id: 'fa25f-3g', problem: 'fa25f-3b', label: 'iv.', points: 2, topics: ['fundamentals'], difficulty: 'medium', blank: 'g',
      type: 'short_answer', prompt: 'Fill in blank (g). **Hint:** Use a dictionary.' },
    { id: 'fa25f-3h', problem: 'fa25f-3c', label: 'i.', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'h',
      type: 'short_answer', prompt: 'Fill in blank (h).' },
    { id: 'fa25f-3i', problem: 'fa25f-3c', label: 'ii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'i',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (i).',
      choices: ["i == '?'", "i != '?'", "eq[i] == '?'", "eq[i] != '?'"] },
    { id: 'fa25f-3j', problem: 'fa25f-3c', label: 'iii.', points: 3, topics: ['recursion', 'lists'], difficulty: 'hard', blank: 'j',
      type: 'short_answer', prompt: 'Fill in blank (j). You may **not** write `for` or `in` or `map` or `range`.' },
    { id: 'fa25f-3k', problem: 'fa25f-3d', label: 'i.', points: 1, topics: ['generators', 'recursion'], difficulty: 'medium', blank: 'k',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (k).',
      choices: ['allowed', 'equation', 'solve(equation[1:], allowed)', 'solve(equation[2:], allowed)', 'candidates(n-1)', 'candidates(n-first)'] },
    { id: 'fa25f-3l', problem: 'fa25f-3d', label: 'ii.', points: 1, topics: ['generators', 'lists'], difficulty: 'easy', blank: 'l',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (l).',
      choices: ['first + rest', '[first] + rest', 'first + [rest]', '[first, rest]', '[[first], rest]', '[first, [rest]]'] },
    { id: 'fa25f-3m', problem: 'fa25f-3d', label: 'iii.', points: 1, topics: ['hof', 'iterators'], difficulty: 'easy', blank: 'm',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (m).',
      choices: ['map', 'filter', 'any', 'all', 'zip'] },
    { id: 'fa25f-3n', problem: 'fa25f-3d', label: 'iv.', points: 2, topics: ['hof'], difficulty: 'medium', blank: 'n',
      type: 'short_answer', prompt: 'Fill in blank (n).' },
    // Fall 2025 Final — Q4
    { id: 'fa25f-4a', problem: 'fa25f-4a', label: 'i.', points: 2, topics: ['trees', 'recursion'], difficulty: 'medium', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
      choices: ['insert(b)', 'sums(b)', 'result += sums(b)', 'result[b] = insert(b)', 'result[b] += insert(b)', 'result[t] += insert(b)', 'result[t] += result[b]', 'result[b] = sums(t)', 'result[b] += sums(t)'] },
    { id: 'fa25f-4b', problem: 'fa25f-4a', label: 'ii.', points: 3, topics: ['trees', 'fundamentals'], difficulty: 'hard', blank: 'b',
      type: 'short_answer', prompt: 'Fill in blank (b).' },
    { id: 'fa25f-4c', problem: 'fa25f-4b', label: 'i.', points: 2, topics: ['trees', 'hof'], difficulty: 'medium', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c).' },
    { id: 'fa25f-4d', problem: 'fa25f-4b', label: 'ii.', points: 2, topics: ['trees', 'recursion'], difficulty: 'hard', blank: 'd',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
      choices: ['t.branches.remove(target)', 't.branches = [b for b in t.branches if b is not target]', 't.branches = [cut(b) for b in t.branches if b is not target]', 't = Tree(t.label, [b for b in t.branches if b is not target])', 't = Tree(t.label, [cut(b) for b in t.branches if b is not target])', 'return Tree(t.label, [b for b in t.branches if b is not target])', 'return Tree(t.label, [cut(b) for b in t.branches if b is not target])'] },
    { id: 'fa25f-4e', problem: 'fa25f-4b', label: 'iii.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'e',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (e).',
      choices: ['return t', 'return cut(t)', 'return Tree(t.label, list(map(cut, t.branches)))', 'return [cut(t), t][1]'] },
    // Fall 2025 Final — Q5
    { id: 'fa25f-5a', problem: 'fa25f-5', label: '(a)', points: 3, topics: ['async'], difficulty: 'medium',
      type: 'multi_select', prompt: 'The code above initializes a `Downloader` with a list of 4 files `["a", "b", "c", "d"]`. Which of the following statements are true? **Select all that apply.**',
      choices: ['The function `download` will be called exactly 4 times.', 'The function `download` may be called more than 4 times.', 'The function `download` may be called fewer than 4 times.', 'The function `download` will be called on each file exactly once.', 'The function `download` may not be called on all of the files.', 'The function `download` may be called more than once on the same file.', 'The code above may error because the index `self.current_index` is out of range.'] },
    { id: 'fa25f-5b', problem: 'fa25f-5', label: '(b)', points: 1, topics: ['async'], difficulty: 'medium',
      type: 'short_answer', prompt: 'Assume that the function `download` takes one second to run, and spends all of that time waiting for the file to be downloaded. During that wait time, it gives up control so that other coroutines can run. How many seconds does the code above take to run?' },
    // Fall 2025 Final — Q6
    { id: 'fa25f-6a', problem: 'fa25f-6a', label: 'i.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
      choices: ['def f(t)', 'if s is not Link.empty', 'while s is not Link.empty', 'for x in range(k)'] },
    { id: 'fa25f-6b', problem: 'fa25f-6a', label: 'ii.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'b',
      type: 'short_answer', prompt: 'Fill in blank (b).' },
    { id: 'fa25f-6c', problem: 'fa25f-6a', label: 'iii.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c).' },
    { id: 'fa25f-6d', problem: 'fa25f-6a', label: 'iv.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'd',
      type: 'short_answer', prompt: 'Fill in blank (d).' },
    { id: 'fa25f-6e', problem: 'fa25f-6b', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'e',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (e).', choices: ['cons', 'list', 'append', 'zip-map'] },
    { id: 'fa25f-6f', problem: 'fa25f-6b', label: 'ii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'f',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (f).',
      choices: ['(car s)', '(car t)', '(cons (car s) (car t))', '(list (car s) (car t))', '(f (cons (car s) (car t)))', '(f (list (car s) (car t)))', '(f (car s) (car t))', '(apply f (car s) (car t))'] },
    { id: 'fa25f-6g', problem: 'fa25f-6b', label: 'iii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'g',
      type: 'short_answer', prompt: 'Fill in blank (g).' },
    { id: 'fa25f-6h', problem: 'fa25f-6c', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'h',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (h).', choices: ['+', 'sum', 'len', "cons '+", 'apply +'] },
    { id: 'fa25f-6i', problem: 'fa25f-6c', label: 'ii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'i',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (i).', choices: ['advance', 'zip-map', 'map', 'filter', 'apply'] },
    { id: 'fa25f-6j', problem: 'fa25f-6c', label: 'iii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'j',
      type: 'short_answer', prompt: 'Fill in blank (j). **Hint:** Write an expression that evaluates to a number.' },
    { id: 'fa25f-6k', problem: 'fa25f-6c', label: 'iv.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'k',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (k).', choices: ['s', 'k', '(cdr s)', '(advance s k)'] },
    // Fall 2025 Final — Q7
    { id: 'fa25f-7a', problem: 'fa25f-7', label: '(a)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: DISC_CHOICES },
    { id: 'fa25f-7b', problem: 'fa25f-7', label: '(b)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'b',
      type: 'short_answer', prompt: 'Fill in blank (b).' },
    { id: 'fa25f-7c', problem: 'fa25f-7', label: '(c)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'c',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: DISC_CHOICES },
    { id: 'fa25f-7d', problem: 'fa25f-7', label: '(d)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'd',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: DISC_CHOICES },
    { id: 'fa25f-7e', problem: 'fa25f-7', label: '(e)', points: 2, topics: ['oop', 'lists'], difficulty: 'medium', blank: 'e',
      type: 'short_answer', prompt: 'Fill in blank (e).' },
    { id: 'fa25f-7f', problem: 'fa25f-7', label: '(f)', points: 1, topics: ['oop'], difficulty: 'medium', blank: 'f',
      type: 'short_answer', prompt: 'Fill in blank (f).' },
    { id: 'fa25f-7g', problem: 'fa25f-7', label: '(g)', points: 2, topics: ['oop', 'lists'], difficulty: 'medium', blank: 'g',
      type: 'short_answer', prompt: 'Fill in blank (g).' },
    // Fall 2025 Final — Q8 (SQL)
    { id: 'fa25f-8a', problem: 'fa25f-8a', label: 'i.', points: 1, topics: ['sql-agg'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
      choices: ['1', 'name', 'COUNT(*)', 'MAX(keyword)', 'MAX(name)', 'MAX(COUNT(*))'] },
    { id: 'fa25f-8b', problem: 'fa25f-8a', label: 'ii.', points: 2, topics: ['sql-agg'], difficulty: 'medium', blank: 'b',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
      choices: ['GROUP BY keyword;', 'GROUP BY keyword HAVING MAX(COUNT(*));', 'GROUP BY keyword HAVING COUNT(*) = MAX(COUNT(*));', 'GROUP BY keyword LIMIT MAX(COUNT(*));', 'GROUP BY keyword ORDER BY keyword DESC LIMIT 1;', 'GROUP BY keyword ORDER BY COUNT(*) DESC LIMIT 1;', 'AS s1 JOIN students AS s2 ON s1.keyword = s2.keyword LIMIT 1;', 'ORDER BY COUNT(*) DESC;', 'ORDER BY keyword DESC;', 'ORDER BY keyword DESC LIMIT MAX(COUNT(*));', 'ORDER BY keyword DESC LIMIT 1;'] },
    { id: 'fa25f-8c', problem: 'fa25f-8b', label: 'i.', points: 3, topics: ['sql-joins', 'sql-agg'], difficulty: 'hard', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c).' },
    // Fall 2025 Final — Q9 (A+)
    { id: 'fa25f-9a', problem: 'fa25f-9a', label: '(a)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'A+',
      type: 'code', prompt: 'Fill in the blank. If your answer is long, write it on multiple lines.' },
    { id: 'fa25f-9b', problem: 'fa25f-9b', label: '(b)', points: 0, topics: ['trees', 'hof'], difficulty: 'hard', blank: 'A+',
      type: 'code', prompt: 'Fill in the blank. If your answer is long, write it on multiple lines.' },

    // Spring 2025 Final — Q1
    { id: 'sp25f-1a', problem: 'sp25f-1', label: '(a)', points: 1, topics: ['hof', 'iterators'], difficulty: 'easy',
      type: 'short_answer', prompt: '`next(map(lambda x: 6 // (x - 2), range(5)))`' },
    { id: 'sp25f-1b', problem: 'sp25f-1', label: '(b)', points: 2, topics: ['lists'], difficulty: 'medium',
      type: 'short_answer', prompt: '`nest[1]`' },
    { id: 'sp25f-1c', problem: 'sp25f-1', label: '(c)', points: 2, topics: ['generators', 'recursion'], difficulty: 'hard',
      type: 'short_answer', prompt: '`list(dip([3, 4, 5]))`' },
    // Spring 2025 Final — Q2
    { id: 'sp25f-2a', problem: 'sp25f-2', label: '(a)', points: 2, topics: ['env', 'lists', 'hof'], difficulty: 'medium',
      type: 'short_answer', prompt: 'What is displayed by `print(where(1))` on line 8?' },
    { id: 'sp25f-2b', problem: 'sp25f-2', label: '(b)', points: 3, topics: ['env', 'lists'], difficulty: 'hard',
      type: 'short_answer', prompt: 'What is displayed by `print(stairs[1])` on line 9?' },
    { id: 'sp25f-2c', problem: 'sp25f-2c', label: '(c)', points: 1, topics: ['efficiency'], difficulty: 'medium',
      type: 'single_choice', prompt: 'What is the order of growth of the time it takes to evaluate `skipsum(s)` in terms of the length of list `s`?',
      choices: ORDER_OF_GROWTH },
    { id: 'sp25f-2d', problem: 'sp25f-2c', label: '(d)', points: 1, topics: ['efficiency'], difficulty: 'medium',
      type: 'single_choice', prompt: 'What would be the order of growth of the time to evaluate `skipsum(s)` if `skipsum` were memoized?',
      choices: ORDER_OF_GROWTH },
    // Spring 2025 Final — Q3
    { id: 'sp25f-3a', problem: 'sp25f-3', label: '(a)', points: 2, topics: ['fundamentals'], difficulty: 'easy', blank: 'a',
      type: 'multi_select', mono: true, prompt: 'Fill in blank (a). **Select all that apply.**',
      choices: ['i == t or u', 'i == t and u', 'i == t or i == u', 'i == t and i == u', 'i in [t, u]'] },
    { id: 'sp25f-3b', problem: 'sp25f-3', label: '(b)', points: 2, topics: ['lists', 'fundamentals'], difficulty: 'hard', blank: 'b',
      type: 'short_answer', prompt: 'Fill in blank (b).' },
    { id: 'sp25f-3c', problem: 'sp25f-3', label: '(c)', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'c',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['i', 'x', 's[i]', 's[x]'] },
    { id: 'sp25f-3d', problem: 'sp25f-3', label: '(d)', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'd',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['s', 's[t:u]', 'range(s)', 'range(len(s))'] },
    // Spring 2025 Final — Q4
    { id: 'sp25f-4a', problem: 'sp25f-4a', label: 'i.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['t.label == x', 'b.label == x', 't.label == x.label', 'b.label == x.label'] },
    { id: 'sp25f-4b', problem: 'sp25f-4a', label: 'ii.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'b',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['t', 't.label', 'b', 'b.label'] },
    { id: 'sp25f-4c', problem: 'sp25f-4a', label: 'iii.', points: 3, topics: ['trees', 'recursion', 'lists'], difficulty: 'hard', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c).' },
    { id: 'sp25f-4d', problem: 'sp25f-4b', label: 'i.', points: 1, topics: ['trees', 'lists'], difficulty: 'easy', blank: 'd',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['[t.label]', 't.branches', '[b.label for b in t.branches]', '[graft(b, u, x) for b in t.branches]'] },
    { id: 'sp25f-4e', problem: 'sp25f-4b', label: 'ii.', points: 4, topics: ['trees', 'lists'], difficulty: 'hard', blank: 'e',
      type: 'short_answer', prompt: 'Fill in blank (e).' },
    { id: 'sp25f-4f', problem: 'sp25f-4b', label: 'iii.', points: 1, topics: ['trees', 'recursion'], difficulty: 'easy', blank: 'f',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (f).', choices: ['graft(b, u, x)', 'return graft(b, u, x)', 'b = u', 'b.label = u.label'] },
    // Spring 2025 Final — Q5
    { id: 'sp25f-5a', problem: 'sp25f-5', label: '(a)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['self', 'self.number', 'Boat', 'Boat.number'] },
    { id: 'sp25f-5b', problem: 'sp25f-5', label: '(b)', points: 3, topics: ['oop', 'fundamentals'], difficulty: 'hard', blank: 'b',
      type: 'short_answer', prompt: 'Fill in blank (b).' },
    { id: 'sp25f-5c', problem: 'sp25f-5', label: '(c)', points: 3, topics: ['oop', 'fundamentals'], difficulty: 'hard', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c), which evaluates to the seat number assigned to the `Rower` when they sat.' },
    { id: 'sp25f-5d', problem: 'sp25f-5', label: '(d)', points: 2, topics: ['oop'], difficulty: 'medium', blank: 'd',
      type: 'multi_select', mono: true, prompt: 'Fill in blank (d). **Select all that apply.**',
      choices: ['self.boat is not None', 'super().sit(boat)', 'super(self).sit(boat)', 'super().sit(self, boat)', 'Rower.sit(boat)', 'self.Rower.sit(boat)', 'Rower.sit(self, boat)'] },
    { id: 'sp25f-5e', problem: 'sp25f-5', label: '(e)', points: 1, topics: ['oop', 'fundamentals'], difficulty: 'medium', blank: 'e',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (e).',
      choices: ['claimed = True', 'self.claimed = True', 'claimed[boat] = self', 'self.claimed[boat] = self', 'boat.captain = self', 'boat.captain = True'] },
    { id: 'sp25f-5f', problem: 'sp25f-5', label: '(f)', points: 2, topics: ['oop', 'fundamentals'], difficulty: 'medium', blank: 'f',
      type: 'short_answer', prompt: 'Fill in blank (f), which evaluates to the name of the captain that claimed this boat.' },
    // Spring 2025 Final — Q6
    { id: 'sp25f-6a', problem: 'sp25f-6a', label: 'i.', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
      choices: ["digits == ''", 'n == 0', "digits == '' and n == 0", "digits == '' or n == 0"] },
    { id: 'sp25f-6b', problem: 'sp25f-6a', label: 'ii.', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'b',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
      choices: ['10', 'int(digits)', 'int(digits) + 1', 'len(digits)', 'len(digits) + 1'] },
    { id: 'sp25f-6c', problem: 'sp25f-6a', label: 'iii.', points: 1, topics: ['recursion', 'hof'], difficulty: 'easy', blank: 'c',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['any', 'all', 'list', 'min', 'iter'] },
    { id: 'sp25f-6d', problem: 'sp25f-6a', label: 'iv.', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'd',
      type: 'short_answer', prompt: 'Fill in blank (d).' },
    { id: 'sp25f-6e', problem: 'sp25f-6a', label: 'v.', points: 2, topics: ['recursion', 'fundamentals'], difficulty: 'medium', blank: 'e',
      type: 'short_answer', prompt: 'Fill in blank (e).' },
    { id: 'sp25f-6f', problem: 'sp25f-6a', label: 'vi.', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'f',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (f).', choices: ['True', 'False', 'n == 0', 'n in digits', 'str(n) in digits'] },
    { id: 'sp25f-6g', problem: 'sp25f-6b', label: 'i.', points: 2, topics: ['links', 'recursion'], difficulty: 'easy', blank: 'g',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (g) to implement `join_link`.',
      choices: ['s + str(s.rest)', 's + join_link(s.rest)', 's + join_link(s.rest.first)', 's.first + str(s.rest)', 's.first + join_link(s.rest)', 's.first + join_link(s.rest.first)'] },
    { id: 'sp25f-6h', problem: 'sp25f-6b', label: 'ii.', points: 2, topics: ['links', 'iterators', 'recursion'], difficulty: 'medium', blank: 'h',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (h) to implement `to_link`.',
      choices: ['Link(t, to_link(t))', 'Link(t, to_link(t.rest))', 'Link(t, to_link(t).rest)', 'Link(t, to_link(next(t)))', 'Link(next(t), to_link(t))', 'Link(next(t), to_link(t.rest))', 'Link(next(t), to_link(t).rest)', 'Link(next(t), to_link(next(t)))'] },
    { id: 'sp25f-6i', problem: 'sp25f-6c', label: 'i.', points: 3, topics: ['links', 'fundamentals'], difficulty: 'hard', blank: 'i',
      type: 'short_answer', prompt: 'Fill in blank (i).' },
    { id: 'sp25f-6j', problem: 'sp25f-6c', label: 'ii.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'j',
      type: 'short_answer', prompt: 'Fill in blank (j).' },
    { id: 'sp25f-6k', problem: 'sp25f-6c', label: 'iii.', points: 1, topics: ['generators'], difficulty: 'medium', blank: 'k',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (k).',
      choices: ['n = -n', 'yield first', 'yield -first', 'yield n-first', 'yield from terms(digits, -n)'] },
    // Spring 2025 Final — Q7 (Scheme)
    { id: 'sp25f-7a', problem: 'sp25f-7a', label: 'i.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'a',
      type: 'short_answer', prompt: 'Fill in blank (a).' },
    { id: 'sp25f-7b', problem: 'sp25f-7a', label: 'ii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'b',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
      choices: ['s', '(cdr s)', '(cdr (cdr s))', '(except-last s)', '(except-last (cdr s))', '(except-last (cdr (cdr s)))'] },
    { id: 'sp25f-7c', problem: 'sp25f-7a', label: 'iii.', points: 3, topics: ['scheme'], difficulty: 'hard', blank: 'c',
      type: 'short_answer', prompt: 'Fill in blank (c) to implement `except-last-k`.' },
    { id: 'sp25f-7b-i', problem: 'sp25f-7b', label: 'i.', points: 2, topics: ['scheme'], difficulty: 'hard',
      type: 'single_choice', mono: true, prompt: "`(cons 2 (mystery (cons 3 nil) '(4)))`",
      choices: ['(2 4)', '(2 (4))', '(2 3 4)', '(2 3 (4))', '(2 (3 4))', '(2 (3 (4)))', 'ERROR'] },
    { id: 'sp25f-7b-ii', problem: 'sp25f-7b', label: 'ii.', points: 2, topics: ['scheme'], difficulty: 'hard',
      type: 'single_choice', mono: true, prompt: '`(mystery (* (+ 2 3) (+ 4 (/ 2 0))) (- 5 2))`',
      choices: ['3', '5', '8', '15', '20', '35', 'ERROR'] },
    // Spring 2025 Final — Q8 (SQL)
    { id: 'sp25f-8a', problem: 'sp25f-8a', label: '(a)', points: 3, topics: ['sql-joins'], difficulty: 'easy', blank: 'a',
      type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
      choices: ['who JOIN kinds ON kind=what WHERE kind=living', "who JOIN kinds ON kind=what WHERE kind='living'", 'who JOIN kinds ON kind=what WHERE living=yes', "who JOIN kinds ON kind=what WHERE living='yes'", 'who JOIN kinds ON kind=kinds WHERE kind=living', "who JOIN kinds ON kind=kinds WHERE kind='living'", 'who JOIN kinds ON kind=kinds WHERE living=yes', "who JOIN kinds ON kind=kinds WHERE living='yes'"] },
    { id: 'sp25f-8b', problem: 'sp25f-8b', label: '(b)', points: 3, topics: ['sql-joins', 'sql-agg'], difficulty: 'hard', blank: 'b',
      type: 'multi_select', mono: true, prompt: 'Fill in blank (b). **Select all that apply.**',
      choices: ['a.size >= b.size * 0.5', 'b.size >= a.size * 0.5', 'a.size >= b.size * 0.5 OR b.size >= a.size * 0.5', 'a.size >= b.size * 0.5 AND b.size >= a.size * 0.5', 'MIN(a.size, b.size) >= b.size * 0.5', 'a.size >= MAX(a.size, b.size) * 0.5', 'MIN(a.size, b.size) >= MAX(a.size, b.size) * 0.5', 'MIN(a.size / b.size, b.size / a.size) >= 0.5', 'MAX(a.size / b.size, b.size / a.size) >= 0.5'] },
    // Spring 2025 Final — Q9 (A+)
    { id: 'sp25f-9a', problem: 'sp25f-9a', label: '(a)', points: 0, topics: ['lists', 'fundamentals'], difficulty: 'hard', blank: 'A+',
      type: 'code', prompt: 'Fill in the blank. Do not write `if`, `and`, `or`, or `lambda`.' },
    { id: 'sp25f-9b', problem: 'sp25f-9b', label: '(b)', points: 0, topics: ['generators', 'hof'], difficulty: 'hard', blank: 'A+',
      type: 'code', prompt: 'Fill in the blank. If your answer is long, write it on multiple lines.' },
  ];

  const ANSWER_KEY = {
    // Fall 2025 Final
    'fa25f-1a': { accepted: ['300'], explanation: '`f` looks up `x` when it is called, not when it is defined, so by the time `f(g(x))` runs, `x` is `c`, which is 10. `g` was made by calling the outer lambda with `x` = 3, so `g(10)` is `3 * 10` = 30. Then `f(30)` is `x * 30` = `10 * 30` = 300.' },
    'fa25f-1b': { accepted: ['-2\n4\n2'], explanation: 'The map is lazy: each item is computed when `delay` asks for it. `print(-2)` prints -2 and gives `None`, so `last` stays falsy. `abs(-2)` is 2, which becomes `last`. `square(-2)` is 4: now `last` is truthy, so `delay` prints 4 and returns `last`, which is 2, and the outer `print` shows it. The final `print` in `w` is never called.' },
    'fa25f-2a': { correct: 3, explanation: '`copy(inner)` builds a new list `[5, [6]]` whose second element is the *same* inner list `[6]`. Changing `inner[0]`, appending to `inner` and rebinding `inner[1]` don’t touch `first`, but `inner[1].append(7)` mutates that shared list, so `first` is `[5, [6, 7]]`.' },
    'fa25f-2b': { correct: 3, explanation: '`second` names the inner list `[6]`. `inner[1].append(7)` changes that list to `[6, 7]`. Then `inner[1] = 8` only rebinds a slot of `inner`; `second` still refers to `[6, 7]`.' },
    'fa25f-2c': { correct: 2, explanation: 'For each `i`, slicing `s[:i]` and summing it take time proportional to `i`. Adding 0 + 1 + … + (n−1) gives about n²/2 steps: quadratic.' },
    'fa25f-3a': { correct: 2, explanation: 'A number is an `int` *or* the string `\'?\'`. Without quotes, `?` is a syntax error, and `and` would require `x` to be both.' },
    'fa25f-3b': { accepted: ['not number and x in', '(not number) and x in'], explanation: 'When a number isn’t expected, `x` must be one of the operators. Together with the code after the blank this reads `not number and x in [\'+\', \'-\', \'=\']`.' },
    'fa25f-3c': { accepted: ['not number and equals == 1', 'equals == 1 and not number', '(not number) and equals == 1', 'not number and equals < 2 and equals > 0'], explanation: 'An equation ends with a number, so after the last element `number` was flipped to `False`. It must also contain exactly one `=`. (An empty list leaves `number` as `True`, so it is rejected.)' },
    'fa25f-3d': { correct: 0, explanation: 'Elements alternate, starting with a number, so `number` says whether `x` is in a number position (`is_equation` already checked the shape).' },
    'fa25f-3e': { accepted: ['x = next(ans)'], explanation: 'Each `?` is replaced by the next answer; `ans` is an iterator, so `next` takes them in order.' },
    'fa25f-3f': { correct: 0, explanation: 'At `=`, the left side is finished, so `tally` returns its total. Because `eq` is an iterator, the second call to `tally` in `evaluate` continues right after the `=`.' },
    'fa25f-3g': { accepted: ["{'+': 1, '-': -1}", "{'-': -1, '+': 1}"], explanation: 'A dictionary maps each operator to the sign of the next number: `+` keeps it, `-` negates it.' },
    'fa25f-3h': { accepted: ['evaluate(eq, [])'], explanation: 'With no `?` left, the equation is feasible exactly when it is already true, and it needs no answers.' },
    'fa25f-3i': { correct: 2, explanation: '`i` is an index, so the element is `eq[i]`. The smallest index whose element is `\'?\'` is the first placeholder.' },
    'fa25f-3j': { accepted: ['feasible(eq[:n] + [x] + eq[n+1:], allowed)', 'feasible(eq[:n] + [x] + eq[n + 1:], allowed)'], explanation: 'Replace the first `?` with `x` (a new list, so `eq` is unchanged) and ask recursively whether the rest can be filled. Passing `allowed` along keeps the same range.' },
    'fa25f-3k': { correct: 4, explanation: 'After choosing `first`, the remaining n−1 values come from every candidate list of length n−1.' },
    'fa25f-3l': { correct: 1, explanation: '`rest` is a list, so putting `first` in a one-element list and concatenating gives a list of n values.' },
    'fa25f-3m': { correct: 1, explanation: '`filter` keeps only the candidate lists that satisfy the equation, and returns an iterator, as `solve` should.' },
    'fa25f-3n': { accepted: ['lambda a: evaluate(equation, a)', 'lambda x: evaluate(equation, x)', 'lambda s: evaluate(equation, s)', 'lambda c: evaluate(equation, c)', 'lambda answers: evaluate(equation, answers)'], explanation: 'The filter’s function takes one candidate answer list and checks it against `equation`.' },
    'fa25f-4a': { correct: 0, explanation: '`insert` fills `result` for a whole subtree. Calling it on each branch first means `result[b]` exists for every branch when the next line runs.' },
    'fa25f-4b': { accepted: ['t.label + sum([result[b] for b in t.branches])', 't.label + sum(result[b] for b in t.branches)', 'sum([result[b] for b in t.branches]) + t.label', 't.label + sum([result[b] for b in t.branches], 0)'], explanation: 'A node’s sum is its own label plus the sums of its branches, which `insert(b)` already stored.' },
    'fa25f-4c': { accepted: ['abs(n - (total - d[node]))', 'abs(total - d[node] - n)', 'abs((total - d[node]) - n)', 'abs(n - total + d[node])'], explanation: 'Cutting `node` removes its whole subtree, whose labels add up to `d[node]`, so the remaining sum is `total - d[node]`. Pick the node that brings it closest to `n`.' },
    'fa25f-4d': { correct: 6, explanation: '`cut` must build a new tree (no mutation) and must recurse, since `target` can be deep in the tree. It returns a copy that skips `target` and cuts inside the other branches.' },
    'fa25f-4e': { correct: 1, explanation: '`one_cut` returns the new tree that `cut` builds from the root. Returning `t` would give back the original, uncut tree.' },
    'fa25f-5a': { correct: [0, 3], explanation: 'Coroutines only switch at `await`. Each `download_files` reads and increments `current_index` with no `await` in between, so no two of them take the same index, and the loop condition is checked before each read. Every file is downloaded exactly once, so `download` is called exactly 4 times and the index never goes out of range.' },
    'fa25f-5b': { accepted: ['2 seconds', '2', 'two seconds', '2 s', '2.0 seconds', '2s'], explanation: 'The two coroutines download at the same time: “a” and “b” together (1 second), then “c” and “d” together (1 more second).' },
    'fa25f-6a': { correct: 3, explanation: 'Move `t` ahead `k` positions so that `s` and `t` point at elements `k` apart. The `if` stops early when the list is shorter than `k`.' },
    'fa25f-6b': { accepted: ['t = t.rest'], explanation: 'Each loop step moves `t` one position ahead of `s`.' },
    'fa25f-6c': { accepted: ['s.first == t.first', 't.first == s.first'], explanation: '`s` and `t` are always `k` positions apart, so compare the elements they point at.' },
    'fa25f-6d': { accepted: ['s, t = s.rest, t.rest', 't, s = t.rest, s.rest'], explanation: 'Advance both together so they stay `k` apart. Multiple assignment does it in one line.' },
    'fa25f-6e': { correct: 0, explanation: 'Build the result one element at a time: the first result, then the rest of the list.' },
    'fa25f-6f': { correct: 6, explanation: '`f` takes two arguments: the first element of `s` and the first element of `t`.' },
    'fa25f-6g': { accepted: ['(zip-map f (cdr s) (cdr t))'], explanation: 'Recurse on the rest of both lists.' },
    'fa25f-6h': { correct: 4, explanation: 'The inner expression is a list of 1s and 0s; `apply +` adds them up.' },
    'fa25f-6i': { correct: 1, explanation: '`zip-map` pairs each element with the one `k` positions later.' },
    'fa25f-6j': { accepted: ['(if (= a b) 1 0)', '(if (equal? a b) 1 0)', '(if (eq? a b) 1 0)'], explanation: 'Each matching pair counts as 1, every other pair as 0.' },
    'fa25f-6k': { correct: 3, explanation: 'Pairing `s` with `(advance s k)` lines up elements that are `k` apart; `zip-map` stops at the shorter list.' },
    'fa25f-7a': { correct: 0, explanation: 'Start with no group. If the loop finds no match, `self.group` stays `None`, which is falsy, so `if not self.group` makes a new one.' },
    'fa25f-7b': { accepted: ['DiscGroup.groups', 'list(DiscGroup.groups)'], explanation: 'The class attribute `DiscGroup.groups` lists every discussion group made so far.' },
    'fa25f-7c': { correct: 1, explanation: 'Join the matching existing group.' },
    'fa25f-7d': { correct: 2, explanation: 'Make a new group for this keyword. `DiscGroup.__init__` takes only a keyword (`self` is passed automatically), and a student has no `keyword` attribute.' },
    'fa25f-7e': { accepted: ['self.group.students.append(self)'], explanation: 'Whichever group was chosen, add this student to its `students` list.' },
    'fa25f-7f': { accepted: ['len(DiscGroup.groups)', 'len(self.groups)'], explanation: 'Ids count up from 0, so a new group’s id is the number of groups that already exist (it hasn’t been added yet).' },
    'fa25f-7g': { accepted: ['DiscGroup.groups.append(self)', 'self.groups.append(self)'], explanation: 'Record the new group in the class-wide list. `self.groups` finds the class attribute too, and `append` mutates that same list.' },
    'fa25f-8a': { correct: 2, explanation: 'With rows grouped by keyword, `COUNT(*)` is the number of students in each group.' },
    'fa25f-8b': { correct: 5, explanation: 'Group by keyword, sort the groups by size from largest to smallest, and keep only the first. Aggregates can’t be nested (`MAX(COUNT(*))`), and ordering by `keyword` sorts alphabetically, not by size.' },
    'fa25f-8c': { accepted: ['ON discussion_id = id GROUP BY id HAVING COUNT(*) > 20', 'ON id = discussion_id GROUP BY id HAVING COUNT(*) > 20', 'ON discussion_id = id GROUP BY discussion_id HAVING COUNT(*) > 20', 'ON id = discussion_id GROUP BY discussion_id HAVING COUNT(*) > 20', 'ON discussion_id = id GROUP BY id HAVING COUNT(*) >= 21', 'ON discussion_id = id GROUP BY id, ta HAVING COUNT(*) > 20', 'ON discussion_id = id GROUP BY ta, id HAVING COUNT(*) > 20'], explanation: 'Join each student to their discussion, make one group per discussion, and keep groups with more than 20 rows. The filter uses an aggregate, so it goes in `HAVING`, not `WHERE`.' },
    'fa25f-9a': { accepted: ["(cons '+ (rest expr (lambda (h s) (cons (list '- (car (cdr s))) (h (cdr (cdr s)))))))"] },
    'fa25f-9b': { accepted: ['min([one_cut(one_cut(t, k), n) for k in range(g(t))], key=lambda t: abs(n - g(t)))'] },

    // Spring 2025 Final
    'sp25f-1a': { accepted: ['-3'], explanation: 'The first element of the map is computed for `x = 0`: `6 // (0 - 2)` is `6 // -2`, which is -3.' },
    'sp25f-1b': { accepted: ['[[2, 2]]'], explanation: 'For `y = 2`, `range(2, 3)` has just 2, so the inner list is `[[2, 2]]`. (For `y = 1` it was `[[1, 1], [2, 1]]`.)' },
    'sp25f-1c': { accepted: ['[7, 5, 3]'], explanation: '`dip` yields the values of `dip(s[1:])` plus 1, then `s[0]`. `dip([5])` yields 5; `dip([4, 5])` yields 6, 4; `dip([3, 4, 5])` yields 7, 5, 3.' },
    'sp25f-2a': { accepted: ['[16]'], explanation: '`where` looks up the *global* `squares`, not `bears`’ parameter. Neither line 6 nor line 7 changes the global list `[[9], [16], [25]]`, so `where(1)` is `[16]`.' },
    'sp25f-2b': { accepted: ['[3, [4], 5]'], explanation: 'The argument is a new list `[3, [4, 5], 16]` whose second element is the same `[4, 5]` that is inside `stairs[1]`. `squares[1].pop()` removes 5 from that shared list, and `stairs[1].append(5)` adds it to `stairs[1]`, giving `[3, [4], 5]`.' },
    'sp25f-2c': { correct: 3, explanation: 'Each call makes two recursive calls on lists that are only 2 or 3 shorter, so the number of calls grows exponentially (like Fibonacci).' },
    'sp25f-2d': { correct: 1, explanation: 'With memoization each suffix of `s` is computed once. There are about n suffixes, so the calls are linear (ignoring the cost of slicing).' },
    'sp25f-3a': { correct: [2, 4], explanation: '`i` must equal `t` or equal `u`; `i in [t, u]` says the same. `i == t or u` is always truthy when `u` isn’t 0, because `or` doesn’t repeat the comparison.' },
    'sp25f-3b': { accepted: ['s[t + u - i]', 's[u + t - i]', 's[(t + u) - i]', 's[t - i + u]', 's[u - i + t]'], explanation: 'If `i` is `t`, then `t + u - i` is `u`, and if `i` is `u` it is `t`: the other index, as the hint suggests.' },
    'sp25f-3c': { correct: 2, explanation: 'Any other index keeps its own element.' },
    'sp25f-3d': { correct: 3, explanation: '`select` takes an index, so loop over every index of `s`.' },
    'sp25f-4a': { correct: 0, explanation: 'The branches of `t` are its children. They belong in the result when their parent, `t`, is labeled `x`.' },
    'sp25f-4b': { correct: 3, explanation: 'The result holds labels, so add the child’s label.' },
    'sp25f-4c': { accepted: ['extend(offspring(b, x))', 'extend(offspring(b, x)) ', 'extend(list(offspring(b, x)))'], explanation: 'Children of `x` deeper in the tree are found by the recursive call on each branch; `extend` adds all of them to `result`.' },
    'sp25f-4d': { correct: 2, explanation: 'Look for `x` among the labels of `t`’s branches, so its index can be used to replace that branch.' },
    'sp25f-4e': { accepted: ['t.branches[s.index(x)] = u'], explanation: 'The branch labeled `x` is at the same index in `t.branches` as `x` is in `s`; replace it with `u`.' },
    'sp25f-4f': { correct: 0, explanation: 'Otherwise, look in every branch. `graft` mutates and returns nothing, so there is nothing to return (and returning would stop after the first branch).' },
    'sp25f-5a': { correct: 0, explanation: '`sit` takes the boat as its argument; inside `add`, the boat is `self`.' },
    'sp25f-5b': { accepted: ['self.where[p] = len(self.where)'], explanation: 'Seats are given out in order from 0, so the next free seat is the number of rowers already seated.' },
    'sp25f-5c': { accepted: ['self.boat.where[self]'], explanation: 'A rower’s seat number is stored in their boat’s `where` dictionary, under the rower.' },
    'sp25f-5d': { correct: [1, 6], explanation: 'This should run `Rower`’s `sit` (which seats the captain or prints “already has a seat!”). `super().sit(boat)` and `Rower.sit(self, boat)` both call it with this captain as `self`.' },
    'sp25f-5e': { correct: 3, explanation: '`claimed` is a class attribute dictionary from boats to their captain. `self.claimed[boat] = self` mutates that shared dictionary (assigning to `self.claimed` would make an instance attribute instead).' },
    'sp25f-5f': { accepted: ['self.claimed[boat].name', 'Captain.claimed[boat].name'], explanation: 'The captain who claimed the boat is stored in `claimed` under that boat.' },
    'sp25f-6a': { correct: 2, explanation: 'Every digit is used, so success means no digits are left and the remaining target is 0.' },
    'sp25f-6b': { correct: 4, explanation: '`k` is how many digits the first number uses, from 1 up to all of them, so the range stops at `len(digits) + 1`.' },
    'sp25f-6c': { correct: 0, explanation: 'Either sign may work, so succeed if any of the two recursive calls does.' },
    'sp25f-6d': { accepted: ['digits[k:]'], explanation: 'The rest of the digits, after the first number.' },
    'sp25f-6e': { accepted: ['int(digits[:k])'], explanation: 'The first number is made of the first `k` digits. Adding it with `sign` means the rest must make `n - sign * first`.' },
    'sp25f-6f': { correct: 1, explanation: 'No split worked.' },
    'sp25f-6g': { correct: 4, explanation: '`s.first` is a string and `join_link(s.rest)` joins the rest.' },
    'sp25f-6h': { correct: 4, explanation: '`next(t)` takes the first value; the recursive call then builds the rest from the same iterator. When `t` runs out, `next` raises `StopIteration`, which ends the list.' },
    'sp25f-6i': { accepted: ['first * 10 + int(digits.first)', 'int(digits.first) + first * 10', '10 * first + int(digits.first)', 'int(str(first) + digits.first)'], explanation: 'Each step adds the next digit to the number being built: shift `first` one place left and add the digit.' },
    'sp25f-6j': { accepted: ['join_link(digits.rest)'], explanation: '`can_equal` takes a string, so turn the digits after this one back into a string.' },
    'sp25f-6k': { correct: 2, explanation: 'Here the number is subtracted, so the term is `-first`, and the rest must reach `n + first`.' },
    'sp25f-7a': { accepted: ['(or (null? s) (null? (cdr s)))'], explanation: 'An empty or one-element list has nothing left after removing the last element.' },
    'sp25f-7b': { correct: 4, explanation: 'Keep the first element and recurse on the rest.' },
    'sp25f-7c': { accepted: ['(except-last-k (- k 1) (except-last s))'], explanation: 'Remove one element, then remove k−1 more.' },
    'sp25f-7b-i': { correct: 2, explanation: 'The macro receives the expression `(cons 3 nil)` unevaluated. `except-last` gives `(cons 3)`, and appending `\'(4)` makes `(cons 3 (quote (4)))`, which evaluates to `(3 4)`. So the result is `(2 3 4)`.' },
    'sp25f-7b-ii': { correct: 3, explanation: 'The macro drops the last part of the expression, `(+ 4 (/ 2 0))`, before it is ever evaluated, and puts `(- 5 2)` in its place: `(* (+ 2 3) (- 5 2))` is 15.' },
    'sp25f-8a': { correct: 3, explanation: 'Join each character to its kind (the `what` column) and keep rows where `living` is the string `\'yes\'`. Without quotes, `yes` would be read as a column name.' },
    'sp25f-8b': { correct: [3, 6, 7], explanation: 'Both sizes must be at least half the other. Writing both conditions with `AND`, comparing the smaller to half the larger, or checking that the smaller ratio is at least 0.5 all say this. One condition alone, `OR`, or the larger ratio are not the same.' },
    'sp25f-9a': { accepted: ['s[{t: u, u: t}.get(x, x)]'] },
    'sp25f-9b': { accepted: ['next(filter(lambda x: eval(x) == n, f(digits)))'] },
  };

  Object.assign(B.EXAMS, EXAMS);
  Object.assign(B.PROBLEMS, PROBLEMS);
  B.QUESTIONS.push(...QUESTIONS);
  Object.assign(B.ANSWER_KEY, ANSWER_KEY);

  // Finals added later: each one is a self-contained add({ exam, problems, questions, answers }) block below.
  function add(x) {
    B.EXAMS[x.exam.id] = x.exam;
    Object.assign(B.PROBLEMS, x.problems);
    B.QUESTIONS.push(...x.questions);
    Object.assign(B.ANSWER_KEY, x.answers);
  }

  // ───────────────────────────── Fall 2024 Final ─────────────────────────────

  const FA24_TABLES = code(`
who:
| name         | region    | job        |
|--------------|-----------|------------|
| caitlyn      | piltover  | enforcer   |
| vi           | zaun      | enforcer   |
| jayce        | piltover  | scientist  |
| victor       | piltover  | scientist  |
| ekko         | zaun      | firelight  |
| heimerdinger | piltover  | scientist  |
| jinx         | zaun      | rebel      |
| mel          | noxus     | councilor  |
| ambessa      | noxus     | warlord    |
| vander       | zaun      | barkeep    |
| silco        | zaun      | chembaron  |

gov:
| place      | ruler       |
|------------|-------------|
| noxus      | triumvirate |
| zaun       | council     |
| piltover   | council     |
| bilgewater | gangs       |

expected result:
| name   | job       |
|--------|-----------|
| vander | barkeep   |
| silco  | chembaron |
| ekko   | firelight |
| jinx   | rebel     |
`);
  const FA24_SETUP = code(`
CREATE TABLE who(name, region, job);
INSERT INTO who VALUES ('caitlyn', 'piltover', 'enforcer'), ('vi', 'zaun', 'enforcer'), ('jayce', 'piltover', 'scientist'),
  ('victor', 'piltover', 'scientist'), ('ekko', 'zaun', 'firelight'), ('heimerdinger', 'piltover', 'scientist'),
  ('jinx', 'zaun', 'rebel'), ('mel', 'noxus', 'councilor'), ('ambessa', 'noxus', 'warlord'), ('vander', 'zaun', 'barkeep'),
  ('silco', 'zaun', 'chembaron');
CREATE TABLE gov(place, ruler);
INSERT INTO gov VALUES ('noxus', 'triumvirate'), ('zaun', 'council'), ('piltover', 'council'), ('bilgewater', 'gangs');
`);
  add({
    exam: { id: 'fa24f', label: 'Fall 2024 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'fa24f-1': {
        exam: 'fa24f', number: '1', title: 'What Would Python Display?', points: 6,
        intro: 'Assume the following code has been executed.',
        code: code(`
def cut(s):
    this = 1
    for x in s:
        if this:
            this = x
            yield this
        else:
            this = True

def paste(n):
    yield n
    for x in paste(n + 1):
        yield 2 * x
    yield n

def copy(t, k):
    return [next(t) for x in range(k)]

nums = [0, 2, 4, 6, 8]
`),
        outro: 'Write the output that would be displayed by printing the result of each expression. If an error occurs, write *ERROR*.',
      },
      'fa24f-2': {
        exam: 'fa24f', number: '2', title: 'Line Diagram', points: 4,
        intro: 'Complete the environment diagram to answer the following questions. Only the questions will be scored.',
        figure: { src: 'assets/fa24-final-q2.png', width: 440, height: 402, alt: 'From the exam: the code with line numbers 1 to 16, and a blank environment diagram. The Global frame has five blank bindings. Frames f1 to f4 each have a blank name and blank parent, two blank bindings and a blank Return value.', slots: [[292, 18, 86], [389, 18, 44], [292, 35, 86], [389, 35, 43], [292, 53, 86], [389, 53, 44], [292, 70, 86], [389, 70, 44], [292, 89, 86], [389, 89, 44], [261, 111, 50], [363, 111, 50], [292, 127, 86], [389, 127, 44], [292, 146, 86], [389, 146, 44], [389, 165, 44], [261, 188, 50], [363, 188, 50], [292, 204, 86], [389, 204, 44], [292, 223, 86], [389, 223, 43], [389, 242, 44], [261, 265, 50], [363, 265, 50], [292, 280, 86], [389, 280, 43], [292, 299, 86], [389, 299, 43], [389, 319, 44], [261, 341, 50], [363, 341, 50], [293, 356, 84], [389, 356, 43], [292, 375, 86], [389, 375, 43], [389, 395, 44]] },
        code: code(`
b = 6
log = []

def make_line(a):
    b = 1
    list(log).append(a)
    return lambda x: a * x + b

def shift_line(f):
    b = 3
    log.append([b])
    return lambda y: f(y) + b

z = shift_line(make_line(2))(0)
print(log)
print(z)
`),
        lineNumbers: true,
      },
      'fa24f-3': {
        exam: 'fa24f', number: '3', title: 'Make Tens', points: 5,
        intro: 'A list of numbers is easier for a person to sum up if it can be split into groups that all sum to 10. Implement `tens`, which takes a list of positive numbers `s`. It returns `True` if, for every positive integer `i` where `10 * i <= sum(s)`, there is a positive `k` that satisfies `sum(s[0:k]) == 10 * i`. Otherwise, it returns `False`.',
        code: code(`
def tens(s):
    """Return whether every multiple of 10 less than or equal to sum(s) appears as a prefix of s.
    >>> tens([3, 2, 2, 3, 6, 2, 2, 4, 1, 5, 2])  # sum(s[:4])==10, sum(s[:7])==20, sum(s[:10])==30
    True
    >>> tens([3, 2, 2, 3, 6, 2, 6, 1, 5, 2])  # sum(s[:4])==10, but no slice starting at 0 sums to 20
    False
    """
    t = 0
    for x in s:
        t += x
        if ⟦g⟧:
            return ⟦h⟧
        if t == ⟦i⟧:
            t = ⟦j⟧
    return True
`),
      },
      'fa24f-4a': {
        exam: 'fa24f', number: '4(a)', title: 'Count Misses — Counter', points: 6,
        intro: 'Implement the `Counter` class. A `Counter` has a `count` of the number of times `inc` has been invoked on itself or any of its offspring. Its offspring are the `Counter`s created by its `spawn` method or the `spawn` method of any of its offspring.',
        code: code(`
class Counter:
    """Counts how many times inc has been invoked on itself or any of its offspring.

    >>> total = Counter()
    >>> odd, even = total.spawn(), total.spawn()  # these are offspring of total
    >>> one, three = odd.spawn(), odd.spawn()     # these are offspring of odd and total
    >>> for c in [one, even, three, even, odd, even]:
    ...     c.inc()
    >>> [c.count for c in [one, three, even, odd, total]]
    [1, 1, 3, 3, 6]
    """
    def __init__(self, parent=None):
        self.parent = parent
        ⟦a⟧

    def inc(self):
        self.count += 1
        ⟦b⟧:
            ⟦c⟧

    def spawn(self):
        return ⟦d⟧
`),
      },
      'fa24f-4b': {
        exam: 'fa24f', number: '4(b)', title: 'Count Misses — MissDict', points: 7,
        intro: 'Implement the `MissDict` class. A `MissDict` has a dictionary `d`. Its `get` method takes an iterable `keys`, returns a list of all values in `d` that correspond to those keys, and counts the number of keys that did not appear in `d` (called *misses*). Printing a `MissDict` displays a fraction in which:\n\n- The numerator is the number of misses during all calls to `get` for that particular `MissDict` instance.\n- The denominator is the number of misses during all calls to `get` for any `MissDict` instance.\n\nAssume `Counter` is implemented correctly.',
        code: code(`
class MissDict:
    """Has a dict, gets a list of values for an iterable of keys,
    and counts the number of keys that are not in the dict.

    >>> double = MissDict({1: 2, 2: 4, 3: 6, 5: 10})
    >>> half = MissDict({2: 1.0, 3: 1.5, 4: 2.0})
    >>> double.get([1, 3, 5, 2, 4])  # No value for key 4 (1 miss)
    [2, 6, 10, 4]
    >>> double.get([5, 4, 3, 0, 4])  # No value for keys 4 or 0 or 4 (3 misses)
    [10, 6]
    >>> half.get([1, 3, 5, 2, 4])    # No value for keys 1 or 5 (2 misses)
    [1.5, 1.0, 2.0]
    >>> print(double)  # double had 4 misses & half had 2 misses
    4 / 6 of the misses
    """
    misses = Counter()
    def __init__(self, d):
        assert isinstance(d, dict)
        self.d = d
        self.misses = ⟦e⟧
    def get(self, keys):
        result = []
        for k in keys:
            if k in self.d:
                ⟦f⟧
            else:
                ⟦g⟧
        return result

    def __str__(self):
        return f'⟦h⟧ of the misses'
`),
      },
      'fa24f-5a': {
        exam: 'fa24f', number: '5(a)', title: 'Promotion to CS 61B — promote', points: 4,
        intro: '**Definition.** Given a sequence `s` and positions (indices) `i` and `j` in `s` with `i < j`, *promoting* an element to `i` from `j` means reordering `s` so that the element originally at position `j` is now at position `i`, all elements originally positioned between `i` and `j` increase their position (index) by one, and all other elements stay where they are. The beginning of `s` is position 0. For example, in the list `[30, 60, 90, 120, 150, 180]`, promoting to 2 from 4 would place the number 150 (original position 4) just before 90 (originally position 2) and increases the positions of both 90 and 120 by one, resulting in `[30, 60, 150, 90, 120, 180]`.\n\nImplement `promote`, which takes a list of numbers `s` and two non-negative integers `i` and `j`. It returns a new list promoting to `i` from `j` in `s`. Do not mutate `s`. **Hint:** For any list `s`, `s[len(s):]` evaluates to `[]`.',
        code: code(`
def promote(s, i, j):
    """Return a list in which s[j] is at index i without mutating s.

    >>> promote([3, 6, 9, 12, 15, 18], 2, 4)
    [3, 6, 15, 9, 12, 18]
    >>> promote([3, 6, 9, 12, 15, 18], 0, 4)
    [15, 3, 6, 9, 12, 18]
    """
    assert i >= 0 and i < j and j < len(s)
    return s[:i] + ⟦a⟧ + ⟦b⟧ + s[⟦c⟧:]
`),
      },
      'fa24f-5b': {
        exam: 'fa24f', number: '5(b)', title: 'Promotion to CS 61B — promotions', points: 4,
        intro: 'Implement `promotions`, which takes two lists of numbers `s` and `t` that have the same elements, possibly in different orders. It returns the minimum number of promotions that must be applied to `s` so that it has the same order as `t`. Assume `promote` is implemented correctly.',
        code: code(`
def promotions(s, t):
    """Return the minimum times promote must be called to start from s and return t.

    >>> promotions([2, 4, 6, 8, 10, 12],
    ...            [2, 6, 8, 4, 12, 10])  # promote (1, 2) then (2, 3) then (4, 5)
    3
    >>> promotions([6, 1, 6, 1, 6, 1],
    ...            [1, 1, 6, 6, 1, 6])    # promote (0, 1) then (1, 5)
    2
    >>> promotions([1, 2, 3], [1, 2, 3])        # no promotions needed
    0
    >>> promotions([1, 2, 1, 2], [2, 1, 2, 1])  # promote (0, 3)
    1
    """
    assert sorted(s) == sorted(t)  # Check that s & t have the same elements (disregarding order)
    if len(s) == 0:
        return 0
    elif ⟦d⟧:
        return promotions(s[1:], t[1:])
    else:
        return 1 + min([promotions(⟦e⟧, t[1:]) for j in range(1, len(s)) if ⟦f⟧])
`),
      },
      'fa24f-5c': {
        exam: 'fa24f', number: '5(c)', title: 'Promotion to CS 61B — promote_link', points: 6,
        intro: 'Implement `promote_link`, which takes a `Link` instance `s` (a non-empty linked list) and two non-negative integers `i` and `j` with `i < j` and `j` less than the length of `s`. It mutates `s` by promoting to `i` from `j` and then returns `s`.\n\nThe `Link` class appears on Page 2 (left side) of the Midterm 2 Study Guide.',
        code: code(`
def promote_link(s, i, j):
    """Mutate linked list s so that the item at index j is at index i.

    >>> a = Link(3, Link(6, Link(9, Link(12, Link(15, Link(18))))))
    >>> print(promote_link(a, 2, 4))
    <3 6 15 9 12 18>
    >>> print(promote_link(a, 0, 4))
    <12 3 6 15 9 18>
    >>> promote_link(a, 1, 3) is a
    True
    """
    assert i >= 0 and i < j
    if i > 0:
        ⟦g⟧
    else:
        insert, tail = s.first, s.rest
        while j > 0:
            ⟦h⟧  # Hint: use multiple assignment: ___ , ___ = ___ , ___
            tail, j = tail.rest, j-1
        ⟦i⟧ = insert
    return ⟦j⟧
`),
      },
      'fa24f-5c-v': {
        exam: 'fa24f', number: '5(c) v', title: 'Promotion to CS 61B — promote_link output', points: 2,
        intro: 'Assume `promote_link` is implemented correctly.',
        code: code(`
odds = Link(3, Link(5, Link(7, Link(9))))
for i in range(3):
    promote_link(odds, 0, 3)

print(odds)
`),
      },
      'fa24f-6a': {
        exam: 'fa24f', number: '6(a)', title: 'Fresh Produce — products', points: 5,
        intro: 'Implement `products`, which takes a `Tree` instance `t` with positive integer labels and a positive integer `n`. It returns `True` if every path from the root of `t` to a leaf has labels that equal `n` when multiplied together.\n\nThe `Tree` class appears on Page 2 (left side) of the Midterm 2 Study Guide.',
        code: code(`
def products(t, n):
    """Return whether the product of labels along every root-to-leaf path is n.

    >>> products(Tree(1, [Tree(2, [Tree(3)]), Tree(6)]), 6)
    True
    >>> products(Tree(1, [Tree(2, [Tree(3)]), Tree(6)]), 12)
    False
    >>> products(Tree(1, [Tree(2, [Tree(3)]), Tree(5)]), 6)
    False
    >>> products(Tree(1, [Tree(5, [Tree(2)]), Tree(12)]), 12)
    False
    """
    assert type(n) == int
    if t.is_leaf():
        return ⟦a⟧
    if ⟦b⟧:
        return False
    return ⟦c⟧
`),
      },
      'fa24f-6b': {
        exam: 'fa24f', number: '6(b)', title: 'Fresh Produce — produce', points: 7,
        intro: '**Definition.** An *increasing sequence* is a sequence of integers in which each element after the first is larger than the previous element.\n\nImplement `produce`, which takes a positive integer `n`. It returns a `Tree` of positive integers in which:\n\n- The product of the labels along every root-to-leaf path is `n`,\n- Every increasing sequence of integers starting with 1 that has product `n` is a root-to-leaf path, and\n- Every sequence of siblings (nodes with a common parent) is an increasing sequence.',
        code: code(`
def produce(n):
    """Return the largest tree in which the labels for every root-to-label path
    are increasing and have product n. Put all siblings in increasing order.

    >>> produce(12)
    Tree(1, [Tree(2, [Tree(6)]), Tree(3, [Tree(4)]), Tree(12)])
    >>> print(produce(24))  # Paths are 1-2-3-4, 1-2-12, 1-3-8, 1-4-6, and 1-24
    1
      2
        3
          4
        12
      3
        8
      4
        6
      24
    """
    def grow(t, x):
        for k in range(⟦d⟧, x + 1):
            if ⟦e⟧ % k == 0:
                branch = ⟦f⟧
                if ⟦g⟧:
                    t.branches.append(branch)
        return t

    return grow(Tree(1), n)
`),
      },
      'fa24f-7a': {
        exam: 'fa24f', number: '7(a)', title: 'A Pair of Schemes — all-pairs', points: 4,
        intro: 'Implement the Scheme procedure `all-pairs`, which takes a procedure `f` and a list `s`. It returns `#t` if `(f x y)` is `#t` for every pair of adjacent elements `x` and `y` in `s`. Assume `f` always returns either `#t` or `#f`.',
        code: code(`
(define (inc x y) (= (+ x 1) y))        ; Whether x+1 equals y

;;; Return #t if (f x y) is #t for every pair of adjacent values (x, y) in list s.
;;;
;;; scm> (all-pairs inc '(3 4 5 6 7 8))
;;; #t
;;; scm> (all-pairs inc '(3 4 5 8 7 8))
;;; #f
;;; scm> (all-pairs inc '(3))
;;; #t
(define (all-pairs f s)
  (or (null? s) (null? (cdr s))
      (and ⟦a⟧ (all-pairs f ⟦b⟧ ))))
`),
      },
      'fa24f-7b': {
        exam: 'fa24f', number: '7(b)', title: 'A Pair of Schemes — show-pairs', points: 5,
        intro: 'Implement the Scheme procedure `show-pairs`, which takes a list `s` and returns a list of every pair of adjacent elements in `s`. A pair is a two-element list.',
        code: code(`
;;; Return a list of every pair of adjacent elements in list s.
;;;
;;; scm> (show-pairs '(3 5 7 9 11 13))
;;; ((3 5) (5 7) (7 9) (9 11) (11 13))
(define (show-pairs s)
  (if (or (null? s) (null? (cdr s))) nil
    ( ⟦a⟧ ⟦b⟧ (show-pairs ⟦c⟧ ))))
`),
      },
      'fa24f-7b-iv': {
        exam: 'fa24f', number: '7(b) iv', title: 'A Pair of Schemes — order of growth', points: 1,
        intro: 'What order of growth describes the time it takes to execute `(unpair s)` in terms of the length of the input list `s`, assuming that `car`, `cdr`, `cons`, and `null?` are all constant-time operations?',
        code: code(`
(define (unpair s) (cond ((null? s) nil)
                         ((null? (cdr s)) (car s))
                         (else (cons (car (car s)) (unpair (cdr s))))))
`),
      },
      'fa24f-7c': {
        exam: 'fa24f', number: '7(c)', title: 'A Pair of Schemes — all-pairs-exp', points: 4,
        intro: 'Implement the Scheme procedure `all-pairs-exp`, which takes a procedure name `proc-name` (a symbol) and a list `s`. It returns an `and` expression that calls the procedure named by `proc-name` on every adjacent pair of elements in `s`. Assume `show-pairs` is implemented correctly.',
        code: code(`
;;; Return an and expression that calls the procedure called proc-name on
;;; every adjacent pair of elements in s.
;;;
;;; scm> (all-pairs-exp 'inc '(3 4 5 6 7 8))
;;; (and (inc 3 4) (inc 4 5) (inc 5 6) (inc 6 7) (inc 7 8))
;;; scm> (eval (all-pairs-exp 'inc '(3 4 5 6 7 8 )))
;;; #t
(define (all-pairs-exp proc-name s)
  ( ⟦a⟧ (map ⟦b⟧ (show-pairs s))))
`),
      },
      'fa24f-8': {
        exam: 'fa24f', number: '8', title: 'Arcane Jobs', points: 5, lang: 'sql',
        intro: 'The Council of Piltover wants a list of all the people living in regions it governs that have unique jobs. Create a table with columns labeled `name` and `job` that contains one row for each person living in a region governed by the `"council"` who is the only person with their job among everybody living in regions ruled by the council.\n\nThe `who` table has one row per person and columns for their `name` (string; each row has a unique value), the `region` (string) they live in, and their `job` (string). The `gov` table has one row per region and columns for its name called `place` (string; each row has a unique value) and the group that rules over it called `ruler` (string).\n\nHere’s an example of the contents of the `who` and `gov` tables and the expected result for a query based on these.\n\n```\n' + FA24_TABLES + '\n```',
        sqlSetup: FA24_SETUP,
        code: code(`
SELECT name, job FROM ⟦a⟧ WHERE ⟦b⟧ AND ruler = "council" ⟦c⟧ ;
`),
      },
      'fa24f-9a': {
        exam: 'fa24f', number: '9(a)', title: 'Ape Pull Us — all-next (A+, Scheme)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nImplement `all-next`, a macro that takes an expression `x-expr` and a list of numbers. It returns `#t` if every element in `s` besides the first is equal to the value of `x-expr` when `x` is bound to the previous element in `s`. It returns `#f` otherwise. Assume `x-expr` does not contain the symbol `y`. You may call `all-pairs` from Q7. **Important:** The template has a quasiquote before the blank.',
        code: code(`
;;; Return whether every value in s that follows another value x is equal
;;; to the x-expr evaluated when x is the previous value.
;;;
;;; scm> (all-next (+ x 2) '(3 5 7 9 11 13))
;;; #t
;;; scm> (all-next (* x 2) '(2 4 8 16 32 64))
;;; #t
;;; scm> (all-next (+ x 2) '(3 5 7 8 11 13))
;;; #f
;;; scm> (all-next (+ x 4) '(3 5 7 9 11 13))
;;; #f
(define-macro (all-next x-expr s) \` ⟦A+⟧ )
`),
      },
      'fa24f-9b': {
        exam: 'fa24f', number: '9(b)', title: 'Ape Pull Us — make_tens (A+)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nImplement `make_tens` by filling in the blank in `repromote`. The `make_tens` function takes a list of numbers `s`. It returns a list `t` of the same elements reordered so that `tens(t)` returns `True`. Return an order that requires the fewest promotions to reorder `s` into `t`. You may use `tens` from Q3 and `promote` from Q5.',
        code: code(`
def make_tens(s):
    """Return a list t for which tens(t) is true and promotions(s, t) is as small as possible.
    If there is no reordering t of s for which tens(t) is true, return None.
    >>> make_tens([4, 2, 2, 2, 4, 6, 1, 3, 3, 2, 5])  # promote (6, 7), (7, 9), and (8, 10)
    [4, 2, 2, 2, 4, 6, 3, 2, 5, 1, 3]
    >>> make_tens([4, 2, 2, 2, 4, 5, 1, 4, 3, 4])  # promote (2, 4), (4, 7), (5, 9), and (8, 9)
    [4, 2, 4, 2, 4, 4, 2, 5, 3, 1]
    """
    for t in promute(s):
        if tens(t):
            return t

def promute(s):
    for k in range(len(s)):
        yield from repromote(s, k)

def repromote(s, k):
    if k == 0:
        yield s
    elif len(s) > 1:
        for j in range(len(s)):
            for rest in ⟦A+⟧:
                yield [s[j]] + rest
`),
      },
    },
    questions: [
      { id: 'fa24f-1a', problem: 'fa24f-1', label: '(a)', points: 2, topics: ['generators'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: '`list(cut(nums))`',
        choices: ['[0, 2, 4, 6, 8]', '[0, 4, 6, 8]', '[1, 0, 2, 4, 6, 8]', '[1, 0, 4, 6, 8]', '[1, 2, 4, 6, 8]', '[2, 4, 6, 8]'] },
      { id: 'fa24f-1b', problem: 'fa24f-1', label: '(b)', points: 2, topics: ['generators', 'hof', 'iterators'], difficulty: 'hard',
        type: 'short_answer', prompt: '`list(cut(map(lambda x: x - 4, cut(nums))))`' },
      { id: 'fa24f-1c', problem: 'fa24f-1', label: '(c)', points: 2, topics: ['generators', 'recursion'], difficulty: 'hard',
        type: 'short_answer', prompt: '`copy(paste(0), 3)`' },
      { id: 'fa24f-2a', problem: 'fa24f-2', label: '(a)', points: 2, topics: ['env', 'lists'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is displayed by `print(log)` on line 15?',
        choices: ['[]', '[3]', '[[3]]', '[[[3]]]', '[2, 3]', '[2, [3]]', '[2, [[3]]]', '[[2], [3]]', '[[2], [[3]]]'] },
      { id: 'fa24f-2b', problem: 'fa24f-2', label: '(b)', points: 2, topics: ['env', 'hof'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is displayed by `print(z)` on line 16?', choices: ['2', '4', '6', '7', '9', '12'] },
      { id: 'fa24f-3g', problem: 'fa24f-3', label: '(a)', points: 1, topics: ['lists', 'fundamentals'], difficulty: 'easy', blank: 'g',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (g).', choices: ['t == 10', 't != 10', 't > 10', 't < 10'] },
      { id: 'fa24f-3h', problem: 'fa24f-3', label: '(b)', points: 2, topics: ['fundamentals'], difficulty: 'medium', blank: 'h',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (h). **Select all correct answers.**',
        choices: ['False', 't % 10 == 0', 't % 10 != 0', 'sum(s) % 10 == 0', 'sum(s) % 10 != 0'] },
      { id: 'fa24f-3i', problem: 'fa24f-3', label: '(c)', points: 1, topics: ['fundamentals'], difficulty: 'easy', blank: 'i',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (i).', choices: ['0', '10', 'x'] },
      { id: 'fa24f-3j', problem: 'fa24f-3', label: '(d)', points: 1, topics: ['fundamentals'], difficulty: 'easy', blank: 'j',
        type: 'short_answer', prompt: 'Fill in blank (j).' },
      { id: 'fa24f-4a', problem: 'fa24f-4a', label: 'i.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa24f-4b', problem: 'fa24f-4a', label: 'ii.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['if parent is not None', 'if self.parent is not None', 'while parent is not None', 'while self.parent is not None', 'for p in parent', 'for p in self.parent'] },
      { id: 'fa24f-4c', problem: 'fa24f-4a', label: 'iii.', points: 2, topics: ['oop', 'recursion'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['p += 1', 'p.count += 1', 'p.inc()', 'p.count.inc()', 'parent += 1', 'parent.count += 1', 'parent.inc()', 'parent.count.inc()', 'self.parent += 1', 'self.parent.count += 1', 'self.parent.inc()', 'self.parent.count.inc()'] },
      { id: 'fa24f-4d', problem: 'fa24f-4a', label: 'iv.', points: 2, topics: ['oop'], difficulty: 'medium', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
        choices: ['self.parent', 'self.parent.spawn()', 'self.spawn()', 'Counter()', 'Counter().spawn()', 'Counter(self)', 'Counter(self.count)'] },
      { id: 'fa24f-4e', problem: 'fa24f-4b', label: 'i.', points: 2, topics: ['oop'], difficulty: 'medium', blank: 'e',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (e). **Select all correct answers.**',
        choices: ['MissDict.spawn()', 'MissDict.misses.spawn()', 'Counter()', 'Counter(MissDict)', 'Counter(MissDict.misses)'] },
      { id: 'fa24f-4f', problem: 'fa24f-4b', label: 'ii.', points: 2, topics: ['oop', 'lists'], difficulty: 'medium', blank: 'f',
        type: 'short_answer', prompt: 'Fill in blank (f).' },
      { id: 'fa24f-4g', problem: 'fa24f-4b', label: 'iii.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'g',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (g).',
        choices: ['misses.inc()', 'misses.count += 1', 'self.misses.inc()', 'self.misses.count += 1', 'MissDict.misses.inc()', 'MissDict.misses.count += 1'] },
      { id: 'fa24f-4h', problem: 'fa24f-4b', label: 'iv.', points: 2, topics: ['oop'], difficulty: 'medium', blank: 'h',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (h).',
        choices: ['{misses.count / MissDict.misses.count}', '{misses.count} / {MissDict.misses.count}', '{misses.count / self.MissDict.misses.count}', '{misses.count} / {self.MissDict.misses.count}', '{self.misses.count / misses.count}', '{self.misses.count} / {misses.count}', '{self.misses.count / MissDict.misses.count}', '{self.misses.count} / {MissDict.misses.count}', '{self.misses.count / self.MissDict.misses.count}', '{self.misses.count} / {self.MissDict.misses.count}'] },
      { id: 'fa24f-5a', problem: 'fa24f-5a', label: 'i.', points: 2, topics: ['lists'], difficulty: 'medium', blank: 'a',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (a). **Select all correct answers.**',
        choices: ['s[j]', '[s[j]]', 'list(s[j])', 's[j:j]', 's[j:j+1]'] },
      { id: 'fa24f-5b', problem: 'fa24f-5a', label: 'ii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['s[i:j]', 's[i+1:j]', 's[i:j+1]', 's[i+1:j+1]'] },
      { id: 'fa24f-5c', problem: 'fa24f-5a', label: 'iii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['i', 'i+1', 'j', 'j+1'] },
      { id: 'fa24f-5d', problem: 'fa24f-5b', label: 'i.', points: 1, topics: ['recursion', 'lists'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
        choices: ['s == t', 's != t', 's[0] == t[0]', 's[0] != t[0]', 'sorted(s) == t', 's == sorted(t)'] },
      { id: 'fa24f-5e', problem: 'fa24f-5b', label: 'ii.', points: 2, topics: ['recursion', 'lists'], difficulty: 'hard', blank: 'e',
        type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'fa24f-5f', problem: 'fa24f-5b', label: 'iii.', points: 1, topics: ['recursion', 'lists'], difficulty: 'medium', blank: 'f',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (f).', choices: ['s[0] == t[j]', 's[1] == t[j]', 's[j] == t[0]', 's[j] == t[1]'] },
      { id: 'fa24f-5g', problem: 'fa24f-5c', label: 'i.', points: 2, topics: ['links', 'recursion'], difficulty: 'medium', blank: 'g',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (g).',
        choices: ['promote_link(s.rest, i-1, j)', 'return promote_link(s.rest, i-1, j)', 'promote_link(s.rest, i, j-1)', 'return promote_link(s.rest, i, j-1)', 'promote_link(s.rest, i-1, j-1)', 'return promote_link(s.rest, i-1, j-1)'] },
      { id: 'fa24f-5h', problem: 'fa24f-5c', label: 'ii.', points: 2, topics: ['links'], difficulty: 'hard', blank: 'h',
        type: 'short_answer', prompt: 'Fill in blank (h). **Hint:** Use multiple assignment: `___ , ___ = ___ , ___`' },
      { id: 'fa24f-5i', problem: 'fa24f-5c', label: 'iii.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'i',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (i).', choices: ['s.first', 's.rest.first', 'tail.first', 'tail.rest.first'] },
      { id: 'fa24f-5j', problem: 'fa24f-5c', label: 'iv.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'j',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (j).', choices: ['s', 'tail', 'Link(insert, tail.rest)', 'Link(s.first, tail.rest)'] },
      { id: 'fa24f-5k', problem: 'fa24f-5c-v', label: 'v.', points: 2, topics: ['links'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is displayed by the call to `print` in this code?',
        choices: ['<3 5 7 9>', '<3 9 7 5>', '<5 7 9 3>', '<5 9 7 3>', '<9 7 5 3>', '<9 3 5 7>'] },
      { id: 'fa24f-6a', problem: 'fa24f-6a', label: 'i.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['True', 'False', 'n == t.label', 'n % t.label == 0', 'n % t.label > 0'] },
      { id: 'fa24f-6b', problem: 'fa24f-6a', label: 'ii.', points: 1, topics: ['trees'], difficulty: 'medium', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['n != t.label', 'n < t.label', 'n > t.label', 'n % t.label > 0'] },
      { id: 'fa24f-6c', problem: 'fa24f-6a', label: 'iii.', points: 3, topics: ['trees', 'recursion'], difficulty: 'hard', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c). **Important:** The second argument to a call to `products` must be an integer (`int`).' },
      { id: 'fa24f-6d', problem: 'fa24f-6b', label: 'i.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['0', '1', 'x', 't.label', 't.label + 1'] },
      { id: 'fa24f-6e', problem: 'fa24f-6b', label: 'ii.', points: 1, topics: ['trees'], difficulty: 'medium', blank: 'e',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (e).', choices: ['x', 'n', 't.label', '(t.label // x)', '(t.label // k)'] },
      { id: 'fa24f-6f', problem: 'fa24f-6b', label: 'iii.', points: 2, topics: ['trees', 'recursion'], difficulty: 'medium', blank: 'f',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (f).',
        choices: ['Tree(k)', 'Tree(x)', 'grow(Tree(k), x)', 'grow(Tree(x), k)', 'grow(Tree(k), x // k)', 'grow(Tree(x), x // k)'] },
      { id: 'fa24f-6g', problem: 'fa24f-6b', label: 'iv.', points: 3, topics: ['trees', 'recursion'], difficulty: 'hard', blank: 'g',
        type: 'short_answer', prompt: 'Fill in blank (g).' },
      { id: 'fa24f-7a', problem: 'fa24f-7a', label: 'i.', points: 3, topics: ['scheme'], difficulty: 'medium', blank: 'a',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (a). **Select all correct answers.**',
        choices: ['(car s) (cdr s)', '(car s) (car (cdr s))', 'f (car s) (cdr s)', 'f (car s) (car (cdr s))', 'f((car s) (cdr s))', 'f((car s) (car (cdr s)))', '(f (car s) (cdr s))', '(f (car s) (car (cdr s)))', '(apply f (car s) (cdr s))', '(apply f (car s) (car (cdr s)))'] },
      { id: 'fa24f-7b', problem: 'fa24f-7a', label: 'ii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['s', '(cdr s)', '(cdr (cdr s))', '(cons (car s) (cdr s))', '(cons (car s) (cdr (cdr s)))'] },
      { id: 'fa24f-7c', problem: 'fa24f-7b', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['car', 'cdr', 'cons', 'list', 'append'] },
      { id: 'fa24f-7d', problem: 'fa24f-7b', label: 'ii.', points: 3, topics: ['scheme'], difficulty: 'hard', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa24f-7e', problem: 'fa24f-7b', label: 'iii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['s', '(cdr s)', '(cdr (cdr s))', '(cons (car s) (cdr s))', '(cons (car s) (cdr (cdr s)))'] },
      { id: 'fa24f-7f', problem: 'fa24f-7b-iv', label: 'iv.', points: 1, topics: ['efficiency', 'scheme'], difficulty: 'medium',
        type: 'single_choice', prompt: 'What order of growth describes the time it takes to execute `(unpair s)`?',
        choices: ['constant', 'logarithmic', 'linear', 'quadratic', 'exponential'] },
      { id: 'fa24f-7g', problem: 'fa24f-7c', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['and', "'and", 'cons and', "cons 'and"] },
      { id: 'fa24f-7h', problem: 'fa24f-7c', label: 'ii.', points: 3, topics: ['scheme'], difficulty: 'hard', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa24f-8a', problem: 'fa24f-8', label: '(a)', points: 1, topics: ['sql-joins'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['who', 'who AS a, who AS b', 'who, gov', 'who AS a, who AS b, gov'] },
      { id: 'fa24f-8b', problem: 'fa24f-8', label: '(b)', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['COUNT(*) = 1', 'place = "council"', 'a.job = b.job', 'a.job != b.job', 'region = place', 'a.region = place', 'a.region = b.region AND a.region = place', 'a.job = b.job AND a.region = place'] },
      { id: 'fa24f-8c', problem: 'fa24f-8', label: '(c)', points: 2, topics: ['sql-agg'], difficulty: 'hard', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c). You may write `AND` to continue the `WHERE` clause (but you don’t have to). You may also include other clauses such as `GROUP BY`, `ORDER BY`, `HAVING`, and `LIMIT` (but you don’t have to).' },
      { id: 'fa24f-9a', problem: 'fa24f-9a', label: '(a)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in the blank (after the quasiquote).' },
      { id: 'fa24f-9b', problem: 'fa24f-9b', label: '(b)', points: 0, topics: ['recursion', 'generators', 'lists'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in the blank.' },
    ],
    answers: {
      'fa24f-1a': { correct: 1, explanation: '`this` starts at 1 (truthy), so 0 is yielded and `this` becomes 0. Then 2 only sets `this` to `True` without yielding; 4, 6 and 8 are each yielded.' },
      'fa24f-1b': { accepted: ['[-4, 0, 4]'], explanation: 'The inner `cut` gives 0, 4, 6, 8; minus 4 that is -4, 0, 2, 4. `cut` yields -4 (as `this` was 1), then 0, then 2 only resets `this` to `True` because 0 is falsy, and 4 is yielded.' },
      'fa24f-1c': { accepted: ['[0, 2, 8]'], explanation: '`paste(0)` yields 0, then doubles everything `paste(1)` yields: `paste(1)` starts with 1 (→ 2), then doubles `paste(2)`, which starts with 2 (→ 4 → 8).' },
      'fa24f-2a': { correct: 2, explanation: '`list(log).append(a)` appends to a copy, so only `log.append([b])` in `shift_line` changes `log`, adding `[3]`.' },
      'fa24f-2b': { correct: 1, explanation: '`make_line(2)` returns `lambda x: 2 * x + 1` (its own `b` is 1). `shift_line` adds its own `b`, 3: `f(0) + 3` is `1 + 3`, which is 4.' },
      'fa24f-3g': { correct: 2, explanation: 'Going past 10 before reaching it exactly means the next multiple of 10 can’t be a prefix sum.' },
      'fa24f-3h': { correct: [0], explanation: 'At this point `t > 10`, so the answer is simply `False`. The other expressions are sometimes `True` (for example when `t` is 20).' },
      'fa24f-3i': { correct: 1, explanation: 'Each time the running total reaches exactly 10, a group is complete.' },
      'fa24f-3j': { accepted: ['0'], explanation: 'Start counting the next group from 0.' },
      'fa24f-4a': { accepted: ['self.count = 0'], explanation: 'Every `Counter` starts at 0.' },
      'fa24f-4b': { correct: 1, explanation: 'Only a counter with a parent passes the count up. `parent` alone isn’t a name inside `inc`.' },
      'fa24f-4c': { correct: 10, explanation: 'Calling `inc` on the parent adds 1 to it and, recursively, to all of its ancestors.' },
      'fa24f-4d': { correct: 5, explanation: 'A spawned counter is a new `Counter` whose parent is this one.' },
      'fa24f-4e': { correct: [1, 4], explanation: 'Each `MissDict` gets its own counter whose parent is the class-wide `MissDict.misses`, so its misses are also counted for all instances. `spawn()` and `Counter(MissDict.misses)` both make that.' },
      'fa24f-4f': { accepted: ['result.append(self.d[k])', 'result += [self.d[k]]', 'result.extend([self.d[k]])', 'result = result + [self.d[k]]'], explanation: 'A key in the dictionary adds its value to the result.' },
      'fa24f-4g': { correct: 2, explanation: '`self.misses.inc()` counts the miss for this instance and, through its parent, for all instances.' },
      'fa24f-4h': { correct: 7, explanation: 'The numerator is this instance’s count and the denominator the class-wide count, with a `/` between them as plain text.' },
      'fa24f-5a': { correct: [1, 4], explanation: 'The element must be added as a one-element list: `[s[j]]`, or the slice `s[j:j+1]`.' },
      'fa24f-5b': { correct: 0, explanation: 'After the promoted element come the elements that were at positions `i` to `j-1`.' },
      'fa24f-5c': { correct: 3, explanation: 'Everything after position `j` stays where it was.' },
      'fa24f-5d': { correct: 2, explanation: 'When the first elements already match, no promotion is needed for position 0.' },
      'fa24f-5e': { accepted: ['promote(s, 0, j)[1:]', 's[:j] + s[j+1:]', 's[:j] + s[j + 1:]', 'promote(s, 0, j)[1: ]'], explanation: 'Promote the matching element `s[j]` to the front, then continue with the rest of the list, which is `s` without position `j`.' },
      'fa24f-5f': { correct: 2, explanation: 'Only an element equal to `t[0]` is worth promoting to the front.' },
      'fa24f-5g': { correct: 4, explanation: 'Promoting within `s.rest` shifts both positions by one; the function mutates and returns `s` at the end, so no `return` here.' },
      'fa24f-5h': { accepted: ['insert, tail.first = tail.first, insert', 'tail.first, insert = insert, tail.first'], explanation: 'Each step swaps the carried value into the current node, so the values shift one place to the right.' },
      'fa24f-5i': { correct: 0, explanation: 'After shifting, the value that was at position `j` goes into the first node.' },
      'fa24f-5j': { correct: 0, explanation: 'The function mutates `s` and returns it.' },
      'fa24f-5k': { correct: 2, explanation: 'Each call moves the element at index 3 to the front: `<9 3 5 7>`, then `<7 9 3 5>`, then `<5 7 9 3>`.' },
      'fa24f-6a': { correct: 2, explanation: 'A leaf ends a path, so the remaining product must equal its label.' },
      'fa24f-6b': { correct: 3, explanation: 'If `t.label` doesn’t divide `n`, no path through `t` can have product `n`.' },
      'fa24f-6c': { accepted: ['all([products(b, n // t.label) for b in t.branches])', 'all(products(b, n // t.label) for b in t.branches)'], explanation: 'Every branch must have paths with product `n // t.label`. Use `//` so the argument stays an `int`.' },
      'fa24f-6d': { correct: 4, explanation: 'Labels along a path must increase, so a child’s label starts above its parent’s.' },
      'fa24f-6e': { correct: 0, explanation: '`x` is the product still needed below `t`, so `k` must divide it.' },
      'fa24f-6f': { correct: 4, explanation: 'Grow the branch labeled `k`, which still needs a product of `x // k` below it.' },
      'fa24f-6g': { accepted: ['not branch.is_leaf() or x == k', 'x == k or not branch.is_leaf()'], explanation: 'Keep a branch if it has children (a path continues) or if it is a leaf that finishes the product exactly (`k == x`).' },
      'fa24f-7a': { correct: [7], explanation: 'Call `f` on the first two elements.' },
      'fa24f-7b': { correct: 1, explanation: 'Move along by one element, so every adjacent pair is checked.' },
      'fa24f-7c': { correct: 2, explanation: 'Build the list one pair at a time.' },
      'fa24f-7d': { accepted: ['(list (car s) (car (cdr s)))', '(list (car s) (cadr s))'], explanation: 'A pair is a two-element list of the first two elements.' },
      'fa24f-7e': { correct: 1, explanation: 'The next pair starts at the second element.' },
      'fa24f-7f': { correct: 2, explanation: 'One recursive call per element: linear.' },
      'fa24f-7g': { correct: 3, explanation: 'Put the symbol `and` in front of the list of calls.' },
      'fa24f-7h': { accepted: ['(lambda (pair) (cons proc-name pair))', '(lambda (pair) (list proc-name (car pair) (car (cdr pair))))'], explanation: 'Turn each pair into a call expression by putting the procedure name in front of it.' },
      'fa24f-8a': { correct: 2, explanation: 'Each person’s region is joined with its row in `gov` to know the ruler.' },
      'fa24f-8b': { correct: 4, explanation: 'Match each person to their region’s row.' },
      'fa24f-8c': { accepted: ['GROUP BY job HAVING COUNT(*) = 1', 'GROUP BY job HAVING COUNT(*) < 2', 'GROUP BY job HAVING COUNT(name) = 1', 'GROUP BY job HAVING COUNT(*) <= 1'], explanation: 'Group the council’s people by job and keep jobs held by exactly one person.' },
      'fa24f-9a': { accepted: ['(all-pairs (lambda (x y) (= ,x-expr y)) ,s)'] },
      'fa24f-9b': { accepted: ['repromote(s[:j] + s[j+1:], k - min(1, j))'] },
    },
  });

  // ───────────────────────────── Spring 2024 Final ─────────────────────────────
  // The PDF's questions total 70 points (Q7 and Q6(d) are A+ questions worth 0).
  const SP24_DOMINOS = code(`
CREATE TABLE dominos AS
  SELECT 0 AS id, 3 AS m, 2 AS n UNION
  SELECT 1      , 3     , 1      UNION
  SELECT 2      , 6     , 3      UNION
  SELECT 3      , 4     , 4      UNION
  SELECT 4      , 3     , 2      UNION
  SELECT 5      , 2     , 6;
`);
  add({
    exam: { id: 'sp24f', label: 'Spring 2024 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'sp24f-1': {
        exam: 'sp24f', number: '1', title: 'What Would Python Display?', points: 6,
        intro: 'Assume the following code has been executed. No error occurs.',
        code: code(`
s = [2, 4]
t, u = [2, 0, s], [2, 0, s]
t.append(5)
u[2].extend(s)
v = t[2]
t[2] = [6, 7]
`),
        outro: 'Write the output printed for each expression below. **Hint:** Draw an environment diagram!',
      },
      'sp24f-2a': {
        exam: 'sp24f', number: '2(a)', title: 'Only Up — up', points: 4,
        intro: '**Definition:** The *increasing sublist* of a sequence of numbers `s` is a list containing each element of `s` that is larger than all previous elements.\n\nImplement `up`, which takes a list of numbers `s` and returns its increasing sublist.',
        code: code(`
def up(s):
    """Return the increasing sublist of list s.

    >>> up([3, 1, 2, 5, 4, 5, 7, 6, 12, 11])
    [3, 5, 7, 12]
    """
    result = ⟦a⟧
    for x in s:
        if ⟦b⟧:
            result.⟦c⟧(x)
    return result
`),
      },
      'sp24f-2b': {
        exam: 'sp24f', number: '2(b)', title: 'Only Up — upiter', points: 5,
        intro: 'Implement `upiter`, which takes a finite iterator over numbers `t` and returns its increasing sublist. You may not call `up` in `upiter`.',
        code: code(`
def upiter(t):
    """Return the increasing sublist of iterator t.

    >>> upiter(iter([3, 1, 2, 5, 4, 5, 7, 6, 12, 11]))
    [3, 5, 7, 12]
    """
    try:
        x = next(t)
    except StopIteration:
        ⟦d⟧
    return ⟦e⟧ + ⟦f⟧(filter( ⟦g⟧ , t))
`),
      },
      'sp24f-3a': {
        exam: 'sp24f', number: '3(a)', title: 'Dominos — Domino', points: 8,
        intro: 'A *domino* is a tile with two numbers, such as 3-4. A 3-4 domino can be flipped around so that it is now a 4-3 domino.\n\nImplement the `Domino` class. A `Domino` instance is constructed from a two-element list of non-negative integers below 10 that is stored as an instance attribute `ns`. The `align` method takes an integer `first` which must be one of the numbers in `ns`. It returns the same domino instance on which it was invoked, but first mutates it so that `first` comes first in `ns`. A `Domino([3, 4])` is displayed as `3-4`.',
        code: code(`
class Domino:
    """A Domino has two numbers and can be aligned to place one of them first.

    >>> d = Domino([3, 4])
    >>> original = d
    >>> d.align(3)
    3-4
    >>> d.align(4)
    4-3
    >>> d is original  # No new Domino instance was created
    True
    >>> d              # A Domino's order is changed by align
    4-3
    """
    def __init__(self, ns):
        assert len(ns) == 2 and ns[0] in range(10) and ns[1] in range(10)
        self.ns = ns

    def align(self, first):
        assert ⟦a⟧, 'first must be a number on the domino.'
        if ⟦b⟧:
            ⟦c⟧
        return ⟦d⟧

    def __repr__(self):
        return ⟦e⟧
`),
      },
      'sp24f-3b': {
        exam: 'sp24f', number: '3(b)', title: 'Dominos — drop', points: 2,
        intro: 'Implement `drop`, which takes a `Domino` instance `d` and a list of `Domino` instances `ds`. It returns a new list with all of the elements of `ds` except for `d`.',
        code: code(`
def drop(d, ds):
    """Return a new list of dominos with all elements of ds except d.

    >>> ds = [Domino(ns) for ns in [[5, 2], [3, 4], [5, 5], [3, 4]]]
    >>> drop(ds[1], ds)
    [5-2, 5-5, 3-4]
    >>> drop(ds[3], ds)
    [5-2, 3-4, 5-5]
    >>> ds
    [5-2, 3-4, 5-5, 3-4]
    """
    return ⟦f⟧
`),
      },
      'sp24f-3b-ii': {
        exam: 'sp24f', number: '3(b) ii', title: 'Dominos — drop and align', points: 2,
        intro: 'What is the value of `drop(ds[2], drop(ds[1].align(4), ds))` assuming `drop` and `Domino` are defined correctly and `ds` is assigned to:',
        code: code(`
ds = [Domino(ns) for ns in [[5, 2], [3, 4], [5, 5], [4, 3]]]
`),
      },
      'sp24f-3c': {
        exam: 'sp24f', number: '3(c)', title: 'Dominos — longest', points: 10,
        intro: '**Definition:** A *line* of Dominos is a sequence of dominos in which pairs of adjacent numbers on different dominos are equal, such as `2-4 4-3 3-3 3-6`.\n\nImplement `longest`, which takes a list of `Domino` instances `ds`. It returns a string that describes the longest line of dominos that can be formed from `ds`. This result should contain domino repr strings separated by spaces, such as `\'2-4 4-3 3-3 3-6\'`. The dominos described in the result can appear in any order and may be flipped using the `align` method. If more than one line is longest, describe any of the longest lines. You may call `drop`.\n\nBlanks (l) and (m) are filled with the same expression, so both are shown as (l) below.',
        code: code(`
def longest(ds):
    """Return a string describing the longest line that can be formed from dominos in ds.

    >>> ds = [Domino(ns) for ns in [[5, 2], [3, 4], [5, 5], [6, 1], [3, 2]]]
    >>> print(longest(ds))
    4-3 3-2 2-5 5-5
    >>> ds = [Domino(ns) for ns in [[1, 2],[1, 2],[3, 2],[3, 2],[3, 2],[4, 3],[4, 3],[4, 3],[6,5]]]
    >>> print(longest(ds))
    2-1 1-2 2-3 3-2 2-3 3-4 4-3 3-4
    """
    def finish(first, rest):
        s = [ ⟦g⟧ + ' ' + finish( ⟦h⟧ , ⟦i⟧ ) for d in rest if ⟦j⟧ ]
        if not s:
            return ⟦k⟧
        return max(s, key=⟦l⟧ )

    candidates = []
    for first in ds:
        candidates.append(finish(first,                    drop(first, ds)))
        candidates.append(finish(first.align(first.ns[1]), drop(first, ds)))
    return max(candidates, key=⟦l⟧ )
`),
      },
      'sp24f-3d': {
        exam: 'sp24f', number: '3(d)', title: 'Dominos — matching numbers (SQL)', points: 4, lang: 'sql',
        intro: 'The `dominos` table has one row per domino that gives its unique `id` (number) and the numbers appearing on the domino `m` and `n` (numbers).\n\n```\n' + SP24_DOMINOS + '\n```\n\nComplete this query that creates one row per domino for which at least one other domino has a number equal to its `n` value. The row contains the domino’s `id`, `m` value, `n` value, and the count of other dominos that have a number equal to its `n` value.',
        sqlSetup: SP24_DOMINOS,
        code: code(`
SELECT a.id, a.m, a.n, COUNT(*) FROM dominos AS a, dominos AS b
  WHERE ⟦o⟧ AND (⟦p⟧)
  GROUP BY ⟦q⟧;
`),
      },
      'sp24f-4a': {
        exam: 'sp24f', number: '4(a)', title: 'Merry-Go-Round — cycle', points: 6,
        intro: 'Implement `cycle`, which takes a non-empty finite linked list `s` (a `Link` instance). It returns a linked list in which the first `Link` of `s` has been moved to become the last `Link` of the result. If `s` has only one element, then it is not moved. The `Link` class appears on Page 2 of the Midterm 2 Study Guide. A linked list is finite if it contains a `Link` that has `Link.empty` as its `rest` attribute rather than having a cyclical structure.',
        code: code(`
def cycle(s):
    """Move the first Link of a non-empty finite linked list to be the last.

    >>> a = Link(3, Link(5, Link(7, Link(9))))  # <3 5 7 9>
    >>> print(cycle(a))
    <5 7 9 3>
    >>> print(a)
    <3>
    """
    assert isinstance(s, Link)
    if s.rest is Link.empty:
        return s
    last = s
    while last.rest is not Link.empty:
        last = last.rest
    s.rest, last.rest, result = ⟦a⟧ , ⟦b⟧ , ⟦c⟧
    return result
`),
      },
      'sp24f-4b': {
        exam: 'sp24f', number: '4(b)', title: 'Merry-Go-Round — repeat', points: 6,
        intro: 'Implement `repeat`, a generator function that takes a non-empty finite linked list `s` and a positive integer `k`. It yields `k` elements from `s`, restarting from the first element of `s` each time the end is reached. It is ok to mutate `s`. You may call `cycle`.',
        code: code(`
def repeat(s, k):
    """Yield k items from a non-empty finite linked list, starting over as needed.
    It is ok to mutate s in the process.

    >>> t = repeat(Link(4, Link(2, Link(6))), 10)
    >>> [next(t), next(t), next(t), next(t)]
    [4, 2, 6, 4]
    >>> list(t)  # 6 of the 10 elements remain
    [2, 6, 4, 2, 6, 4]
    """
    for x in ⟦d⟧:
        yield ⟦e⟧
        ⟦f⟧
`),
      },
      'sp24f-5a': {
        exam: 'sp24f', number: '5(a)', title: 'Trees — count_ones', points: 4,
        intro: 'Implement `count_ones`, which takes a `Tree` instance `t`. It returns the number of nodes in `t` that have one child. The `Tree` class is defined on Page 2 of the Midterm 2 study guide.',
        code: code(`
def count_ones(t):
    """Return the number of nodes that have one child.

    >>> count_ones(Tree(1, [Tree(2), Tree(3, [Tree(4)])]))
    1
    >>> count_ones(Tree(1, [Tree(2), Tree(3), Tree(4)]))
    0
    >>> count_ones(Tree(1, [Tree(2, [Tree(3, [Tree(4)]), Tree(5, [Tree(6)])])]))
    3
    """
    count = sum([ count_ones(⟦a⟧) for b in t.branches if ⟦b⟧ ])
    if ⟦c⟧:
        return count + 1
    else:
        return count
`),
      },
      'sp24f-5b': {
        exam: 'sp24f', number: '5(b)', title: 'Trees — shorten', points: 6,
        intro: 'Implement `shorten`, which takes a `Tree` instance `t`. It removes all non-root nodes that have no siblings (no other nodes with the same parent), then returns `t`.',
        code: code(`
def shorten(t):
    """Remove all non-root nodes with no siblings and return t.

    >>> shorten(Tree(1, [Tree(2), Tree(3, [Tree(4)])]))
    Tree(1, [Tree(2), Tree(3)])
    >>> shorten(Tree(1, [Tree(2, [Tree(3, [Tree(4)])])]))
    Tree(1)
    >>> shorten(Tree(1, [Tree(2, [Tree(3), Tree(4)])]))
    Tree(1, [Tree(3), Tree(4)])
    >>> shorten(Tree(1, [Tree(2, [Tree(3, [Tree(4), Tree(5)]), Tree(6, [Tree(7)])])]))
    Tree(1, [Tree(3, [Tree(4), Tree(5)]), Tree(6)])
    """
    ⟦d⟧:
        ⟦e⟧ = ⟦f⟧
    for b in t.branches:
        shorten(b)
    return t
`),
      },
      'sp24f-5b-iv': {
        exam: 'sp24f', number: '5(b) iv', title: 'Trees — order of growth', points: 1,
        intro: 'What order of growth describes the time it takes to execute `u = Tree(1, [t])` in terms of the number of nodes in a `Tree` instance `t`. Assume every non-leaf node in `t` has two children.',
        code: code(`
u = Tree(1, [t])
`),
      },
      'sp24f-6': {
        exam: 'sp24f', number: '6', title: 'Scheme — truths', points: 6,
        intro: 'A *nested list of numbers* is a list containing numbers and nested lists of numbers. For example: `((7 5) 3 ((1)) 9)`\n\nImplement `truths`, which takes a nested list of numbers `s` and a one-argument procedure `f`. It returns the count of numbers `x` in `s` for which `(f x)` returns a true value.\n\n**Hint:** The built-in `number?` procedure returns whether its argument is a number.',
        code: code(`
;;; scm> (define (eight? x) (and (number? x) (= x 8)))
;;; scm> (truths '(8 (8 ((3 8)) 8 ())) eight?)
;;; 4
;;; scm> (truths '(8 (8 ((3 8)) 8 ())) number?)
;;; 5
(define (truths s f)
  (if (null? s) 0
    (+
      (if (number? (car s)) ⟦a⟧ (truths ⟦b⟧ f))  ; first argument to +
      ⟦c⟧ )))                                     ; second argument to +
`),
      },
      'sp24f-6d': {
        exam: 'sp24f', number: '6(d)', title: 'Scheme — eights (A+)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nFill in blank (d) to implement `eights`, which returns the number of eights that appear in a row at the beginning of a nested list `s`. You may call `truths`. The only special form you may use to fill in the blank is `if`.',
        code: code(`
;;; scm> (eights '(8 8 8 3 8))
;;; 3
;;; scm> (eights '((8 (8) 8) (3) 8 ()))
;;; 3
;;; scm> (eights '(8 (8 ((8 3 8)) 8 ())))
;;; 3
;;; scm> (eights '(7 (8 ((3 8)) 8 ())))
;;; 0
;;; Return the number of eights at the start of a nested list of numbers s.
(define (eights s)
  (cond
    ((null? s) 0)
    ((eight? (car s)) (+ 1 (eights (cdr s))))
    ((number? (car s)) 0)
    (else (let ((k (eights (car s)))) (+ k ⟦A+⟧ ) ))))
`),
      },
      'sp24f-7': {
        exam: 'sp24f', number: '7', title: 'Tree Swap (A+)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nImplement `swap`, which takes a `Tree` instance `t` with unique node labels and two different values `x` and `y` that are labels of `t`. It mutates the tree by placing the node labeled `x` in the position of the node labeled `y`, and the node labeled `y` in the position of the node labeled `x`.\n\n**Hint:** The built-in `exec` function takes a string and executes the Python statement it contains in the current environment. For example, after `exec(\'x = 1 + 1\')`, `x` is 2.\n\nThere are two blanks in `swap`, but they both contain exactly the same code, so you just need to write that code once. The `find` function takes four arguments, so your answer should contain two expressions separated by a comma.',
        code: code(`
def find(t, x, s, f):
    result = []
    def g(t, s):
        if t.label == x:
            result.append(s)
        for i in range(len(t.branches)):
            g(t.branches[i], s + f(i))
    g(t, s)
    assert len(result) == 1, 'x should appear as a label exactly once'
    return result[0]

def swap(t, x, y):
    """Swap the positions of the nodes labeled x and y in Tree t.

    >>> n = Tree(1, [Tree(2, [Tree(3, [Tree(4)]), Tree(5)]), Tree(6, [Tree(7)])])
    >>> b = n.branches[0].branches[0]
    >>> b is n.branches[1]
    False
    >>> swap(n, 3, 6)
    >>> n
    Tree(1, [Tree(2, [Tree(6, [Tree(7)]), Tree(5)]), Tree(3, [Tree(4)])])
    >>> b is n.branches[1]
    True
    """
    px = find(t, x, ⟦A+⟧ )
    py = find(t, y, ⟦A+⟧ )
    exec(px + ',' + py + '=' + py + ',' + px)
`),
      },
    },
    questions: [
      { id: 'sp24f-1a', problem: 'sp24f-1', label: '(a)', points: 0.5, topics: ['lists'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: '`print(s is u)`', choices: ['True', 'False'] },
      { id: 'sp24f-1b', problem: 'sp24f-1', label: '(b)', points: 0.5, topics: ['lists'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: '`print(s is v)`', choices: ['True', 'False'] },
      { id: 'sp24f-1c', problem: 'sp24f-1', label: '(c)', points: 0.5, topics: ['lists'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: '`print(s is u[2])`', choices: ['True', 'False'] },
      { id: 'sp24f-1d', problem: 'sp24f-1', label: '(d)', points: 0.5, topics: ['lists'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: '`print(s is t[2])`', choices: ['True', 'False'] },
      { id: 'sp24f-1e', problem: 'sp24f-1', label: '(e)', points: 2, topics: ['lists'], difficulty: 'medium',
        type: 'short_answer', prompt: '`print(t)`' },
      { id: 'sp24f-1f', problem: 'sp24f-1', label: '(f)', points: 2, topics: ['lists'], difficulty: 'hard',
        type: 'short_answer', prompt: '`print(u)`' },
      { id: 'sp24f-2a', problem: 'sp24f-2a', label: 'i.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['[]', '[[]]', '[s]', '[s[0]]', 'None'] },
      { id: 'sp24f-2b', problem: 'sp24f-2a', label: 'ii.', points: 2, topics: ['lists', 'fundamentals'], difficulty: 'medium', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['result and s[0] < x', 'result and result[-1] < x', 'result or s[0] < x', 'result or result[-1] < x', 'not result and s[0] < x', 'not result and result[-1] < x', 'not result or s[0] < x', 'not result or result[-1] < x'] },
      { id: 'sp24f-2c', problem: 'sp24f-2a', label: 'iii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['append', 'extend', 'pop', 'list'] },
      { id: 'sp24f-2d', problem: 'sp24f-2b', label: 'i.', points: 1, topics: ['iterators'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['return t', 'return []', 'return None', 'x = t', 'x = []', 'x = None'] },
      { id: 'sp24f-2e', problem: 'sp24f-2b', label: 'ii.', points: 1, topics: ['iterators', 'lists'], difficulty: 'easy', blank: 'e',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (e).', choices: ['x', 'next(t)', '[x]', '[next(t)]', '[x, next(t)]'] },
      { id: 'sp24f-2f', problem: 'sp24f-2b', label: 'iii.', points: 1, topics: ['recursion', 'iterators'], difficulty: 'medium', blank: 'f',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (f).', choices: ['max', 'list', 'iter', 'next', 'upiter'] },
      { id: 'sp24f-2g', problem: 'sp24f-2b', label: 'iv.', points: 2, topics: ['hof', 'iterators'], difficulty: 'medium', blank: 'g',
        type: 'short_answer', prompt: 'Fill in blank (g). You may not call `up`.' },
      { id: 'sp24f-3a', problem: 'sp24f-3a', label: 'i.', points: 2, topics: ['oop'], difficulty: 'easy', blank: 'a',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (a). **Select all that apply.**',
        choices: ['first == self.ns', '[first] == self.ns', 'first == self.ns[0] or self.ns[1]', 'first in self.ns', 'self.first == self.ns', '[self.first] == self.ns', 'self.first == self.ns[0] or self.ns[1]', 'self.first in self.ns'] },
      { id: 'sp24f-3b', problem: 'sp24f-3a', label: 'ii.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['first == self.ns[0]', 'first != self.ns[0]', 'self.first == self.ns[0]', 'self.first != self.ns[0]'] },
      { id: 'sp24f-3c', problem: 'sp24f-3a', label: 'iii.', points: 3, topics: ['oop', 'lists'], difficulty: 'medium', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'sp24f-3d', problem: 'sp24f-3a', label: 'iv.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
        choices: ['Domino', 'Domino(self.ns)', 'Domino([self.ns])', 'self', 'self.ns', 'repr(self)', 'repr(self.ns)'] },
      { id: 'sp24f-3e', problem: 'sp24f-3a', label: 'v.', points: 1, topics: ['oop', 'fundamentals'], difficulty: 'medium', blank: 'e',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (e).',
        choices: ['str(self)', 'str(self.ns)', "ns[0] + '-' + ns[1]", "self.ns[0] + '-' + self.ns[1]", "str(self.ns[0] + '-' + self.ns[1])", "str(self.ns[0]) + '-' + str(self.ns[1])"] },
      { id: 'sp24f-3f', problem: 'sp24f-3b', label: 'i.', points: 2, topics: ['lists', 'oop'], difficulty: 'medium', blank: 'f',
        type: 'short_answer', prompt: 'Fill in blank (f).' },
      { id: 'sp24f-3f-ii', problem: 'sp24f-3b-ii', label: 'ii.', points: 2, topics: ['oop', 'lists'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the value of `drop(ds[2], drop(ds[1].align(4), ds))`?',
        choices: ['[5-2]', '[5-2, 3-4]', '[5-2, 4-3]', '[5-2, 5-5]', '[5-2, 3-4, 5-5]', '[5-2, 4-3, 5-5]', '[5-2, 5-5, 4-3]', '[5-2, 3-4, 5-5, 4-3]', '[5-2, 4-3, 5-5, 4-3]'] },
      { id: 'sp24f-3g', problem: 'sp24f-3c', label: 'i.', points: 1, topics: ['recursion', 'oop'], difficulty: 'easy', blank: 'g',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (g).', choices: ['d', 'first', 'rest[0]', 'repr(d)', 'repr(first)', 'repr(rest[0])'] },
      { id: 'sp24f-3h', problem: 'sp24f-3c', label: 'ii.', points: 3, topics: ['recursion', 'oop'], difficulty: 'hard', blank: 'h',
        type: 'short_answer', prompt: 'Fill in blank (h).' },
      { id: 'sp24f-3i', problem: 'sp24f-3c', label: 'iii.', points: 1, topics: ['recursion', 'lists'], difficulty: 'medium', blank: 'i',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (i).', choices: ['rest', 'rest[1:]', 'drop(d, rest)', 'drop(first, rest)'] },
      { id: 'sp24f-3j', problem: 'sp24f-3c', label: 'iv.', points: 2, topics: ['recursion', 'oop'], difficulty: 'medium', blank: 'j',
        type: 'short_answer', prompt: 'Fill in blank (j).' },
      { id: 'sp24f-3k', problem: 'sp24f-3c', label: 'v.', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'k',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (k).',
        choices: ["''", 'None', 'first', 'repr(first)', 'max(rest)', 'repr(max(rest))', 'longest(ds[1:])'] },
      { id: 'sp24f-3l', problem: 'sp24f-3c', label: 'vi.', points: 1, topics: ['hof'], difficulty: 'medium', blank: 'l',
        type: 'single_choice', mono: true, prompt: 'Fill in blanks (l) and (m) with the same expression. Numbers on a domino must be below 10.',
        choices: ['len', 'max', 'str', 'repr', 'lambda s: s', 'lambda s: s[0]', 'lambda s: len(s[0])'] },
      { id: 'sp24f-3o', problem: 'sp24f-3d', label: 'i.', points: 1, topics: ['sql-joins'], difficulty: 'easy', blank: 'o',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (o).', choices: ['a.id = b.id', 'a.id < b.id', 'a.id != b.id'] },
      { id: 'sp24f-3p', problem: 'sp24f-3d', label: 'ii.', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'p',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (p).',
        choices: ['a.m = b.m OR a.n = b.n', 'a.m = b.m AND a.n = b.n', 'a.n = b.m OR a.n = b.n', 'a.n = b.m AND a.n = b.n', 'a.m = b.n OR a.n = b.n', 'a.m = b.n AND a.n = b.n'] },
      { id: 'sp24f-3q', problem: 'sp24f-3d', label: 'iii.', points: 1, topics: ['sql-agg'], difficulty: 'easy', blank: 'q',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (q).', choices: ['m', 'a.m', 'b.m', 'id', 'a.id', 'b.id'] },
      { id: 'sp24f-4a', problem: 'sp24f-4a', label: 'i.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['s', 's.rest', 'last', 'last.rest', 'Link.empty'] },
      { id: 'sp24f-4b', problem: 'sp24f-4a', label: 'ii.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['s', 's.rest', 'last', 'last.rest', 'Link.empty'] },
      { id: 'sp24f-4c', problem: 'sp24f-4a', label: 'iii.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['s', 's.rest', 'last', 'last.rest', 'Link.empty'] },
      { id: 'sp24f-4d', problem: 'sp24f-4b', label: 'i.', points: 2, topics: ['generators'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['s', 'iter(s)', 'next(s)', 'range(k)', 'range(s)', 'range(len(s))'] },
      { id: 'sp24f-4e', problem: 'sp24f-4b', label: 'ii.', points: 2, topics: ['generators', 'links'], difficulty: 'medium', blank: 'e',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (e).',
        choices: ['s', 's.first', 's.rest.first', 'from repeat(s.rest, k-1)', 'x', 's[x]', 's[x % len(s)]'] },
      { id: 'sp24f-4f', problem: 'sp24f-4b', label: 'iii.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'f',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (f).',
        choices: ['cycle(s)', 's = cycle(s)', 'cycle(s.rest)', 's = cycle(s.rest)', 's.rest = cycle(s.rest)'] },
      { id: 'sp24f-5a', problem: 'sp24f-5a', label: 'i.', points: 1, topics: ['trees', 'recursion'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['b', 't', 'b.branches', 't.branches'] },
      { id: 'sp24f-5b', problem: 'sp24f-5a', label: 'ii.', points: 1, topics: ['trees'], difficulty: 'medium', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['True', 'is_leaf(b)', 'is_leaf(t)', 'len(b.branches) == 1', 'len(t.branches) == 1'] },
      { id: 'sp24f-5c', problem: 'sp24f-5a', label: 'iii.', points: 2, topics: ['trees'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['True', 'is_leaf(b)', 'is_leaf(t)', 'len(b.branches) == 1', 'len(t.branches) == 1', 'all([len(b.branches) == 1 for b in t.branches])', 'any([len(b.branches) == 1 for b in t.branches])'] },
      { id: 'sp24f-5d', problem: 'sp24f-5b', label: 'i.', points: 3, topics: ['trees'], difficulty: 'hard', blank: 'd',
        type: 'short_answer', prompt: 'Fill in blank (d). Include the type of the control statement you are using (`if`, `while`, `for`, etc.).' },
      { id: 'sp24f-5e', problem: 'sp24f-5b', label: 'ii.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'e',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (e).', choices: ['t', 't.branches', 't.branches[i]', 'Tree(t.label, t.branches)'] },
      { id: 'sp24f-5f', problem: 'sp24f-5b', label: 'iii.', points: 2, topics: ['trees'], difficulty: 'medium', blank: 'f',
        type: 'short_answer', prompt: 'Fill in blank (f). You may not use `and`, `or`, `if`, or `lambda` in your answer.' },
      { id: 'sp24f-5g', problem: 'sp24f-5b-iv', label: 'iv.', points: 1, topics: ['efficiency'], difficulty: 'medium',
        type: 'single_choice', prompt: 'What order of growth describes the time it takes to execute `u = Tree(1, [t])` in terms of the number of nodes in `t`?',
        choices: ['constant', 'logarithmic', 'linear', 'quadratic', 'exponential'] },
      { id: 'sp24f-6a', problem: 'sp24f-6', label: '(a)', points: 3, topics: ['scheme'], difficulty: 'medium', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'sp24f-6b', problem: 'sp24f-6', label: '(b)', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['s', '(car s)', '(cdr s)', '(list s)'] },
      { id: 'sp24f-6c', problem: 'sp24f-6', label: '(c)', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['nil', '0', '1', 'f', 's', '(f s)', 'truths', '(truths (cdr s) f)'] },
      { id: 'sp24f-6d', problem: 'sp24f-6d', label: '(d)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in blank (d).' },
      { id: 'sp24f-7', problem: 'sp24f-7', label: '(a)', points: 0, topics: ['trees', 'hof'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Write the code that fills in both blanks (the same code fills in each blank).' },
    ],
    answers: {
      'sp24f-1a': { correct: 1, explanation: '`u` is the list `[2, 0, s]`, not `s` itself.' },
      'sp24f-1b': { correct: 0, explanation: '`v = t[2]` happened before `t[2]` was replaced, and `t[2]` was `s`.' },
      'sp24f-1c': { correct: 0, explanation: '`u[2]` is still `s` (`extend` mutated `s` in place).' },
      'sp24f-1d': { correct: 1, explanation: '`t[2] = [6, 7]` replaced that element with a new list.' },
      'sp24f-1e': { accepted: ['[2, 0, [6, 7], 5]'], explanation: '`t` had 5 appended, then its element at index 2 was replaced by `[6, 7]`.' },
      'sp24f-1f': { accepted: ['[2, 0, [2, 4, 2, 4]]'], explanation: '`u[2]` is `s`, and `s.extend(s)` doubled it to `[2, 4, 2, 4]`. `t.append(5)` changed only `t`.' },
      'sp24f-2a': { correct: 0, explanation: 'Start with an empty result.' },
      'sp24f-2b': { correct: 7, explanation: 'The first element always goes in; after that, `x` must be larger than the last element added, which is the largest so far.' },
      'sp24f-2c': { correct: 0, explanation: 'Add one element.' },
      'sp24f-2d': { correct: 1, explanation: 'An empty iterator has an empty increasing sublist.' },
      'sp24f-2e': { correct: 2, explanation: 'The first element always starts the sublist, as a one-element list.' },
      'sp24f-2f': { correct: 4, explanation: 'Recurse on the rest of the iterator, keeping only elements above `x`.' },
      'sp24f-2g': { accepted: ['lambda y: y > x', 'lambda v: v > x', 'lambda z: z > x', 'lambda n: n > x', 'lambda y: x < y'], explanation: 'Only elements larger than `x` can be in the sublist after it; `filter` keeps them lazily.' },
      'sp24f-3a': { correct: [3], explanation: '`first` must be one of the two numbers. `first == self.ns[0] or self.ns[1]` is truthy whenever `self.ns[1]` isn’t 0, and the domino has no `first` attribute.' },
      'sp24f-3b': { correct: 1, explanation: 'Only flip when `first` isn’t already first.' },
      'sp24f-3c': { accepted: ['self.ns = [self.ns[1], self.ns[0]]', 'self.ns = self.ns[::-1]', 'self.ns.reverse()', 'self.ns = list(reversed(self.ns))', 'self.ns[0], self.ns[1] = self.ns[1], self.ns[0]'], explanation: 'Swap the two numbers.' },
      'sp24f-3d': { correct: 3, explanation: '`align` returns the same instance, mutated.' },
      'sp24f-3e': { correct: 5, explanation: 'The numbers are integers, so each must be turned into a string before joining with `\'-\'`.' },
      'sp24f-3f': { accepted: ['[x for x in ds if x is not d]', '[e for e in ds if e is not d]', '[y for y in ds if y is not d]', '[x for x in ds if not x is d]'], explanation: 'Use `is not` to drop only that exact domino: another domino with the same numbers (like the second 3-4) stays.' },
      'sp24f-3f-ii': { correct: 2, explanation: '`ds[1].align(4)` flips `ds[1]` to 4-3 and returns it, so the inner `drop` removes it: `[5-2, 5-5, 4-3]` (the last one is the original 4-3). The outer `drop` removes `ds[2]`, 5-5.' },
      'sp24f-3g': { correct: 4, explanation: 'Each line starts with the current domino’s string.' },
      'sp24f-3h': { accepted: ['d.align(first.ns[1])'], explanation: 'The next domino must start with `first`’s second number, so align it that way.' },
      'sp24f-3i': { correct: 2, explanation: 'The rest of the line uses the remaining dominos, without `d`.' },
      'sp24f-3j': { accepted: ['first.ns[1] in d.ns', 'd.ns[0] == first.ns[1] or d.ns[1] == first.ns[1]', 'first.ns[1] == d.ns[0] or first.ns[1] == d.ns[1]'], explanation: 'A domino can come next only if it has `first`’s second number on it.' },
      'sp24f-3k': { correct: 3, explanation: 'With nothing left to add, the line is just this domino.' },
      'sp24f-3l': { correct: 0, explanation: 'Every domino string has the same length (3 characters plus a space), so the longest string describes the most dominos.' },
      'sp24f-3o': { correct: 2, explanation: 'Compare each domino with every *other* domino.' },
      'sp24f-3p': { correct: 2, explanation: 'Another domino matches if either of its numbers equals `a.n`.' },
      'sp24f-3q': { correct: 4, explanation: 'One row per domino `a`; `id` alone would be ambiguous.' },
      'sp24f-4a': { correct: 4, explanation: 'The first Link becomes the last, so its `rest` becomes `Link.empty`.' },
      'sp24f-4b': { correct: 0, explanation: 'The old last Link now points to the old first Link.' },
      'sp24f-4c': { correct: 1, explanation: 'The result starts at the old second Link (read before `s.rest` changes, since multiple assignment evaluates the right side first).' },
      'sp24f-4d': { correct: 3, explanation: 'Exactly `k` elements are yielded.' },
      'sp24f-4e': { correct: 1, explanation: 'Yield the current first element.' },
      'sp24f-4f': { correct: 1, explanation: 'Rotate the list and keep the new first Link.' },
      'sp24f-5a': { correct: 0, explanation: 'Count in every branch.' },
      'sp24f-5b': { correct: 0, explanation: 'Every branch is counted (the blank only filters, and no branch should be skipped).' },
      'sp24f-5c': { correct: 4, explanation: 'This node counts if it has exactly one child.' },
      'sp24f-5d': { accepted: ['while len(t.branches) == 1'], explanation: 'Keep removing an only child (its children take its place) until `t` has zero or several children.' },
      'sp24f-5e': { correct: 1, explanation: 'Replace `t`’s branches.' },
      'sp24f-5f': { accepted: ['t.branches[0].branches'], explanation: 'The only child’s children take its place.' },
      'sp24f-5g': { correct: 0, explanation: 'Making a `Tree` with one branch copies a one-element list; the size of `t` doesn’t matter.' },
      'sp24f-6a': { accepted: ['(if (f (car s)) 1 0)'], explanation: 'A number counts 1 if `f` is true for it.' },
      'sp24f-6b': { correct: 1, explanation: 'A nested list: count inside it.' },
      'sp24f-6c': { correct: 7, explanation: 'Add the count for the rest of the list.' },
      'sp24f-6d': { accepted: ['(if (< k (truths (car s) number?)) 0 (eights (cdr s)))'] },
      'sp24f-7': { accepted: ["'t', lambda i: '.branches[' + str(i) + ']'"] },
    },
  });

  // ───────────────────────────── Fall 2023 Final ─────────────────────────────
  const FA23_TABLES = code(`
donuts:
| kind   | flavor    |
|--------|-----------|
| cake   | chocolate |
| cake   | lemon     |
| cake   | vanilla   |
| raised | cinnamon  |
| raised | chocolate |

prices:
| dough  | price |
|--------|-------|
| cake   | 2     |
| raised | 3     |

quantity:
| choice    | k |
|-----------|---|
| chocolate | 6 |
| cinnamon  | 3 |
| vanilla   | 3 |

result:
| flavor    | total |
|-----------|-------|
| chocolate | 12    |
| cinnamon  | 9     |
| vanilla   | 6     |
`);
  const FA23_SETUP = code(`
CREATE TABLE donuts(kind, flavor);
INSERT INTO donuts VALUES ('cake', 'chocolate'), ('cake', 'lemon'), ('cake', 'vanilla'), ('raised', 'cinnamon'), ('raised', 'chocolate');
CREATE TABLE prices(dough, price);
INSERT INTO prices VALUES ('cake', 2), ('raised', 3);
CREATE TABLE quantity(choice, k);
INSERT INTO quantity VALUES ('chocolate', 6), ('cinnamon', 3), ('vanilla', 3);
`);
  add({
    exam: { id: 'fa23f', label: 'Fall 2023 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'fa23f-1': {
        exam: 'fa23f', number: '1', title: 'Copying Copies', points: 5,
        intro: 'Draw the environment diagram that results from running all of the code below until it is fully executed, an error occurs, or you run out of frames. Then, answer the questions that follow. Blanks and frames with no labels have no questions associated with them and are not scored. You may not need all the spaces or frames.',
        figure: { src: 'assets/fa23-final-q1.png', width: 658, height: 358, alt: 'From the exam: the code, and a partly filled environment diagram. The Global frame binds chain and add_copy to functions and result to a blank labeled (a). Frame f1: chain [parent=Global] has g and a Return value of None. Frame f2: add_copy [parent=Global] has p bound to True, then, copy bound to a blank labeled (b), and a Return value of None. Frame f3 is blank.', slots: [[360, 62, 39], [360, 106, 39], [360, 195, 39], [360, 217, 39], [274, 283, 76], [360, 283, 39], [274, 304, 76], [360, 304, 39], [274, 326, 76], [360, 326, 38], [274, 350, 76], [360, 350, 39]] },
        code: code(`
def chain(g):
    g(True, g)

def add_copy(p, then):
    copy = result
    if p:
        copy.append(1)
        result.append(list(copy))
        return then(not p, add_copy)
    else:
        copy.append(2)

result = [5]
chain(add_copy)
print(result)
`),
      },
      'fa23f-2': {
        exam: 'fa23f', number: '2', title: 'Path Math', points: 6,
        intro: 'Implement `bounds`, which takes a `Tree` instance `t` and numbers `low` and `high`. It returns the number of paths through `t` from the root to a leaf for which the sum of the labels along the path is at least `low` and at most `high`.',
        code: code(`
def bounds(t, low, high):
    """Return the number of root-to-leaf paths in t whose sum is between low and high (inclusive).

    >>> t = Tree(3, [Tree(4), Tree(5, [Tree(1), Tree(2)]), Tree(7)])
    >>> bounds(t, 7, 10)  # 3+4=7, 3+5+1=9, 3+5+2=10, 3+7=10
    4
    >>> bounds(t, 9, 10)
    3
    >>> bounds(t, 9, 9)
    1
    """
    count = 0
    if ⟦a⟧:
        count = 1
    return count + ⟦b⟧([⟦c⟧ for b in t.branches])
`),
      },
      'fa23f-3': {
        exam: 'fa23f', number: '3', title: 'Talk Like a Pirate Day', points: 10,
        intro: 'Pirate expressions are reversed and substitute some words (such as `"aye"` for `"yes"`) according to a pirate dialect.\n\n- An `Expression` instance is constructed from a list of strings and has a dictionary attribute `dialect` and a `Word` instance attribute `first` that represents the first word of the reversed sequence.\n- A `Word` instance is constructed from its attributes: a string `w`, an `Expression` instance `exp`, and a `Word` instance `then` representing the next word in the reversed sequence. If there is no next word, `then` is `None`. A `Word` instance’s `say` method returns either `w` or its substitute if `w` is a key of the expression’s `dialect`.\n\nPrinting a `Word` prints how a pirate would say that word and the following words in the reversed sequence. Printing an `Expression` prints all of the words in the reversed sequence using the `Expression`’s dialect.\n\n**Reminder:** The `get` method of a dictionary takes two arguments: `key` and `default`. If the key is in the dictionary, its value is returned. If not, `default` is returned. E.g., `{1:2}.get(1, 3)` evaluates to 2, but `{1:2}.get(5, 3)` is 3.',
        code: code(`
class Expression:
    """A pirate expression is reversed and substitutes some words using a dialect.

    >>> str(Expression(['I', 'said', 'hi']))
    'ahoy says I'
    >>> e = Expression(['there', 'you', 'are'])
    >>> print(e)
    arrrr you there
    >>> e.dialect['you'] = 'ye'  # After adding to the dialect...
    >>> print(e)                 # ... the result of printing changes
    arrrr ye there
    """
    def __init__(self, original):
        assert len(original) > 0
        self.dialect = {'yes': 'aye', 'hi': 'ahoy', 'said': 'says', 'are': 'arrrr'}
        previous = None
        for w in original:
            current = ⟦a⟧
            ⟦b⟧
        self.first = ⟦c⟧

    def __str__(self):
        return ⟦d⟧

class Word:
    def __init__(self, w, exp, then):
        self.w = w
        self.exp = exp
        self.then = then

    def say(self):
        return ⟦e⟧

    def __str__(self):
        first = ⟦f⟧
        if self.then:
            return first + ' ' + str(self.then)
        else:
            return first
`),
      },
      'fa23f-4a': {
        exam: 'fa23f', number: '4(a)', title: 'Six Pages of Pairings — longest_pairing', points: 6,
        intro: '**Definition:** A *pairing* of a sequence `s` is a list of two-element tuples (called *pairs*) that contain adjacent elements of `s`. There must be at least one element of `s` between any two pairs in the pairing. The pairs in the pairing must be in the same order as they are in `s`.\n\nThe sequence `[4, 5, 6, 1, 2, 3, 7, 8]` has pairings `[(6, 1), (3, 7)]` and `[(4, 5), (1, 2), (7, 8)]` and `[]` and many others, but the following are not pairings of that sequence:\n\n- `[(5, 1), (3, 7)]` contains a pair `(5, 1)`, but 5 and 1 are not adjacent in the sequence.\n- `[(5, 6), (1, 2)]` contains two pairs with no element between them, since 6 is adjacent to 1 in the sequence.\n- `[(1, 2), (4, 5)]` contains valid pairs, but those pairs are not in the same order as the sequence.\n\nImplement `longest_pairing`, which takes a list `s` with `3*n-1` elements for some positive integer `n`. It returns the longest pairing of `s`.\n\n(The exam’s code says `results._______` on the line with blank (e); the variable is `result`, so that is corrected here.)',
        code: code(`
def longest_pairing(s):
    """Return the longest pairing for list s that has length 3*n-1 for some positive integer n.

    >>> longest_pairing([1, 2, 3, 4, 5, 6, 7, 8])
    [(1, 2), (4, 5), (7, 8)]
    """
    assert len(s) > 0 and ⟦a⟧, 's must have length 3*n-1 for a positive integer n'
    result, pair, skip = [], [], False
    for x in s:
        if ⟦b⟧:
            pair.append(x)
        else:
            ⟦c⟧
        if ⟦d⟧:
            result.⟦e⟧
            pair, skip = [], True
    return result
`),
      },
      'fa23f-4b': {
        exam: 'fa23f', number: '4(b)', title: 'Six Pages of Pairings — is_pair_sequence', points: 4,
        intro: 'Implement `is_pair_sequence`, which takes a list `s` and returns whether it contains only two-element tuples.',
        code: code(`
def is_pair_sequence(s):
    """Return whether list s contains only pairs (which are tuples with two elements).

    >>> is_pair_sequence([(1, 2), (3, 4)])
    True
    >>> is_pair_sequence([(1, 2), (3, 4, 5)])
    False
    >>> is_pair_sequence([(1, 2), "not a tuple"])
    False
    >>> is_pair_sequence([(1, 2), (3, (4, 5, 6))])  # (3, (4, 5, 6)) is a two-element tuple
    True
    >>> is_pair_sequence([])
    True
    """
    return all([⟦f⟧ for x in s]) and all(map(⟦g⟧, s))
`),
      },
      'fa23f-4c': {
        exam: 'fa23f', number: '4(c)', title: 'Six Pages of Pairings — is_pairing', points: 6,
        intro: 'Implement `is_pairing`, which takes a list `s` and a list of `pairs`. It returns whether `pairs` is a pairing of `s`.',
        code: code(`
def is_pairing(s, pairs):
    """Return whether the list of pairs is a pairing for the list s.

    >>> pairs = [(3, 4), (5, 6), (7, 7)]
    >>> is_pairing([3, 3, 4, 5, 4, 5, 6, 0, 7, 7, 7], pairs)
    True
    >>> is_pairing([3, 3, 4, 5, 6, 0, 7, 7, 7], pairs)  # Need an element between pairs
    False
    >>> is_pairing([3, 2, 4, 0, 5, 6, 0, 7, 7], pairs)  # Elements of a pair must be adjacent
    False
    >>> is_pairing([7, 7, 3, 3, 4, 5, 4, 5, 6], pairs)  # Pairing isn't in the same order as s
    False
    """
    assert is_pair_sequence(pairs)
    if not pairs:
        return True
    if ⟦h⟧:
        return False
    if ⟦i⟧ == tuple(s[:2]):
        return is_pairing(s[3:], ⟦j⟧)  # Note: [0, 1][3:] evaluates to []
    return ⟦k⟧
`),
      },
      'fa23f-4d': {
        exam: 'fa23f', number: '4(d)', title: 'Six Pages of Pairings — unequal_pairs', points: 7,
        intro: 'Implement `unequal_pairs`, a generator function that yields all **non-empty** pairings of a list `s` in which no pair contains two equal elements.',
        code: code(`
def unequal_pairs(s):
    """Yield all non-empty pairings for a list s in which each pair's values are unequal.

    >>> sorted(unequal_pairs([4, 2, 2, 4, 4, 1, 1]))  # Four different pairings!
    [[(2, 4)], [(4, 1)], [(4, 2)], [(4, 2), (4, 1)]]
    >>> max(unequal_pairs([4, 2, 2, 4, 5, 4, 4, 1, 5, 5, 6]), key=len)  # The longest pairing
    [(4, 2), (4, 5), (4, 1), (5, 6)]
    """
    if len(s) >= 2:
        yield from ⟦l⟧
        if ⟦m⟧:
            pair = (s[0], s[1])
            ⟦n⟧
            for rest in unequal_pairs(s[3:]):  # Note: [0, 1][3:] evaluates to []
                yield ⟦o⟧
`),
      },
      'fa23f-4e': {
        exam: 'fa23f', number: '4(e)', title: 'Six Pages of Pairings — max_pair_sum', points: 6,
        intro: 'Implement `max_pair_sum`, which takes a linked list `s` (either a `Link` instance or `Link.empty`). It returns the largest possible sum of the values in a pairing of `s`. The `Link` class appears on the Midterm 2 Study Guide (p. 2).',
        code: code(`
def max_pair_sum(s):
    """Return the largest sum of values in a pairing for a linked list of positive numbers s.

    >>> L = Link                                                       # Abbreviate Link
    >>> max_pair_sum(L(3, L(4, L(5, L(3, L(4, L(5, L(6))))))))         # 4+5 + 5+6
    20
    >>> max_pair_sum(L(3, L(4, L(5, L(3, L(4, L(5, L(6, L(3)))))))))   # 3+4 + 3+4 + 6+3
    23
    """
    if ⟦p⟧:
        return 0
    n = ⟦q⟧
    if s.rest.rest is Link.empty:
        return n
    else:
        return max(n + max_pair_sum(⟦r⟧), max_pair_sum(⟦s⟧))
`),
      },
      'fa23f-5': {
        exam: 'fa23f', number: '5', title: 'What Would Scheme Do?', points: 6,
        intro: 'Assume the following code has been evaluated.',
        code: code(`
(define (shrink k t)
  (lambda (s)
    (if (null? s) t
        ( (if (= (car s) k)   (shrink (+ k 1) t)   (shrink k (cons (car s) t)))
          (cdr s)) )))
(define-macro (wait expr) \`(lambda () ,expr))
(define (double wait-list)
  (if (null? wait-list) nil
      (cons (* 2 (car wait-list)) (wait (double ((cdr wait-list)))))))
(define twos (cons 2 (wait (double twos))))
`),
      },
      'fa23f-6': {
        exam: 'fa23f', number: '6', title: 'How to Get Promoted', points: 5,
        intro: 'Implement `promote`, which takes a one-argument procedure `f` and a list `s`. It returns a list that begins with all of the elements of `s` for which calling `f` on the element returns `#t`, followed by all of the elements of `s` for which calling `f` on the element returns `#f`. Assume that when `f` is called on any element of `s`, it returns either `#t` or `#f`.',
        code: code(`
;;; Return a list containing all the elements of s, with the elements for which
;;; f returns #t at the front of the list, but otherwise keeping the order the same.
;;;
;;; scm> (promote even? '(1 2 3 4 5 6 7))
;;; (2 4 6 1 3 5 7)
;;; scm> (promote odd? '(1 2 3 4 5 6 7))
;;; (1 3 5 7 2 4 6)
(define (promote f s)
    (⟦a⟧ ⟦b⟧ (filter ⟦c⟧ s)))
`),
      },
      'fa23f-6d': {
        exam: 'fa23f', number: '6(d)', title: 'How to Get Promoted — bigger-first (A+)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nImplement `bigger-first` without writing `lambda` or `define`. You may use `promote`, `curry`, and `curry-call`.',
        code: code(`
(define (curry f) (lambda (x) (lambda (y) (f x y))))
(define (curry-call f) (lambda (x g) (lambda (y) (f (x (g y)) y))))
;;; (bigger-first s) returns a list with all of the elements of s larger than (car s)
;;; at the front, followed by all of the elements of s smaller or equal to (car s).
;;;
;;; scm> (bigger-first '(3 1 4 1 5 9 2 6))
;;; (4 5 9 6 3 1 1 2)
(define bigger-first ⟦A+⟧)
`),
      },
      'fa23f-7': {
        exam: 'fa23f', number: '7', title: 'Don’t Skip This', points: 5,
        intro: '**Definition.** A *skip-partition* of a positive integer `n` is a list of positive integers in increasing order that sums to `n` and does not contain any duplicates or consecutive numbers.\n\nImplement `part`, which takes positive integers `n` and `m`. It returns a list of all skip-partitions of `n` that contain elements greater than or equal to `m`. The provided `cons-me` procedure is used in the implementation.',
        code: code(`
(define (cons-me first) (lambda (rest) (cons first rest)))
;;; Return a list of all skip-partitions of n with elements greater than or equal to m.
;;;
;;; scm> (part 12 2)
;;; ((2 4 6) (2 10) (3 9) (4 8) (5 7) (12))
(define (part n m)
    (cond ((= m n) ⟦a⟧)
          ((> m n) nil)
          (else (append
                  (⟦b⟧ (cons-me m) ⟦c⟧)
                  (part n (+ m 1))))))
`),
      },
      'fa23f-7d': {
        exam: 'fa23f', number: '7(d)', title: 'Don’t Skip This — scheme_eval', points: 3,
        intro: 'Which expressions are passed to `scheme_eval` when evaluating `(if (> 1 2) (+ 1 2) 2)`? **Check all that apply.**',
        code: code(`
(if (> 1 2) (+ 1 2) 2)
`),
      },
      'fa23f-8': {
        exam: 'fa23f', number: '8', title: 'Cheap Donuts', points: 6, lang: 'sql',
        intro: 'There are three tables in a database:\n\n- The `donuts` table has a row for each menu option at a donut shop. There are columns for the `kind` (string) of dough and `flavor` (string). For example, there is one row for chocolate cake donuts (although the store may have many such donuts, they only have one menu option for this kind & flavor combination).\n- The price of a donut depends only on the dough. The `prices` table has a row for each kind of dough. The `dough` (string) column contains the kind; the `price` (number) column is for one donut made from that kind of dough.\n- Your friends only care about the flavor, not the kind of dough. The `quantity` table contains one row for every flavor your friends want. The `choice` (string) column is the flavor they want and the `k` (number) column is the number of donuts of that flavor they want.\n\nCreate a table with two columns, `flavor` (string) and `total` (number) with one row for each flavor your friends want. The `total` column contains the least expensive total cost of buying `k` donuts of that flavor, where `k` is the number your friends want.\n\nThe rows of the result can appear in any order. Here is an example, but complete the query so that it would work even if the contents or number of rows were different.\n\n```\n' + FA23_TABLES + '\n```',
        sqlSetup: FA23_SETUP,
        code: code(`
SELECT flavor, ⟦a⟧ AS total FROM ⟦b⟧ WHERE ⟦c⟧ GROUP BY ⟦d⟧;
`),
      },
      'fa23f-9a': {
        exam: 'fa23f', number: '9(a)', title: 'A+ — fib stream (Scheme)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nComplete the definition of `fib` so that `(prefix fib 10)` is a list of the first 10 Fibonacci numbers: `(0 1 1 2 3 5 8 13 21 34)`. A Fibonacci number is the sum of the previous two. You may not write `lambda` or `let` or `define`.',
        code: code(`
(define-macro (wait expr) \`(lambda () ,expr))
(define (prefix s k) (if (zero? k) nil (cons (car s) (prefix ((cdr s)) (- k 1)))))
(define (add s t) (cons (+ (car s) (car t)) (wait (add ((cdr s)) ((cdr t))))))
(define fib (cons 0 (wait (cons 1 ⟦A+⟧))))
`),
      },
      'fa23f-9b': {
        exam: 'fa23f', number: '9(b)', title: 'A+ — match', points: 0,
        intro: 'This A+ question is not worth any points. It uses the definitions and functions from Six Pages of Pairings.\n\nFill in blank (a) of `match`, a generator function that takes a list `s` and a pairing `pairs`. It yields all non-empty pairings of `s` that contain the pairs in `pairs` in order, but which may also contain other pairs as well. Just fill in blank (a); the remaining blanks (shown as `_______`) are not scored.',
        code: code(`
def match(s, pairs):
    """Yield all non-empty pairings of s that contain pairs in order.

    >>> for p in sorted(match(range(14), [(3, 4), (8, 9)])):
    ...     print(p)
    [(0, 1), (3, 4), (8, 9)]
    [(0, 1), (3, 4), (8, 9), (11, 12)]
    [(0, 1), (3, 4), (8, 9), (12, 13)]
    [(3, 4), (8, 9)]
    [(3, 4), (8, 9), (11, 12)]
    [(3, 4), (8, 9), (12, 13)]
    """
    assert is_pair_sequence(pairs)
    if len(s) >= 2:
        first = tuple(s[:2])
        if ⟦A+⟧:  # Just fill in this blank as your answer
            yield [first]
        if _______:
            rest = pairs[1:]
        else:
            rest = pairs
        for p in match(_______, rest):
            yield _______ + p
        yield from match(_______, pairs)
`),
      },
    },
    questions: [
      { id: 'fa23f-1a', problem: 'fa23f-1', label: '(a)', points: 1, topics: ['env', 'lists'], difficulty: 'medium',
        type: 'single_choice', prompt: 'Which of the following is true about the blanks labeled (a) and (b)?',
        choices: ['They contain arrows to the same list', 'They contain arrows to different lists with the same contents', 'They contain arrows to different lists with different contents'] },
      { id: 'fa23f-1b', problem: 'fa23f-1', label: '(b)', points: 1, topics: ['env', 'hof'], difficulty: 'medium',
        type: 'single_choice', prompt: 'What error occurs during execution, if any?',
        choices: ['NameError because a name is referenced before assignment', 'TypeError because a function was called with the wrong number of arguments', 'TypeError because a built-in function is called on the wrong argument type(s)', 'RecursionError because of too many recursive calls', 'No error occurs'] },
      { id: 'fa23f-1c', problem: 'fa23f-1', label: '(c)', points: 3, topics: ['env', 'lists'], difficulty: 'hard',
        type: 'short_answer', prompt: 'What would be displayed by evaluating `print(result)` in the global frame? If an error occurred or you ran out of frames, still evaluate `print(result)` according to the environment diagram you drew.' },
      { id: 'fa23f-2a', problem: 'fa23f-2', label: '(a)', points: 2, topics: ['trees'], difficulty: 'medium', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
        choices: ['low <= t and t <= high', 't and low <= t and t <= high', 't.branches and low <= t and t <= high', 't.is_leaf() and low <= t and t <= high', 'low <= t.label and t.label <= high', 't and low <= t.label and t.label <= high', 't.branches and low <= t.label and t.label <= high', 't.is_leaf() and low <= t.label and t.label <= high'] },
      { id: 'fa23f-2b', problem: 'fa23f-2', label: '(b)', points: 1, topics: ['trees', 'hof'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['bounds', 'max', 'sum', 'lambda t:'] },
      { id: 'fa23f-2c', problem: 'fa23f-2', label: '(c)', points: 3, topics: ['trees', 'recursion'], difficulty: 'hard', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa23f-3a', problem: 'fa23f-3', label: '(a)', points: 3, topics: ['oop', 'links'], difficulty: 'hard', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa23f-3b', problem: 'fa23f-3', label: '(b)', points: 1, topics: ['oop'], difficulty: 'medium', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa23f-3c', problem: 'fa23f-3', label: '(c)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['current', 'self.current', 'current.then', 'self.current.then'] },
      { id: 'fa23f-3d', problem: 'fa23f-3', label: '(d)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
        choices: ['self', 'self.first', 'str(self)', 'str(self.first)', 'print(self)', 'print(self.first)'] },
      { id: 'fa23f-3e', problem: 'fa23f-3', label: '(e)', points: 3, topics: ['oop', 'fundamentals'], difficulty: 'hard', blank: 'e',
        type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'fa23f-3f', problem: 'fa23f-3', label: '(f)', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'f',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (f).',
        choices: ['self.w', 'self.exp[w]', 'self.say', 'self.say()', 'self.say(self)', 'self.say(self.w)'] },
      { id: 'fa23f-4a', problem: 'fa23f-4a', label: 'i.', points: 1, topics: ['lists', 'fundamentals'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
        choices: ['len(s) == 3 * n - 1', '(len(s) - 1) / 3', '(len(s) - 1) % 3 == 0', 'len(s) % 3 == 2'] },
      { id: 'fa23f-4b', problem: 'fa23f-4a', label: 'ii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['skip', 'not skip', 'result', 'not result', 'pair', 'not pair', 'len(pair) < 2', 'len(pair) == 2'] },
      { id: 'fa23f-4c', problem: 'fa23f-4a', label: 'iii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['skip = False', 'skip = True', 'pair = []', 'pair.remove(x)', 'result.append(x)', 'result.append(pair)'] },
      { id: 'fa23f-4d', problem: 'fa23f-4a', label: 'iv.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
        choices: ['skip', 'not skip', 'result', 'not result', 'pair', 'not pair', 'len(pair) < 2', 'len(pair) == 2'] },
      { id: 'fa23f-4e', problem: 'fa23f-4a', label: 'v.', points: 2, topics: ['lists'], difficulty: 'medium', blank: 'e',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (e). **Select all that apply.**',
        choices: ['append(pair)', 'extend(pair)', 'append((pair[0], pair[1]))', 'extend((pair[0], pair[1]))', 'append(tuple(pair))', 'extend(tuple(pair))', 'append(tuple(pair[0], pair[1]))', 'extend(tuple(pair[0], pair[1]))'] },
      { id: 'fa23f-4f', problem: 'fa23f-4b', label: 'i.', points: 2, topics: ['fundamentals'], difficulty: 'medium', blank: 'f',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (f). **Select all that apply.** Assume `tuple` has no subclasses.',
        choices: ['tuple(x)', 'x == tuple', 'x is tuple', 'type(x) == tuple', 'x == type(tuple)', 'isinstance(x, tuple)', 'isinstance(x, type(tuple))', 'isinstance(type(x), tuple)'] },
      { id: 'fa23f-4g', problem: 'fa23f-4b', label: 'ii.', points: 2, topics: ['hof'], difficulty: 'medium', blank: 'g',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (g).',
        choices: ['len(s) == 2', 'len(x) == 2', 'lambda x: len(s) == 2', 'lambda x: len(x) == 2', 'lambda s: lambda x: len(s) == 2', 'lambda s: lambda x: len(x) == 2', 'lambda x: len(s[i]) == 2', 'lambda x: len(x[i]) == 2', 'lambda i: lambda x: len(s[i]) == 2', 'lambda i: lambda x: len(x[i]) == 2'] },
      { id: 'fa23f-4h', problem: 'fa23f-4c', label: 'i.', points: 1, topics: ['recursion', 'lists'], difficulty: 'easy', blank: 'h',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (h).', choices: ['pairs not in s', 'pairs[0] not in s', 'len(s) < 2', 'not is_pairing(s, pairs)'] },
      { id: 'fa23f-4i', problem: 'fa23f-4c', label: 'ii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'i',
        type: 'short_answer', prompt: 'Fill in blank (i).' },
      { id: 'fa23f-4j', problem: 'fa23f-4c', label: 'iii.', points: 1, topics: ['recursion', 'lists'], difficulty: 'easy', blank: 'j',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (j).', choices: ['pairs', 'pairs[1]', 'pairs[1:]', 'pairs[:1]'] },
      { id: 'fa23f-4k', problem: 'fa23f-4c', label: 'iv.', points: 3, topics: ['recursion', 'lists'], difficulty: 'hard', blank: 'k',
        type: 'short_answer', prompt: 'Fill in blank (k).' },
      { id: 'fa23f-4l', problem: 'fa23f-4d', label: 'i.', points: 2, topics: ['generators', 'recursion'], difficulty: 'medium', blank: 'l',
        type: 'short_answer', prompt: 'Fill in blank (l).' },
      { id: 'fa23f-4m', problem: 'fa23f-4d', label: 'ii.', points: 1, topics: ['generators'], difficulty: 'easy', blank: 'm',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (m).', choices: ['s[0] == s[1]', 's[0] != s[1]', 'pair[0] == pair[1]', 'pair[0] != pair[1]'] },
      { id: 'fa23f-4n', problem: 'fa23f-4d', label: 'iii.', points: 2, topics: ['generators'], difficulty: 'medium', blank: 'n',
        type: 'short_answer', prompt: 'Fill in blank (n).' },
      { id: 'fa23f-4o', problem: 'fa23f-4d', label: 'iv.', points: 2, topics: ['generators', 'lists'], difficulty: 'medium', blank: 'o',
        type: 'short_answer', prompt: 'Fill in blank (o).' },
      { id: 'fa23f-4p', problem: 'fa23f-4e', label: 'i.', points: 2, topics: ['links'], difficulty: 'easy', blank: 'p',
        type: 'multi_select', mono: true, prompt: 'Fill in blank (p). **Select all that apply.**',
        choices: ['s is Link.empty', 's.rest is Link.empty', 's is Link.empty or s.rest is Link.empty', 's.rest is Link.empty or s is Link.empty'] },
      { id: 'fa23f-4q', problem: 'fa23f-4e', label: 'ii.', points: 2, topics: ['links'], difficulty: 'easy', blank: 'q',
        type: 'short_answer', prompt: 'Fill in blank (q).' },
      { id: 'fa23f-4r', problem: 'fa23f-4e', label: 'iii.', points: 1, topics: ['links', 'recursion'], difficulty: 'medium', blank: 'r',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (r).', choices: ['s', 's.rest', 's.rest.rest', 's.rest.rest.rest'] },
      { id: 'fa23f-4s', problem: 'fa23f-4e', label: 'iv.', points: 1, topics: ['links', 'recursion'], difficulty: 'medium', blank: 's',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (s).', choices: ['s', 's.rest', 's.rest.rest', 's.rest.rest.rest'] },
      { id: 'fa23f-5a', problem: 'fa23f-5', label: '(a)', points: 2, topics: ['scheme'], difficulty: 'hard',
        type: 'short_answer', prompt: "What does this expression evaluate to? `((shrink 3 nil) '(3 1 4 1 5 9 2 6))`" },
      { id: 'fa23f-5b', problem: 'fa23f-5', label: '(b)', points: 1, topics: ['scheme', 'efficiency'], difficulty: 'medium',
        type: 'single_choice', prompt: 'What is the order of growth of the run time of `((shrink 1 nil) s)` in terms of the length of list `s`?',
        choices: ['constant', 'linear', 'quadratic', 'exponential'] },
      { id: 'fa23f-5c', problem: 'fa23f-5', label: '(c)', points: 1, topics: ['scheme'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'Which of the following evaluates to 4?',
        choices: ['(cdr twos)', '((cdr twos))', '(car (cdr twos))', '((car (cdr twos)))', '(car ((cdr twos)))', '((car ((cdr twos))))'] },
      { id: 'fa23f-5d', problem: 'fa23f-5', label: '(d)', points: 2, topics: ['scheme'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'Which of the following evaluates to 8?',
        choices: ['(cdr (cdr twos))', '((cdr (cdr twos)))', '(cdr ((cdr twos)))', '(car (cdr (cdr twos)))', '((car (cdr (cdr twos))))', '(car (cdr ((cdr twos))))', '(car ((cdr (cdr twos))))', '(car ((cdr ((cdr twos)))))'] },
      { id: 'fa23f-6a', problem: 'fa23f-6', label: '(a)', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['append', 'cons', 'list', 'promote', 'map', 'filter'] },
      { id: 'fa23f-6b', problem: 'fa23f-6', label: '(b)', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa23f-6c', problem: 'fa23f-6', label: '(c)', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa23f-6d', problem: 'fa23f-6d', label: '(d)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in the blank.' },
      { id: 'fa23f-7a', problem: 'fa23f-7', label: '(a)', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa23f-7b', problem: 'fa23f-7', label: '(b)', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['cons', 'list', 'append', 'map'] },
      { id: 'fa23f-7c', problem: 'fa23f-7', label: '(c)', points: 2, topics: ['scheme'], difficulty: 'hard', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa23f-7d', problem: 'fa23f-7d', label: '(d)', points: 3, topics: ['scheme'], difficulty: 'medium',
        type: 'multi_select', mono: true, prompt: 'Which expressions are passed to `scheme_eval` when evaluating `(if (> 1 2) (+ 1 2) 2)`? **Check all that apply.**',
        choices: ['if', '(> 1 2)', '>', '1', '2', '(+ 1 2)', '+'] },
      { id: 'fa23f-8a', problem: 'fa23f-8', label: '(a)', points: 2, topics: ['sql-agg'], difficulty: 'hard', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa23f-8b', problem: 'fa23f-8', label: '(b)', points: 1, topics: ['sql-joins'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['quantity, prices', 'quantity, donuts, prices', 'donuts, prices AS a, prices AS b', 'quantity, prices AS a, prices AS b'] },
      { id: 'fa23f-8c', problem: 'fa23f-8', label: '(c)', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa23f-8d', problem: 'fa23f-8', label: '(d)', points: 1, topics: ['sql-agg'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['quantity', 'dough', 'kind', 'flavor'] },
      { id: 'fa23f-9a', problem: 'fa23f-9a', label: '(a)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in the blank.' },
      { id: 'fa23f-9b', problem: 'fa23f-9b', label: '(b)', points: 0, topics: ['generators', 'lists'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in blank (a), the one marked “Just fill in this blank”.' },
    ],
    answers: {
      'fa23f-1a': { correct: 0, explanation: '`copy = result` makes `copy` another name for the same list; no copy is made.' },
      'fa23f-1b': { correct: 4, explanation: '`chain` calls `add_copy(True, add_copy)`, which calls `add_copy(False, add_copy)`. Each call has the right number of arguments and every name is defined.' },
      'fa23f-1c': { accepted: ['[5, 1, [5, 1], 2]'], explanation: 'The first call appends 1 to `result` (through `copy`), then appends a copy of it, `[5, 1]`. The second call appends 2.' },
      'fa23f-2a': { correct: 7, explanation: 'A path ends at a leaf, so only a leaf counts as one path; the bounds have already been shifted by the labels above it.' },
      'fa23f-2b': { correct: 2, explanation: 'Add up the counts from all branches.' },
      'fa23f-2c': { accepted: ['bounds(b, low - t.label, high - t.label)'], explanation: 'Below `t`, a path must make up the rest of the sum, so subtract `t.label` from both bounds.' },
      'fa23f-3a': { accepted: ['Word(w, self, previous)'], explanation: 'Each new word points to the previous one, which reverses the order.' },
      'fa23f-3b': { accepted: ['previous = current'], explanation: 'The next word will point to this one.' },
      'fa23f-3c': { correct: 0, explanation: 'After the loop, `current` is the word made last, which is the first of the reversed sequence.' },
      'fa23f-3d': { correct: 3, explanation: '`__str__` must return a string: the string of the first word, which includes the rest.' },
      'fa23f-3e': { accepted: ['self.exp.dialect.get(self.w, self.w)'], explanation: 'Look up the word in its expression’s dialect, defaulting to the word itself.' },
      'fa23f-3f': { correct: 3, explanation: 'Call `say` to get how a pirate says this word.' },
      'fa23f-4a': { correct: 3, explanation: 'A length of `3*n - 1` leaves remainder 2 when divided by 3.' },
      'fa23f-4b': { correct: 1, explanation: 'Add `x` to the current pair unless this element is skipped (just after a pair).' },
      'fa23f-4c': { correct: 0, explanation: 'Skip exactly one element after each pair.' },
      'fa23f-4d': { correct: 7, explanation: 'A pair is complete when it has two elements.' },
      'fa23f-4e': { correct: [2, 4], explanation: 'Each pair is added as a tuple. `extend` would add the two numbers separately, and `tuple(pair[0], pair[1])` is an error.' },
      'fa23f-4f': { correct: [3, 5], explanation: 'Check the type: `type(x) == tuple` or `isinstance(x, tuple)`.' },
      'fa23f-4g': { correct: 3, explanation: '`map` needs a one-argument function that checks one element’s length.' },
      'fa23f-4h': { correct: 2, explanation: 'With pairs left to match but fewer than two elements, it can’t be a pairing.' },
      'fa23f-4i': { accepted: ['pairs[0]'], explanation: 'Compare the first pair with the first two elements.' },
      'fa23f-4j': { correct: 2, explanation: 'That pair is matched; skip it and one more element, and match the remaining pairs.' },
      'fa23f-4k': { accepted: ['is_pairing(s[1:], pairs)'], explanation: 'Otherwise the first pair starts later: try again from the next element.' },
      'fa23f-4l': { accepted: ['unequal_pairs(s[1:])'], explanation: 'Pairings that don’t use `s[0]`.' },
      'fa23f-4m': { correct: 1, explanation: 'A pair of the first two elements is allowed only if they differ.' },
      'fa23f-4n': { accepted: ['yield [pair]'], explanation: 'The pair on its own is a non-empty pairing.' },
      'fa23f-4o': { accepted: ['[pair] + rest'], explanation: 'Put this pair before each pairing of the rest (which starts after a skipped element).' },
      'fa23f-4p': { correct: [2], explanation: 'With fewer than two elements there is no pair. Order matters: `s.rest` doesn’t exist when `s` is empty, so check `s is Link.empty` first.' },
      'fa23f-4q': { accepted: ['s.first + s.rest.first'], explanation: 'The sum of the first pair.' },
      'fa23f-4r': { correct: 3, explanation: 'Using the first pair means skipping it and the element after it.' },
      'fa23f-4s': { correct: 1, explanation: 'Not using the first element: start from the second.' },
      'fa23f-5a': { accepted: ['(2 9 1 1)'], explanation: 'Each element equal to `k` is dropped and `k` increases; the others are consed onto `t`, which reverses them.' },
      'fa23f-5b': { correct: 1, explanation: 'One step per element.' },
      'fa23f-5c': { correct: 4, explanation: 'The `cdr` is a procedure that computes the rest; calling it gives the list starting with 4.' },
      'fa23f-5d': { correct: 7, explanation: 'Call the rest procedure twice to reach the third element.' },
      'fa23f-6a': { correct: 0, explanation: 'Join two lists.' },
      'fa23f-6b': { accepted: ['(filter f s)'], explanation: 'The elements for which `f` is true come first.' },
      'fa23f-6c': { accepted: ['(lambda (x) (not (f x)))'], explanation: 'Then the others.' },
      'fa23f-6d': { accepted: ['((curry-call promote) (curry <) car)'] },
      'fa23f-7a': { accepted: ['(list (list m))'], explanation: 'One skip-partition: just `m`.' },
      'fa23f-7b': { correct: 3, explanation: 'Put `m` in front of every partition of the rest.' },
      'fa23f-7c': { accepted: ['(part (- n m) (+ m 2))'], explanation: 'The rest sums to `n - m` and starts at least 2 above `m` (no duplicates or consecutive numbers).' },
      'fa23f-7d': { correct: [1, 2, 3, 4], explanation: 'The condition `(> 1 2)` and its parts are evaluated; it is false, so only `2` is evaluated next. `if` is a special form, and `(+ 1 2)` is never evaluated.' },
      'fa23f-8a': { accepted: ['MIN(price) * k', 'MIN(price * k)', 'k * MIN(price)', 'MIN(k * price)'], explanation: 'The cheapest dough for that flavor, times how many donuts.' },
      'fa23f-8b': { correct: 1, explanation: 'Join what is wanted, what is on the menu, and what dough costs.' },
      'fa23f-8c': { accepted: ['kind=dough AND choice=flavor', 'choice=flavor AND kind=dough', 'dough=kind AND flavor=choice', 'flavor=choice AND dough=kind', 'kind=dough AND flavor=choice', 'dough=kind AND choice=flavor'], explanation: 'Match each wanted flavor to its menu options, and each option to its price.' },
      'fa23f-8d': { correct: 3, explanation: 'One row per flavor.' },
      'fa23f-9a': { accepted: ['(wait (add fib ((cdr fib))))'] },
      'fa23f-9b': { accepted: ['(len(pairs) == 1 and pairs[0] == first) or not pairs'] },
    },
  });

  // ───────────────────────────── Spring 2023 Final ─────────────────────────────
  const SP23_TABLES = code(`
finals:
| hall    | course |
|---------|--------|
| RSF     | 61A    |
| Wheeler | 61A    |
| RSF     | 61B    |

sizes:
| room     | seats |
|----------|-------|
| RSF      | 900   |
| Wheeler  | 700   |
| 310 Soda | 40    |

result:
| course | seats |
|--------|-------|
| 61A    | 1600  |
`);
  const SP23_SETUP = code(`
CREATE TABLE finals(hall, course);
INSERT INTO finals VALUES ('RSF', '61A'), ('Wheeler', '61A'), ('RSF', '61B');
CREATE TABLE sizes(room, seats);
INSERT INTO sizes VALUES ('RSF', 900), ('Wheeler', 700), ('310 Soda', 40);
`);
  add({
    exam: { id: 'sp23f', label: 'Spring 2023 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'sp23f-1': {
        exam: 'sp23f', number: '1', title: 'What Would Python Display?', points: 10,
        intro: 'Assume the following code has been executed. The `Link` class appears on the midterm 2 study guide.',
        code: code(`
class Chain(Link):
    def add(self, v):
        self.rest = Chain(v, self.rest)
        return self

gold = Chain(3, Chain(5, Chain(7)))
silver = [1, [2], 3]
bronze = silver[1:]
silver.append(4)
silver[1].append(5)
`),
        outro: 'For each expression below, choose the output displayed when the expression is evaluated. Assume the expressions are evaluated in order in the same interactive session, and so evaluating an earlier expression may affect the result of a later one.',
      },
      'sp23f-2': {
        exam: 'sp23f', number: '2', title: 'Framed', points: 5,
        intro: 'Complete the environment diagram that results from running all of the code below and then answer the questions that follow. Blanks with no labels have no questions associated with them and are not scored.',
        figure: { src: 'assets/sp23-final-q2.png', width: 516, height: 503, alt: 'From the exam: a partly filled environment diagram and the code with line numbers 1 to 10. The Global frame binds rounded, k (blank (a)), up, and s (blank (b)). Frame f1: rounded [parent=Global] binds f, k (blank (c)), g and h, with Return Value blank (d). Frame f2: h has details omitted. Frame f3: λ(x) <line 2> has x = 7 and Return Value blank (e). Frame f4: λ(x) <line 7> has x = 7 and Return Value blank (f). Some parent boxes are blank.', slots: [[217, 46, 39], [217, 94, 39], [217, 188, 39], [217, 266, 39], [217, 394, 39], [217, 490, 39], [471, 71, 30], [471, 216, 30], [445, 241, 30], [202, 336, 30], [202, 431, 30]] },
        code: code(`
def rounded(f, k):
    g = lambda x: (f(x)//k)*k
    def h(update):
        k = update
    return [h, g]
k = 2
up = lambda x: x * k + 1
s = rounded(up, 4)
s[0](5)
s[1](7)
`),
        lineNumbers: true,
      },
      'sp23f-3a': {
        exam: 'sp23f', number: '3(a)', title: 'Trees Get Degrees — big_paths', points: 10,
        intro: 'Implement `big_paths`, which takes a `Tree` instance `t` with number labels. It returns the number of paths from the root of `t` to a leaf in which all labels are greater than or equal to the root label. The `Tree` class appears on the midterm 2 study guide.',
        code: code(`
def big_paths(t):
    """Return the number of paths from the root to a leaf in which all labels are
    greater than or equal to the root label of t.

    >>> t = Tree(5, [Tree(4, [Tree(6), Tree(7)]), Tree(8), Tree(7, [Tree(5), Tree(3)])])
    >>> big_paths(t)  # 5-8 and 5-7-5
    2
    """
    def f(s):
        if ⟦a⟧:
            return 0
        elif ⟦b⟧:
            return 1
        else:
            return ⟦c⟧
    return ⟦d⟧
`),
      },
      'sp23f-3b': {
        exam: 'sp23f', number: '3(b)', title: 'Trees Get Degrees — gen', points: 6,
        intro: 'Implement `gen`, a generator function that takes a `Tree` instance `t` with number labels and a number `n`. It yields a two-element list for every pair of a parent label and child label that sum to `n`.',
        code: code(`
def gen(t, n):
    """Yield all pairs of a parent label and child label that sum to n in tree t.

    >>> t = Tree(5, [Tree(4, [Tree(6), Tree(7)]), Tree(8), Tree(7, [Tree(5), Tree(3)])])
    >>> sorted(gen(t, 10))  # Does not yield [5, 5]; one 5 is the grandparent of the other.
    [[4, 6], [7, 3]]
    """
    for b in ⟦e⟧:
        if ⟦f⟧ == n:
            ⟦g⟧
        yield from ⟦h⟧
`),
      },
      'sp23f-4': {
        exam: 'sp23f', number: '4', title: 'Repark the Car', points: 6,
        intro: '**Definition.** A car takes up 2 adjacent parking spots. A string of length `n` can represent `n` adjacent parking spots using `<>` for a car and `.` for an empty spot. For example `\'.<>.<><>\'` represents an empty spot, then two spots containing a car, then another empty spot, then four spots containing two cars.\n\nImplement `cars`, which takes non-negative integers `k` and `n`. It returns the number of ways to park `k` cars in `n` adjacent parking spots. Treat all cars the same; it does not matter which car is parked in which spot.',
        code: code(`
def cars(k, n):
    """Return the number of ways to park k cars in n adjacent parking spaces where
    each car takes up two spaces.

    >>> cars(2, 5)  # '<><>.', '<>.<>', '.<><>'
    3
    >>> cars(3, 6)  # '<><><>'
    1
    >>> cars(1, 7)  # '<>.....', '.<>....', etc.
    6
    """
    if k == 0:
        return ⟦a⟧
    if ⟦b⟧:
        return 0
    return ⟦c⟧
`),
      },
      'sp23f-5a': {
        exam: 'sp23f', number: '5(a)', title: 'Pairings — pair', points: 4,
        intro: '**Definition.** The *pairing* of a sequence `s` is a sequence of pairs containing all of the elements of `s` in order. A pair is a two-element list. E.g., the pairing of `[1, 3, 5, 6, 4, 2]` is `[[1, 3], [5, 6], [4, 2]]`.\n\nImplement `pair`, a function that takes a list `s` with an even length. It returns the pairing of `s`.',
        code: code(`
def pair(s):
    """Return the pairing of an even-length list s as a list of two-element lists.

    >>> pair([3, 4, 5, 8, 7, 6])
    [[3, 4], [5, 8], [7, 6]]
    """
    assert len(s) % 2 == 0
    return [⟦a⟧ for i in ⟦b⟧]
`),
      },
      'sp23f-5a-iii': {
        exam: 'sp23f', number: '5(a) iii', title: 'Pairings — gen_pairs', points: 2,
        intro: 'Fill in blank (c) in the implementation of `gen_pairs`, a generator function that takes an infinite iterator `t`. It yields the elements of the pairing of the sequence represented by `t`.',
        code: code(`
def naturals(k):
    yield k
    yield from naturals(k + 1)

def gen_pairs(t):
    """Yield elements of the pairing of an infinite iterable s.

    >>> t = gen_pairs(naturals(3))  # naturals(3) contains 3, 4, 5, 6, ...
    >>> next(t)
    [3, 4]
    >>> next(t)
    [5, 6]
    """
    while True:
        yield ⟦c⟧
`),
      },
      'sp23f-5b': {
        exam: 'sp23f', number: '5(b)', title: 'Pairings — pairs (Scheme)', points: 5,
        intro: 'Implement `pairs`, a Scheme procedure that takes a list `s` with an even length. It returns the pairing of `s`. For example, `(pairs \'(3 4 5 8 7 6))` evaluates to `((3 4) (5 8) (7 6))`.',
        code: code(`
(define (pairs s) (if (null? s) nil ( ⟦d⟧ ( list (car s) ⟦e⟧ ) ⟦f⟧ )))
`),
      },
      'sp23f-5b-iv': {
        exam: 'sp23f', number: '5(b) iv–v', title: 'Pairings — Scheme expressions', points: 5,
        intro: 'Assume `pairs` is implemented correctly. The built-in `map` procedure appears on the final study guide.',
        code: code(`
(map pairs (pairs '(3 4 5 6)))
((lambda (x) 1) 2)
`),
      },
      'sp23f-6a': {
        exam: 'sp23f', number: '6(a)', title: 'Log and Count — Log', points: 6,
        intro: 'The `Log` class is constructed with a one-argument function `f` and has a method `call` that takes `n` and returns `f(n)`. The `args` attribute of a `Log` instance for function `f` is a list containing all `n` passed to the `call` method of any `Log` instance with the same `f`.\n\nOne expression fills both blanks (a) and (c), so both are shown as (a) below.',
        code: code(`
class Log:
    """Store the arguments passed to a one-argument function in a list called args.
    If two logs are created for the same function f, they share a list of args.

    >>> f = Log(lambda x: x * x)
    >>> f.call(f.call(3))
    81
    >>> f.args
    [3, 9]
    >>> g, h = Log(abs), Log(abs)
    >>> g.call(h.call(-3))
    3
    >>> g.args
    [-3, 3]
    """
    logged = {}
    def __init__(self, f):
        if f not in self.logged:
            ⟦a⟧ = []
        self.f = ⟦b⟧
        self.args = ⟦a⟧

    def call(self, n):
        self.args.append(n)
        return ⟦d⟧
`),
      },
      'sp23f-6b': {
        exam: 'sp23f', number: '6(b)', title: 'Log and Count — Counter', points: 8,
        intro: 'The `Counter` class has a method `observe` that takes an iterable and a method `count` that takes a value `v` and returns the number of times `v` appears among the elements of all the iterables ever passed to `observe`. Finally, the `forget` method takes no arguments and omits the values of the most recent (not yet forgotten) call to `observe` from subsequent calls to `count`. Assume `forget` is never called more times than `observe`.\n\n**Hint:** The built-in `count` method of a list returns the count of a value: `[3, 4, 3].count(3)` is 2.',
        code: code(`
class Counter:
    """Counts the number of times a value was observed.

    >>> c = Counter()
    >>> c.observe(map(abs, range(-3, 3)))  # observe 3, 2, 1, 0, 1, 2
    >>> c.observe(range(-3, 3))            # observe -3, -2, -1, 0, 1, 2
    >>> {i: c.count(i) for i in range(-3, 3)}
    {-3: 1, -2: 1, -1: 1, 0: 2, 1: 3, 2: 3}
    >>> c.forget()  # forget range(-3, 3)
    >>> {i: c.count(i) for i in range(-3, 3)}
    {-3: 0, -2: 0, -1: 0, 0: 1, 1: 2, 2: 2}
    >>> c.forget()  # forget map(abs, range(-3, 3))
    >>> c.count(1)
    0
    """
    def __init__(self):
        self.obs = []

    def observe(self, vs):
        ⟦e⟧

    def count(self, v):
        return ⟦f⟧

    def forget(self):
        ⟦g⟧
`),
      },
      'sp23f-7': {
        exam: 'sp23f', number: '7', title: 'Room Service', points: 8, lang: 'sql',
        intro: 'The `finals` table has columns `hall` (strings) and `course` (strings), and has rows for each lecture hall in which a course is holding its final exam. Each `course` and each `hall` value may appear multiple times because a course may use multiple lecture halls at the same time, and a lecture hall may hold finals for multiple courses at different times.\n\nThe `sizes` table has columns `room` (strings) and `seats` (numbers), and has one row per unique room on campus containing the number of seats in that room. Each room appears once. All lecture halls are rooms.\n\nCreate a table with two columns, `course` (string) and `seats` (number), and with one row containing the name of the course and the total number of seats in final rooms for that course. Only include a row for each course that uses at least two rooms for its final.\n\n```\n' + SP23_TABLES + '\n```',
        sqlSetup: SP23_SETUP,
        code: code(`
SELECT course, SUM(⟦a⟧) AS seats FROM ⟦b⟧ GROUP BY ⟦c⟧;
`),
      },
      'sp23f-8a': {
        exam: 'sp23f', number: '8(a)', title: 'Group Work — group (A+)', points: 0,
        intro: 'This A+ question is not worth any points.\n\n**Definition.** The *n-grouping* of a list `s` for positive integer `n` is a list of `n`-length lists containing all of the elements of `s` in order. The last list may contain fewer than `n` elements. E.g., the 3-grouping of `[4, 3, 2, 1, 5, 6, 7, 8]` is `[[4, 3, 2], [1, 5, 6], [7, 8]]`.\n\nFill in the blank to implement `group`, which takes positive integer `n` and list `s`. It returns the n-grouping of `s`.',
        code: code(`
def group(n, s):
    """Return the n-grouping of a list s as a list of n-element lists.

    >>> group(2, [3, 4, 5, 6, 7, 8])
    [[3, 4], [5, 6], [7, 8]]
    >>> group(3, [3, 4, 5, 6, 7, 8])
    [[3, 4, 5], [6, 7, 8]]
    >>> group(4, [3, 4, 5, 6, 7, 8])
    [[3, 4, 5, 6], [7, 8]]
    """
    if len(s) <= n:
        return [s]
    else:
        return ⟦A+⟧
`),
      },
      'sp23f-8b': {
        exam: 'sp23f', number: '8(b)', title: 'Group Work — group (A+, Scheme)', points: 0,
        intro: 'This A+ question is not worth any points.\n\nFill in the blank to implement `group` in Scheme, which takes positive integer `n` and list `s`. It returns the n-grouping of `s`.',
        code: code(`
; (group 3 '(3 4 5 6 7 8)) evaluates to ((3 4 5) (6 7 8))
; (group 4 '(3 4 5 6 7 8)) evaluates to ((3 4 5 6) (7 8))
(define (group n s)
  (define (first n s f)
    (cond ((null? s) nil)
          ((= n 0) (cons nil (f s)))
          ((null? (cdr s)) (list (list (car s))))
          (else (let ((t (first (- n 1) (cdr s) f)))
                  (cons (cons (car s) (car t)) (cdr t))))))
  ⟦A+⟧ )
`),
      },
    },
    questions: [
      { id: 'sp23f-1a', problem: 'sp23f-1', label: '(a)', points: 3, topics: ['links', 'oop'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: '`print(gold.rest.add(1))`',
        choices: ['<3 1 5 7>', '<3 <1> 5 7>', '<3 5 1 7>', '<3 5 <1> 7>', '<5 1 7>', '<5 <1> 7>', 'None of these'] },
      { id: 'sp23f-1b', problem: 'sp23f-1', label: '(b)', points: 3, topics: ['links', 'oop'], difficulty: 'hard',
        type: 'short_answer', prompt: '`print(Chain(2, gold).add(4))`' },
      { id: 'sp23f-1c', problem: 'sp23f-1', label: '(c)', points: 2, topics: ['lists'], difficulty: 'medium',
        type: 'short_answer', prompt: '`print(bronze)`' },
      { id: 'sp23f-1d', problem: 'sp23f-1', label: '(d)', points: 2, topics: ['efficiency'], difficulty: 'easy',
        type: 'single_choice', prompt: 'What is the order of growth of the time to run the `Chain.add` method with respect to the length of `self`?',
        choices: ['Constant', 'Logarithmic', 'Linear', 'Quadratic', 'Exponential'] },
      { id: 'sp23f-2a', problem: 'sp23f-2', label: '(a)', points: 1, topics: ['env'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['2', '4', '5', 'None of these'] },
      { id: 'sp23f-2b', problem: 'sp23f-2', label: '(b)', points: 1, topics: ['env', 'lists'], difficulty: 'easy',
        type: 'single_choice', prompt: 'Blanks (b) and (d) have the same value; what is it?',
        choices: ['Two functions', 'A list containing two functions', 'A list containing a list of two functions', 'A list containing two lists that each contain one function'] },
      { id: 'sp23f-2c', problem: 'sp23f-2', label: '(c)', points: 3, topics: ['env', 'hof'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What three numbers fill in blanks (c), (e), and (f) respectively?',
        choices: ['4, 12, 15', '4, 14, 15', '4, 15, 15', '4, 25, 29', '4, 28, 29', '4, 36, 36', '5, 12, 15', '5, 15, 15', '5, 25, 29', '5, 28, 29', '5, 36, 36'] },
      { id: 'sp23f-3a', problem: 'sp23f-3a', label: 'i.', points: 2, topics: ['trees'], difficulty: 'medium', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).',
        choices: ['s.is_leaf()', 't.is_leaf()', 't.label >= s.label', 's.label >= t.label', 't.label > s.label', 's.label > t.label'] },
      { id: 'sp23f-3b', problem: 'sp23f-3a', label: 'ii.', points: 2, topics: ['trees'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['s.is_leaf()', 't.is_leaf()', 't.label >= s.label', 's.label >= t.label', 't.label > s.label', 's.label > t.label'] },
      { id: 'sp23f-3c', problem: 'sp23f-3a', label: 'iii.', points: 4, topics: ['trees', 'recursion'], difficulty: 'hard', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'sp23f-3d', problem: 'sp23f-3a', label: 'iv.', points: 2, topics: ['trees', 'hof'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['f(s)', 'f(t)', 'f(s, 0)', 'f(t, 0)', '1 + f(s, 0)', '1 + f(t, 0)'] },
      { id: 'sp23f-3e', problem: 'sp23f-3b', label: 'i.', points: 1, topics: ['trees', 'generators'], difficulty: 'easy', blank: 'e',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (e).', choices: ['t.branches', 'gen(t.branches, n)', 'map(lambda x: gen(x, n), t.branches)'] },
      { id: 'sp23f-3f', problem: 'sp23f-3b', label: 'ii.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'f',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (f).', choices: ['b.label', 't.label', 't.label + b.label', 'sum([b.label for b in t.branches])'] },
      { id: 'sp23f-3g', problem: 'sp23f-3b', label: 'iii.', points: 2, topics: ['generators'], difficulty: 'medium', blank: 'g',
        type: 'short_answer', prompt: 'Fill in blank (g).' },
      { id: 'sp23f-3h', problem: 'sp23f-3b', label: 'iv.', points: 2, topics: ['generators', 'recursion'], difficulty: 'medium', blank: 'h',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (h).',
        choices: ['t.branches', 'b.branches', '[[t, b] for b in t.branches]', '[[t.label, b.label] for b in t.branches]', 'gen(t, n)', 'gen(b, n)'] },
      { id: 'sp23f-4a', problem: 'sp23f-4', label: '(a)', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['0', '1', 'n', 'n+1'] },
      { id: 'sp23f-4b', problem: 'sp23f-4', label: '(b)', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['k > 0', 'k < 0', 'n == 0', 'n < 1', 'n < 2'] },
      { id: 'sp23f-4c', problem: 'sp23f-4', label: '(c)', points: 3, topics: ['recursion'], difficulty: 'hard', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'sp23f-5a', problem: 'sp23f-5a', label: 'i.', points: 3, topics: ['lists'], difficulty: 'hard', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'sp23f-5b', problem: 'sp23f-5a', label: 'ii.', points: 1, topics: ['lists', 'hof'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b). The built-in `map` function appears on the midterm 2 study guide.',
        choices: ['map(lambda x: x // 2, s)', 'map(lambda x: s // 2, s)', 'range(len(s // 2))', 'range(len(s) // 2)'] },
      { id: 'sp23f-5c', problem: 'sp23f-5a-iii', label: 'iii.', points: 2, topics: ['generators', 'iterators'], difficulty: 'medium', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'sp23f-5d', problem: 'sp23f-5b', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['append', 'car', 'cdr', 'cons', 'if', 'list'] },
      { id: 'sp23f-5e', problem: 'sp23f-5b', label: 'ii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'e',
        type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'sp23f-5f', problem: 'sp23f-5b', label: 'iii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'f',
        type: 'short_answer', prompt: 'Fill in blank (f).' },
      { id: 'sp23f-5g', problem: 'sp23f-5b-iv', label: 'iv.', points: 2, topics: ['scheme'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: "What is the value of the expression `(map pairs (pairs '(3 4 5 6)))`?",
        choices: ['(3 4 5 6)', '((3 4) (5 6))', '(((3 4) (5 6)))', '((3 (4)) (5 (6)))', '(((3 4)) ((5 6)))'] },
      { id: 'sp23f-5h', problem: 'sp23f-5b-iv', label: 'v.', points: 3, topics: ['scheme'], difficulty: 'medium',
        type: 'multi_select', mono: true, prompt: 'Which expressions are passed to `scheme_eval` when evaluating `((lambda (x) 1) 2)`? **Check all that apply.**',
        choices: ['((lambda (x) 1) 2)', '(lambda (x) 1)', 'lambda', '(x)', 'x', '1', '2'] },
      { id: 'sp23f-6a', problem: 'sp23f-6a', label: 'i.', points: 3, topics: ['oop'], difficulty: 'hard', blank: 'a',
        type: 'short_answer', prompt: 'One expression can fill both blanks (a) and (c); what is it?' },
      { id: 'sp23f-6b', problem: 'sp23f-6a', label: 'ii.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'sp23f-6d', problem: 'sp23f-6a', label: 'iii.', points: 2, topics: ['oop', 'hof'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['Log.call(self, n)', 'self.call(n)', 'self.f(n)', 'self.f.call(n)'] },
      { id: 'sp23f-6e', problem: 'sp23f-6b', label: 'i.', points: 3, topics: ['oop', 'iterators', 'lists'], difficulty: 'hard', blank: 'e',
        type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'sp23f-6f', problem: 'sp23f-6b', label: 'ii.', points: 3, topics: ['oop', 'lists'], difficulty: 'hard', blank: 'f',
        type: 'short_answer', prompt: 'Fill in blank (f).' },
      { id: 'sp23f-6g', problem: 'sp23f-6b', label: 'iii.', points: 2, topics: ['oop', 'lists'], difficulty: 'easy', blank: 'g',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (g).',
        choices: ['obs.pop()', 'self.obs.pop()', '[obs.pop() for i in range(len(vs))]', '[self.obs.pop() for i in range(len(vs))]'] },
      { id: 'sp23f-7a', problem: 'sp23f-7', label: '(a)', points: 1, topics: ['sql-agg'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['course', 'room', 'seats', 'sizes'] },
      { id: 'sp23f-7b', problem: 'sp23f-7', label: '(b)', points: 4, topics: ['sql-joins'], difficulty: 'hard', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b). You may include a `WHERE` or `HAVING` clause.' },
      { id: 'sp23f-7c', problem: 'sp23f-7', label: '(c)', points: 3, topics: ['sql-agg'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['hall WHERE seats > 1', 'hall HAVING seats > 1', 'hall WHERE sizes > 1', 'hall HAVING sizes > 1', 'hall WHERE COUNT(*) > 1', 'hall HAVING COUNT(*) > 1', 'course WHERE seats > 1', 'course HAVING seats > 1', 'course WHERE sizes > 1', 'course HAVING sizes > 1', 'course WHERE COUNT(*) > 1', 'course HAVING COUNT(*) > 1'] },
      { id: 'sp23f-8a', problem: 'sp23f-8a', label: '(a)', points: 0, topics: ['recursion', 'lists'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in the blank.' },
      { id: 'sp23f-8b', problem: 'sp23f-8b', label: '(b)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'A+',
        type: 'code', prompt: 'Fill in the blank.' },
    ],
    answers: {
      'sp23f-1a': { correct: 4, explanation: '`gold.rest` is the Chain starting at 5. `add(1)` puts a new Chain holding 1 right after it, and returns that same Chain: `<5 1 7>`.' },
      'sp23f-1b': { accepted: ['<2 4 3 5 1 7>'], explanation: '`add(4)` inserts 4 after the first element, 2; `gold` already contains the 1 added in (a).' },
      'sp23f-1c': { accepted: ['[[2, 5], 3]'], explanation: 'The slice `silver[1:]` copies the outer list but shares the inner list `[2]`, which later had 5 appended. Appending 4 to `silver` doesn’t affect `bronze`.' },
      'sp23f-1d': { correct: 0, explanation: '`add` always does the same few steps, however long the list is.' },
      'sp23f-2a': { correct: 0, explanation: 'Calling `h` assigns `k` in `h`’s own frame, so the global `k` stays 2.' },
      'sp23f-2b': { correct: 1, explanation: '`rounded` returns `[h, g]`, a list of two functions.' },
      'sp23f-2c': { correct: 0, explanation: '`k` in `rounded`’s frame is 4 (h’s assignment is local to h). `s[1](7)` computes `up(7)` = 7 × 2 + 1 = 15 using the global `k`, then `(15 // 4) * 4` = 12.' },
      'sp23f-3a': { correct: 4, explanation: 'A label smaller than the root ends the path: it doesn’t count.' },
      'sp23f-3b': { correct: 0, explanation: 'Reaching a leaf (with no smaller label on the way) is one path.' },
      'sp23f-3c': { accepted: ['sum([f(b) for b in s.branches])', 'sum(f(b) for b in s.branches)', 'sum(map(f, s.branches))', 'sum(list(map(f, s.branches)))'], explanation: 'Add up the paths through each branch. `f` compares every node with the original root `t`.' },
      'sp23f-3d': { correct: 1, explanation: 'Start at the root.' },
      'sp23f-3e': { correct: 0, explanation: 'Look at each child of `t`.' },
      'sp23f-3f': { correct: 2, explanation: 'A parent label plus a child label.' },
      'sp23f-3g': { accepted: ['yield [t.label, b.label]'], explanation: 'Yield the pair as a two-element list, parent first.' },
      'sp23f-3h': { correct: 5, explanation: 'Then look for pairs further down, inside each branch.' },
      'sp23f-4a': { correct: 1, explanation: 'There is exactly one way to park no cars: leave every spot empty.' },
      'sp23f-4b': { correct: 4, explanation: 'At least one car to park but fewer than 2 spots: no way.' },
      'sp23f-4c': { accepted: ['cars(k, n-1) + cars(k-1, n-2)', 'cars(k - 1, n - 2) + cars(k, n - 1)', 'cars(k-1, n-2) + cars(k, n-1)', 'cars(k, n - 1) + cars(k - 1, n - 2)'], explanation: 'Either the first spot is empty (park all `k` cars in the other `n - 1` spots), or a car takes the first two spots (park `k - 1` cars in `n - 2` spots).' },
      'sp23f-5a': { accepted: ['[s[2 * i], s[2 * i + 1]]', 's[2*i:2*i+2]', '[s[2*i], s[2*i+1]]', 's[2 * i:2 * i + 2]', 's[i*2:i*2+2]', '[s[i*2], s[i*2+1]]'], explanation: 'The `i`th pair is made of elements `2i` and `2i + 1`.' },
      'sp23f-5b': { correct: 3, explanation: 'There are `len(s) // 2` pairs.' },
      'sp23f-5c': { accepted: ['[next(t), next(t)]'], explanation: 'Each pair takes the next two values from the iterator.' },
      'sp23f-5d': { correct: 3, explanation: 'Put the first pair in front of the pairing of the rest.' },
      'sp23f-5e': { accepted: ['(car (cdr s))', '(cadr s)'], explanation: 'The second element.' },
      'sp23f-5f': { accepted: ['(pairs (cdr (cdr s)))', '(pairs (cddr s))'], explanation: 'The rest of the list after the first two elements.' },
      'sp23f-5g': { correct: 4, explanation: '`(pairs \'(3 4 5 6))` is `((3 4) (5 6))`; pairing each two-element list gives `((3 4))` and `((5 6))`.' },
      'sp23f-5h': { correct: [0, 1, 5, 6], explanation: 'The whole call, its operator `(lambda (x) 1)` and its operand `2` are evaluated, then the body `1`. Parts of the lambda expression itself are not evaluated.' },
      'sp23f-6a': { accepted: ['self.logged[f]', 'Log.logged[f]'], explanation: '`logged` is a class-level dictionary from functions to their shared list of arguments.' },
      'sp23f-6b': { accepted: ['f'], explanation: 'Store the function.' },
      'sp23f-6d': { correct: 2, explanation: 'Call the stored function on `n`.' },
      'sp23f-6e': { accepted: ['self.obs.append(list(vs))', 'self.obs += [list(vs)]', 'self.obs.append([v for v in vs])'], explanation: 'Store this observation as its own list (an iterator can only be read once), so `forget` can remove it later.' },
      'sp23f-6f': { accepted: ['sum([s.count(v) for s in self.obs])', 'sum(s.count(v) for s in self.obs)', 'sum([x.count(v) for x in self.obs])'], explanation: 'Count `v` in each stored observation and add them up.' },
      'sp23f-6g': { correct: 1, explanation: 'Remove the most recent observation.' },
      'sp23f-7a': { correct: 2, explanation: 'Add up the seats of the course’s rooms.' },
      'sp23f-7b': { accepted: ['finals, sizes WHERE hall=room', 'finals, sizes WHERE room=hall', 'sizes, finals WHERE hall=room', 'sizes, finals WHERE room=hall', 'finals JOIN sizes ON hall=room', 'finals JOIN sizes ON room=hall'], explanation: 'Join each final’s hall to its row in `sizes`.' },
      'sp23f-7c': { correct: 11, explanation: 'One row per course, keeping only courses with at least two rows (rooms). An aggregate condition goes in `HAVING`.' },
      'sp23f-8a': { accepted: ['[s[:n]] + group(n, s[n:])'] },
      'sp23f-8b': { accepted: ['(first n s (lambda (s) (group n s)))'] },
    },
  });

  // ───────────────────────────── Fall 2022 Final ─────────────────────────────
  const FA22_NUMS = code(`
CREATE TABLE s AS
  SELECT 979 as num UNION SELECT 1721 UNION SELECT 366 UNION
  SELECT 299        UNION SELECT 675 UNION SELECT 1456;
`);
  const FA22_POKEMON_TABLE = code(`
Pokemon:
| Name       | Type1  | Type2   | Move1           | Move2        | BaseAttack | BaseDefense |
|------------|--------|---------|-----------------|--------------|------------|-------------|
| Rattata    | Normal | None    | Endeavor        | Quick Attack | 0          | 0           |
| Maushold   | Normal | None    | Population Bomb | Tidy Up      | 30         | 30          |
| Cyclizard  | Dragon | Normal  | Shed Tail       | Dragon Rush  | 100        | 40          |
| Meoscadera | Grass  | Dark    | Flower Trick    | Agility      | 80         | 40          |
| Farigiraf  | Normal | Psychic | Agility         | Twin Beam    | 40         | 50          |
`);
  const FA22_POKEMON = FA22_POKEMON_TABLE + '\n\n' + code(`
Moves:
| Name            | MoveAttack | MoveDefense |
|-----------------|------------|-------------|
| Endeavor        | 250        | 0           |
| Quick Attack    | 40         | 45          |
| Shed Tail       | 0          | 150         |
| Dragon Rush     | 80         | 0           |
| Flower Trick    | 90         | 55          |
| Agility         | 50         | 20          |
| Twin Beam       | 80         | 30          |
| Population Bomb | 100        | 50          |
| Tidy Up         | 30         | 150         |
`);
  const FA22_POKEMON_SETUP = code(`
CREATE TABLE Pokemon(Name, Type1, Type2, Move1, Move2, BaseAttack, BaseDefense);
INSERT INTO Pokemon VALUES ('Rattata', 'Normal', 'None', 'Endeavor', 'Quick Attack', 0, 0),
  ('Maushold', 'Normal', 'None', 'Population Bomb', 'Tidy Up', 30, 30),
  ('Cyclizard', 'Dragon', 'Normal', 'Shed Tail', 'Dragon Rush', 100, 40),
  ('Meoscadera', 'Grass', 'Dark', 'Flower Trick', 'Agility', 80, 40),
  ('Farigiraf', 'Normal', 'Psychic', 'Agility', 'Twin Beam', 40, 50);
CREATE TABLE Moves(Name, MoveAttack, MoveDefense);
INSERT INTO Moves VALUES ('Endeavor', 250, 0), ('Quick Attack', 40, 45), ('Shed Tail', 0, 150), ('Dragon Rush', 80, 0),
  ('Flower Trick', 90, 55), ('Agility', 50, 20), ('Twin Beam', 80, 30), ('Population Bomb', 100, 50), ('Tidy Up', 30, 150);
`);
  const FA22_Q1_EXPRS = '```\n>>> print(20, (lambda x: print)(20)(22))\n>>> (print(4) or 3+2) or 1/0\n>>> alt(triple, dec)(8)(8)\n>>> Sub(triple, dec).h(8).h(8)\n>>> [f(8) for f in Pub(dec, triple).fns]\n>>> Pub(dec, triple).h(8).h(8)\n```';
  add({
    exam: { id: 'fa22f', label: 'Fall 2022 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'fa22f-1': {
        exam: 'fa22f', number: '1', title: 'What Would Python Display?', points: 15,
        intro: 'Assume the following code has been executed.',
        code: code(`
triple = lambda z: 3 * z
dec = lambda z: z - 1

def alt(f, g):
    def h(x):
        print(fns[0](fns[1](x)))
        fns[0] = fns[1]
        fns[1] = fns[0]
        return h
    fns = [f, g]
    return h

class Sub:
    fns = [lambda z: str(z) + str(z),
           lambda z: 2 * z]
    def __init__(self, f, g):
        self.fns = [f, g]
    def h(self, x):
        print(Sub.fns[0](Sub.fns[1](x)))
        Sub.fns = self.fns
        return self
    def __repr__(self):
        return str(self.fns[0]('ha'))

class Pub(Sub):
    fns = [lambda z: [z],
           lambda z: z]
    def __init__(self, f, g):
        fns = [f, g]  # Careful!
`),
        outro: 'What is the output displayed by the interactive Python interpreter after evaluating each of the following expressions. Expressions are evaluated in order, and earlier expressions may affect later ones.\n\n' + FA22_Q1_EXPRS,
      },
      'fa22f-2': {
        exam: 'fa22f', number: '2', title: 'What About Scheme?', points: 4,
        intro: 'Choose the output displayed by the interactive Scheme interpreter when each expression below is evaluated. The first character of (c) is a backtick; all other ticks are apostrophes.',
        code: code(`
(+ (* 3 2) (+ 3 2))
'(+ (* 3 2) (+ 3 2))
\` (+ ,(* 3 '2) (+ 3 2))
'(+ (* '3 2) '(+ 3 2))
`),
      },
      'fa22f-3': {
        exam: 'fa22f', number: '3', title: 'Sum Total', points: 6,
        intro: 'Executing the code below produced this environment diagram. Complete the diagram, then answer questions about it. The diagram itself will not be scored; only the questions. Blanks that do not have a letter label will not be scored.',
        figure: { src: 'assets/fa22-final-q3.png', width: 713, height: 338, alt: 'From the exam: the code, and a partly filled environment diagram. The Global frame binds sums to a function, result to blank (a) and totals to blank (b). Frame f1: sums [parent=Global] binds result to a blank box, t to 0.1, pair to a function, and returns a lambda. Frame f2: λ <line 5> [parent=f1] binds s to blank (c), t to 0.2, and has Return value blank (d). Frame f3: pair [parent=f1] has a blank vals and a blank Return value.', slots: [[433, 41, 34], [433, 64, 34], [433, 111, 34], [433, 218, 34], [433, 260, 34], [433, 301, 34], [433, 326, 34]] },
        code: code(`
def sums(result, t):
    def pair(vals):
        result.append(vals.pop() + vals.pop())
        return t
    return lambda s, t: pair(s) + sum(result)

result, totals = [], []
result.append(sums(totals, 0.1)([1, 2, 4], 0.2))
`),
        lineNumbers: true,
      },
      'fa22f-4a': {
        exam: 'fa22f', number: '4(a)', title: 'Advent of Code — Python', points: 5,
        intro: 'The choice of programming language can affect the difficulty of implementation. This problem was adapted from Day 1 of the 2020 Advent of Code. Given a list of numbers, find the two numbers in the list that sum to 2020. You are guaranteed that there is exactly one pair of numbers that sum to 2020 and that the list does not contain 1010.\n\nFor example, given `[979, 1721, 366, 299, 675, 1456]`, output `[1721, 299]`, since 1721+299 = 2020.',
        code: code(`
def find_pair(s):
    '''Return the two elements of s that sum to 2020, in the order that they appear in s.

    >>> find_pair([979, 1721, 366, 299, 675, 1456])
    [1721, 299]
    '''
    for i in ⟦a⟧:
        for j in ⟦b⟧:
            ⟦c⟧:
                return ⟦d⟧
`),
      },
      'fa22f-4b': {
        exam: 'fa22f', number: '4(b)', title: 'Advent of Code — Scheme', points: 6,
        intro: 'Implement `find-pair` in Scheme. You may call `contains?`, which takes a Scheme list of numbers `s` and a number `n`. It returns whether `s` contains `n`.',
        code: code(`
;;; > (contains? '(1 2 3) 3)
;;; #t
;;; > (contains? '(1 2 3) 4)
;;; #f
(define (contains? s n) ...)  ; Assume contains? has been implemented correctly for you.

;;; > (find-pair '(979 1721 366 299 675 1456))
;;; (1721 299)
(define (find-pair s)
  (if ⟦a⟧ ( ⟦b⟧ (car s) (- 2020 (car s))) ⟦c⟧ ))
`),
      },
      'fa22f-4c': {
        exam: 'fa22f', number: '4(c)', title: 'Advent of Code — SQL', points: 5, lang: 'sql',
        intro: 'Implement a SQL query that creates a one-row, two-column table of numbers where the single row contains the two numbers in table `s` that sum to 2020. The order that the numbers appear will not be graded.\n\n```\n' + FA22_NUMS + '\n```',
        sqlSetup: FA22_NUMS,
        code: code(`
SELECT ⟦a⟧ FROM ⟦b⟧ WHERE ⟦c⟧;
`),
      },
      'fa22f-5': {
        exam: 'fa22f', number: '5', title: 'Two Cents', points: 5,
        intro: 'One of the most useful aspects of programming is that code can often be reused to solve similar problems. The `count_change` function takes an integer amount of cents and returns the number of ways to make change for that amount in US currency.\n\nModify this code to solve the following new problem: Your cash register only has `k` of each type of coin. Implement `count_change_register`, which counts the number of ways to make change for `amount` using at most `k` coins of each type.',
        code: code(`
coins = (1, 5, 10, 25, 50)

def count_change(amount):
    '''Return the number of ways to make change for amount.

    >>> count_change(10)  # 10, 5-5, 5-1-1-1-1-1, 1-1-1-1-1-1-1-1-1-1
    4
    >>> count_change(20)  # 10-10, 10-5-5, 10-5-1-1-1-1-1, 10-1-1-1-1-1-1-1-1-1-1, 5-5-5-5, ...
    9
    >>> count_change(100)
    292
    '''
    def helper(remaining, coin_index):
        if coin_index == len(coins) or remaining < 0:
            return 0
        if remaining == 0:
            return 1
        return (helper(remaining - coins[coin_index], coin_index    ) +
                helper(remaining                    , coin_index + 1))
    return helper(amount, 0)

def count_change_register(amount, k):
    '''Return the number of ways to make change for amount using at most k of each coin type.

    >>> count_change_register(20, 10)  # Excludes 20 pennies and excludes 1 nickel + 15 pennies
    7
    >>> count_change_register(20, 2)   # 10-10, 10-5-5
    2
    >>> count_change_register(100, 10)
    84
    >>> count_change_register(100, 100)
    292
    '''
    def helper(remaining, coin_index, n):
        if coin_index == len(coins) or remaining < 0 or ⟦a⟧:
            return 0
        if remaining == 0:
            return 1
        return (helper(remaining - coins[coin_index], coin_index    , ⟦b⟧ ) +
                helper(remaining                    , coin_index + 1, ⟦c⟧ ))
    return helper(amount, 0, 0)
`),
      },
      'fa22f-6': {
        exam: 'fa22f', number: '6', title: 'Barking up the Wrong Tree', points: 6,
        intro: 'After years of using SQL, John the Dog Breeder decides to switch to a Python `Tree` to track his dogs’ heredity.\n\nImplement `tree_to_table`, which takes a `Tree` instance `t` representing dogs. Each node in the tree has a label that is the name of a dog and children corresponding to the children of that dog. The `tree_to_table` function returns a list of the parent-child relationships in `t` in any order. Each parent-child relationship is represented as a two-element tuple, where the first element is the name of the parent, and the second is the name of the child.\n\nThe `Tree` class is defined on page 2 of the Midterm 2 Study Guide with instance attributes `label` and `branches`. You may not use any functions from the study guide defined outside of the `Tree` class.\n\nFor `Tree(\'E\', [Tree(\'F\', [Tree(\'A\', [Tree(\'B\'), Tree(\'C\')]), Tree(\'D\', [Tree(\'H\')]), Tree(\'G\')])])` one valid output is: `[(\'A\', \'B\'), (\'A\', \'C\'), (\'D\', \'H\'), (\'F\', \'A\'), (\'F\', \'D\'), (\'F\', \'G\'), (\'E\', \'F\')]`',
        code: code(`
def tree_to_table(t):
    relationships = ⟦a⟧
    for i in ⟦b⟧:
        relationships.⟦c⟧(⟦d⟧)
    return relationships
`),
      },
      'fa22f-7a': {
        exam: 'fa22f', number: '7(a)', title: 'One Cent — three_flips', points: 6,
        intro: 'In Penney’s Game, two players each choose a different sequence of three coin flips (Heads or Tails). A coin is flipped repeatedly until one of those two sequences occurs; the winner is the player whose sequence is flipped. For example, if Player 1 selects “HHH” and Player 2 selects “THH”, and the flips are HTTHTHTTHTHTHH, then “THH” was flipped first (the last three flips), so Player 2 wins.\n\nFirst, implement the generator function `three_flips`. It takes as input a (potentially infinite) iterator `coin`, each element of which is either `\'H\'` or `\'T\'`. It yields a sequence of triples of coin flip outcomes from `coin`.\n\nNote: the last example in the docstring is from the exam. Since Python 3.7, a generator whose code lets a `StopIteration` escape raises `RuntimeError` instead (PEP 479), so that example doesn’t print exactly `StopIteration`.',
        code: code(`
def three_flips(coin):
    '''
    >>> a = three_flips(iter("HTTHHT"))
    >>> next(a)  # Coin flips 0, 1, and 2
    'HTT'
    >>> next(a)  # Coin flips 1, 2, and 3
    'TTH'
    >>> next(a)  # Coin flips 2, 3, and 4
    'THH'
    >>> next(a)  # Coin flips 3, 4, and 5
    'HHT'
    >>> next(a)  # A StopIteration exception is raised
    StopIteration
    '''
    start = ⟦a⟧
    ⟦b⟧:
        yield start
        start = ⟦c⟧ + ⟦d⟧
`),
      },
      'fa22f-7b': {
        exam: 'fa22f', number: '7(b)', title: 'One Cent — penney', points: 4,
        intro: 'Implement the function `penney`. It receives as input an iterator `coin` over `\'H\'` and `\'T\'` and two sequences `p1` and `p2`. It returns 1 if Player 1 wins Penney’s Game and 2 if Player 2 wins. Assume that one player wins before the coin runs out of elements, and that `p1` and `p2` are distinct three-element sequences of `\'H\'` and `\'T\'`.',
        code: code(`
def penney(coin, p1, p2):
    '''Return the winner of Penney's game, where Player 1 chooses p1 and Player 2 chooses p2.

    >>> penney(iter("HTTHTHTTHTHTHH"),"THH","HHH")
    1
    >>> penney(iter("HTTHTHTTHTHTHH"),"HHH","THH")
    2
    >>> penney(iter("HTTHTHTTHTHTHH"),"HTT","THH")  # HTT happens first
    1
    '''
    it = ⟦a⟧(lambda x: ⟦b⟧, ⟦c⟧)
    if next(it) == p1:
        return 1
    return 2
`),
      },
      'fa22f-8': {
        exam: 'fa22f', number: '8', title: 'A Parentheses Scheme', points: 6,
        intro: 'In a fit of Scheme-induced rage, you’ve decided that all internal parentheses must be eliminated! Implement the procedure `remove-parens` that takes as input a Scheme list and returns that list with all internal parentheses removed.',
        code: code(`
;;; > (remove-parens '(((1) 2 3) 4 5 (6 (7)) (8 10)))
;;; (1 2 3 4 5 6 7 8 10)
;;; > (remove-parens '(((a) b (c) ()) (d) e (f (((g)))) (h i)))
;;; (a b c d e f g h i)
(define (remove-parens s)
  (cond
    ( (null? s) nil  )
    ( ⟦a⟧   ⟦b⟧ )
    ( else  ⟦c⟧ )))
`),
      },
      'fa22f-9': {
        exam: 'fa22f', number: '9', title: 'Pokemon SQarLet', points: 7, lang: 'sql',
        intro: 'You’ve been hired as the newest Gym Leader of the Paldea region! Now you need to decide what team to make. All your available Pokemon (for this question, Pokemon stats have been simplified) are listed in a SQL table `Pokemon`. You also have a table `Moves` listing all Pokemon moves.\n\n```\n' + FA22_POKEMON + '\n```\n\nCreate a table `Attack`, which lists the `Name` and `TotalAttack` of each Pokemon. The total attack of a Pokemon is equal to the sum of a Pokemon’s `BaseAttack` and the `MoveAttack` of both moves it knows. Order rows by total attack.\n\nFor example, Maushold has a base Attack of 30, and has two moves with `MoveAttack` values 100 and 30, respectively. Its total attack is 30+100+30 = 160. With the above tables, you should have the following result (the exam spells two names differently here than in its table; this is the table’s spelling):\n\n```\n| Name       | TotalAttack |\n|------------|-------------|\n| Maushold   | 160         |\n| Farigiraf  | 170         |\n| Cyclizard  | 180         |\n| Meoscadera | 220         |\n| Rattata    | 290         |\n```',
        sqlSetup: FA22_POKEMON_SETUP,
        code: code(`
CREATE TABLE Attack AS
  SELECT ⟦a⟧ AS Name, ⟦b⟧ AS TotalAttack FROM ⟦c⟧ WHERE ⟦d⟧ ORDER BY TotalAttack;
`),
      },
      'fa22f-10': {
        exam: 'fa22f', number: '10', title: 'A+: Treeing up the Wrong Bark', points: 0,
        intro: 'This A+ question is not worth any points.\n\nWrite a function `table_to_tree` that takes a list `parents` of parent-child relationships between dogs. Each element of this list is a two-element list of strings containing the name of the parent and the name of the child, as well as `ancestor`, the name of the very first dog. It returns a `Tree` instance with root label `ancestor` that has each dog’s name as a label and represents all parent-child pairs in `parents` as parent-child relations between nodes. Assume that:\n\n- All dogs have unique names and are descendents of `ancestor` (or `ancestor` itself).\n- All dogs have exactly one parent (John has some weird dogs) except for `ancestor`, which has none.\n- Any order of branches is acceptable.\n\nFor example: `table_to_tree([[\'A\',\'B\'],[\'A\',\'C\'],[\'D\',\'H\'],[\'F\',\'A\'],[\'F\',\'D\'],[\'F\',\'G\'],[\'E\',\'F\']],\'E\')` could return: `Tree(\'E\', [Tree(\'F\', [Tree(\'A\', [Tree(\'B\'), Tree(\'C\')]), Tree(\'D\', [Tree(\'H\')]), Tree(\'G\')])])`',
        code: code(`
def table_to_tree(parents, ancestor):
    dogs = {}
    def add_if_new(dog):
        if ⟦a⟧:
            dogs[dog] = ⟦b⟧
    for i, j in ⟦c⟧:
        add_if_new(i)
        add_if_new(j)
        ⟦d⟧
    ⟦e⟧
`),
      },
      'fa22f-11': {
        exam: 'fa22f', number: '11', title: 'A+: Another Parentheses Scheme', points: 0,
        intro: 'This A+ question is not worth any points.\n\nWrite a Scheme macro `eval-noparens`. This macro receives as input a list representing a line of Scheme code with all the parentheses removed (except the parentheses surrounding the entire list), and returns the result that would have been obtained by evaluating the original line of Scheme code. All elements of the list are either numbers or symbols bound to two-input procedures; all original call expressions had exactly two operands; and the list corresponds to exactly one valid line of Scheme code. For credit, your solution must run in linear time in the length of its input. **Hint:** Treat the `car` and `cdr` of the return value of `helper` as two independent outputs.',
        code: code(`
;;; > (eval-noparens (+ 1 * 2 3))
;;; 7
;;; > (eval-noparens (+ * 1 2 + 3 * 4 + + + 5 6 7 8))
;;; 109
;;; > (eval-noparens (cons 1 list 2 3))
;;; (1 2 3)
;;; > (let ((times *)) (eval-noparens (+ 1 times 2 3)))
;;; 7
(define-macro (eval-noparens expr)
  (define (helper expr)
    (if (number? (car expr)) expr
      (let ((x ⟦a⟧ ))
        (let ((y ⟦b⟧ ))
          ⟦c⟧ ))))
  (car (helper expr)))
`),
      },
      'fa22f-12': {
        exam: 'fa22f', number: '12', title: 'A+: Pokemon Ancient SQarLet', points: 0, lang: 'sql',
        intro: 'This A+ question is not worth any points.\n\nAs a gym leader, your team must be composed of Pokemon of a single type. Generate a table with two columns: All unique types in your collection and the number of Pokemon you have of each type, sorted in descending order by number of Pokemon. Each Pokemon can have either one or two types, listed under columns `Type1` and `Type2`. If a Pokemon has one type, `Type2` stores the string `"None"`. A Pokemon with two types counts as both of its types.\n\n```\n' + FA22_POKEMON_TABLE + '\n\nExpected (the last four rows in any order):\n| Type    | Count |\n|---------|-------|\n| Normal  | 4     |\n| Dragon  | 1     |\n| Grass   | 1     |\n| Dark    | 1     |\n| Psychic | 1     |\n```\n\nNote: as printed, the official answer for (a) doesn’t run in SQLite (its `WHERE Type != "None"` belongs to the second `SELECT`, where there is no column `Type`), so this question has no Run Code tests.',
        sqlSetup: FA22_POKEMON_SETUP,
        code: code(`
CREATE TABLE helper AS SELECT ⟦a⟧;
SELECT Type, COUNT(*) AS Count FROM helper ⟦b⟧;
`),
      },
    },
    questions: [
      { id: 'fa22f-1a', problem: 'fa22f-1', label: '(a)', points: 1, topics: ['hof', 'fundamentals'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is the first line displayed for the first expression: `print(20, (lambda x: print)(20)(22))`', choices: ['20', '22', '20 None', '22 None', 'A function value'] },
      { id: 'fa22f-1b', problem: 'fa22f-1', label: '(b)', points: 1, topics: ['hof', 'fundamentals'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is the second line displayed for the first expression: `print(20, (lambda x: print)(20)(22))`', choices: ['20', '22', '20 None', '22 None', 'A function value'] },
      { id: 'fa22f-1c', problem: 'fa22f-1', label: '(c)', points: 1, topics: ['fundamentals'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: 'What is the first line displayed for the second expression: `(print(4) or 3+2) or 1/0`', choices: ['4', '5', '45', 'None 5', 'There is no first line because an error occurs'] },
      { id: 'fa22f-1d', problem: 'fa22f-1', label: '(d)', points: 1, topics: ['fundamentals'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is the second line displayed for the second expression: `(print(4) or 3+2) or 1/0`', choices: ['4', '5', '45', 'None 5', 'There is no second line because an error occurs'] },
      { id: 'fa22f-1e', problem: 'fa22f-1', label: '(e)', points: 1, topics: ['hof', 'lists'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is the first line displayed for the third expression: `alt(triple, dec)(8)(8)`', choices: ['6', '21', '23', '72'] },
      { id: 'fa22f-1f', problem: 'fa22f-1', label: '(f)', points: 1, topics: ['hof', 'lists'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the second line displayed for the third expression: `alt(triple, dec)(8)(8)`', choices: ['6', '21', '23', '72'] },
      { id: 'fa22f-1g', problem: 'fa22f-1', label: '(g)', points: 1, topics: ['hof'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is the third line displayed for the third expression: `alt(triple, dec)(8)(8)`', choices: ['A function', 'None', "'h'", 'h', 'There is no third line'] },
      { id: 'fa22f-1h', problem: 'fa22f-1', label: '(h)', points: 1, topics: ['oop'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What is the first line displayed for the fourth expression: `Sub(triple, dec).h(8).h(8)`', choices: ['8', '12', '16', '21', '1616', "'8888'", 'There is no first line because an error occurs'] },
      { id: 'fa22f-1i', problem: 'fa22f-1', label: '(i)', points: 1, topics: ['oop'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the second line displayed for the fourth expression: `Sub(triple, dec).h(8).h(8)`', choices: ['8', '12', '16', '21', '1616', 'There is no second line because an error occurs'] },
      { id: 'fa22f-1j', problem: 'fa22f-1', label: '(j)', points: 1, topics: ['oop'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the third line displayed for the fourth expression: `Sub(triple, dec).h(8).h(8)`', choices: ['A function', 'ha', 'haha', 'hahaha', "['ha']", "['haha']", "['hahaha']", 'There is no third line (for any reason, including an error)'] },
      { id: 'fa22f-1k', problem: 'fa22f-1', label: '(k)', points: 2, topics: ['oop', 'lists'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is displayed for the fifth expression: `[f(8) for f in Pub(dec, triple).fns]`', choices: ['[7, 21]', '[7, [21]]', "['88', 16]", "['88', [16]]", '[[8], 8]', '[[8], [8]]', 'None of these'] },
      { id: 'fa22f-1l', problem: 'fa22f-1', label: '(l)', points: 1, topics: ['oop'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the first line displayed for the sixth expression: `Pub(dec, triple).h(8).h(8)`', choices: ['8', '[8]', '21', '23', '1616', "'8888'"] },
      { id: 'fa22f-1m', problem: 'fa22f-1', label: '(m)', points: 1, topics: ['oop'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the second line displayed for the sixth expression: `Pub(dec, triple).h(8).h(8)`', choices: ['8', '[8]', '21', '23', '1616', "'8888'"] },
      { id: 'fa22f-1n', problem: 'fa22f-1', label: '(n)', points: 1, topics: ['oop'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: 'What is the third line displayed for the sixth expression: `Pub(dec, triple).h(8).h(8)`', choices: ['A function', 'ha', 'haha', 'hahaha', "['ha']", "['haha']", "['hahaha']", 'There is no third line (for any reason, including an error)'] },
      { id: 'fa22f-2a', problem: 'fa22f-2', label: '(a)', points: 1, topics: ['scheme'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: '`(+ (* 3 2) (+ 3 2))`', choices: ['11', '(+ (* 3 2) (+ 3 2))', '(+ 6 (+ 3 2))', '(+ (* 3 2) 5)', '(+ 6 5)'] },
      { id: 'fa22f-2b', problem: 'fa22f-2', label: '(b)', points: 1, topics: ['scheme'], difficulty: 'easy',
        type: 'single_choice', mono: true, prompt: "`'(+ (* 3 2) (+ 3 2))`", choices: ['11', '(+ (* 3 2) (+ 3 2))', '(+ 6 (+ 3 2))', '(+ (* 3 2) 5)', '(+ 6 5)'] },
      { id: 'fa22f-2c', problem: 'fa22f-2', label: '(c)', points: 1, topics: ['scheme'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: "`` ` (+ ,(* 3 '2) (+ 3 2)) ``", choices: ['11', '(+ (* 3 2) (+ 3 2))', '(+ 6 (+ 3 2))', '(+ (* 3 2) 5)', '(+ 6 5)', 'Error'] },
      { id: 'fa22f-2d', problem: 'fa22f-2', label: '(d)', points: 1, topics: ['scheme'], difficulty: 'hard',
        type: 'single_choice', mono: true, prompt: "`'(+ (* '3 2) '(+ 3 2))`",
        choices: ['11', '(+ (* 3 2) (+ 3 2))', '(+ (* 3 2) (quote (+ 3 2)))', '(+ (* (quote 3) 2) (+ 3 2))', '(+ (* (quote 3) 2) (quote (+ 3 2)))', '(+ (* 3 2) (quasiquote (+ 3 2)))', '(+ (* (quasiquote 3) 2) (+ 3 2))', '(+ (* (quasiquote 3) 2) (quasiquote (+ 3 2)))', 'Error'] },
      { id: 'fa22f-3a', problem: 'fa22f-3', label: '(a)', points: 1, topics: ['env', 'lists'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'Blank (a): How many elements are in the list bound to `result` in the Global frame?', choices: ['0', '1', '2'] },
      { id: 'fa22f-3b', problem: 'fa22f-3', label: '(b)', points: 2, topics: ['env', 'lists'], difficulty: 'hard',
        type: 'single_choice', prompt: 'Blank (b): What value is bound to `totals` in the Global frame?', choices: ['An empty list', 'A list [3]', 'A list [6]', 'None of the above'] },
      { id: 'fa22f-3c', problem: 'fa22f-3', label: '(c)', points: 1, topics: ['env', 'lists'], difficulty: 'medium',
        type: 'single_choice', prompt: 'Blank (c): What value is bound to `s` in frame f2?', choices: ['An empty list', 'A list [1]', 'A list [4]', 'A list [1, 2, 4]'] },
      { id: 'fa22f-3d', problem: 'fa22f-3', label: '(d)', points: 2, topics: ['env', 'hof'], difficulty: 'hard',
        type: 'short_answer', prompt: 'Blank (d): What is the return value of frame f2?' },
      { id: 'fa22f-4a', problem: 'fa22f-4a', label: 'i.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['s', '[s]', 's[:len(s)-1]', 'zip(s, s)', 'range(s)'] },
      { id: 'fa22f-4b', problem: 'fa22f-4a', label: 'ii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['i', '[i]', 's', 's[1:]', 'range(s)'] },
      { id: 'fa22f-4c', problem: 'fa22f-4a', label: 'iii.', points: 2, topics: ['fundamentals'], difficulty: 'easy', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa22f-4d', problem: 'fa22f-4a', label: 'iv.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'd',
        type: 'multi_select', mono: true, prompt: 'Select all expressions that could fill in blank (d).', choices: ['[i, j]', 'list(i, j)', '[list(i, j)]', '[next(i), next(j)]'] },
      { id: 'fa22f-4e', problem: 'fa22f-4b', label: 'i.', points: 3, topics: ['scheme'], difficulty: 'hard', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-4f', problem: 'fa22f-4b', label: 'ii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['append', 'car', 'cdr', 'cons', 'list'] },
      { id: 'fa22f-4g', problem: 'fa22f-4b', label: 'iii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['nil', '(cdr s)', '(map (lambda (x) (- 2020 x)) (cdr s))', '(filter (lambda (x) (= 2020 (+ (car s) x))) (cdr s))', '(find-pair (cdr s))', '(find-pair (map (lambda (x) (- 2020 x)) (cdr s)))', '(find-pair (filter (lambda (x) (= 2020 (+ (car s) x))) (cdr s)))'] },
      { id: 'fa22f-4h', problem: 'fa22f-4c', label: 'i.', points: 1, topics: ['sql-joins'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['s, 2020 - s', 'num, 2020 - num', 'a, b', 's.a, s.b', 'a.num, b.num'] },
      { id: 'fa22f-4i', problem: 'fa22f-4c', label: 'ii.', points: 2, topics: ['sql-joins'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['s', 'a, b', 's, s', 's AS a, s AS b', 'a AS s, b AS s'] },
      { id: 'fa22f-4j', problem: 'fa22f-4c', label: 'iii.', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).',
        choices: ['a + b = 2020', 'a.num + b.num = 2020', 'a < b AND a + b = 2020', 'a.num < b.num AND a.num + b.num = 2020', 'a = b AND a + b = 2020', 'a.num = b.num AND a.num + b.num = 2020', '(2020 - num) IN s', 'CONTAINS(2020 - num, s)'] },
      { id: 'fa22f-5a', problem: 'fa22f-5', label: '(a)', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['True', 'False', 'n > 0', 'k > 0', 'n > k', 'n == k', 'n > 10', 'n == 10'] },
      { id: 'fa22f-5b', problem: 'fa22f-5', label: '(b)', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['k', 'k-1', 'k+1', 'n', 'n + 1', 'n-1', '0', '10'] },
      { id: 'fa22f-5c', problem: 'fa22f-5', label: '(c)', points: 1, topics: ['recursion'], difficulty: 'medium', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['k', 'k-1', 'k+1', 'n', 'n+1', 'n-1', '0', '10'] },
      { id: 'fa22f-5d', problem: 'fa22f-5', label: '(d)', points: 1, topics: ['recursion'], difficulty: 'medium',
        type: 'single_choice', mono: true, prompt: 'What does `count_change_register(25, 2)` return?', choices: ['0', '1', '2', '3', '4', 'None of these'] },
      { id: 'fa22f-6a', problem: 'fa22f-6', label: '(a)', points: 3, topics: ['trees', 'lists'], difficulty: 'hard', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-6b', problem: 'fa22f-6', label: '(b)', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).',
        choices: ['branches', 't.branches', 'Tree.branches', 'tree_to_table(branches)', 'tree_to_table(t.branches)', 'tree_to_table(Tree.branches)', 'relationships', '[p for p, c in relationships]'] },
      { id: 'fa22f-6c', problem: 'fa22f-6', label: '(c)', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['append', 'extend'] },
      { id: 'fa22f-6d', problem: 'fa22f-6', label: '(d)', points: 1, topics: ['trees', 'recursion'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).',
        choices: ['i', 'i.branches', 't.branches', 'tree_to_table(i)', 'tree_to_table(i.branches)', 'tree_to_table(t.branches)'] },
      { id: 'fa22f-7a', problem: 'fa22f-7a', label: 'i.', points: 2, topics: ['iterators'], difficulty: 'medium', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-7b', problem: 'fa22f-7a', label: 'ii.', points: 1, topics: ['generators'], difficulty: 'easy', blank: 'b',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (b).', choices: ['while True', 'while next(coin) is not None', 'for x in coin'] },
      { id: 'fa22f-7c', problem: 'fa22f-7a', label: 'iii.', points: 2, topics: ['generators'], difficulty: 'medium', blank: 'c',
        type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa22f-7d', problem: 'fa22f-7a', label: 'iv.', points: 1, topics: ['iterators'], difficulty: 'easy', blank: 'd',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (d).', choices: ['coin', 'coin.pop()', 'next(coin)'] },
      { id: 'fa22f-7e', problem: 'fa22f-7b', label: 'i.', points: 1, topics: ['hof', 'iterators'], difficulty: 'easy', blank: 'a',
        type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-7f', problem: 'fa22f-7b', label: 'ii.', points: 2, topics: ['hof'], difficulty: 'medium', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa22f-7g', problem: 'fa22f-7b', label: 'iii.', points: 1, topics: ['iterators', 'generators'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (c).', choices: ['it', 'coin', '(p1, p2)', 'three_flips(coin)'] },
      { id: 'fa22f-8a', problem: 'fa22f-8', label: '(a)', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'a',
        type: 'single_choice', mono: true, prompt: 'Fill in blank (a).', choices: ['(list? s)', '(list? (car s))', '(list? (cdr s))', '(null? (cdr s))', '(not (number? (car s)))'] },
      { id: 'fa22f-8b', problem: 'fa22f-8', label: '(b)', points: 3, topics: ['scheme'], difficulty: 'hard', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa22f-8c', problem: 'fa22f-8', label: '(c)', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'c',
        type: 'multi_select', mono: true, prompt: 'Select all of the expressions below that could fill in blank (c).',
        choices: ['(remove-parens (cdr s))', '(remove-parens (cons (car s) (cdr s)))', '(remove-parens (list (car s) (cdr s)))', '(cons (car s) (remove-parens (cdr s)))', '(cons (remove-parens (car s)) (remove-parens (cdr s)))', '(list (car s) (remove-parens (cdr s)))', '(list (remove-parens (car s)) (remove-parens (cdr s)))'] },
      { id: 'fa22f-9a', problem: 'fa22f-9', label: '(a)', points: 1, topics: ['sql-joins'], difficulty: 'easy', blank: 'a',
        type: 'multi_select', mono: true, prompt: 'Select all options that could fill in blank (a).', choices: ['Name', 'p.Name', 'q.Name', 'a.Name', 'b.Name'] },
      { id: 'fa22f-9b', problem: 'fa22f-9', label: '(b)', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa22f-9c', problem: 'fa22f-9', label: '(c)', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'c',
        type: 'multi_select', mono: true, prompt: 'Select all options that could fill in blank (c).',
        choices: ['Pokemon, Moves', 'Pokemon, Pokemon, Moves', 'Pokemon, Moves, Moves', 'Pokemon as p, Moves as a', 'Pokemon as p, Pokemon as q, Moves as a', 'Pokemon as p, Moves as a, Moves as b'] },
      { id: 'fa22f-9d', problem: 'fa22f-9', label: '(d)', points: 2, topics: ['sql-joins'], difficulty: 'medium', blank: 'd',
        type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa22f-10a', problem: 'fa22f-10', label: '(a)', points: 0, topics: ['trees'], difficulty: 'hard', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-10b', problem: 'fa22f-10', label: '(b)', points: 0, topics: ['trees'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa22f-10c', problem: 'fa22f-10', label: '(c)', points: 0, topics: ['trees'], difficulty: 'easy', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa22f-10d', problem: 'fa22f-10', label: '(d)', points: 0, topics: ['trees'], difficulty: 'hard', blank: 'd', type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa22f-10e', problem: 'fa22f-10', label: '(e)', points: 0, topics: ['trees'], difficulty: 'medium', blank: 'e', type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'fa22f-11a', problem: 'fa22f-11', label: '(a)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-11b', problem: 'fa22f-11', label: '(b)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa22f-11c', problem: 'fa22f-11', label: '(c)', points: 0, topics: ['scheme'], difficulty: 'hard', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa22f-12a', problem: 'fa22f-12', label: '(a)', points: 0, topics: ['sql-agg'], difficulty: 'hard', blank: 'a', type: 'code', prompt: 'Fill in blank (a).' },
      { id: 'fa22f-12b', problem: 'fa22f-12', label: '(b)', points: 0, topics: ['sql-agg'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
    ],
    answers: {
      'fa22f-1a': { correct: 1, explanation: '`(lambda x: print)(20)` is the `print` function, so `print(22)` runs first and displays 22.' },
      'fa22f-1b': { correct: 2, explanation: 'Then the outer `print` displays 20 and the value of `print(22)`, which is `None`.' },
      'fa22f-1c': { correct: 0, explanation: '`print(4)` displays 4 and returns `None`.' },
      'fa22f-1d': { correct: 1, explanation: '`None or 3+2` is 5, which is truthy, so `1/0` is never evaluated; the interpreter displays 5.' },
      'fa22f-1e': { correct: 1, explanation: '`fns` is `[triple, dec]`: `triple(dec(8))` is 21. Then both entries become `dec`.' },
      'fa22f-1f': { correct: 0, explanation: 'Now `dec(dec(8))` is 6.' },
      'fa22f-1g': { correct: 0, explanation: '`h` returns itself, and the interpreter displays that function value.' },
      'fa22f-1h': { correct: 4, explanation: 'The first call uses the class’s `Sub.fns`: `2 * 8` is 16, then `str(16) + str(16)` is `1616`. Then `Sub.fns` becomes `[triple, dec]`.' },
      'fa22f-1i': { correct: 3, explanation: 'Now `Sub.fns` is `[triple, dec]`: `triple(dec(8))` is 21.' },
      'fa22f-1j': { correct: 3, explanation: 'The interpreter shows the returned `Sub` instance using `__repr__`: `triple(\'ha\')` is `\'hahaha\'`.' },
      'fa22f-1k': { correct: 4, explanation: '`Pub.__init__` only sets a local `fns`, so `.fns` is the class attribute `Pub.fns`: `[[8], 8]`.' },
      'fa22f-1l': { correct: 2, explanation: '`h` reads `Sub.fns`, which is still `[triple, dec]` from before: 21. Then `Sub.fns = self.fns`, which is `Pub.fns`.' },
      'fa22f-1m': { correct: 1, explanation: 'Now `Sub.fns` is `Pub.fns`: `[z]` of `z` of 8 is `[8]`.' },
      'fa22f-1n': { correct: 4, explanation: 'The interpreter shows the `Pub` instance using `__repr__`: `str([\'ha\'])`.' },
      'fa22f-2a': { correct: 0, explanation: 'An ordinary call expression: 6 + 5.' },
      'fa22f-2b': { correct: 1, explanation: 'A quoted expression is not evaluated.' },
      'fa22f-2c': { correct: 2, explanation: 'In a quasiquote, only the unquoted part `,(* 3 \'2)` is evaluated, to 6.' },
      'fa22f-2d': { correct: 4, explanation: 'Inside a quoted list, each `\'x` is shown as `(quote x)`.' },
      'fa22f-3a': { correct: 1, explanation: 'The global `result` gets one element appended: the value returned by the lambda.' },
      'fa22f-3b': { correct: 2, explanation: 'In `sums`, the parameter `result` is `totals`, so `pair` appends `4 + 2` to it.' },
      'fa22f-3c': { correct: 1, explanation: '`vals` and `s` are the same list `[1, 2, 4]`; two `pop`s leave `[1]`.' },
      'fa22f-3d': { accepted: ['6.1'], explanation: '`pair` returns `t` from `sums`’ frame, 0.1, and `sum(result)` sums `totals`, which is `[6]`.' },
      'fa22f-4a': { correct: 0, explanation: 'Try each element.' },
      'fa22f-4b': { correct: 2, explanation: 'Pair it with every element (1010 isn’t in the list, so an element never pairs with itself).' },
      'fa22f-4c': { accepted: ['if i + j == 2020', 'if j + i == 2020', 'if 2020 == i + j', 'if i == 2020 - j', 'if j == 2020 - i'], explanation: 'Check whether the two sum to 2020.' },
      'fa22f-4d': { correct: [0], explanation: 'Return the two numbers as a list. `list(i, j)` is an error, and `next` doesn’t work on numbers.' },
      'fa22f-4e': { accepted: ['(contains? (cdr s) (- 2020 (car s)))'], explanation: 'Check whether the first element’s partner is in the rest of the list.' },
      'fa22f-4f': { correct: 4, explanation: 'Build a two-element list.' },
      'fa22f-4g': { correct: 4, explanation: 'Otherwise, look in the rest of the list.' },
      'fa22f-4h': { correct: 4, explanation: 'One number from each copy of the table.' },
      'fa22f-4i': { correct: 3, explanation: 'Join `s` with itself, with aliases.' },
      'fa22f-4j': { correct: 3, explanation: 'The two numbers sum to 2020; `a.num < b.num` keeps just one of the two orders.' },
      'fa22f-5a': { correct: 4, explanation: 'Using more than `k` coins of this type isn’t allowed.' },
      'fa22f-5b': { correct: 4, explanation: 'Using one more coin of the current type.' },
      'fa22f-5c': { correct: 6, explanation: 'Moving on to the next coin type, none of it has been used yet.' },
      'fa22f-5d': { correct: 2, explanation: 'With at most 2 of each coin, 25 can be 25 or 10-10-5.' },
      'fa22f-6a': { accepted: ['[(t.label, i.label) for i in t.branches]', '[(t.label, b.label) for b in t.branches]', '[(t.label, c.label) for c in t.branches]'], explanation: 'The relationships between `t` and its children.' },
      'fa22f-6b': { correct: 1, explanation: 'Then each child…' },
      'fa22f-6c': { correct: 1, explanation: '…adds all of its own relationships (a list), so `extend`.' },
      'fa22f-6d': { correct: 3, explanation: 'The relationships inside the child’s subtree.' },
      'fa22f-7a': { accepted: ['next(coin) + next(coin) + next(coin)'], explanation: 'The first three flips as one string.' },
      'fa22f-7b': { correct: 0, explanation: 'Keep going until the coin runs out (then `next` stops the generator).' },
      'fa22f-7c': { accepted: ['start[1:]', 'start[-2:]'], explanation: 'Drop the oldest flip…' },
      'fa22f-7d': { correct: 2, explanation: '…and add the next one.' },
      'fa22f-7e': { accepted: ['filter'], explanation: 'Keep only the triples that are one of the players’ sequences.' },
      'fa22f-7f': { accepted: ['x in [p1, p2]', 'x == p1 or x == p2', 'x in (p1, p2)', 'x in [p2, p1]'], explanation: 'A triple matters only if one of the players chose it.' },
      'fa22f-7g': { correct: 3, explanation: 'The triples of flips, in order.' },
      'fa22f-8a': { correct: 1, explanation: 'When the first element is a list…' },
      'fa22f-8b': { accepted: ['(append (remove-parens (car s)) (remove-parens (cdr s)))'], explanation: '…flatten it and the rest, and join them.' },
      'fa22f-8c': { correct: [3], explanation: 'A non-list first element stays, in front of the flattened rest.' },
      'fa22f-9a': { correct: [1], explanation: '`Name` alone is ambiguous (both tables have it); the Pokemon’s name is `p.Name`.' },
      'fa22f-9b': { accepted: ['BaseAttack + a.MoveAttack + b.MoveAttack', 'p.BaseAttack + a.MoveAttack + b.MoveAttack', 'a.MoveAttack + b.MoveAttack + BaseAttack', 'a.MoveAttack + b.MoveAttack + p.BaseAttack'], explanation: 'The base attack plus each move’s attack.' },
      'fa22f-9c': { correct: [5], explanation: 'One copy of `Moves` for each of the Pokemon’s two moves.' },
      'fa22f-9d': { accepted: ['p.Move1 = a.Name AND p.Move2 = b.Name', 'p.Move1 = a.Name AND b.Name = p.Move2', 'a.Name = p.Move1 AND b.Name = p.Move2', 'p.Move2 = b.Name AND p.Move1 = a.Name'], explanation: 'Match each move copy to one of the Pokemon’s moves.' },
      'fa22f-10a': { accepted: ['not dogs.get(dog)', 'dog not in dogs'] },
      'fa22f-10b': { accepted: ['Tree(dog)'] },
      'fa22f-10c': { accepted: ['parents'] },
      'fa22f-10d': { accepted: ['dogs[i].branches.append(dogs[j])'] },
      'fa22f-10e': { accepted: ['return dogs[ancestor]'] },
      'fa22f-11a': { accepted: ['(helper (cdr expr))'] },
      'fa22f-11b': { accepted: ['(helper (cdr x))'] },
      'fa22f-11c': { accepted: ['(cons (list (car expr) (car x) (car y)) (cdr y))'] },
      'fa22f-12a': { accepted: ['Name, Type1 AS Type FROM Pokemon UNION SELECT Name, Type2 FROM Pokemon WHERE Type != "None"'] },
      'fa22f-12b': { accepted: ['GROUP BY Type ORDER BY count(*) DESC;'] },
    },
  });

  // ───────────────────────────── Fall 2021 Final ─────────────────────────────
  // Q5(c) uses the dogs and parents tables from the course's final study guide (printed with the question here).
  const FA21_DOGS = code(`
parents:
| parent     | child     |
|------------|-----------|
| Abraham    | Barack    |
| Abraham    | Clinton   |
| Delano     | Herbert   |
| Fillmore   | Abraham   |
| Fillmore   | Delano    |
| Fillmore   | Grover    |
| Eisenhower | Fillmore  |

dogs:
| name       | fur   | height |
|------------|-------|--------|
| Abraham    | long  | 26     |
| Barack     | short | 52     |
| Clinton    | long  | 47     |
| Delano     | long  | 46     |
| Eisenhower | short | 35     |
| Fillmore   | curly | 32     |
| Grover     | short | 28     |
| Herbert    | curly | 31     |
`);
  const FA21_DOGS_SETUP = code(`
CREATE TABLE parents(parent, child);
INSERT INTO parents VALUES ('Abraham', 'Barack'), ('Abraham', 'Clinton'), ('Delano', 'Herbert'), ('Fillmore', 'Abraham'),
  ('Fillmore', 'Delano'), ('Fillmore', 'Grover'), ('Eisenhower', 'Fillmore');
CREATE TABLE dogs(name, fur, height);
INSERT INTO dogs VALUES ('Abraham', 'long', 26), ('Barack', 'short', 52), ('Clinton', 'long', 47), ('Delano', 'long', 46),
  ('Eisenhower', 'short', 35), ('Fillmore', 'curly', 32), ('Grover', 'short', 28), ('Herbert', 'curly', 31);
`);
  const FA21_NEAR = code(`
def near(i, j):
    """Return whether digits i and j have absolute difference equal to 1."""
    assert i >= 0 and i < 10 and j >= 0 and j < 10
    return abs(i - j) == 1
`);
  const FA21_WORM = '**Definition.** A *worm* is a non-negative integer in which the absolute difference between each pair of adjacent digits is 1. 4345 is a worm. 4334 and 4354 are not. All non-negative integers below 10 are worms.\n\nYou may use `near` (defined at the top of the code).';
  const FA21_FRUIT = code(`
def fruited_branch(t):
    """Return whether Tree t has exactly one child that is a fruit (a leaf with no siblings).

    >>> fruited_branch(Tree(4))
    False
    >>> fruited_branch(Tree(4, [Tree(5)]))
    True
    >>> fruited_branch(Tree(4, [Tree(5, [Tree(6)])]))
    False
    """
    return len(t.branches) == 1 and t.branches[0].is_leaf()
`);
  const FA21_ARROWS = ['an arrow to list x (named gurney in the Global frame)', 'an arrow to list y (named gurney in the f1 frame)', 'an arrow to list z (named gurney in the f2 frame)', 'an arrow to another list that does not appear in the diagram'];
  add({
    exam: { id: 'fa21f', label: 'Fall 2021 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'fa21f-1a': {
        exam: 'fa21f', number: '1(a)', title: 'House Atreides — environment diagram', points: 8,
        intro: 'The environment diagram below was generated by the code below. Answer which values could fill in the labeled blanks. (The exam labels the last frame f2; it is the third frame, for `chani`.)',
        illustration: { src: 'assets/fa21-final-q1.png', width: 671, height: 532, alt: 'From the exam: an environment diagram with the code. The Global frame binds paul and chani to functions and gurney to list x, whose elements are blanks (a) and (b). Frame f1: paul [parent=Global] binds leto to blank (g), duncan to a function, gurney to list y with blank elements (c) and (d), and returns None. Frame f2: duncan [parent=f1] binds gurney to list z with blank elements (e) and (f), and returns None. The last frame, chani [parent=Global], binds paul to blank (h) and returns None.' },
        code: code(`
gurney = [1, 2]

def paul(leto):
    def duncan(gurney):
        gurney[0][0] = 3
        chani(gurney)
    gurney = [leto, 4]
    duncan([gurney, 5])

def chani(paul):
    gurney[0] = 6
    paul[0][1] = 7
    paul[0] = gurney

paul(gurney)
`),
      },
      'fa21f-1b': {
        exam: 'fa21f', number: '1(b)', title: 'House Atreides — Blink', points: 6,
        intro: 'Implement the `Blink` class. A `Blink` instance represents a linked list of numbers and can find the longest sublist starting with any particular value in constant time. A `Blink` instance `b` is constructed from a linked list `s` (a `Link` instance or `Link.empty`) and has the following attributes:\n\n- `b.link` is `s`, the linked list from which `b` was constructed.\n- `b.rest` is a `Blink` representing the rest of `s`. If `b` represents `Link.empty`, then it has no `rest` attribute.\n- `b.sublists` is a dictionary with a key for each unique element in `s`. The value for a key `k` is the `Link` instance representing the longest sublist of `s` starting with `k`.',
        code: code(`
class Blink:
    """A Blink has link, rest, and sublists attributes for a linked list s.

    >>> s = Link(3, Link(1, Link(4, Link(1, Link(5)))))
    >>> b = Blink(s)
    >>> b.link is s
    True
    >>> b.rest.rest.link is s.rest.rest
    True
    >>> b.rest.rest.rest.rest.rest.link is Link.empty
    True
    >>> b.sublists[4]
    Link(4, Link(1, Link(5)))
    >>> b.sublists[1]
    Link(1, Link(4, Link(1, Link(5))))
    >>> b.rest.rest.sublists[1]
    Link(1, Link(5))
    >>> b.sublists[3] is s
    True
    """
    def __init__(self, s):
        assert s is Link.empty or isinstance(s, Link)
        if s is not Link.empty:
            self.rest = ⟦a⟧
            # Copy the sublists dict of self.rest into a new dict.
            self.sublists = self.rest.sublists.copy()
            ⟦b⟧
        else:
            self.sublists = ⟦c⟧
        self.link = ⟦d⟧
`),
      },
      'fa21f-2a': {
        exam: 'fa21f', number: '2(a)', title: 'Arrakis — is_worm', points: 4,
        intro: FA21_WORM + '\n\nImplement `is_worm`, which takes a non-negative integer `n` and returns `True` if `n` is a worm and `False` otherwise.',
        code: FA21_NEAR + '\n\n' + code(`
def is_worm(n):
    """Return whether non-negative n is a worm.

    >>> [is_worm(0), is_worm(4), is_worm(4345), is_worm(4334), is_worm(4354)]
    [True, True, True, False, False]
    >>> [n for n in range(200, 300) if is_worm(n)]
    [210, 212, 232, 234]
    """
    if ⟦a⟧:
        ⟦b⟧
    return near(n % 10, ⟦c⟧) and is_worm(⟦d⟧)
`),
      },
      'fa21f-2b': {
        exam: 'fa21f', number: '2(b)', title: 'Arrakis — sandworm', points: 7,
        intro: FA21_WORM + '\n\nImplement `sandworm`, which takes a non-negative integer `n` and returns the largest worm that appears among the digits of `n` in order (but not necessarily formed of adjacent digits). A worm `a` is larger than a worm `b` if `a > b`. Worms are integers.',
        code: FA21_NEAR + '\n\n' + code(`
def sandworm(n):
    """Return the largest worm formed by selecting some digits of non-negative n.

    >>> sandworm(13531)            # 13[5]31
    5
    >>> sandworm(152)              # [1]5[2]
    12
    >>> sandworm(31415926535)      # [3]1[4]1[5]92[6]53[5]
    34565
    >>> sandworm(314159265358973)  # [3]1[4]1[5]92[6]53589[7]3
    34567
    """
    if n == 0:
        return 0
    def use_last(n):
        "Return the largest worm in n that includes n % 10"
        return tooth(n // 10, n % 10)
    def tooth(n, d):
        "Return the largest worm formed by some digits of n followed by digit d."
        if n == 0:
            return ⟦a⟧
        skip = ⟦b⟧
        if near(n % 10, d):
            return max(skip, ⟦c⟧)
        else:
            return skip
    return max(⟦d⟧, use_last(n))
`),
      },
      'fa21f-2c': {
        exam: 'fa21f', number: '2(c)', title: 'Arrakis — thumper', points: 7,
        intro: FA21_WORM + '\n\nImplement `thumper`, a generator function that takes a positive integer `k` and a digit `m`. It yields all `k`-digit worms with digits that are all less than or equal to `m`, and it yields these results in increasing order. Assume the number 0 has 0 digits.',
        code: code(`
def thumper(k, m):
    """Yield all k-digit worms with digits that are at most m, in increasing order.

    >>> list(thumper(1, 7))  # Note: 0 has no digits, so it is not a 1-digit worm.
    [1, 2, 3, 4, 5, 6, 7]
    >>> list(thumper(2, 3))
    [10, 12, 21, 23, 32]
    >>> list(thumper(3, 3))
    [101, 121, 123, 210, 212, 232, 321, 323]
    """
    if k == 1:
        ⟦a⟧
    else:
        for w in ⟦b⟧:
            if ⟦c⟧:
                yield 10 * w + (w % 10 - 1)
            if ⟦d⟧:
                yield 10 * w + (w % 10 + 1)
`),
      },
      'fa21f-2d': {
        exam: 'fa21f', number: '2(d)', title: 'Arrakis — segment', points: 8,
        intro: 'Implement `segment`, which takes a positive integer `n` (such as 3456) and a two-argument function `grouped`. It returns a linked list `s` containing linked lists of digits (such as `<<3 4> <5 6>>`). Together, the elements of `s` contain all digits of `n` in order. Two adjacent digits `a` and `b` (with `a` to the left of `b`) appear in the same element of `s` if `grouped(a, b)` returns a true value.\n\nThe `Link` class appears on page 2 (left column) of the midterm 2 study guide.',
        code: code(`
def segment(n, grouped):
    """Return a linked list of linked lists of the digits of positive n.
    Adjacent digits a and b appear in the same linked list if grouped(a, b).

    >>> print(segment(3233344, lambda a, b: a == b))
    <<3> <2> <3 3 3> <4 4>>
    >>> print(segment(314159, lambda a, b: a == 1))
    <<3> <1 4> <1 5> <9>>
    """
    part = Link.empty
    parts = Link.empty
    while n:
        if part is Link.empty or ⟦a⟧:
            ⟦b⟧
        else:
            ⟦c⟧
            part = ⟦d⟧
        ⟦e⟧
    return ⟦f⟧
`),
      },
      'fa21f-2e': {
        exam: 'fa21f', number: '2(e)', title: 'Arrakis — desert', points: 2,
        intro: FA21_WORM + '\n\nImplement `desert`, which takes a positive integer `n`. It returns a linked list `s` containing linked lists of digits. Together, the elements of `s` contain all digits of `n` in order, and `s` is the shortest linked list for which each element contains the digits of a worm. Assume that `segment` is implemented correctly.',
        code: FA21_NEAR + '\n\n' + code(`
def desert(n):
    """Return the shortest linked list whose elements are linked lists
    of digits of worms that together are the digits of positive n.

    >>> print(desert(43587))
    <<4 3> <5> <8 7>>
    >>> print(desert(11235813213455))
    <<1> <1 2 3> <5> <8> <1> <3 2 1> <3 4 5> <5>>
    """
    return ⟦a⟧
`),
      },
      'fa21f-3a': {
        exam: 'fa21f', number: '3(a)', title: 'Caladan — sum_fruit_labels', points: 4,
        intro: '**Definition.** A *fruit* is a leaf node that has a parent but no siblings. That is, its parent has no other children.\n\nThe `Tree` class appears on page 2 (left column) of the midterm 2 study guide. You may use `fruited_branch` (defined at the top of the code).\n\nImplement `sum_fruit_labels`, which takes a `Tree` instance `t`. It returns the sum of the labels of the fruits in `t`. If `t` has no fruits, 0 is returned.',
        code: FA21_FRUIT + '\n\n' + code(`
def sum_fruit_labels(t):
    """Return the sum of the labels of the fruits of Tree t.

    >>> apple = Tree(5, [Tree(6, [Tree(7)]), Tree(8), Tree(9, [Tree(10)])])
    >>> sum_fruit_labels(apple)  # 7 + 10
    17
    >>> pineapple = Tree(3, [Tree(4), apple, apple, Tree(1, [Tree(2)])])
    >>> sum_fruit_labels(pineapple)  # 7 + 10 + 7 + 10 + 2
    36
    >>> sum_fruit_labels(Tree(3, [Tree(4), Tree(5)]))  # No fruits!
    0
    """
    if fruited_branch(t):
        return ⟦a⟧
    else:
        return ⟦b⟧
`),
      },
      'fa21f-3b': {
        exam: 'fa21f', number: '3(b)', title: 'Caladan — pruned', points: 4,
        intro: '**Definition.** A *fruit* is a leaf node that has a parent but no siblings.\n\nImplement `pruned`, which takes a `Tree` instance `t`. If `t` contains at least one fruit, it returns a `Tree` instance with only the nodes of `t` that appear on a path from the root to a fruit. If `t` contains no fruit, `pruned(t)` returns `None`. Calling `pruned(t)` should not modify `t`.',
        code: FA21_FRUIT + '\n\n' + code(`
def pruned(t):
    """Return a Tree with only the nodes of t that are on a path to a fruit.

    >>> t = Tree(5, [Tree(6, [Tree(7)]), Tree(8), Tree(9, [Tree(10)])])
    >>> pruned(t)
    Tree(5, [Tree(6, [Tree(7)]), Tree(9, [Tree(10)])])
    >>> t  # t is not modified by calling pruned(t)
    Tree(5, [Tree(6, [Tree(7)]), Tree(8), Tree(9, [Tree(10)])])
    >>> pruned(Tree(2, [Tree(3), Tree(4)])) is None  # No fruit!
    True
    """
    if fruited_branch(t):
        return ⟦a⟧
    cut = [pruned(b) for b in t.branches]  # Some items in cut might be None
    if ⟦b⟧:
        return ⟦c⟧
`),
      },
      'fa21f-4a': {
        exam: 'fa21f', number: '4(a)', title: 'Spice — repeated-call', points: 4,
        intro: '**Definition.** A *repeated call* is a nested call expression in which each subexpression is either a number, a symbol, or a call with exactly one operand. For example, `(((f 2) 3) 4)` is a repeated call.\n\nImplement `repeated-call`, a procedure that takes an `operator` expression and a list of `operands` expressions. It returns a repeated call for the operator and operands. If `operands` is `nil`, the result is the operator expression.',
        code: code(`
;;; scm> (repeated-call 'f '(2 3 4))
;;; (((f 2) 3) 4)
;;; scm> (repeated-call '(f 2) '(3 4))
;;; (((f 2) 3) 4)
;;; scm> (repeated-call 'f nil)
;;; f
(define (repeated-call operator operands)
    (if (null? operands)
        operator
        (⟦a⟧ ⟦b⟧ ⟦c⟧)))
`),
      },
      'fa21f-4b': {
        exam: 'fa21f', number: '4(b)', title: 'Spice — curry', points: 4,
        intro: 'Complete the implementation of `curry`, a higher-order procedure that is called repeatedly on a non-negative integer `num-args` and then a procedure `f`. It returns a curried version of `f` that, when called repeatedly `num-args` times, returns the result of applying `f` to those arguments. As a special case, `((curry 0) f)` calls `f` on no arguments. **Hint:** `(apply + \'(1 2 3))` evaluates to 6, and `(apply + \'())` to 0.',
        code: code(`
;;; scm> (((((curry 3) +) 4) 5) 6)     ; (+ 4 5 6) evaluates to 15
;;; 15
;;; scm> ((curry 0) +)                 ; (+) evaluates to 0
;;; 0
(define (curry num-args)
    (lambda (f) (curry-helper num-args (lambda (s) (apply f s)))))

;;; curry-helper's argument g is a one-argument procedure that takes a list.
(define (curry-helper num-args g)
    (if (= num-args 0)
        ⟦a⟧
        (lambda (x) (curry-helper (- num-args 1) ⟦b⟧))))
`),
      },
      'fa21f-4c': {
        exam: 'fa21f', number: '4(c)', title: 'Spice — one-arg', points: 7,
        intro: 'Implement `one-arg`, which takes a Scheme expression `s`. It returns a call expression that would evaluate to the same value as `s` (calling the same procedures), but which uses `curry` to ensure that all call expressions have exactly one operand. Call expressions that already have one operand are unchanged.',
        code: code(`
;;; scm> (one-arg '(+ 4 5 6))
;;; (((((curry 3) +) 4) 5) 6)
;;; scm> (one-arg '(+ (- 4) (*) (* 5 6)))
;;; (((((curry 3) +) (- 4)) ((curry 0) *)) ((((curry 2) *) 5) 6))
(define (one-arg s)
    (if (number? s) s
        (let ((num-args (- (length s) 1)))
            (if (= num-args 1)
                (⟦a⟧ ⟦b⟧ (one-arg ⟦c⟧))
                (repeated-call (list ⟦d⟧ ⟦e⟧)
                               (map ⟦f⟧ (cdr s)))))))
`),
      },
      'fa21f-5a': {
        exam: 'fa21f', number: '5(a)', title: 'Gom Jabbar — regular expression', points: 4,
        intro: 'Which of the following strings is entirely matched (from beginning to end) by the regular expression below? **Check all that apply.**',
        code: code(`
(([cs][61]|[abc])?(cs)+)|([cs]+61+)
`),
      },
      'fa21f-5b': {
        exam: 'fa21f', number: '5(b)', title: 'Gom Jabbar — BNF', points: 2,
        intro: 'Write a short string (fewer than 10 characters) that matches the BNF grammar below, but is guaranteed to cause an error when evaluated by Scheme, regardless of how any symbols such as `f` are defined in the environment. The `%ignore /\\s+/` directive ignores whitespace in the string. The `INT` terminal matches integers.',
        code: code(`
?start: expr
expr: INT | "(" operator expr+ ")"
operator: PROCEDURE | expr
PROCEDURE: "f"
%ignore /\\s+/
%import common.INT
`),
      },
      'fa21f-5c': {
        exam: 'fa21f', number: '5(c)', title: 'Gom Jabbar — one short-furred child (SQL)', points: 4, lang: 'sql',
        intro: 'Write a SQL query that generates a one-column table of the names of all dogs with exactly one child that has short fur. (The dog may have multiple children, but only one can have short fur.) Assume the `parents` and `dogs` tables from the final study guide have been created (shown below). The result of your query should contain two rows: “Abraham” and “Fillmore”. Your query should select the rows described even if the contents of `parents` and `dogs` were different.\n\n```\n' + FA21_DOGS + '\n```',
        sqlSetup: FA21_DOGS_SETUP,
        code: code(`
⟦a⟧
`),
      },
    },
    questions: [
      { id: 'fa21f-1a', problem: 'fa21f-1a', label: 'i.', points: 1, topics: ['env', 'lists'], difficulty: 'medium', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?', choices: ['1', '3', '6', '7'] },
      { id: 'fa21f-1b', problem: 'fa21f-1a', label: 'ii.', points: 1, topics: ['env', 'lists'], difficulty: 'easy', type: 'single_choice', prompt: 'Which of these could fill in blank (b)?', choices: ['2', '6', '7', 'an arrow to list y (named gurney in the f1 frame)'] },
      { id: 'fa21f-1c', problem: 'fa21f-1a', label: 'iii.', points: 1, topics: ['env', 'lists'], difficulty: 'medium', type: 'single_choice', prompt: 'Which of these could fill in blank (c)?', choices: ['3', '6', '7', 'an arrow to list x (named gurney in the Global frame)'] },
      { id: 'fa21f-1d', problem: 'fa21f-1a', label: 'iv.', points: 1, topics: ['env', 'lists'], difficulty: 'medium', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?', choices: ['3', '4', '6', '7'] },
      { id: 'fa21f-1e', problem: 'fa21f-1a', label: 'v.', points: 1, topics: ['env', 'lists'], difficulty: 'hard', type: 'single_choice', prompt: 'Which of these could fill in blank (e)?', choices: ['3', '6', '7', FA21_ARROWS[0], FA21_ARROWS[1]] },
      { id: 'fa21f-1f', problem: 'fa21f-1a', label: 'vi.', points: 1, topics: ['env', 'lists'], difficulty: 'easy', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (f)?', choices: ['3', '4', '5', '6', '7'] },
      { id: 'fa21f-1g', problem: 'fa21f-1a', label: 'vii.', points: 1, topics: ['env'], difficulty: 'easy', type: 'single_choice', prompt: 'Which of these could fill in blank (g)?', choices: FA21_ARROWS },
      { id: 'fa21f-1h', problem: 'fa21f-1a', label: 'viii.', points: 1, topics: ['env'], difficulty: 'medium', type: 'single_choice', prompt: 'Which of these could fill in blank (h)?', choices: FA21_ARROWS },
      { id: 'fa21f-1i', problem: 'fa21f-1b', label: 'i.', points: 1, topics: ['oop', 'links', 'recursion'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-1j', problem: 'fa21f-1b', label: 'ii.', points: 3, topics: ['oop', 'links', 'fundamentals'], difficulty: 'hard', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-1k', problem: 'fa21f-1b', label: 'iii.', points: 1, topics: ['oop', 'fundamentals'], difficulty: 'easy', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?',
        choices: ['self.rest.sublists', 'self.rest.sublists.copy()', '{}', '{s: s}', '{s: self}', '{s.first: s}', '{s.first: self}'] },
      { id: 'fa21f-1l', problem: 'fa21f-1b', label: 'iv.', points: 1, topics: ['oop'], difficulty: 'easy', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['s', 's.rest', 's.link', 'self', 'self.rest', 'self.rest.link'] },
      { id: 'fa21f-2a', problem: 'fa21f-2a', label: 'i.', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?', choices: ['n == 0', 'n <= 0', 'n < 10', 'n > 0 and n < 10'] },
      { id: 'fa21f-2b', problem: 'fa21f-2a', label: 'ii.', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-2c', problem: 'fa21f-2a', label: 'iii.', points: 1, topics: ['fundamentals'], difficulty: 'medium', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?',
        choices: ['n % 10', 'n // 10', 'n % 100', 'n // 100', '(n % 10) // 10', '(n // 10) % 10', '(n % 10) // 100', '(n // 100) % 10'] },
      { id: 'fa21f-2d', problem: 'fa21f-2a', label: 'iv.', points: 1, topics: ['recursion'], difficulty: 'easy', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['n % 10', 'n // 10', 'n % 100', 'n // 100', '(n % 10) // 10', '(n // 10) % 10', '(n % 10) // 100', '(n // 100) % 10'] },
      { id: 'fa21f-2e', problem: 'fa21f-2b', label: 'i.', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-2f', problem: 'fa21f-2b', label: 'ii.', points: 2, topics: ['recursion'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-2g', problem: 'fa21f-2b', label: 'iii.', points: 2, topics: ['recursion'], difficulty: 'hard', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?',
        choices: ['10 * use_last(n) + n % 10', '10 * use_last(n // 10) + n % 10', '10 * sandworm(n) + n % 10', '10 * sandworm(n // 10) + n % 10', '10 * use_last(n) + d', '10 * use_last(n // 10) + d', '10 * sandworm(n) + d', '10 * sandworm(n // 10) + d'] },
      { id: 'fa21f-2h', problem: 'fa21f-2b', label: 'iv.', points: 1, topics: ['recursion'], difficulty: 'medium', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['sandworm(n // 10)', 'use_last(n // 10)', 'tooth(n // 10, 0)', '10 * sandworm(n // 10) + n % 10', '10 * use_last(n // 10) + n % 10', '10 * tooth(n // 10, 0) + n % 10'] },
      { id: 'fa21f-2i', problem: 'fa21f-2c', label: 'i.', points: 3, topics: ['generators'], difficulty: 'hard', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-2j', problem: 'fa21f-2c', label: 'ii.', points: 2, topics: ['generators', 'recursion'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-2k', problem: 'fa21f-2c', label: 'iii.', points: 1, topics: ['generators'], difficulty: 'medium', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?',
        choices: ['True', 'False', 'w > 0', 'w >= 0', 'w < m', 'w <= m', 'w % 10 > 0', 'w % 10 >= 0', 'w % 10 < m', 'w % 10 <= m'] },
      { id: 'fa21f-2l', problem: 'fa21f-2c', label: 'iv.', points: 1, topics: ['generators'], difficulty: 'medium', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['True', 'False', 'w > 0', 'w >= 0', 'w < m', 'w <= m', 'w % 10 > 0', 'w % 10 >= 0', 'w % 10 < m', 'w % 10 <= m'] },
      { id: 'fa21f-2m', problem: 'fa21f-2d', label: 'i.', points: 2, topics: ['links', 'hof'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-2n', problem: 'fa21f-2d', label: 'ii.', points: 2, topics: ['links'], difficulty: 'medium', blank: 'b', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (b)?',
        choices: ['part = Link(n, part)', 'part = Link(n % 10, part)', 'part = Link(n // 10 % 10, part)', 'part.rest = Link(n)', 'part.rest = Link(n % 10)', 'part.rest = Link(n // 10 % 10)'] },
      { id: 'fa21f-2o', problem: 'fa21f-2d', label: 'iii.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?',
        choices: ['parts.append(part)', 'parts.rest = Link(part)', 'parts = Link(part, parts)', 'parts = part + parts', 'parts += part', 'parts += Link(part)'] },
      { id: 'fa21f-2p', problem: 'fa21f-2d', label: 'iv.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['part.first', 'part.rest', 'Link.empty', 'Link(n % 10)', 'Link(n, part)', 'Link(n % 10, part)'] },
      { id: 'fa21f-2q', problem: 'fa21f-2d', label: 'v.', points: 1, topics: ['fundamentals'], difficulty: 'easy', blank: 'e', type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'fa21f-2r', problem: 'fa21f-2d', label: 'vi.', points: 1, topics: ['links'], difficulty: 'medium', blank: 'f', type: 'short_answer', prompt: 'Fill in blank (f).' },
      { id: 'fa21f-2s', problem: 'fa21f-2e', label: 'i.', points: 2, topics: ['hof', 'links'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-3a', problem: 'fa21f-3a', label: 'i.', points: 2, topics: ['trees'], difficulty: 'easy', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-3b', problem: 'fa21f-3a', label: 'ii.', points: 2, topics: ['trees', 'recursion'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-3c', problem: 'fa21f-3b', label: 'i.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?',
        choices: ['t', 't.branches[0]', 'Tree(t.label)', 'Tree(t.label, t.branches[0])', 'Tree(t.label, [b for b in t.branches if fruited_branch(b)])'] },
      { id: 'fa21f-3d', problem: 'fa21f-3b', label: 'ii.', points: 1, topics: ['trees', 'hof'], difficulty: 'medium', blank: 'b', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (b)?',
        choices: ['cut', 'cut is not None', 'None in cut', 'any(cut)', 'all(cut)'] },
      { id: 'fa21f-3e', problem: 'fa21f-3b', label: 'iii.', points: 2, topics: ['trees', 'lists'], difficulty: 'hard', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa21f-4a', problem: 'fa21f-4a', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?', choices: ['cons', 'cdr', 'list', 'append', 'map', 'repeated-call'] },
      { id: 'fa21f-4b', problem: 'fa21f-4a', label: 'ii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-4c', problem: 'fa21f-4a', label: 'iii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?',
        choices: ['operands', '(cdr operands)', '(cons operator operands)', '(cons operator (cdr operands))', '(repeated-call operator operands)', '(repeated-call operator (cdr operands))'] },
      { id: 'fa21f-4d', problem: 'fa21f-4b', label: 'i.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa21f-4e', problem: 'fa21f-4b', label: 'ii.', points: 2, topics: ['scheme'], difficulty: 'hard', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa21f-4f', problem: 'fa21f-4c', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?', choices: ['cons', 'car', 'cdr', 'list', 'append', 'length'] },
      { id: 'fa21f-4g', problem: 'fa21f-4c', label: 'ii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'b', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (b)?', choices: ['s', '(car s)', '(cdr s)', '(car (cdr s))', '(car (cdr (cdr s)))'] },
      { id: 'fa21f-4h', problem: 'fa21f-4c', label: 'iii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'c', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?', choices: ['s', '(car s)', '(cdr s)', '(car (cdr s))', '(car (cdr (cdr s)))'] },
      { id: 'fa21f-4i', problem: 'fa21f-4c', label: 'iv.', points: 2, topics: ['scheme'], difficulty: 'hard', blank: 'd', type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa21f-4j', problem: 'fa21f-4c', label: 'v.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'e', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (e)?', choices: ['s', "'s", '(car s)', "'(car s)", '(cdr s)', "'(cdr s)"] },
      { id: 'fa21f-4k', problem: 'fa21f-4c', label: 'vi.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'f', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (f)?',
        choices: ['one-arg', 'car', 'cdr', '(lambda (x) (car (cdr x)))', '(lambda (x) (one-arg (car x)))', '(lambda (x) (one-arg (car (cdr x))))'] },
      { id: 'fa21f-5a', problem: 'fa21f-5a', label: '(a)', points: 4, topics: ['fundamentals'], difficulty: 'hard', type: 'multi_select', mono: true, prompt: 'Which of these strings is entirely matched by the regular expression? **Check all that apply.**',
        choices: ['cs61a', 'cs61acscs', 'cs61', 'cscs', 'cscs611', 'cccsss61', 'cs6161', 's1cs'] },
      { id: 'fa21f-5b', problem: 'fa21f-5b', label: '(b)', points: 2, topics: ['fundamentals'], difficulty: 'hard', type: 'short_answer', prompt: 'Write a short string (fewer than 10 characters).' },
      { id: 'fa21f-5c', problem: 'fa21f-5c', label: '(c)', points: 4, topics: ['sql-joins', 'sql-agg'], difficulty: 'hard', blank: 'a', type: 'code', prompt: 'Write the query.' },
    ],
    answers: {
      'fa21f-1a': { correct: 2, explanation: '`chani` sets the global `gurney[0] = 6`, and the global `gurney` is list x.' },
      'fa21f-1b': { correct: 0, explanation: 'Nothing changes x[1].' },
      'fa21f-1c': { correct: 0, explanation: 'In `duncan`, `gurney` is z, so `gurney[0][0] = 3` sets z[0][0], which is y[0].' },
      'fa21f-1d': { correct: 3, explanation: 'In `chani`, `paul` is z, so `paul[0][1] = 7` sets y[1].' },
      'fa21f-1e': { correct: 3, explanation: '`paul[0] = gurney` sets z[0] to the global `gurney`, list x.' },
      'fa21f-1f': { correct: 2, explanation: 'z was built as `[gurney, 5]`.' },
      'fa21f-1g': { correct: 0, explanation: '`paul(gurney)` passes the global list x as `leto`.' },
      'fa21f-1h': { correct: 2, explanation: '`duncan` calls `chani(gurney)` with its own `gurney`, list z.' },
      'fa21f-1i': { accepted: ['Blink(s.rest)'], explanation: 'The rest is the `Blink` of the rest of the linked list.' },
      'fa21f-1j': { accepted: ['self.sublists[s.first] = s'], explanation: 'The longest sublist starting with `s.first` is `s` itself (it overrides a shorter one from the rest).' },
      'fa21f-1k': { correct: 2, explanation: 'An empty list has no elements, so no keys.' },
      'fa21f-1l': { correct: 0, explanation: '`link` is the linked list the `Blink` was built from.' },
      'fa21f-2a': { correct: 2, explanation: 'Every one-digit number is a worm.' },
      'fa21f-2b': { accepted: ['return True'], explanation: 'One digit is always a worm.' },
      'fa21f-2c': { correct: 5, explanation: 'Compare the last digit with the second-to-last digit.' },
      'fa21f-2d': { correct: 1, explanation: 'The rest of the number must be a worm too.' },
      'fa21f-2e': { accepted: ['d'], explanation: 'With no digits left before it, the worm is just `d`.' },
      'fa21f-2f': { accepted: ['tooth(n // 10, d)'], explanation: 'Skip the last digit of `n`.' },
      'fa21f-2g': { correct: 4, explanation: 'Use the last digit of `n` (it is near `d`): the best worm ending with it, then `d`.' },
      'fa21f-2h': { correct: 0, explanation: 'Either the worm skips the last digit of `n`, or it uses it.' },
      'fa21f-2i': { accepted: ['yield from range(1, m + 1)', 'yield from range(1, m+1)'], explanation: 'The one-digit worms (at least 1, since 0 has no digits).' },
      'fa21f-2j': { accepted: ['thumper(k-1, m)', 'thumper(k - 1, m)'], explanation: 'Extend each (k−1)-digit worm by one digit.' },
      'fa21f-2k': { correct: 6, explanation: 'Adding the digit one below the last needs the last digit to be above 0.' },
      'fa21f-2l': { correct: 8, explanation: 'Adding the digit one above the last must stay at most `m`.' },
      'fa21f-2m': { accepted: ['grouped(n % 10, part.first)'], explanation: 'Digits are read from the right, so the current digit `n % 10` is to the left of `part.first`.' },
      'fa21f-2n': { correct: 1, explanation: 'Add the digit to the front of the current part.' },
      'fa21f-2o': { correct: 2, explanation: 'Put the finished part in front of the other parts.' },
      'fa21f-2p': { correct: 3, explanation: 'Start a new part with this digit.' },
      'fa21f-2q': { accepted: ['n = n // 10', 'n //= 10'], explanation: 'Move to the next digit.' },
      'fa21f-2r': { accepted: ['Link(part, parts)'], explanation: 'Add the last part.' },
      'fa21f-2s': { accepted: ['segment(n, near)', 'segment(n, lambda a, b: near(a, b))'], explanation: 'Group adjacent digits exactly when they are near: each group is then a worm, and no two groups could be joined.' },
      'fa21f-3a': { accepted: ['t.branches[0].label'], explanation: 'The fruit is the only child.' },
      'fa21f-3b': { accepted: ['sum([sum_fruit_labels(b) for b in t.branches])', 'sum(sum_fruit_labels(b) for b in t.branches)', 'sum(map(sum_fruit_labels, t.branches))'], explanation: 'Add the fruit labels from each branch.' },
      'fa21f-3c': { correct: 0, explanation: 'Its whole subtree is the path to the fruit, and returning `t` doesn’t modify it.' },
      'fa21f-3d': { correct: 3, explanation: 'At least one branch contains a fruit.' },
      'fa21f-3e': { accepted: ['Tree(t.label, [b for b in cut if b])', 'Tree(t.label, [b for b in cut if b is not None])', 'Tree(t.label, [x for x in cut if x])'], explanation: 'Keep only the branches that lead to a fruit.' },
      'fa21f-4a': { correct: 5, explanation: 'Recurse on a bigger operator with fewer operands.' },
      'fa21f-4b': { accepted: ['(list operator (car operands))'], explanation: 'Wrap the operator around the first operand.' },
      'fa21f-4c': { correct: 1, explanation: 'The remaining operands.' },
      'fa21f-4d': { accepted: ['(g nil)'], explanation: 'With no arguments left, call `g` on the empty list.' },
      'fa21f-4e': { accepted: ['(lambda (s) (g (cons x s)))'], explanation: 'Remember `x` by putting it in front of the arguments that come later.' },
      'fa21f-4f': { correct: 3, explanation: 'Build a two-element call expression.' },
      'fa21f-4g': { correct: 1, explanation: 'The operator stays.' },
      'fa21f-4h': { correct: 3, explanation: 'Its only operand, also converted.' },
      'fa21f-4i': { accepted: ["(list 'curry num-args)", "(cons 'curry (cons num-args nil))", '`(curry ,num-args)'], explanation: 'The call `(curry num-args)`.' },
      'fa21f-4j': { correct: 2, explanation: 'The operator.' },
      'fa21f-4k': { correct: 0, explanation: 'Convert each operand.' },
      'fa21f-5a': { correct: [2, 3, 4, 5, 7], explanation: 'The first branch matches an optional two-character prefix then one or more `cs`; the second matches `c`/`s` characters then 6 and one or more 1s.' },
      'fa21f-5b': { accepted: ['(2 3)'], explanation: 'A call whose operator is an integer, such as `(2 3)`, matches the grammar but always errors.' },
      'fa21f-5c': { accepted: ['SELECT parent FROM parents, dogs WHERE child=name AND fur="short" GROUP BY parent HAVING COUNT(*)=1;'], explanation: 'Join each child to its row in `dogs`, keep the short-furred children, and keep parents with exactly one of them.' },
    },
  });

  // ───────────────────────────── Fall 2020 Final ─────────────────────────────
  // An online exam: few, long questions; Q1 gives a finished environment diagram and asks for the code.
  const FA20_STATES = code(`
class State:
    electors = {}
    def __init__(self, code, electors):
        self.code = code
        self.electors = electors
        State.electors[code] = electors

battleground = [State('AZ', 11), State('PA', 20), State('NV', 6),
                State('GA', 16), State('WI', 10), State('MI', 16)]

def print_all(s):
    for x in s:
        print(x)
`);
  const FA20_ELECTION = '**Definition:** For some collection of states `s`, a *win by at least k* is a (possibly empty) subset `w` of `s` such that the total number of electors for the states in `w` is at least `k` more than the total number of electors for the states not in `w` but in `s`. For example, Arizona (AZ), Pennsylvania (PA), and Michigan (MI) have a total of 11 + 20 + 16 = 47 electors. The remaining battleground states have a total of 6 + 16 + 10 = 32 electors. So, the subset `<AZ PA MI>` is a win by 47 - 32 = 15. The total number of electors for an empty set of states is 0. The `print_all` function prints all elements of an iterable.';
  const FA20_LLAMAS = 'Llambda the llama breeder had four original llamas, but now has 12. An arrow from one llama to another indicates that the first is a parent of the second. For example, Jackie’s parents are Sidney and Finley. All llamas except the originals have 2 parents, and each has a unique name.\n\n**Definition.** An *offspring tree* is a `Tree` instance with string labels in which each node represents a llama and the branches of a node represent its (biological) children. The `Tree` class appears on the Midterm 2 Study Guide. Assume `originals` is a list of offspring trees for the original four: `[Tree(\'Charlie\', ...), Tree(\'Sidney\', ...), Tree(\'Finley\', ...), Tree(\'Frankie\', ...)]`. For example, Sidney’s offspring tree is `Tree(\'Sidney\', [Tree(\'Jaidyn\', [Tree(\'Lee\'), Tree(\'Max\')]), Tree(\'Jackie\', [Tree(\'Alex\')])])`.';
  const FA20_FAMILY = code(`
CREATE TABLE family(parent, child);
INSERT INTO family VALUES ('Charlie', 'Jaidyn'), ('Charlie', 'Jules'), ('Sidney', 'Jaidyn'), ('Sidney', 'Jackie'),
  ('Finley', 'Jackie'), ('Finley', 'Jan'), ('Finley', 'Jess'), ('Frankie', 'Jules'), ('Frankie', 'Jan'),
  ('Jaidyn', 'Lee'), ('Jaidyn', 'Max'), ('Jules', 'Alex'), ('Jules', 'Jess'), ('Jackie', 'Alex'), ('Jan', 'Lee'), ('Jan', 'Max');
`);
  const FA20_LLAMA_FIG = { src: 'assets/fa20-final-q4.png', width: 1008, height: 588, alt: 'From the exam: a family diagram of 12 llamas. The four originals are Charlie, Sidney, Finley and Frankie. Charlie is a parent of Jaidyn and Jules; Sidney of Jaidyn and Jackie; Finley of Jackie, Jan and Jess; Frankie of Jules and Jan. Jaidyn is a parent of Lee and Max; Jules of Alex and Jess; Jackie of Alex; Jan of Lee and Max.' };
  add({
    exam: { id: 'fa20f', label: 'Fall 2020 Final', kind: 'final', url: 'https://cs61a.org/resources/', complete: true },
    problems: {
      'fa20f-1': {
        exam: 'fa20f', number: '1', title: 'The Droids You’re Looking For', points: 6,
        intro: 'Fill in each blank in the code example below so that executing it would generate the environment diagram shown (from tutor.cs61a.org).\n\n**RESTRICTIONS.** You must use all of the blanks. Each blank can only include one statement or expression.',
        illustration: { src: 'assets/fa20-final-q1.png', width: 790, height: 800, alt: 'From the exam: the target environment diagram. Global binds x to func x(wing), droid to a list [8], and b to func λ(poe) <line 2> [parent=f1]. Frame f1: x [parent=Global] binds wing to a list [1, list] (whose second element is the list [8]), poe to the lambda, and returns the lambda. Frame f2: λ <line 2> [parent=f1] binds poe to a list [8] and returns a list [1, list [8], 8]. Frame f3: λ <line 2> [parent=f1] binds poe to a list containing that list, and returns a list [1, ..., ...].' },
        code: code(`
def x(wing):
    poe = lambda poe: ⟦a⟧
    wing.append(⟦b⟧)
    return ⟦c⟧

droid = [8]

b = x([1])

⟦d⟧
`),
      },
      'fa20f-2a': {
        exam: 'fa20f', number: '2(a)', title: 'Stoned — hailstone', points: 9,
        intro: '**Definition:** A *hailstone sequence* begins with a positive integer `n`. If `n` is even, divide it by 2. If `n` is odd, triple it and add 1. Repeat until 1 is reached. For example, the hailstone sequence starting at 10 is 10, 5, 16, 8, 4, 2, 1. Assume that all hailstone sequences are finite.\n\nImplement `hailstone`, which takes a positive integer `n` and a one-argument function `g`. It calls `g` on each element of the hailstone sequence starting at `n` and returns the length of the sequence.',
        code: code(`
def hailstone(n, g):
    """Call g on each element of the hailstone sequence starting
    at n and return its length.

    >>> a = hailstone(10, print)
    10
    5
    16
    8
    4
    2
    1
    >>> a
    7
    >>> s = []
    >>> hailstone(10, s.append)
    7
    >>> s
    [10, 5, 16, 8, 4, 2, 1]
    """
    if n == 1:
        h = ⟦a⟧
    elif ⟦b⟧:
        h = up
    else:
        h = down
    ⟦c⟧
    return ⟦d⟧(n, ⟦e⟧)

def up(n, f):
    return 1 + f(3 * n + 1)

def down(n, f):
    return 1 + f(n // 2)
`),
      },
      'fa20f-2b': {
        exam: 'fa20f', number: '2(b)', title: 'Stoned — collide', points: 7,
        intro: 'Implement `collide`, which takes positive integers `m` and `n`. It returns the earliest element of the hailstone sequence starting at `n` that also appears in the hailstone sequence starting at `m`. Assume `hailstone` is implemented correctly.',
        code: code(`
def collide(m, n):
    """Return the earliest number in the hailstone sequence starting at n that
    also appears in the hailstone sequence starting at m.

    >>> collide(10, 32)  # 10, 5, 16, 8, ...   vs   32, 16, 8, ...
    16
    >>> collide(13, 11)  # 13, 40, ...   vs   11, 34, 17, 52, 26, 13, 40, ...
    13
    """
    s = []
    hailstone(m, ⟦a⟧)
    found = None
    def f(k):
        ⟦b⟧
        if ⟦c⟧:
            ⟦d⟧
    hailstone(n, f)
    return ⟦e⟧
`),
      },
      'fa20f-3a': {
        exam: 'fa20f', number: '3(a)', title: 'College Party — wins', points: 8,
        intro: 'In a US presidential election, each state has a number of electors. ' + FA20_ELECTION + '\n\nImplement `wins`, a generator function that takes a list of `State` instances `states` and an integer `k`. For every possible win by at least `k` among the states, it yields a linked list containing strings of the two-letter codes for the states in that win. Any order of the wins and any order of the states within a win is acceptable. A linked list is a `Link` instance or `Link.empty`. The `Link` class appears on the Midterm 2 Study Guide.',
        code: FA20_STATES + '\n\n' + code(`
def wins(states, k):
    """Yield each linked list of two-letter state codes that describes a win by at least k.

    >>> print_all(wins(battleground, 50))
    <AZ PA NV GA WI MI>
    <AZ PA NV GA MI>
    <AZ PA GA WI MI>
    <PA NV GA WI MI>
    >>> print_all(wins(battleground, 75))
    <AZ PA NV GA WI MI>
    """
    if ⟦a⟧:
        yield Link.empty
    if states:
        first = states[0].electors
        for win in wins(states[1:], ⟦b⟧):
            yield Link(⟦c⟧, win)
        yield from wins(states[1:], ⟦d⟧)
`),
      },
      'fa20f-3b': {
        exam: 'fa20f', number: '3(b)', title: 'College Party — must_win', points: 7,
        intro: FA20_ELECTION + '\n\nImplement `must_win`, which takes a list of `State` instances `states` and an integer `k`. It returns a list of two-letter state codes (strings) for all states that appear in every win by at least `k` among the states. Assume `wins` is implemented correctly.',
        code: FA20_STATES + '\n\n' + code(`
def must_win(states, k):
    """List all states that must be won in every scenario that wins by k.

    >>> must_win(battleground, 50)
    ['PA', 'GA', 'MI']
    >>> must_win(battleground, 75)
    ['AZ', 'PA', 'NV', 'GA', 'WI', 'MI']
    """
    def contains(s, x):
        """Return whether x is a value in linked list s."""
        return (⟦a⟧) and (⟦b⟧)
    return [⟦c⟧ for s in states if ⟦d⟧([⟦e⟧ for w in wins(states, k)])]
`),
      },
      'fa20f-3c': {
        exam: 'fa20f', number: '3(c)', title: 'College Party — is_minimal', points: 6,
        intro: '**Definition.** A win by at least `k` is *minimal* if every state in it is necessary to win by at least `k`. Assume that only the code below has been executed. You may not call `wins` or `must_win`.\n\nImplement `is_minimal`, which takes a non-empty list of strings `state_codes` in which every element is the code for some `State` instance, as well as an integer `k`. It returns whether the states named in `state_codes` form a minimal win by `k` among all `State` instances that have ever been constructed.',
        code: code(`
class State:
    electors = {}
    def __init__(self, code, electors):
        self.code = code
        self.electors = electors
        State.electors[code] = electors

battleground = [State('AZ', 11), State('PA', 20), State('NV', 6),
                State('GA', 16), State('WI', 10), State('MI', 16)]

def is_minimal(state_codes, k):
    """Return whether a non-empty list of state_codes describes a minimal win by
    at least k.

    >>> is_minimal(['AZ', 'NV', 'GA', 'WI'], 0)  # Every state is necessary
    True
    >>> is_minimal(['AZ', 'GA', 'WI'], 0)        # Not a win
    False
    >>> is_minimal(['AZ', 'NV', 'PA', 'WI'], 0)  # NV is not necessary
    False
    >>> is_minimal(['AZ', 'PA', 'WI'], 0)        # Every state is necessary
    True
    """
    assert state_codes, 'state_codes must not be empty'
    votes_in_favor = ⟦a⟧
    total_possible_votes = sum(⟦b⟧)
    def win_margin(n):
        "Margin of victory if n votes are in favor and the rest are against."
        return n - (total_possible_votes - n)
    if win_margin(sum(votes_in_favor)) < k:
        return False  # Not a win
    in_favor_no_smallest = ⟦c⟧
    return win_margin(in_favor_no_smallest) < k
`),
      },
      'fa20f-4a': {
        exam: 'fa20f', number: '4(a)', title: 'Last Lecture AMA — related', points: 6,
        intro: FA20_LLAMAS + '\n\nImplement `related`, which takes two strings `a` and `b` that are names, as well as a list of `offspring_trees` for the originals. It returns whether `a` and `b` are related. That is, they either share a common ancestor or one is an ancestor of the other.',
        illustration: FA20_LLAMA_FIG,
        code: code(`
def related(a, b, offspring_trees):
    """Return whether the llamas named a and b are related.

    >>> related('Charlie', 'Max', originals)  # Grandparent
    True
    >>> related('Jules', 'Jackie', originals)  # Not related, even though they have child
    False
    >>> related('Max', 'Jules', originals)     # Both descend from Charlie and Frankie
    True
    >>> related('Max', 'Jess', originals)      # Both descend from Charlie and Finley
    True
    """
    def family(t):
        """Return a list of the names of all llamas in Tree t."""
        result = ⟦a⟧
        for b in t.branches:
            result.⟦b⟧(⟦c⟧)
        return result
    for s in ⟦d⟧:
        if a in s and b in s:
            return True
    return False
`),
      },
      'fa20f-4b': {
        exam: 'fa20f', number: '4(b)', title: 'Last Lecture AMA — parents', points: 8,
        intro: FA20_LLAMAS + '\n\nImplement `parents`, which takes two strings `a` and `b` that are names of llamas, as well as a list of `offspring_trees` for the originals. It returns whether `a` and `b` are both parents of the same child.',
        illustration: FA20_LLAMA_FIG,
        code: code(`
def parents(a, b, offspring_trees):
    """Return whether a and b are both parents of the same child.

    >>> parents('Jules', 'Jackie', originals)  # Parents of Alex
    True
    >>> parents('Jules', 'Finley', originals)  # Parents of Jess
    True
    >>> parents('Jules', 'Jaidyn', originals)
    False
    >>> parents('Jules', 'Sidney', originals)
    False
    """
    storage = {}
    def traverse(t):
        for b in ⟦a⟧:
            if ⟦b⟧:
                storage[b.label] = []
            storage[b.label].⟦c⟧
            ⟦d⟧
    for t in ⟦e⟧:
        traverse(t)
    return ⟦f⟧([a in s and b in s for s in storage.⟦g⟧])
`),
      },
      'fa20f-4c': {
        exam: 'fa20f', number: '4(c)', title: 'Last Lecture AMA — multigenerational (SQL)', points: 6, lang: 'sql',
        intro: '**Definition.** A llama `p` is *multigenerational* if it has a child whose other parent is also a parent of `p`’s grandchild. For example:\n\n- Finley has a child Jess whose other parent Jules is also a parent of Alex, which is Finley’s grandchild.\n- Frankie has a child Jan whose other parent Finley is also a parent of Jess, which is Frankie’s grandchild.\n\n**Hint:** In the diagram, the labels a through e correspond to the five joined tables in the query and are meant to help you.\n\nThe `family` table has one row per arrow in the llama diagram: a `parent` and a `child`. Complete a query that selects a one-column table with the name of each multigenerational llama. The result has two rows: Finley and Frankie.',
        illustration: { src: 'assets/fa20-final-q4c.png', width: 696, height: 800, alt: 'From the exam: the llama diagram twice, with arrows labeled a to e. Top: Finley to Jackie (a), Jackie to Alex (b), Jules to Alex (c), Finley to Jess (d), Jules to Jess (e). Bottom: Frankie to Jules (a), Jules to Jess (b), Finley to Jess (c), Frankie to Jan (d), Finley to Jan (e).' },
        sqlSetup: FA20_FAMILY,
        code: code(`
SELECT a.parent FROM family AS a, family AS b, family AS c, family AS d, family AS e
  WHERE ⟦u⟧ AND ⟦v⟧ AND ⟦w⟧ AND ⟦x⟧ AND ⟦y⟧ AND ⟦z⟧;
`),
      },
      'fa20f-5a': {
        exam: 'fa20f', number: '5(a)', title: 'SchemeQL — cons', points: 4,
        intro: 'Implement the procedure `cons` that behaves just like the built-in `cons` when called on a value `x` and a (possibly empty) list `s`. You may not write `cons` in your solution.',
        code: code(`
(define (cons x s) ( ⟦a⟧ ⟦b⟧ ⟦c⟧ ))
`),
      },
      'fa20f-5b': {
        exam: 'fa20f', number: '5(b)', title: 'SchemeQL — join', points: 6,
        intro: 'The `join` procedure takes two lists of lists `s` and `t`. It returns a list of lists that has one element for each possible pairing of an element of `s` with an element of `t`. Each element of the result is a list that has all the elements of a list from `s` followed by all the elements of a list from `t`.',
        code: code(`
;;; scm> (define instructors '((john 61a) (hany 61a) (josh 61b)))
;;; scm> (define grades '((a b) (c d)))
;;; scm> (join instructors grades)
;;; ((john 61a a b) (john 61a c d) (hany 61a a b) (hany 61a c d) (josh 61b a b) (josh 61b c d))
(define (join s t)
  (if (null? s) nil
      (⟦a⟧ (⟦b⟧ (lambda (v) (⟦c⟧ ⟦d⟧ ⟦e⟧)) t)
           (join ⟦f⟧ t))))
`),
      },
    },
    questions: [
      { id: 'fa20f-1a', problem: 'fa20f-1', label: '(a)', points: 1, topics: ['env', 'lists'], difficulty: 'medium', blank: 'a',
        type: 'multi_select', mono: true, prompt: 'Which of these could fill in blank (a)? **Check all that apply.**',
        choices: ['wing + poe', 'wing.extend(poe)', 'wing.append(poe)', 'list(wing).extend(poe)', 'list(wing).append(poe)'] },
      { id: 'fa20f-1b', problem: 'fa20f-1', label: '(b)', points: 1, topics: ['env', 'lists'], difficulty: 'easy', blank: 'b',
        type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa20f-1c', problem: 'fa20f-1', label: '(c)', points: 1, topics: ['env', 'hof'], difficulty: 'easy', blank: 'c',
        type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (c)?', choices: ['poe', 'poe(droid)', 'poe(wing)', 'poe(b)'] },
      { id: 'fa20f-1d', problem: 'fa20f-1', label: '(d)', points: 3, topics: ['env', 'hof', 'lists'], difficulty: 'hard', blank: 'd',
        type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa20f-2a', problem: 'fa20f-2a', label: 'i.', points: 2, topics: ['hof'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa20f-2b', problem: 'fa20f-2a', label: 'ii.', points: 2, topics: ['fundamentals'], difficulty: 'easy', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa20f-2c', problem: 'fa20f-2a', label: 'iii.', points: 2, topics: ['hof'], difficulty: 'medium', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa20f-2d', problem: 'fa20f-2a', label: 'iv.', points: 1, topics: ['hof'], difficulty: 'easy', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['f', 'g', 'h', 'hailstone', 'up', 'down'] },
      { id: 'fa20f-2e', problem: 'fa20f-2a', label: 'v.', points: 2, topics: ['hof', 'recursion'], difficulty: 'hard', blank: 'e', type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'fa20f-2f', problem: 'fa20f-2b', label: 'i.', points: 2, topics: ['hof', 'lists'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a).' },
      { id: 'fa20f-2g', problem: 'fa20f-2b', label: 'ii.', points: 1, topics: ['hof'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa20f-2h', problem: 'fa20f-2b', label: 'iii.', points: 2, topics: ['hof', 'lists'], difficulty: 'hard', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa20f-2i', problem: 'fa20f-2b', label: 'iv.', points: 1, topics: ['hof'], difficulty: 'easy', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['found = k', 'found = min(k, n)', 'return k', 'return min(k, n)', 'found.append(k)', 'found.append(min(k, n))'] },
      { id: 'fa20f-2j', problem: 'fa20f-2b', label: 'v.', points: 1, topics: ['hof'], difficulty: 'easy', blank: 'e', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (e)?',
        choices: ['found', 'found[0]', 'found[-1]', 'f(m)', 'f(n)', 's', 's[0]', 's[-1]'] },
      { id: 'fa20f-3a', problem: 'fa20f-3a', label: 'i.', points: 2, topics: ['generators', 'recursion'], difficulty: 'medium', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?',
        choices: ['k >= 0', 'k <= 0', 'k == 0', 'not states', 'k >= 0 and not states', 'k <= 0 and not states', 'k == 0 and not states'] },
      { id: 'fa20f-3b', problem: 'fa20f-3a', label: 'ii.', points: 2, topics: ['generators', 'recursion'], difficulty: 'hard', blank: 'b', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (b)?',
        choices: ['k - first', 'k + first', 'k', '-k', '0', 'first', 'min(k, first)', 'max(k, first)'] },
      { id: 'fa20f-3c', problem: 'fa20f-3a', label: 'iii.', points: 2, topics: ['links', 'oop'], difficulty: 'easy', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa20f-3d', problem: 'fa20f-3a', label: 'iv.', points: 2, topics: ['generators', 'recursion'], difficulty: 'hard', blank: 'd', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (d)?',
        choices: ['k - first', 'k + first', 'k', '-k', '0', 'first', 'min(k, first)', 'max(k, first)'] },
      { id: 'fa20f-3e', problem: 'fa20f-3b', label: 'i.', points: 1, topics: ['links'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?',
        choices: ['s is Link.empty', 's is not Link.empty', 'x in s', 'x not in s', 'x == s.first', 'x != s.first'] },
      { id: 'fa20f-3f', problem: 'fa20f-3b', label: 'ii.', points: 2, topics: ['links', 'recursion'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa20f-3g', problem: 'fa20f-3b', label: 'iii.', points: 1, topics: ['oop', 'lists'], difficulty: 'easy', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa20f-3h', problem: 'fa20f-3b', label: 'iv.', points: 1, topics: ['hof'], difficulty: 'easy', blank: 'd', type: 'short_answer', prompt: 'Fill in blank (d) with a single function name.' },
      { id: 'fa20f-3i', problem: 'fa20f-3b', label: 'v.', points: 2, topics: ['links', 'lists'], difficulty: 'medium', blank: 'e', type: 'short_answer', prompt: 'Fill in blank (e).' },
      { id: 'fa20f-3j', problem: 'fa20f-3c', label: 'i.', points: 2, topics: ['oop', 'lists'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a). You may not write `battleground` in your response.' },
      { id: 'fa20f-3k', problem: 'fa20f-3c', label: 'ii.', points: 2, topics: ['oop', 'fundamentals'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b). You may not write `battleground` in your response.' },
      { id: 'fa20f-3l', problem: 'fa20f-3c', label: 'iii.', points: 2, topics: ['lists'], difficulty: 'medium', blank: 'c', type: 'multi_select', mono: true, prompt: 'Which of these could fill in blank (c)? **Check all that apply.** Hint: Two states may have the same number of electors.',
        choices: ['sum(votes_in_favor) - min(votes_in_favor)', 'sum(votes_in_favor - min(votes_in_favor))', 'sum(votes_in_favor - [min(votes_in_favor)])', 'sum(votes_in_favor.remove(min(votes_in_favor)))', 'sum([v for v in votes_in_favor if v > min(votes_in_favor)])'] },
      { id: 'fa20f-4a', problem: 'fa20f-4a', label: 'i.', points: 1, topics: ['trees', 'lists'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?',
        choices: ['[]', '[t]', '[t.label]', 'list(t.branches)', '[b.label for b in t.branches]'] },
      { id: 'fa20f-4b', problem: 'fa20f-4a', label: 'ii.', points: 1, topics: ['lists'], difficulty: 'easy', blank: 'b', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (b)?',
        choices: ['append', 'extend', 'pop', 'remove', 'insert'] },
      { id: 'fa20f-4c', problem: 'fa20f-4a', label: 'iii.', points: 2, topics: ['trees', 'recursion'], difficulty: 'medium', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa20f-4d', problem: 'fa20f-4a', label: 'iv.', points: 2, topics: ['trees', 'hof'], difficulty: 'medium', blank: 'd', type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa20f-4e', problem: 'fa20f-4b', label: 'i.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?',
        choices: ['t.branches', 'b.branches', 'branches(t)', 'branches(b)'] },
      { id: 'fa20f-4f', problem: 'fa20f-4b', label: 'ii.', points: 1, topics: ['fundamentals'], difficulty: 'easy', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa20f-4g', problem: 'fa20f-4b', label: 'iii.', points: 2, topics: ['trees', 'lists'], difficulty: 'medium', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c).' },
      { id: 'fa20f-4h', problem: 'fa20f-4b', label: 'iv.', points: 1, topics: ['trees', 'recursion'], difficulty: 'easy', blank: 'd', type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa20f-4i', problem: 'fa20f-4b', label: 'v.', points: 1, topics: ['trees'], difficulty: 'easy', blank: 'e', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (e)?',
        choices: ['offspring_trees', 'map(traverse, offspring_trees)', 'map(list, offspring_trees)', 'filter(traverse, offspring_trees)', 'filter(list, offspring_trees)'] },
      { id: 'fa20f-4j', problem: 'fa20f-4b', label: 'vi.', points: 1, topics: ['hof'], difficulty: 'easy', blank: 'f', type: 'short_answer', prompt: 'Fill in blank (f) with a single function name.' },
      { id: 'fa20f-4k', problem: 'fa20f-4b', label: 'vii.', points: 1, topics: ['fundamentals'], difficulty: 'easy', blank: 'g', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (g)?',
        choices: ['values()', 'keys()', 'items()', 'copy()'] },
      { id: 'fa20f-4u', problem: 'fa20f-4c', label: 'i.', points: 1, topics: ['sql-joins'], difficulty: 'medium', blank: 'u', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (u)?', choices: ['a.child = b.parent', 'a.parent = b.parent', 'a.child = b.child'] },
      { id: 'fa20f-4v', problem: 'fa20f-4c', label: 'ii.', points: 1, topics: ['sql-joins'], difficulty: 'medium', blank: 'v', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (v)?', choices: ['b.parent = c.parent', 'b.parent != c.parent', 'b.parent = c.child', 'b.parent != c.child'] },
      { id: 'fa20f-4w', problem: 'fa20f-4c', label: 'iii.', points: 1, topics: ['sql-joins'], difficulty: 'medium', blank: 'w', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (w)?', choices: ['b.child = c.child', 'b.child != c.child', 'b.child < c.child'] },
      { id: 'fa20f-4x', problem: 'fa20f-4c', label: 'iv.', points: 1, topics: ['sql-joins'], difficulty: 'medium', blank: 'x', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (x)?', choices: ['a.parent = d.parent', 'a.parent = d.child', 'a.parent != d.parent', 'a.parent != d.child'] },
      { id: 'fa20f-4y', problem: 'fa20f-4c', label: 'v.', points: 1, topics: ['sql-joins'], difficulty: 'medium', blank: 'y', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (y)?', choices: ['c.parent = e.parent', 'c.parent = e.child', 'c.parent != e.parent', 'c.parent != e.child'] },
      { id: 'fa20f-4z', problem: 'fa20f-4c', label: 'vi.', points: 1, topics: ['sql-joins'], difficulty: 'medium', blank: 'z', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (z)?', choices: ['d.child = e.parent', 'd.child = e.child', 'd.child != e.parent', 'd.child != e.child'] },
      { id: 'fa20f-5a', problem: 'fa20f-5a', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'a', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (a)?', choices: ['list', 'append', 'if', 'map', 'lambda'] },
      { id: 'fa20f-5b', problem: 'fa20f-5a', label: 'ii.', points: 2, topics: ['scheme'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b).' },
      { id: 'fa20f-5c', problem: 'fa20f-5a', label: 'iii.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'c', type: 'multi_select', mono: true, prompt: 'Which of these could fill in blank (c)? **Check all that apply.**', choices: ['s', '(cdr s)', '(car s)', '(list s)'] },
      { id: 'fa20f-5d', problem: 'fa20f-5b', label: 'i.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'a', type: 'short_answer', prompt: 'Fill in blank (a) with a single procedure name or symbol.' },
      { id: 'fa20f-5e', problem: 'fa20f-5b', label: 'ii.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'b', type: 'short_answer', prompt: 'Fill in blank (b) with a single procedure name or symbol.' },
      { id: 'fa20f-5f', problem: 'fa20f-5b', label: 'iii.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'c', type: 'short_answer', prompt: 'Fill in blank (c) with a single procedure name or symbol.' },
      { id: 'fa20f-5g', problem: 'fa20f-5b', label: 'iv.', points: 1, topics: ['scheme'], difficulty: 'medium', blank: 'd', type: 'short_answer', prompt: 'Fill in blank (d).' },
      { id: 'fa20f-5h', problem: 'fa20f-5b', label: 'v.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'e', type: 'single_choice', mono: true, prompt: 'Which of these could fill in blank (e)?', choices: ['s', 't', 'v'] },
      { id: 'fa20f-5i', problem: 'fa20f-5b', label: 'vi.', points: 1, topics: ['scheme'], difficulty: 'easy', blank: 'f', type: 'short_answer', prompt: 'Fill in blank (f).' },
    ],
    answers: {
      'fa20f-1a': { correct: [0], explanation: 'f2’s return value is a new list `[1, [8], 8]`: `wing + poe` builds it without changing `wing`. The other options mutate a list or return `None`.' },
      'fa20f-1b': { accepted: ['droid'], explanation: '`wing`’s second element is the list `droid`.' },
      'fa20f-1c': { correct: 0, explanation: '`x` returns the lambda itself, which is bound to `b`.' },
      'fa20f-1d': { accepted: ['b([b([8])])'], explanation: 'Two calls to the lambda: f2 gets a new list `[8]` and f3 gets a list containing the result of the first call.' },
      'fa20f-2a': { accepted: ['lambda n, f: 1'], explanation: 'At 1 the sequence ends, so the length from here is 1 (like `up`/`down`, `h` takes `n` and `f`).' },
      'fa20f-2b': { accepted: ['n % 2 == 1', 'n % 2', 'n % 2 != 0', 'not n % 2 == 0'], explanation: 'Odd numbers go up.' },
      'fa20f-2c': { accepted: ['g(n)'], explanation: 'Call `g` on this element.' },
      'fa20f-2d': { correct: 2, explanation: '`h` is `up`, `down`, or the function for 1.' },
      'fa20f-2e': { accepted: ['lambda n: hailstone(n, g)', 'lambda x: hailstone(x, g)', 'lambda k: hailstone(k, g)'], explanation: '`h` calls this on the next number: continue the sequence from there, still calling `g`.' },
      'fa20f-2f': { accepted: ['s.append'], explanation: 'Collect the sequence from `m` in `s`.' },
      'fa20f-2g': { accepted: ['nonlocal found'], explanation: '`f` assigns `found`, which belongs to `collide`’s frame.' },
      'fa20f-2h': { accepted: ['found is None and k in s', 'k in s and found is None', 'not found and k in s', 'found == None and k in s'], explanation: 'Record only the first element of `n`’s sequence that is also in `m`’s.' },
      'fa20f-2i': { correct: 0, explanation: 'Remember it.' },
      'fa20f-2j': { correct: 0, explanation: 'Return what was found.' },
      'fa20f-3a': { correct: 5, explanation: 'With no states left, the empty set is a win when the remaining margin needed is at most 0.' },
      'fa20f-3b': { correct: 0, explanation: 'Winning the first state counts its electors toward the margin.' },
      'fa20f-3c': { accepted: ['states[0].code'], explanation: 'Put the first state’s code in front of each such win.' },
      'fa20f-3d': { correct: 1, explanation: 'Losing the first state means the others must make up its electors as well.' },
      'fa20f-3e': { correct: 1, explanation: 'An empty list contains nothing.' },
      'fa20f-3f': { accepted: ['s.first == x or contains(s.rest, x)', 'x == s.first or contains(s.rest, x)'], explanation: 'Either it is the first element or it is in the rest.' },
      'fa20f-3g': { accepted: ['s.code'], explanation: 'The state’s code.' },
      'fa20f-3h': { accepted: ['all'], explanation: 'A state that must be won is in every win.' },
      'fa20f-3i': { accepted: ['contains(w, s.code)'], explanation: 'Whether this win includes the state.' },
      'fa20f-3j': { accepted: ['[State.electors[s] for s in state_codes]', '[State.electors[c] for c in state_codes]', 'list(map(lambda s: State.electors[s], state_codes))'], explanation: 'Look up each named state’s electors in the class-level dictionary.' },
      'fa20f-3k': { accepted: ['State.electors.values()', 'list(State.electors.values())', '[State.electors[s] for s in State.electors]'], explanation: 'Every state ever constructed is in `State.electors`.' },
      'fa20f-3l': { correct: [0], explanation: 'A list minus a number is an error, `remove` returns `None`, and dropping every copy of the minimum is wrong when two states tie. Removing the smallest state’s votes once is right: if it is still a win without the smallest state, some state isn’t necessary.' },
      'fa20f-4a': { correct: 2, explanation: 'The family list holds names, starting with this llama’s.' },
      'fa20f-4b': { correct: 1, explanation: 'Add every name from the branch’s family.' },
      'fa20f-4c': { accepted: ['family(b)'], explanation: 'The names in each branch’s tree.' },
      'fa20f-4d': { accepted: ['map(family, offspring_trees)', '[family(t) for t in offspring_trees]', 'list(map(family, offspring_trees))'], explanation: 'Two llamas are related exactly when they are both in some original’s family.' },
      'fa20f-4e': { correct: 0, explanation: 'Visit each child.' },
      'fa20f-4f': { accepted: ['b.label not in storage', 'not b.label in storage'], explanation: 'Start an empty list of parents the first time a child is seen.' },
      'fa20f-4g': { accepted: ['append(t.label)'], explanation: 'Record `t` as one of the child’s parents.' },
      'fa20f-4h': { accepted: ['traverse(b)'], explanation: 'Then visit the child’s own children.' },
      'fa20f-4i': { correct: 0, explanation: 'Traverse every original’s tree.' },
      'fa20f-4j': { accepted: ['any'], explanation: 'Some child has both as parents.' },
      'fa20f-4k': { correct: 0, explanation: 'The lists of parents.' },
      'fa20f-4u': { correct: 0, explanation: 'Edge a goes from the llama p to its child, and edge b from that child to p’s grandchild.' },
      'fa20f-4v': { correct: 1, explanation: 'Edge c comes from a different parent of the grandchild…' },
      'fa20f-4w': { correct: 0, explanation: '…and ends at the same grandchild as edge b.' },
      'fa20f-4x': { correct: 0, explanation: 'Edge d goes from p to a child of p…' },
      'fa20f-4y': { correct: 0, explanation: '…and edge e comes from that other parent (the start of edge c)…' },
      'fa20f-4z': { correct: 1, explanation: '…to the same child as edge d, so p has a child whose other parent is also a parent of p’s grandchild.' },
      'fa20f-5a': { correct: 1, explanation: 'Join two lists.' },
      'fa20f-5b': { accepted: ['(list x)'], explanation: 'A one-element list with `x`.' },
      'fa20f-5c': { correct: [0], explanation: 'Followed by all of `s`.' },
      'fa20f-5d': { accepted: ['append'], explanation: 'Join the results for the first list with the rest.' },
      'fa20f-5e': { accepted: ['map'], explanation: 'Pair the first list of `s` with every list of `t`.' },
      'fa20f-5f': { accepted: ['append'], explanation: 'Join the two lists.' },
      'fa20f-5g': { accepted: ['(car s)'], explanation: 'The first list of `s`…' },
      'fa20f-5h': { correct: 2, explanation: '…followed by the list from `t`.' },
      'fa20f-5i': { accepted: ['(cdr s)'], explanation: 'The rest of `s`.' },
    },
  });
})();
