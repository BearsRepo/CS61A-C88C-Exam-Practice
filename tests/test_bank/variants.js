// Plausible wrong answers used to validate the verified test suites (app/data/test_suites.js).
// Each variant replaces some blanks of the official solution; the suite must FAIL for every one.
// Wrong multiple-choice options and multi-select subsets are generated automatically by the verifier, and every
// accepted alternative answer must PASS, so neither is listed here.
// `alternatives` are other correct answers (not in the answer key) that the suite must also accept.
module.exports = {
  'fa25-3': {
    wrong: [
      { b: 'includes(whole.branches[w], part.branches[p])' },
      { b: 'part.branches[p] == whole.branches[w]' },
      { b: 'part.branches[p].label == whole.branches[w].label' },
      { c: 'p == len(whole.branches)' },
      { c: 'w == len(whole.branches)' },
      { c: 'True' },
      { c: 'p > 0' },
    ],
  },
  'fa25-4': {
    wrong: [
      { a: 's' },
      { a: '[y for y in s if y is not x]' },
      { a: 'list(set(s) - {x})' },
      { a: '[y for y in s if y != x][1:]' },
      { a: 's.remove(x) or s' },
      { b: 's.rest is Link.empty' },
      { c: 'None' },
      { d: 's.first != x' },
      { e: 's.rest' },
      { f: 's' },
      { f: 'Link(s.first, s.rest)' },
      { f: 'exclude_link(s.rest, x)' },
      { b: 's is None', c: 's' },
    ],
    alternatives: [
      { a: 'list(filter(lambda e: e != x, s))' },
      { a: '[s[i] for i in range(len(s)) if s[i] != x]' },
      { d: 'not s.first != x' },
    ],
  },
  'fa25-5': {
    wrong: [
      { c: 'self.cook(self.pizzas)' },
      { c: 'Parlor.cook(self, quantity)' },
      { c: 'quantity - self.pizzas' },
      { d: 'rest * self.price' },
      { d: 'self.alt.price' },
      { e: 'self.alt.order(rest)' },
      { e: 'self.alt.order(quantity, self)' },
      { e: 'self.alt.cook(rest)' },
      { f: 'q' },
      { f: 'None' },
    ],
  },
  'fa25-6a': { wrong: [] },
  'fa25-6b': {
    wrong: [
      { d: 'True' },
      { d: 'disallow.get(slice) == pizza[0]' },
      { d: 'pizza[0] != pizza[-1]' },
      { d: 'disallow.get(previous) != slice' },
      { d: 'disallow.get(pizza[0]) != pizza[1]' },
      { d: 'slice != pizza[0]' },
    ],
  },
  'fa25-6c': {
    wrong: [
      { e: 'n == num_slices - 1' },
      { e: 'n > num_slices' },
      { e: 'num_slices == 1' },
      { h: 'f(n+1, x, x)' },
      { h: 'f(n+1, first, previous)' },
      { h: 'f(n, first, x)' },
    ],
  },
  'fa25-6d': {
    wrong: [
      { i: '[]' },
      { i: '""' },
      { j: "['_' + x for x in pizzas(n-1)]" },
      { j: "['_' for x in recurse]" },
      { j: "[x + '_' for x in recurse]" },
      { l: 'x[0] == z' },
      { l: 'x[-1] != z' },
      { m: 'filter(ok, ways)' },
      { m: 'list(ways)' },
      { m: 'list(map(ok, ways))' },
    ],
    alternatives: [
      { j: "list(map(lambda x: '_' + x, recurse))" },
    ],
  },
  'fa25-6aplus': {
    wrong: [
      { 'A+': 'filter(lambda p: len(p) == n, g(slices)), range(count_pizzas(n))' },
      { 'A+': 'filter(lambda p: acceptable(p), g(slices)), range(count_pizzas(n))' },
      { 'A+': 'filter(lambda p: len(p) == n and acceptable(p), g(slices)), range(n)' },
      { 'A+': 'g(slices), range(count_pizzas(n))' },
    ],
    alternatives: [
      { 'A+': '(p for p in g(slices) if len(p) == n and acceptable(p)), range(count_pizzas(n))' },
    ],
  },
  'sp25-3a': {
    wrong: [
      { b: 'Event(start, length)' },
      { b: 'Event(self.start, self.start + length)' },
      { b: 'Event(start, self.end)' },
      { b: 'Event(start + length, start)' },
    ],
  },
  'sp25-4a': {
    wrong: [
      { a: 'y+1 for y in below' },
      { a: 'y for y in below if y is not None' },
      { a: 'y+1 for y in below if y' },
      { a: '1 for y in below if y is not None' },
      { c: 'append(1)' },
      { c: 'extend(0)' },
      { c: 'insert(0)' },
    ],
  },
  'sp25-4b': {
    wrong: [
      { d: 'result[depth]' },
      { d: 'result[node]' },
      { g: 'visit(b, depth)' },
      { g: 'visit(node, depth + 1)' },
    ],
  },
  'sp25-5a': {
    wrong: [
      { b: 's.first * muladd(s.rest)' },
      { b: 's.first * s.rest.first + muladd(s.rest)' },
      { b: 's.first * (s.rest.first + muladd(s.rest.rest))' },
      { b: 's.first + s.rest.first * muladd(s.rest.rest)' },
      { b: 's.first * s.rest.first' },
    ],
  },
  'sp25-5b': {
    wrong: [
      { e: 'f(left, n - 1)' },
      { e: 'f(k - 1, n - 1)' },
      { e: 'f(left - 1, n)' },
    ],
  },
  'sp25-5c': {
    wrong: [
      { f: 'close(s[i:], x)' },
      { f: 'close(s[i+1:], x - product(s[:i]))' },
      { f: 'close(s[i:], x + product(s[:i]))' },
      { f: 'product(s[i:])' },
      { f: 'close(s[:i], x - product(s[i:]))' },
    ],
  },
  'sp25-5d': {
    wrong: [
      { 'A+': "'+' + close_exp(s[i+1:], x)" },
      { 'A+': "'+' + close_exp(s[i:], x - eval(term))" },
      { 'A+': "'*' + close_exp(s[i+1:], x - eval(term))" },
      { 'A+': "'+' + str(close(s[i+1:], x - eval(term)))" },
    ],
  },

  // ── Fall 2024 Midterm 2 ──
  'fa24-3': {
    wrong: [
      { b: 'b.inventory.count(s)' },
      { b: 'len(b.inventory)' },
      { b: 'b.copies(p)' },
      { b: 'copies(b, s)' },
      { c: 'self.branches[k].inventory' },
      { c: 'self.inventory.append' },
      { c: 'self.branches[k].append' },
      { c: 'self.branches[k].inventory.append(s)' },
      { c: 'lambda s: self.branches[k].inventory + [s]' },
    ],
  },
  'fa24-4a': {
    wrong: [
      { c: 'd' },
      { c: 's + d' },
      { c: 'n - d' },
      { c: 's - 1' },
      { d: 'False' },
      { d: 'f(s - d, d + 1)' },
      { d: 'f(n, d + 1)' },
      { d: 'f(s, d)' },
    ],
  },
  'fa24-4b': {
    wrong: [
      { f: 'subsums(s[1:], n)' },
      { f: 'subsums(s[1:], n - 1)' },
      { f: 'subsums(s[1:], s[0] - n)' },
      { f: 'subsums(s[:1], n - s[0])' },
      { f: 'subsums(s, n - s[0])' },
    ],
  },
  'fa24-4c': {
    wrong: [
      { k: 'n - 1' },
      { k: '0' },
      { k: 'k' },
      { l: 'lambda k: n % k == 0, range(1, n + 1)' },
      { l: 'lambda k: n % k == 0, range(n)' },
      { l: 'lambda k: n % k, range(1, n)' },
      { l: 'lambda k: k % n == 0, range(1, n)' },
      { l: 'semiperfect, range(1, n)' },
    ],
    alternatives: [
      { l: 'lambda k: not n % k, range(1, n)' },
      { l: 'lambda d: n % d == 0, range(2, n)' },  // 1 is never semiperfect
    ],
  },
  'fa24-5a': {
    wrong: [
      { a: 'b is Link.empty' },
      { a: 'a.rest is Link.empty' },
      { a: 'a is not Link.empty' },
      { a: 'a == b' },
      { a: 'False' },
    ],
    alternatives: [
      { a: 'not a' },
    ],
  },
  'fa24-5b': {
    wrong: [
      { f: 's.first < n' },
      { f: 'n > 0' },
      { f: 's.first >= n' },
      { f: 's.rest is not Link.empty' },
      { g: 'Link(s.first, t)' },
      { g: 'Link(s.first, longest(s.rest, n))' },
      { g: 'longest(s.rest, n - s.first)' },
      { g: 's' },
    ],
    alternatives: [
      { f: 'n - s.first >= 0' },
    ],
  },
  'fa24-6': {
    wrong: [
      { 'A+': 'g(x + [b.label])' },
      { 'A+': 'g(x + max_path(b, g))' },
      { 'A+': 'g(max_path(b, g))' },
      { 'A+': 'max_path(b, g)' },
    ],
    alternatives: [
      { 'A+': 'g([t.label] + max_path(b, lambda p: g([t.label] + p)))' },
    ],
  },

  // ── Spring 2024 Midterm 2 ──
  'sp24-3': {
    wrong: [
      { a: '{}' },
      { a: "{'Front': Speaker}" },
      { a: "{'Front': lambda x: x}" },
      { a: "{'Front': Speaker(str.lower)}" },
      { c: 'm.speakers[location] = self.transform' },
      { c: 'self.speakers[location] = self' },
      { c: 'm.speakers = {location: self}' },
      { c: "m.speakers['location'] = self" },
      { c: 'm.speakers[self] = location' },
    ],
    alternatives: [
      { a: 'dict(Front=Speaker(lambda x: x))' },
      { c: 'm.speakers.update({location: self})' },
    ],
  },
  'sp24-4a': {
    wrong: [
      { b: 's[0] + 1' },
      { b: '0' },
      { b: 's[-1]' },
      { b: 'len(s)' },
    ],
    alternatives: [
      { b: 'min(s)' },
    ],
  },
  'sp24-4c': {
    wrong: [
      { a: 'longest_with_s0(s[1:])' },
      { a: 'longest(s)' },
      { a: 's[1:]' },
      { a: 'longest(s[:-1])' },
      { d: 'k == result[0] + 1' },
      { d: 'k > result[-1]' },
      { d: 'k == s[0] + 1' },
      { d: 'k - 1 in result' },
    ],
    alternatives: [
      { d: 'k - result[-1] == 1' },
    ],
  },
  'sp24-4d': {
    wrong: [
      { b: 'b.label == t.label + 1' },
      { b: 'has_strip(b)' },
      { b: 'b.label == t.label + 1 or has_strip(b)' },
      { b: 't.label == b.label + 1 and has_strip(b)' },
      { b: 'b.label == t.label + 1 and is_strip(b)' },
    ],
    alternatives: [
      { b: 'has_strip(b) and b.label - t.label == 1' },
    ],
  },
  'sp24-4e': { wrong: [] },  // every blank is multiple choice; all wrong options are generated
  'sp24-4aplus': {
    wrong: [
      { 'A+': 'has_strip(b)' },
      { 'A+': 't.label + 1 == b.label' },
      { 'A+': 'has_strip(b) and t.label + 1 == b.label' },
      { 'A+': 'only_strips(b) or has_strip(b)' },
    ],
    alternatives: [
      { 'A+': 't.label + 1 == b.label and has_strip(b) and not only_strips(b)' },
    ],
  },

  // ── Fall 2023 Midterm 2 ──
  'fa23-3': {
    wrong: [
      { b: 'self.books[0]' },
      { b: 'title' },
      { b: 'Book(title, self)' },
      { b: 'self.books' },
    ],
    alternatives: [
      { b: "self.books.get(title, None)" },
    ],
  },
  'fa23-4b': {
    wrong: [
      { d: 'k * k' },
      { d: '[k]' },
      { d: '[total, k]' },
      { e: 'squares(total - k * k, k + 1)' },
      { e: 'squares(total, k)' },
      { e: 'squares(total - k, k)' },
      { e: 'squares(k * k, k)' },
    ],
  },
  'fa23-5': {
    wrong: [
      { a: 't.is_leaf()' },
      { a: 'n == t.label' },
      { a: 't.is_leaf() and n == 0' },
      { b: 'only_paths(b, n)' },
      { b: 'only_paths(b, n - b.label)' },
      { b: 'b' },
    ],
    alternatives: [
      { a: 'not t.branches and t.label == n' },
    ],
  },
  'fa23-6': {
    wrong: [
      { b: 'True' },
      { b: 'find(rest, b, lambda rest: False)' },
      { b: 'find(s, b, lambda rest: True)' },
      { b: 'rest.first == b' },
      { b: 'find(rest, a, lambda rest: True)' },
    ],
  },

  // ── Spring 2023 Midterm 2 ──
  'sp23-2a': {
    wrong: [
      { a: 'self.sent = True' },
      { a: 'sent = False' },
      { b: 'self.sent = False' },
      { b: 'sent = True' },
      { c: 'self.contents.upper()' },
      { c: 'Letter(self.contents)' },
      { c: 'self' },
    ],
    alternatives: [
      { c: 'type(self)(self.contents.upper())' },
    ],
  },
  'sp23-3a': {
    wrong: [
      { a: 'sum(s[:k])' },
      { a: 's[k]' },
      { a: 'sum(s[k:])' },
      { a: 'sum(s[:k+2])' },
    ],
    alternatives: [
      { a: 'sum(s[0:k+1])' },
    ],
  },
  'sp23-3b': {
    wrong: [
      { e: 'f(suffix.rest, total)' },
      { e: 'f(suffix, total + suffix.first)' },
      { e: 'f(suffix.rest, suffix.first)' },
      { f: 'f(s, 0)' },
      { f: 'f(s.rest, 0)' },
      { f: 'f(s, s.first)' },
    ],
  },
  'sp23-4a': {
    wrong: [
      { a: 'y' },
      { a: 'exclude(y, y.label)' },
      { a: 'exclude(t, x)' },
      { b: 'b.label != x' },
      { b: 't.label == x' },
      { b: 'False' },
    ],
  },
  'sp23-4b': {
    wrong: [
      { e: 't = exclude(t, x)' },
      { e: 'exclude(t, x)' },
      { e: 't.branches = exclude(t, x)' },
      { e: 't.branches = [exclude(b, x) for b in t.branches]' },
    ],
    alternatives: [
      { e: 't.branches[:] = exclude(t, x).branches' },
    ],
  },
  'sp23-5a': {
    wrong: [
      { a: '0' },
      { b: 'count_park(n-1) + count_park(n-2)' },
      { b: '2 * count_park(n-1) + 2 * count_park(n-2)' },
      { b: '3 * count_park(n-1)' },
      { b: '2 * count_park(n-1)' },
    ],
  },
  'sp23-5b': {
    wrong: [
      { 'c, d': "yield s + '.'" },
      { 'c, d': "yield s + '.'\nyield s + '.'" },
      { 'c, d': "yield s + '.'\nyield s + '<>'" },
      { e: 'park(n-1)' },
      { e: 'park(n)' },
      { f: "yield s + '%'" },
      { f: "yield '<>' + s + '<>'" },
    ],
    alternatives: [
      { 'c, d': "yield '.' + s\nyield '%' + s", f: "yield '<>' + s" },  // prepending works only if (f) prepends too
    ],
  },
  'sp23-5aplus': {
    wrong: [
      { 'A+': '(yes + s for s in f(n, k))' },
      { 'A+': '(yes + s for s in f(n, k) if s[0] != no)' },
      { 'A+': '(no + s for s in f(n, k) if not s or s[0] != no)' },
    ],
  },
  // ───────────── Finals ─────────────
  'fa25f-3a': {
    wrong: [
      { b: 'number and x in' },
      { b: 'x in' },
      { b: 'not number or x in' },
      { c: 'equals == 1' },
      { c: 'not number' },
      { c: 'number and equals == 1' },
      { c: 'not number and equals >= 1' },
      { c: 'True' },
    ],
  },
  'fa25f-3b': {
    wrong: [
      { e: 'x = next(eq)' },
      { e: 'next(ans)' },
      { e: 'x = ans[0]' },
      { e: 'x = 0' },
      { g: "{'+': -1, '-': 1}" },
      { g: "{'+': 1, '-': 1}" },
    ],
  },
  'fa25f-3c': {
    wrong: [
      { h: 'True' },
      { h: 'False' },
      { h: 'evaluate(eq, [0])' },
      { j: 'feasible(eq[:n] + [x] + eq[n:], allowed)' },
      { j: 'feasible(eq[:n] + [x] + eq[n+1:])' },
      { j: 'evaluate(eq[:n] + [x] + eq[n+1:], [])' },
      { j: 'feasible(eq[n+1:], allowed)' },
      { j: 'feasible(eq[:n] + eq[n+1:], allowed)' },
    ],
    alternatives: [
      { j: 'feasible(eq[:n] + [x] + eq[n + 1:], allowed)' },
      { j: 'feasible(list(eq[:n]) + [x] + list(eq[n+1:]), allowed)' },
    ],
  },
  'fa25f-3d': {
    wrong: [
      { n: 'lambda a: evaluate(a, equation)' },
      { n: 'evaluate(equation, a)' },
      { n: 'lambda a: feasible(equation, a)' },
      { n: 'lambda a: True' },
      { n: 'lambda a: is_equation(equation)' },
    ],
    alternatives: [
      { n: 'lambda answers: evaluate(equation, list(answers))' },
    ],
  },
  'fa25f-4a': {
    wrong: [
      { b: 't.label' },
      { b: 'sum([result[b] for b in t.branches])' },
      { b: 't.label + len(t.branches)' },
      { b: 't.label + sum([b.label for b in t.branches])' },
    ],
    alternatives: [
      { b: 't.label + sum([sums(b)[b] for b in t.branches])' },
      { b: 'sum([result[b] for b in t.branches] + [t.label])' },
    ],
  },
  'fa25f-4b': {
    wrong: [
      { c: 'abs(n - d[node])' },
      { c: 'n - (total - d[node])' },
      { c: 'abs(total - n)' },
      { c: 'd[node]' },
    ],
  },
  'fa25f-6a': {
    wrong: [
      { b: 't = s.rest' },
      { c: 's == t' },
      { c: 's.first == t.rest.first' },
      { c: 's.first != t.first' },
      { d: 't = t.rest' },
      { d: 's, t = t, t.rest' },
      { d: 's = s.rest' },
    ],
    alternatives: [
      { d: 's = s.rest\nt = t.rest' },
    ],
  },
  'fa25f-7': {
    wrong: [
      { b: 'self.groups' },
      { b: 'DiscGroup.groups[1:]' },
      { e: 'self.group.students = [self]' },
      { e: 'self.group.students + [self]' },
      { f: 'len(DiscGroup.groups) + 1' },
      { f: '0' },
      { g: 'DiscGroup.groups = [self]' },
      { g: 'self.groups = self.groups + [self]' },
    ],
  },
  'fa25f-9b': {
    wrong: [
      { 'A+': 'one_cut(one_cut(t, n), n)' },
      { 'A+': 'one_cut(t, n)' },
      { 'A+': 'min([one_cut(one_cut(t, k), n) for k in range(g(t))], key=g)' },
      { 'A+': 'min([one_cut(t, k) for k in range(g(t))], key=lambda t: abs(n - g(t)))' },
    ],
  },
  'sp25f-3': {
    wrong: [
      { b: 's[u]' },
      { b: 's[t]' },
      { b: 's[i]' },
      { b: 's[t - u + i]' },
    ],
    alternatives: [
      { b: 's[u] if i == t else s[t]' },
    ],
  },
  'sp25f-4a': {
    wrong: [
      { c: 'append(offspring(b, x))' },
      { c: 'extend(b.branches)' },
      { c: 'extend([b.label for b in b.branches])' },
    ],
    alternatives: [
      { c: 'extend(sorted(offspring(b, x)))' },
    ],
  },
  'sp25f-5': {
    wrong: [
      { b: 'self.where[p] = len(self.where) + 1' },
      { b: 'self.where[p] = len(folks)' },
      { b: 'self.where[p] = 0' },
      { c: 'self.boat.where[self.name]' },
      { c: 'len(self.boat.where)' },
      { f: 'self.name' },
      { f: 'Captain.claimed[boat]' },
    ],
  },
  'sp25f-6a': {
    wrong: [
      { d: 'digits[:k]' },
      { d: 'digits[k+1:]' },
      { e: 'int(digits[k:])' },
      { e: 'int(digits[0])' },
      { e: 'digits[:k]' },
    ],
  },
  'sp25f-6b': {
    wrong: [],
  },
  'sp25f-6c': {
    wrong: [
      { i: 'int(digits.first)' },
      { i: 'first + int(digits.first)' },
      { i: 'first * 10 + digits.first' },
      { j: 'digits.rest' },
      { j: 'join_link(digits)' },
    ],
  },
  'sp25f-9a': {
    wrong: [
      { 'A+': 's[x]' },
      { 'A+': 's[{t: u}.get(x, x)]' },
      { 'A+': '{t: s[u], u: s[t]}.get(x)' },
    ],
    alternatives: [
      { 'A+': '{t: s[u], u: s[t]}.get(x, s[x])' },
      { 'A+': 's[{u: t, t: u}.get(x, x)]' },
    ],
  },
  'sp25f-9b': {
    wrong: [
      { 'A+': 'next(f(digits))' },
      { 'A+': 'filter(lambda x: eval(x) == n, f(digits))' },
      { 'A+': 'next(filter(lambda x: eval(x) != n, f(digits)))' },
    ],
  },
  'fa24f-3': {
    wrong: [
      { j: '10' },
      { j: 't - 10 + x' },
      { j: 'x' },
    ],
  },
  'fa24f-4a': {
    wrong: [
      { a: 'self.count = 1' },
      { a: 'count = 0' },
    ],
  },
  'fa24f-5a': { wrong: [] },
  'fa24f-5b': {
    wrong: [
      { e: 's[1:]' },
      { e: 'promote(s, 0, j)' },
      { e: 's[:j] + s[j:]' },
      { e: 'promote(s, 0, j)[:-1]' },
    ],
  },
  'fa24f-6a': {
    wrong: [
      { c: 'all([products(b, n / t.label) for b in t.branches])' },
      { c: 'any([products(b, n // t.label) for b in t.branches])' },
      { c: 'all([products(b, n) for b in t.branches])' },
    ],
  },
  'fa24f-6b': {
    wrong: [
      { g: 'not branch.is_leaf()' },
      { g: 'x == k' },
      { g: 'True' },
      { g: 'branch.is_leaf() or x == k' },
    ],
  },
  'fa24f-9b': {
    wrong: [
      { 'A+': 'repromote(s[:j] + s[j+1:], k - 1)' },
      { 'A+': 'repromote(s[1:], k - min(1, j))' },
      { 'A+': 'repromote(s[:j] + s[j+1:], k)' },
    ],
  },
  'sp24f-2a': { wrong: [] },
  'sp24f-2b': {
    wrong: [
      { g: 'lambda y: y >= x' },
      { g: 'lambda y: y < x' },
      { g: 'lambda y: True' },
    ],
    alternatives: [
      { g: 'lambda y: x < y' },
    ],
  },
  'sp24f-3a': {
    wrong: [
      { c: 'self.ns = [self.ns[0], self.ns[1]]' },
      { c: 'self = Domino([self.ns[1], self.ns[0]])' },
    ],
    alternatives: [
      { c: 'self.ns[0], self.ns[1] = self.ns[1], self.ns[0]' },
      { c: 'self.ns = [first, self.ns[0]]' },  // inside the if, first is the second number
    ],
  },
  'sp24f-3b': {
    wrong: [
      { f: '[x for x in ds if x.ns != d.ns]' },
      { f: 'ds.remove(d)' },
      { f: 'ds[1:]' },
    ],
    alternatives: [
      { f: '[x for x in ds if x != d]' },  // Domino has no __eq__, so != compares identity
    ],
  },
  'sp24f-3c': {
    wrong: [
      { h: 'd' },
      { h: 'd.align(first.ns[0])' },
      { j: 'first.ns[0] in d.ns' },
      { j: 'True' },
    ],
    alternatives: [
      { j: 'd.ns[0] == first.ns[1] or d.ns[1] == first.ns[1]' },
    ],
  },
  'sp24f-5a': { wrong: [] },
  'fa23f-2': {
    wrong: [
      { c: 'bounds(b, low, high)' },
      { c: 'bounds(b, low - b.label, high - b.label)' },
      { c: 'bounds(b, low + t.label, high + t.label)' },
    ],
  },
  'fa23f-3': {
    wrong: [
      { a: 'Word(w, self, None)' },
      { a: 'Word(w, self.dialect, previous)' },
      { b: 'current = previous' },
      { e: 'self.exp.dialect[self.w]' },
      { e: 'self.w' },
    ],
  },
  'fa23f-4a': { wrong: [] },
  'fa23f-4b': { wrong: [] },
  'fa23f-4c': {
    wrong: [
      { i: 'pairs' },
      { i: 'pairs[1]' },
      { k: 'False' },
      { k: 'is_pairing(s[2:], pairs)' },
      { k: 'is_pairing(s[1:], pairs[1:])' },
    ],
  },
  'fa23f-4d': {
    wrong: [
      { l: 'unequal_pairs(s[2:])' },
      { l: 'unequal_pairs(s[3:])' },
      { n: 'yield pair' },
      { o: 'pair + rest' },
      { o: '[pair, rest]' },
    ],
  },
  'fa23f-4e': {
    wrong: [
      { q: 's.first' },
      { q: 's.first + s.rest' },
    ],
  },
};
