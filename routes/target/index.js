module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    let queryString = '';
    if (req.query.year !== undefined) {
      queryString = 'select * from zzz.v_segment_totals_2019'
    } else {
      queryString = 'select * from zzz.v_segment_totals'
    }
    conn.query(queryString, function (err, data) {
      if (err) console.log(err);
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: data
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
