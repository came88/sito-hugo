+++ 
draft = false
date = 2022-02-17T15:56:59+01:00
title = "Dimensioni delle tabelle su Oracle"
description = "Come ottenere le dimensioni di una tabella su database Oracle"
slug = "dimensioni-tabelle-oracle" 
tags = ["oracle", "query", "db", "sql"]
categories = ["oracle"]
externalLink = ""
series = []
+++

Quando si lavora con un DB prima o poi ci si incontra il problema di essere vicini alla fine dello spazio sul tablespace,
e in quei casi è necessario sapere quanto spazio stanno occupando le varie tabelle, gli indici e quant'altro per identificare il punto dove intervenire.

Una prima informazione si può ottendere dalla vista `dba_segments` (o `all_segments` oppure anche `user_segments`) in questo modo:

```sql
SELECT owner, segment_name, segment_type, SUM(bytes) AS bytes
FROM dba_segments
GROUP BY owner, segment_name, segment_type
ORDER BY bytes DESC
```

Quando però le tabelle contengono dei `LOB` di dimensione importanti (che vengono salvati in segmenti diversi da quello principale della tabella) 
o quando gli indici sulle tabelle sono di dimensioni consistenti questo non è più sufficiente, 
e può essere comoda una query più elaborata come la seguente:


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

Il risultato dovrebbe essere qualcosa del tipo

```
OWNER    TABLE_NAME SEGMENT_NAME              SEGMENT_TYPE SEGMENT_GB     TOTAL_TABLE_GB SEGMENT_TO_TABLE SEGMENT_TO_SCHEMA TABLE_TO_SCHEMA
-------- ---------- ------------------------- ------------ -------------- -------------- ---------------- ----------------- ---------------
MYSCHEMA MY_TABLE   SYS_LOB0000898717C00004$$ LOBSEGMENT   164,5009765625 164,9130859375 99,750 %         93,907 %          94,142 %
MYSCHEMA MY_TABLE   SYS_IL0000898717C00004$$  LOBINDEX     0,27734375     164,9130859375 0,168 %          0,158 %           94,142 %
MYSCHEMA MY_TABLE   MY_TABLE                  TABLE        0,125          164,9130859375 0,076 %          0,071 %           94,142 %
MYSCHEMA MY_TABLE   MY_TABLE_PK               INDEX        0,009765625    164,9130859375 0,006 %          0,006 %           94,142 %
```
