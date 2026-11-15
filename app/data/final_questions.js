// Past CS 61A FINAL exams, added to the question bank in questions.js (load this file right after it).
//
// Content source: CS 61A Final of Fall 2025 and Spring 2025 (exam + official solutions, final/ in the repo),
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

  // complete: every question of the PDF is transcribed. Both total 75 points (A+ questions are 0 points).
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
})();
