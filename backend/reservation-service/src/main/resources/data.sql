-- Idempotent seed of the restaurant's tables. Each row inserted only if absent.

INSERT INTO restaurant_table (label, seats)
SELECT v.label, v.seats
FROM (VALUES
        ('T1', 2),
        ('T2', 2),
        ('T3', 4),
        ('T4', 4),
        ('T5', 6),
        ('T6', 8)
     ) AS v(label, seats)
WHERE NOT EXISTS (SELECT 1 FROM restaurant_table t WHERE t.label = v.label);
