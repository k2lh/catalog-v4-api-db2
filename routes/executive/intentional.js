module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    function addParam(val, cat, query) {
      if (val.length > 0) {
        for (var i = 0; i < val.length; i++) {
          if (i === 0) {
            query = query + ' AND ' + cat + ' = ' + val[i];
          } else {
            query = query + ' OR ' + cat + ' = ' + val[i];
          }
        }
      }
      return query;
    };
    var thisquery = 'select A2T_Group, DesProgramSkill, DimprogramStatus, count(distinct learnercnum) as total from ccc.f_learning where DimprogramStartdate is not null';
    if (req.body.body) {
      thisquery = addParam(req.body.region, 'REGION', thisquery);
      thisquery = addParam(req.body.ciclocation, 'CIC_LOCATION', thisquery);
      // thisquery = addParam(req.body.istss, 'ISTSS', thisquery);
      // thisquery = addParam(req.body.market, 'MARKET', thisquery);
      thisquery = addParam(req.body.country, 'COUNTRY', thisquery);
      // thisquery = addParam(req.body.businessmodel, 'businessmodel', thisquery);
      // thisquery = addParam(req.body.jrs, 'JRSS', thisquery);
      thisquery = addParam(req.body.service, 'SERVICE_NAME', thisquery);
      thisquery = addParam(req.body.servicearea, 'SERVICE_AREA', thisquery);
      // thisquery = addParam(req.body.serviceline, 'SERVICE_LINE', thisquery);
    };
    thisquery = thisquery + ' and (year(Dimprogramcompletedate) = year(current date) or DimProgramCompletedate is null) group by A2T_Group, DesProgramSkill, DimProgramStatus';
    console.log(thisquery);
    conn.query(thisquery, function (err, data) {
      if (err) console.log(err);
      else {
        console.log(req.body);
        var results = {
          table: [
            {
              name: 'Growth Hub'
            },
            {
              name: 'Red Hat'
            },
            {
              name: 'Regional Training'
            },
            {
              name: 'Segments'
            }
          ],
          total: {
            reip: 0,
            upip: 0,
            recom: 0,
            upcom: 0
          }
        };
        var result = {};
        for (let i = 0; i < data.length; i++) {
          result = {};
          if (data[i].DESPROGRAMSKILL === 'RESKILL') {
            if (data[i].DIMPROGRAMSTATUS === 'COMPLETED') {
              if (data[i].A2T_GROUP === results.table[0].name) {
                results.table[0].recom = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[1].name) {
                results.table[1].recom = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[2].name) {
                results.table[2].recom = data[i].TOTAL;
              } else {
                results.table[3].recom = data[i].TOTAL;
              };
            } else {
              if (data[i].A2T_GROUP === results.table[0].name) {
                results.table[0].reip = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[1].name) {
                results.table[1].reip = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[2].name) {
                results.table[2].reip = data[i].TOTAL;
              } else {
                results.table[3].reip = data[i].TOTAL;
              };
            };
          } else {
            if (data[i].DIMPROGRAMSTATUS === 'COMPLETED') {
              if (data[i].A2T_GROUP === results.table[0].name) {
                results.table[0].upcom = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[1].name) {
                results.table[1].upcom = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[2].name) {
                results.table[2].upcom = data[i].TOTAL;
              } else {
                results.table[3].upcom = data[i].TOTAL;
              };
            } else {
              if (data[i].A2T_GROUP === results.table[0].name) {
                results.table[0].upip = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[1].name) {
                results.table[1].upip = data[i].TOTAL;
              } else if (data[i].A2T_GROUP === results.table[2].name) {
                results.table[2].upip = data[i].TOTAL;
              } else {
                results.table[3].upip = data[i].TOTAL;
              };
            };
          };
          results.total.reip = results.total.reip + result.reip;
          results.total.upip = results.total.upip + result.upip;
          results.total.recom = results.total.recom + result.recom;
          results.total.upcom = results.total.upcom + result.upcom;
        };
      };
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        // data: JSON.parse(result)
        data: results
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
