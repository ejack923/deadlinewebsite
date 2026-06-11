# Audit Manager Migration Plan

## Scope

The Audit Manager module adds a dedicated CLS audit workflow alongside the existing Audit Intelligence module.

## Database

The existing local SQLite database remains `data/audit-intelligence.sqlite`.

On server start, `createAuditManagerService()` applies an idempotent migration:

```sql
CREATE TABLE IF NOT EXISTS audit_manager_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firm_name TEXT,
  client_name TEXT,
  matter_number TEXT,
  matter_type TEXT,
  review_date TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  outcome TEXT,
  reviewer_name TEXT,
  audit_data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_manager_firm ON audit_manager_audits(firm_name);
CREATE INDEX IF NOT EXISTS idx_audit_manager_status ON audit_manager_audits(status);
CREATE INDEX IF NOT EXISTS idx_audit_manager_matter ON audit_manager_audits(matter_number);
```

`audit_data` stores the complete typed Audit Manager payload as JSON so future checklist or timeline changes can be added without destructive schema churn.

## API Endpoints

- `GET /api/audit-manager/audits?q=&firm=&status=`
- `POST /api/audit-manager/audits`
- `GET /api/audit-manager/audits/:id`
- `PUT /api/audit-manager/audits/:id`
- `DELETE /api/audit-manager/audits/:id`
- `GET /api/audit-manager/audits/:id/export/pdf`
- `GET /api/audit-manager/audits/:id/export/doc`
- `GET /api/audit-manager/audits/:id/export/json`

## Rollout

1. Back up `data/audit-intelligence.sqlite`.
2. Deploy the frontend and server changes together.
3. Start the audit API server with `npm run server`.
4. Open the app and navigate to `/AuditManager`.
5. Create a draft audit and confirm it appears in search/filter results.
6. Complete an audit and verify PDF, Word, and print output.

## Rollback

The migration is additive. To rollback the feature, remove the route/page files and optionally drop `audit_manager_audits` after exporting any needed draft data.
