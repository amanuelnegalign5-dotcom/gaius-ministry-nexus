# v10.3 administrator permanent deletion policy

Full Admin users may use **Permanently delete** even for previously removed or pending users, except the last active Full Admin. Server checks the actor's Full Admin role, current password, exact target username, literal `DELETE`, record version, and retained administrator count. Delegated managers with only `manage_users` cannot use this action. The client also requires an explicit acknowledgement and a final confirmation.

The action removes account credentials, profile, recovery OTPs and sessions from the active records and clears associated authentication-attempt references. Structured fields in historical reports, plans, comments, reviews, attendance, projects, documents, audit logs and other user metadata are de-identified. Approval status and review history remain intact; identifying free-text content, downloads and third-party copies are **not** automatically removed. No restore is available after permanent deletion. The user can sign up again later only as a new account.

**Upgrade instructions:** [GAIUS v10.3 Amharic guide](GAIUS_v10_3_ADMIN_DELETE_AMHARIC.md).

---

# GAIUS v10.2 — administrator governance

Country Director and International Director roles are full administrators. Members explicitly granted fullAdmin rights have the same application-wide permissions. The backend enforces these permissions for management of accounts, plans, reports, comments, attendance, projects, announcements, document metadata, and record deletion.

- Administrators can create user accounts with temporary credentials, approve requests, remove and restore users, delegate limited privileges, reset a staff password, and appoint a successor.
- A removed user's historical work is attributed to the original author and retained unless a full administrator explicitly deletes a particular non-source record.
- Review approvals, change requests, and decisions have state transitions with actor and timestamp. Commenting is not equivalent to approving a report.
- Server-side recovery updates the password hash and revokes outstanding sessions. Changing the registered email address requires the existing password and a one-time verification code delivered to the new address.
- The six October source reports cannot be edited or deleted through the application. Their accompanying review decisions and director comments can be recorded.

For production, restrict full administrator accounts to essential personnel. Add hardware MFA, independent backup verification, and immutable external audit logging as distinct subsequent security projects; these are not claimed here.
