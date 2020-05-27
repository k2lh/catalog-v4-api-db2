module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open("DATABASE=xxx;HOSTNAME=xxx;UID=xxx;PWD=xxx", function (err, conn) {
    if (err) return console.log(err);
    conn.query('select * from zzz.v_segment_totals', function (err, data) {
      if (err) console.log(err);
      else console.log(data);
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        // data: JSON.parse(result)
        // data: data
        data: [{
            "description": "external-billable",
            "total": 600
          },
          {
            "description": "internal-billable",
            "total": 896
          },
          {
            "description": "non-billable",
            "total": 132
          }
        ]
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
