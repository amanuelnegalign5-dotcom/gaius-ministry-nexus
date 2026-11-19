# Center App Integration Contract — v11 (specification only)

The separate Center Leader app's source and live API were not provided, so **integration is not installed**. For a future secure link, use consistent immutable `center_id`, `department_id`, `user_id`, `record_id` and a schema-version field on both sides. Do not join on display names.

Recommended endpoints with backend token authentication and per-center scope checks:

- `GET /centers/{center_id}/plans?since=...` — approved/submitted plan metadata, version, owner.
- `GET /centers/{center_id}/reports?since=...` — report activity, planned/achieved, result, challenge, next action, review history, approved media references.
- `GET /centers/{center_id}/attendance?week=...` — aggregated Sunday volunteer counts and separately authorized leader-level attendance.
- `POST /centers/{center_id}/reviews` — reviewer, decision, note, record revision, idempotency key.
- `GET /centers/{center_id}/leadership` — verified leadership directory and mentorship status with minimum necessary personal fields.

Use a single source-of-truth per record. Never double-create reports, perform blind bidirectional sync, or expose all centers via a global read token. Require idempotent writes and version checks. Include an explicit consent/retention model for youth/volunteer contact data.
