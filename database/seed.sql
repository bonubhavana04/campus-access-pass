
USE campus_access_pass;

-- Seed data for campus resources.
-- Re-running this script will not duplicate these entries
-- as long as their names and locations remain unchanged.

INSERT INTO resources (name, description, location, category, status)
SELECT 'Computer Science Lab',
       'Computer laboratory for programming and practical sessions.',
       'Academic Block A, Floor 2',
       'LABORATORY',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM resources
    WHERE name = 'Computer Science Lab'
      AND location = 'Academic Block A, Floor 2'
);

INSERT INTO resources (name, description, location, category, status)
SELECT 'Electronics Lab',
       'Laboratory for electronics experiments and practical work.',
       'Academic Block B, Floor 1',
       'LABORATORY',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM resources
    WHERE name = 'Electronics Lab'
      AND location = 'Academic Block B, Floor 1'
);

INSERT INTO resources (name, description, location, category, status)
SELECT 'Project Discussion Room',
       'Room for student project meetings and team discussions.',
       'Library Block, Floor 1',
       'MEETING_ROOM',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM resources
    WHERE name = 'Project Discussion Room'
      AND location = 'Library Block, Floor 1'
);

INSERT INTO resources (name, description, location, category, status)
SELECT 'Research Lab',
       'Workspace for approved research and academic projects.',
       'Research Block, Floor 2',
       'RESEARCH',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM resources
    WHERE name = 'Research Lab'
      AND location = 'Research Block, Floor 2'
);

INSERT INTO resources (name, description, location, category, status)
SELECT 'Seminar Hall',
       'Hall for academic seminars, presentations, and workshops.',
       'Main Block, Ground Floor',
       'EVENT_SPACE',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM resources
    WHERE name = 'Seminar Hall'
      AND location = 'Main Block, Ground Floor'
);
