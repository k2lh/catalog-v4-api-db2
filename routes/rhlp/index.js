module.exports = function(req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function(err, conn) {
    console.log('querying...' + req.originalUrl);
    if (err) {
      res.status(500).send(err)
    }
    conn.query(`select * from zzz.V_RH_LP FETCH FIRST 10 ROWS only`, function(err, data) {
      if (err) {
        res.status(500).send(err)
      }
      res.status(200).send(data)
    })
    conn.close(()=> {
      console.log('connection closed...' + req.originalUrl);
    });
  })
}