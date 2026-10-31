# Optimization Changelog

Use this file to document every performance fix you implement. For each fix, include:
- What the problem was (symptom & cause).
- Which React feature (or pattern) you used to fix it.
- Why that specific fix works.

## Example Formatting
### [FIX] Fix Unnecessary Re-render (Component X)
- **Problem**: Component X was re-rendering 50 times on every keypress due to unstable props.
- **Fix**: Wrapped Component X in `React.memo` and memoized the `style` object in the parent.
- **Impact**: Zero child re-renders now (verified via Profiler).

---

## 🛠️ List of Changes
1.  **[FIX] Double Fetch on Mount** - ...
2.  **[FIX] Expensive Computation** - ...
3.  ... (and so on)
