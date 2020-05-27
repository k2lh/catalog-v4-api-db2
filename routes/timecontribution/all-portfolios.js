module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) console.log(err);
    conn.query(`SELECT *
      FROM ccc.F_CA_FINANCIAL_SUMMARY_BY_PORTFOLIO_JCHA F
      FULL OUTER JOIN ccc.F_CA_INVEST_TRAINED_NPS_CLAIM_BY_PORTFOLIO_JCHA I
      ON F.PORTFOLIO = I.PORTFOLIO
      WITH UR`, function (err, data) {
      if (err) console.log(err);
      else {
        var results = {
          "total": {},
          "tables": []
        };
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
          result.pname = shortstring(data[i].PORTFOLIO);
          result.portfolio = data[i].PORTFOLIO;
          result.investment = parseInt(data[i].INVESTMENT);
          result.capacity = parseInt(data[i].PEOPLE_TRAINED);
          result.cost = parseInt(data[i].COST_PER_PERSON);
          result.nps = parseInt(data[i].NPS);
          result.claimActual = parseInt(data[i].CLAIM_HOURS);
          result.claimPercent = parseFloat(data[i].CLAIM);
          result.signingsCurrent = parseInt(data[i].SIGNINGS_CURRENT);
          result.signingsPercent = parseFloat(data[i].SIGNINGS_YTY);
          result.revenueCurrent = parseInt(data[i].REVENUE_CURRENT);
          result.revenuePercent = parseFloat(data[i].REVENUE_YTY);
          result.gpCurrent = parseInt(data[i].GROSS_PROFIT_CURRENT);
          result.gpPercent = parseFloat(data[i].GROSS_PROFIT_YTY);
          result.tssis = data[i].TSS_IS;
          result.orderby = data[i].NUM;
          if (result.pname === 'total') {
            results.total = result;
          } else {
          results.tables.push(result);
          }
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
