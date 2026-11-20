# iPad Exam Mode — known issues

Open issues found in physical iPad testing on `feature/ipad-mvp` that are not fixed yet.

## Dragging a sticky note with Apple Pencil can trigger handwriting recognition

On iPad, dragging a Sticky Note with Apple Pencil may trigger handwriting or text recognition in the underlying answer box or code editor.

- **Where:** a sticky note that sits over an answer box (right pane) or the code editor (left pane), moved by dragging its title bar with Apple Pencil.
- **Likely cause (not confirmed):** the note's own pointer handling moves the note but does not cancel the Pencil's touches, so iPadOS Scribble can still see the stroke over the text field underneath.
- **Workaround:** drag the note with a finger.
- **Status:** open. Not addressed in the sticky note changes (Task 4).
