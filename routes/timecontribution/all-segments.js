module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) console.log(err);
    conn.query(`SELECT * FROM ccc.F_CA_FINANCIAL_INVEST_PORTFOLIO_GM WITH ur`, function (err, data) {
    // TEMP REPLACEMENT FOR:
    // conn.query(`SELECT * FROM ccc.F_CA_INVEST_TRAINED_NPS_CLAIM_SEGMENT_NOOFFER WITH ur`, function (err, data) {
      if (err) console.log(err);
      else {
        var results = {
          "totals": {
            "all": {},
            "main": {},
            "extra": {}
          },
          "tables": {
            "main": [],
            "extra": []
          }
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
          result.sname = shortstring(data[i].SEGMENT_NAME);
          result.segment = data[i].SEGMENT_NAME;
          result.portfolio = data[i].PORTFOLIO;
          result.investment = parseInt(data[i].INVESTMENT);
          result.capacity = parseInt(data[i].TRAINED_EMPLOYEES);
          result.cost = parseInt(data[i].COST_PER_PERSON);
          result.nps = parseFloat(data[i].NPS);
          result.claimActual = parseInt(data[i].CLAIM_HOURS);
          result.claimPercent = parseFloat(data[i].CLAIM);
          result.signingsPercent = parseFloat(data[i].SIGNINGS_YTY);
          result.revenuePercent = parseFloat(data[i].REVENUE_YTY);
          result.gpPercent = parseFloat(data[i].GROSS_PROFIT_YTY);
          if (result.pname === 'total') {
            if (result.sname === 'total') {
              results.totals.all = result;
            }
            if (result.sname === 'training') {
              results.totals.main = result;
            }
            if (result.sname === 'additional') {
              results.totals.extra = result;
            }
          } else {
            if (result.pname === 'additionalinvestments') {
              results.tables.extra.push(result);
            } else {
              results.tables.main.push(result);
            }
          }
        }
        var allresults = [];
        allresults.push(results);
      }
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: allresults
      })
    });
    conn.close(() => {
      console.log('connection closed.');
    });
  })
}
