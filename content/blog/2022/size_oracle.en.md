+++ 
draft = false
date = 2022-02-17T15:56:59+01:00
title = "Size of tables on Oracle"
description = "How to get the size of a table on an Oracle database"
slug = "size-tables-oracle" 
tags = ["oracle", "query", "db", "sql"]
categories = ["oracle"]
externalLink = ""
series = []
+++

When working with a DB sooner or later we encounter the problem of being close to the end of the space on the tablespace,
and in those cases we need to know how much space the various tables, indexes and so on are taking up to look up where to act.

A first insight can be obtained from the `dba_segments` (or `all_segments` or even `user_segments`) view like this:

```sql
SELECT owner, segment_name, segment_type, SUM(bytes) AS bytes
FROM dba_segments
GROUP BY owner, segment_name, segment_type
ORDER BY bytes DESC
```

However, when the tables contain `LOB`s of remarkable size (which are saved in segments other than the table's main one)
or when the indexes on the tables are of considerable size this is no longer enough and a more elaborate query like the following may be handy:

```sql
WITH base AS
  (SELECT owner, segment_name, segment_type, SUM(bytes) AS bytes
  FROM dba_segments
  GROUP BY owner, segment_name, segment_type
  ),
  summary AS
  (SELECT b.owner, b.segment_name, b.segment_type, b.bytes,
    CASE
      WHEN b.segment_type IN ('TABLE', 'TABLE PARTITION')
        THEN b.segment_name
      WHEN b.segment_type = 'LOBSEGMENT'
        THEN ( SELECT l.table_name  FROM dba_lobs l
            WHERE l.owner        = b.owner AND l.segment_name = b.segment_name )
      WHEN b.segment_type = 'LOB PARTITION'
        THEN ( SELECT lp.table_name FROM DBA_PART_LOBS lp
            WHERE lp.table_owner = b.owner AND lp.lob_name    = b.segment_name )
      WHEN b.segment_type IN ('INDEX', 'LOBINDEX')
        THEN ( SELECT i.table_name  FROM DBA_INDEXES i
            WHERE i.owner        = b.owner AND i.INDEX_NAME   = b.segment_name )
      WHEN b.segment_type = 'INDEX PARTITION'
        THEN ( SELECT ip.table_name FROM DBA_PART_INDEXES ip
            WHERE ip.owner       = b.owner AND ip.INDEX_NAME  = b.segment_name )
      ELSE 'n.a.'
    END table_name
  FROM base b
  )
SELECT owner,
  table_name,
  segment_name,
  segment_type,
  bytes                                            / 1024 / 1024 / 1024 segment_gb,
  SUM(bytes) over (partition BY owner, table_name) / 1024 / 1024 / 1024 total_table_gb,
  TO_CHAR(bytes / SUM(bytes) over (partition BY owner, table_name) * 100, '990D000')
    || ' %' segment_to_table,
  TO_CHAR(bytes / SUM(bytes) over (partition BY owner)             * 100, '990D000')
    || ' %' segment_to_schema,
  TO_CHAR(SUM(bytes) over (partition BY owner, table_name) 
                / SUM(bytes) over (partition BY owner)             * 100, '990D000')
    || ' %' table_to_schema
FROM summary
WHERE owner = 'myschema'
ORDER BY SUM(bytes) over (partition BY owner, table_name) DESC, bytes DESC
```

The result should be something like this

```
OWNER    TABLE_NAME SEGMENT_NAME              SEGMENT_TYPE SEGMENT_GB     TOTAL_TABLE_GB SEGMENT_TO_TABLE SEGMENT_TO_SCHEMA TABLE_TO_SCHEMA
-------- ---------- ------------------------- ------------ -------------- -------------- ---------------- ----------------- ---------------
MYSCHEMA MY_TABLE   SYS_LOB0000898717C00004$$ LOBSEGMENT   164,5009765625 164,9130859375 99,750 %         93,907 %          94,142 %
MYSCHEMA MY_TABLE   SYS_IL0000898717C00004$$  LOBINDEX     0,27734375     164,9130859375 0,168 %          0,158 %           94,142 %
MYSCHEMA MY_TABLE   MY_TABLE                  TABLE        0,125          164,9130859375 0,076 %          0,071 %           94,142 %
MYSCHEMA MY_TABLE   MY_TABLE_PK               INDEX        0,009765625    164,9130859375 0,006 %          0,006 %           94,142 %
```

If there aren't suffient privileges to query the `dba_segments`, by limiting the result to the current user it's possible to query the `user_segments` view:

```sql
WITH base AS
  (SELECT segment_name, segment_type, SUM(bytes) AS bytes
  FROM user_segments
  GROUP BY segment_name, segment_type
  ),
  summary AS
  (SELECT b.segment_name, b.segment_type, b.bytes,
    CASE
      WHEN b.segment_type IN ('TABLE', 'TABLE PARTITION')
        THEN b.segment_name
      WHEN b.segment_type = 'LOBSEGMENT'
        THEN ( SELECT l.table_name  FROM user_lobs l
            WHERE l.segment_name = b.segment_name )
      WHEN b.segment_type = 'LOB PARTITION'
        THEN ( SELECT lp.table_name FROM user_PART_LOBS lp
            WHERE lp.lob_name    = b.segment_name )
      WHEN b.segment_type IN ('INDEX', 'LOBINDEX')
        THEN ( SELECT i.table_name  FROM user_INDEXES i
            WHERE i.INDEX_NAME   = b.segment_name )
      WHEN b.segment_type = 'INDEX PARTITION'
        THEN ( SELECT ip.table_name FROM user_PART_INDEXES ip
            WHERE ip.INDEX_NAME  = b.segment_name )
      ELSE 'n.a.'
    END table_name
  FROM base b
  )
SELECT table_name,
  segment_name,
  segment_type,
  bytes                                     / 1024 / 1024 / 1024 segment_gb,
  SUM(bytes) over (partition BY table_name) / 1024 / 1024 / 1024 total_table_gb,
  TO_CHAR(bytes / SUM(bytes) over (partition BY table_name) * 100, '990D000')
    || ' %' segment_to_table,
  TO_CHAR(bytes / SUM(bytes) over ()                        * 100, '990D000')
    || ' %' segment_to_schema,
  TO_CHAR(SUM(bytes) over (partition BY table_name) 
                / SUM(bytes) over ()                        * 100, '990D000')
    || ' %' table_to_schema
FROM summary
ORDER BY SUM(bytes) over (partition BY table_name) DESC, bytes DESC
```

The result should be something like this

```
TABLE_NAME SEGMENT_NAME              SEGMENT_TYPE SEGMENT_GB     TOTAL_TABLE_GB SEGMENT_TO_TABLE SEGMENT_TO_SCHEMA TABLE_TO_SCHEMA
---------- ------------------------- ------------ -------------- -------------- ---------------- ----------------- ---------------
MY_TABLE   SYS_LOB0000898717C00004$$ LOBSEGMENT   164,5009765625 164,9130859375 99,750 %         93,907 %          94,142 %
MY_TABLE   SYS_IL0000898717C00004$$  LOBINDEX     0,27734375     164,9130859375 0,168 %          0,158 %           94,142 %
MY_TABLE   MY_TABLE                  TABLE        0,125          164,9130859375 0,076 %          0,071 %           94,142 %
MY_TABLE   MY_TABLE_PK               INDEX        0,009765625    164,9130859375 0,006 %          0,006 %           94,142 %
```