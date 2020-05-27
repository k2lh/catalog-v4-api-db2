module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) console.log(err);
    conn.query(`select * from zzz.f_ca_claim_bysegment_svcl20_summary_api_flat`, function (err, data) {
      if (err) console.log(err);
      else {
        console.log(data);
        var results = {};
        var result = {};
        var str = '';
        function shortstring(a) {
          if (a !== null) {
            str = a.replace(/[^0-9a-z]/gi, '');
            str = str.toLowerCase();
            return str;
          } else {
            return null;
          }
        };
        for (let i = 0; i < data.length; i++) {
          result = {};
          result.sname = shortstring(data[i].SEGMENT);
          result.segment = data[i].SEGMENT;
          result.mapCount = data[i].MAPPED_COUNT_OF_PEOPLE;
          result.mapAvgBefore = parseInt(data[i].MAPPED_AVG_BEFORE_HOURS);
          result.mapAvgAfter = parseInt(data[i].MAPPED_AVG_AFTER_HOURS);
          result.mapChange = parseFloat(data[i].MAPPED_RATE_OF_CHANGE) / 100;
          result.notmapCount = data[i].NOTMAPPED_COUNT_OF_PEOPLE;
          result.notmapAvgBefore = parseInt(data[i].NOTMAPPED_AVG_BEFORE_HOURS);
          result.notmapAvgAfter = parseInt(data[i].NOTMAPPED_AVG_AFTER_HOURS);
          result.notmapChange = parseFloat(data[i].NOTMAPPED_RATE_OF_CHANGE) / 100;
          results[result.sname] = result;
        }
      }
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: results
      })
    });
    conn.close(() => {
      console.log('connection closed.');
    });
  })
}
