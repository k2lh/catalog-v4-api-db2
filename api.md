## Union API
### GET /employees/:cnum
- GET employee information by CNUM
- Parameters
  - completiondate String, Default 2019-01-01
- Example
```
GET http://api.staging.domain.net/api/employees/idnum?completiondate=2019-02-01
```

## Separated API for analyzing

### GET /employees/base/:cnum
- GET employee base information by CNUM
- Example
```
GET http://api.staging.domain.net/api/employees/idnum
```
### GET /employees/yl/:cnum
- GET employee information by CNUM
- Parameters
  - completiondate String, Default 2019-01-01
- Example
```
GET http://api.staging.domain.net/api/employees/idnum?completiondate=2019-05-01
```

### GET /employees/edvisor/:cnum
- GET employee information by CNUM
- Parameters
  - completiondate String, Default 2019-01-01
- Example
```
GET http://api.staging.domain.net/api/employees/edvisor/idnum?completiondate=2019-02-01
```
