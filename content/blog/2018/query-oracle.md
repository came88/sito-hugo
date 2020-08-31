+++ 
draft = false
date = 2018-09-12
title = "Query utili per Oracle"
description = ""
slug = "query-oracle" 
tags = ["oracle", "db", "sql"]
categories = []
externalLink = ""
series = []
+++

Alcune query utili su Oracle SQL

## Ricerca oggetti invalidi
```sql
SELECT * FROM user_objects WHERE status != 'VALID';
```

## Versione database
```sql
SELECT * FROM V$VERSION;
```

## Ricerca di colonne
Ricerca in tabelle e viste
```sql
SELECT * FROM user_tab_columns
```
Per escludere le viste invece
```sql
SELECT * FROM user_tab_columns
where table_name not in (
    select view_name from user_views
)
```
