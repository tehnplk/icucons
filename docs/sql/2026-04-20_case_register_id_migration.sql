-- Move child case_* tables from patient_id to case_register_id.
-- Executed against database: icuconsult
-- Date: 2026-04-20
--
-- Note:
-- - Data backfill from case_register.patient_id completed for every case_* row.
-- - The current MariaDB/InnoDB instance returned engine errors when applying
--   ALTER ... MODIFY case_register_id INT NOT NULL and when adding foreign keys.
-- - As a result, the application now writes case_register_id everywhere, all
--   existing rows are linked, and indexes exist, but FK / NOT NULL hardening may
--   need a later engine-level fix before reapplying.

ALTER TABLE case_close ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_close x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_close ADD INDEX idx_case_close_case_register_id (case_register_id);
ALTER TABLE case_close DROP COLUMN patient_id;

ALTER TABLE case_file ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_file x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_file ADD INDEX idx_case_file_case_register_id (case_register_id);
ALTER TABLE case_file DROP COLUMN patient_id;

ALTER TABLE case_lab ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_lab x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_lab ADD INDEX idx_case_lab_case_register_id (case_register_id);
ALTER TABLE case_lab DROP COLUMN patient_id;

ALTER TABLE case_medication ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_medication x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_medication ADD INDEX idx_case_medication_case_register_id (case_register_id);
ALTER TABLE case_medication DROP COLUMN patient_id;

ALTER TABLE case_message ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_message x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_message ADD INDEX idx_case_message_case_register_id (case_register_id);
ALTER TABLE case_message DROP COLUMN patient_id;

ALTER TABLE case_note ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_note x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_note ADD INDEX idx_case_note_case_register_id (case_register_id);
ALTER TABLE case_note DROP COLUMN patient_id;

ALTER TABLE case_team ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_team x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_team ADD INDEX idx_case_team_case_register_id (case_register_id);
ALTER TABLE case_team DROP INDEX uk_case_team_patient_provider;
ALTER TABLE case_team DROP INDEX idx_case_team_patient_id;
ALTER TABLE case_team ADD UNIQUE KEY uk_case_team_case_register_provider (case_register_id, provider_id);
ALTER TABLE case_team DROP COLUMN patient_id;

ALTER TABLE case_vital ADD COLUMN case_register_id INT NULL AFTER id;
UPDATE case_vital x
JOIN case_register c ON c.patient_id = x.patient_id
SET x.case_register_id = c.id
WHERE x.case_register_id IS NULL;
ALTER TABLE case_vital ADD INDEX idx_case_vital_case_register_id (case_register_id);
ALTER TABLE case_vital DROP COLUMN patient_id;
