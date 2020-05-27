module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    function countAll(arr) {
      var counts = {};
      var result = [];
      arr.sort();
      for (var i = 0; i < arr.length; i++) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
      }
      for (var j = 0; j < Object.entries(counts).length; j++) {
        var obj = {
          datestamp: Object.entries(counts)[j][0],
          data: Object.entries(counts)[j][1]
        };
        result.push(obj);
      }
      result.push(result.shift());
      return result;
    };
    conn.query(`SELECT DISTINCT e.CNUM, e.EMP_NAME, e.CERTIFICATE_DESCRIPTION,
        e.CERT_DATE, e.EXPIRY_DATE, e.VENDOR, e.ID_SOURCE, e.CONFIDENCE, e.EVIDENCE
        FROM zzz.V_VORTEX_SELF_CERT e INNER JOIN zzz.YL_MANAGERS_GLOBAL m ON e.CNUM = m.EMP_CNUM AND m.LEVEL = 1
        AND e.REPORT_GRP = '` + req.params.org + `'
        AND m.MGR_CNUM = '` + req.params.mgr + `' AND CERTIFICATE_DESCRIPTION IS NOT NULL
        WITH UR`, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        var results = {
          tablerows: [],
          certNames: [],
          certVendors: []
        };
        var obj = {};
        var str = '';
        var datestr = '';
        for (i = 0; i < data.length; i++) {
          if (data[i].CONFIDENCE !== null) {
            obj = {};
            obj.employee = data[i].EMP_NAME;
            obj.certName = data[i].CERTIFICATE_DESCRIPTION;
            obj.vendor = data[i].VENDOR;
            obj.source = data[i].ID_SOURCE;
            obj.confidence = Math.round(data[i].CONFIDENCE);
            obj.evidence = data[i].EVIDENCE;
            results.tablerows.push(obj);
            if (Math.round(data[i].CONFIDENCE) > 69) {
              results.certNames.push(data[i].CERTIFICATE_DESCRIPTION);
            };
            if (data[i].VENDOR !== null) {
              results.certVendors.push(data[i].VENDOR);
            } else {
              results.certVendors.push('Unknown');
            }
            if (data[i].CERT_DATE !== null) {
              obj.completion = data[i].CERT_DATE.substring(0, 10);
            } else {
              obj.completion = null;
            }
          }
        }
      }
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
