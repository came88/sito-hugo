+++ 
draft = false
date = 2018-09-12
title = "Some nice queries for Oracle"
description = ""
slug = "query-oracle" 
tags = ["oracle", "db", "sql"]
categories = []
externalLink = ""
series = []
+++

Some utils queries on Oracle SQL

## Search for invalid objects
```sql
SELECT * FROM user_objects WHERE status != 'VALID';
```

## Database version
```sql
SELECT * FROM V$VERSION;
```

## Search for a column
Search in all tables and views
```sql
SELECT * FROM user_tab_columns
```
Search in tables only
```sql
SELECT * FROM user_tab_columns where table_name not in (select view_name from user_views)
```
