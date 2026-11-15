# Runs the test-bank variants built by verify_test_bank.js with the browser runner's own harness
# (run_student / run_case from app/runner.js), with the same 5-second limit per run and per case.
import json, os, signal, sys, time

dir = sys.argv[1]
exec(open(os.path.join(dir, 'harness.py')).read())

class _Timeout(BaseException):
    pass

if hasattr(signal, 'SIGALRM'):
    def _alarm(signum, frame):
        raise _Timeout('timed out')

    signal.signal(signal.SIGALRM, _alarm)

    def limited(fn, *args):
        signal.setitimer(signal.ITIMER_REAL, 5)
        try:
            return fn(*args)
        finally:
            signal.setitimer(signal.ITIMER_REAL, 0)
else:
    # Windows has no SIGALRM: after 5 seconds a watchdog thread interrupts the main thread (KeyboardInterrupt at the next
    # bytecode, so any Python loop stops), and keeps interrupting until the run returns: the harness catches exceptions
    # per doctest example, so one interrupt would only end one example and the next could loop forever. An interrupted
    # example fails, so a timed-out version never passes.
    import _thread, threading

    def limited(fn, *args):
        done = threading.Event()

        def watchdog():
            if not done.wait(5):
                while not done.wait(0.2):
                    _thread.interrupt_main()

        threading.Thread(target=watchdog, daemon=True).start()
        try:
            return fn(*args)
        except KeyboardInterrupt:
            raise _Timeout('timed out')
        finally:
            done.set()

out = []
progress = bool(os.environ.get('PROGRESS'))
for job in json.load(open(os.path.join(dir, 'jobs.json'))):
    if progress:
        t0 = time.monotonic()
        sys.stderr.write(job['suite'] + ': ' + job['label'] + ' ... ')
        sys.stderr.flush()
    # Like the browser: the code runs once on its own first; if that fails, the cases do not run.
    try:
        stdout, error, truncated = limited(run_student, job['code'], 20000)
    except _Timeout:
        out.append({'passed': False, 'summary': 'code timed out before tests'})
        continue
    if error:
        out.append({'passed': False, 'summary': 'code raised before tests: ' + error.strip().splitlines()[-1]})
        continue
    # A version passes only if every case passes, so the first failing case settles it; skipping the rest keeps
    # versions that loop forever from costing a 5-second timeout per case.
    statuses = []
    for case in job['cases']:
        try:
            r = json.loads(limited(run_case, job['code'], job['setup'], case, 5000))
        except _Timeout:
            r = {'status': 'timeout'}
        statuses.append(r['status'])
        if r['status'] != 'passed':
            break
    out.append({'passed': all(s == 'passed' for s in statuses), 'summary': ', '.join(statuses)})
    if progress:
        sys.stderr.write('%.1fs %s\n' % (time.monotonic() - t0, out[-1]['summary']))
print(json.dumps(out))
