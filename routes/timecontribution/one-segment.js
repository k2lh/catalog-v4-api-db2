module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) console.log(err);
    conn.query(`SELECT *
      FROM ccc.F_CA_SIGN_REV_GP_MARG_YTY_FLAT F
      FULL OUTER JOIN ccc.F_CA_INVEST_TRAINED_NPS_CLAIM_BY_SEGMENT I
      ON F.OFFERING_ID = I.OFFERING_ID
      AND F.PORTFOLIO = I.PORTFOLIO
      WITH ur`, function (err, data) {
      if (err) console.log(err);
      else {
        var result = {};
        var str = '';
        function shortstring(a) {
          if (a !== null) {
            str = a.replace(/[^0-9a-z]/gi, '');
            str = str.toLowerCase();
            return str;
          } else {
            return 'None';
          }
        };
        for (let i = 0; i < data.length; i++) {
          result = {};
          result.sname = shortstring(data[i].A2T_SEGMENT);
          if (result.sname === req.params.id) {
            result.offering = data[i].OFFERING_NAME;
            result.portfolio = data[i].PORTFOLIO;
            result.pname = shortstring(data[i].PORTFOLIO);
            result.sname = shortstring(data[i].A2T_SEGMENT);
            result.segment = data[i].A2T_SEGMENT;
            result.investment = parseInt(data[i].INVESTMENT);
            result.capacity = parseInt(data[i].PEOPLE_TRAINED);
            result.cost = parseInt(data[i].COST_PER_PERSON);
            result.nps = parseInt(data[i].NPS);
            result.claimActual = parseInt(data[i].CLAIM_HOURS);
            result.claimPercent = parseFloat(data[i].CLAIM);
            result.signingsCurrent = parseInt(data[i].SIGNINGS_CURRENT);
            // result.signingsPrevious = parseInt(data[i].SIGNINGS_PREVIOUS);
            result.signingsPercent = parseFloat(data[i].SIGNINGS_YTY);
            result.revenueCurrent = parseInt(data[i].REVENUE_CURRENT);
            // result.revenuePrevious = parseInt(data[i].REVENUE_PREVIOUS);
            result.revenuePercent = parseFloat(data[i].REVENUE_YTY);
            result.gpCurrent = parseInt(data[i].GROSS_PROFIT_CURRENT);
            // result.gpPrevious = parseInt(data[i].GROSS_PROFIT_PREVIOUS);
            result.gpPercent = parseFloat(data[i].GROSS_PROFIT_YTY);
            break;
          }
        }
      }
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: result
      })
    });
    conn.close(() => {
      console.log('connection closed.');
    });
  })
}
