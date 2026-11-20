# iPad Exam and Practice Mode — known issues

Open issues found in physical iPad testing on `feature/ipad-mvp` that are not fixed yet.

## Dragging a sticky note with Apple Pencil can trigger handwriting recognition

On iPad, dragging a Sticky Note with Apple Pencil may trigger handwriting or text recognition in the underlying answer box or code editor.

- **Where:** a sticky note that sits over an answer box (right pane) or the code editor (left pane), moved by dragging its title bar with Apple Pencil.
- **Likely cause (not confirmed):** the note's own pointer handling moves the note but does not cancel the Pencil's touches, so iPadOS Scribble can still see the stroke over the text field underneath.
- **Workaround:** drag the note with a finger.
- **Practice Mode:** iPad Practice Mode uses the same notes and the same drag handling as exams (Task 5), so the issue is the same there and no worse. No practice-only drag path was added.
- **Status:** open. Not addressed in the sticky note changes (Task 4) or in Practice Mode (Task 5).

## Practice Mode: handwriting alignment edge cases after Show Solution

When a solution opens in iPad Practice Mode, the parts below it move down, and the answer-pane handwriting on those parts is moved down with them (only its saved y-coordinates change; the saved format is the same). Two cases are not covered:

- **Undo after Show Solution:** a stroke that was erased *before* the solution opened is not moved with the others. If it is brought back with Undo (or Redo) afterwards, it returns at its old position, which may no longer line up with its part.
- **Empty space under a part:** a stroke belongs to the part where its vertical middle sits. A stroke drawn in the empty space just below a part, where that part's solution then opens, is not moved, so it can end up over the solution text.

- **Status:** open (Task 5). A full fix would anchor answer-pane strokes to their part, which changes the saved handwriting format.
