module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    conn.query(`select count(distinct cnum) HeadCount, count(distinct total_comp_cnum) Total_completed, count(distinct upskill_comp_cnum) Upskill_completed, count(distinct reskill_comp_cnum) Reskill_completed from (select cnum, case
      when year(dimprogramcompletedate) = year(current date)
      then learnercnum
      end total_comp_cnum, case
      when year(dimprogramcompletedate) = year(current date) and desprogramskill='UPSKILL'
      then learnercnum
      end Upskill_comp_cnum, case
      when year(dimprogramcompletedate) = year(current date) and desprogramskill='RESKILL'
      then learnercnum
      end Reskill_comp_cnum
      from ccc.f_learning)`, function (err, data) {
      if (err) console.log(err);
      else {
        console.log(req.body);
      };
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

function addParam(val, cat, query) {
  if (val.length > 0) {
    for (var i = 0; i < val.length; i++) {
      if (i === 0) {
        query = query + ' AND ' + cat + ' = ' + val[i];
      } else {
        query = query + ' OR ' + cat + ' = ' + val[i];
      }
    }
  }
  return query;
};
