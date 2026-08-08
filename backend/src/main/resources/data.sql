-- Seed data for the `specializations` master table.
-- Table/columns match the Specialization entity (com.healbit.entity.Specialization):
--   specializations(specialization_id BIGINT PK AUTO_INCREMENT, name VARCHAR(100) UNIQUE NOT NULL, deleted BOOLEAN NOT NULL)
--
-- Uses INSERT IGNORE so it's safe to re-run (name has a unique constraint) and won't
-- fail/duplicate if some of these already exist.

INSERT IGNORE INTO specializations (name, deleted) VALUES ('Cardiology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Dermatology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Neurology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Orthopedics', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Pediatrics', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Gynecology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('General Medicine', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('ENT', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Ophthalmology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Psychiatry', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Dentistry', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Urology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Oncology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Gastroenterology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Pulmonology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Endocrinology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('Nephrology', false);
INSERT IGNORE INTO specializations (name, deleted) VALUES ('General Surgery', false);
