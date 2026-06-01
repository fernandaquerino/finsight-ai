# Feedback states

FinSight uses calm, contextual feedback states. Prefer skeletons that preserve
the final layout shape, and reserve error states for recoverable failures.

## LoadingState

Use `LoadingState` for generic loading areas and pass contextual skeletons when
the final layout is known. Avoid generic spinners as the default.

## EmptyState

Use `EmptyState` when there is no data yet. Empty states should explain what
happens next without sounding like a failure.

Recommended variants:

- `dashboard`: user has not added/imported financial data yet.
- `transactions`: filters returned no transactions.
- `chart`: not enough data for a chart.
- `notifications`: no notifications.
- `insights`: AI has no useful insight yet.

## ErrorState

Use `ErrorState` when loading failed and the user can retry. Keep the copy
neutral and avoid blaming the user.

## InlineFeedback

Use `InlineFeedback` near form fields or compact surfaces. Use `error` for
validation failures, and `info`/`warning`/`success` for non-blocking messages.

## Toasts

Use `showToast` for action feedback after a user action succeeds or fails.
Never include sensitive financial descriptions or raw statement data in toast
messages.
