module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) console.log(err);
    conn.query(`SELECT *
      FROM ccc.F_CA_SIGN_REV_GP_MARG_YTY_FLAT F
      FULL OUTER JOIN ccc.F_CA_INVEST_TRAINED_NPS_CLAIM_BY_OFFERING I
      ON F.OFFERING_ID = I.OFFERING_ID
      AND F.PORTFOLIO = I.PORTFOLIO
      WITH UR`, function (err, data) {
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
