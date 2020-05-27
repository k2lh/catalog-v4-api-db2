module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    conn.query('select * from ccc.v_segment_counts_current order by 2,3', function (err, data) {
      if (err) console.log(err);
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        // data: JSON.parse(result)
        data: data
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
