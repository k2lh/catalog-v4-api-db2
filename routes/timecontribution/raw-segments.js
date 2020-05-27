module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) console.log(err);
    conn.query(`SELECT * FROM ccc.F_CA_FINANCIAL_INVEST_PORTFOLIO_GM WITH ur`, function (err, data) {
      if (err) console.log(err);
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: data
      })
    })
    conn.close(() => {
      console.log('connection closed.');
    })
  })
}
