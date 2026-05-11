UPDATE rooms r
SET name = m.name_en || ' Room'
FROM majors m
WHERE r.type = 'MAJOR'
  AND r.major = m.name_ko;
