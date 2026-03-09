# Phase 6 - GUI Surfaces

Phase 6 adds GUI experiences only after the orchestration core is stable, headless, and expressive enough to support them cleanly.

## TASK-21 - Stabilize headless service APIs for future frontends

Depends on: TASK-10, TASK-13, TASK-20

Goal:

- Make the application layer safe to consume from a desktop or web UI without forcing the UI to understand backend internals.

Work:

- Review application services and CLI flows for gaps that would force a GUI to reimplement orchestration logic.
- Stabilize service inputs and outputs for project registration, workspace lifecycle, run execution, layer inspection, and health reporting.
- Separate presentation concerns from orchestration concerns so the CLI and GUI can share the same service layer.
- Document unsupported areas that must remain CLI-only until a stable contract exists.

Deliverables:

- Stable headless orchestration API surface.
- Contract notes for frontend consumers.

Acceptance:

- A frontend can call the orchestration core without bypassing it.
- No GUI-only feature requires changing the domain model in a special way.

## TASK-22 - Build the first GUI shell without introducing GUI-only behavior

Depends on: TASK-21

Goal:

- Provide a thin GUI layer over the existing orchestration core.

Work:

- Choose the first GUI surface, desktop or web, based on operator needs rather than novelty.
- Expose project, workspace, run, layer, and health workflows through the GUI using the shared service layer.
- Reuse the same validation, policy choices, and capability reporting already defined for the CLI.
- Keep advanced orchestration behavior debuggable from the CLI even if the GUI adds convenience flows.

Deliverables:

- First GUI shell over `loom`.
- Shared workflow coverage between CLI and GUI.

Acceptance:

- The GUI is a consumer of existing orchestration capabilities, not a second implementation of the product.
- A behavior expressible in the GUI remains expressible through the CLI.

## Phase 6 exit

- `loom` remains headless at its core.
- The first GUI adds usability without forking product behavior.
- Future interfaces can continue to build on the same domain and app-layer contracts.
