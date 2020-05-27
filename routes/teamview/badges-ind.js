module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    function countAll(arr) {
      var counts = {};
      var result = [];
      arr.sort();
      for (var i = 0; i < arr.length; i++) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
      }
      for (var j = 0; j < Object.entries(counts).length; j++) {
        var obj = {
          datestamp: Object.entries(counts)[j][0],
          data: Object.entries(counts)[j][1]
        };
        result.push(obj);
      }
      result.push(result.shift());
      return result;
    };
    function countMost(arr) {
      var counts = {};
      var result = [];
      for (var i = 0; i < arr.length; i++) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
      }
      for (var j = 0; j < Object.entries(counts).length; j++) {
        if (Object.entries(counts)[j][1] > 2) {
          var obj = {
            datestamp: Object.entries(counts)[j][0],
            data: Object.entries(counts)[j][1]
          };
          result.push(obj);
        }
      }
      return result;
    };
    if (err) return console.log(err);
    conn.query(`SELECT
      e.CNUM, e.EMP_NAME, e.EMAIL,
      e.BADGE_NAME,
      e.ISSUE_DATE,
      e.BADGE_STATUS,
      e.EXPIRES,
      PROFESSION_BADGES_GRP,
      BADGE_DISPLAY_NAME,
      BADGE_LEVEL,
      MAX_BADGE_LEVEL,
      STRAT_TAGS,
      ISSUE_ID
      FROM zzz.V_JRSS_BADGES e
      INNER JOIN zzz.YL_MANAGERS_GLOBAL m ON e.CNUM = m.EMP_CNUM AND m.LEVEL = 1
      WHERE e.BADGE_STATUS IN ('accepted', 'pending')
      AND e.REPORT_GRP = '` + req.params.org + `'
      AND m.MGR_CNUM = '` + req.params.mgr + `'`, function (err, data) {
        if (err) {
          console.log(err)
        } else {
          var results = {
            badgerows: [],
            badgeyears: [],
            badgenames: [],
            badgerecent: []
          };
          var badgeyearsTmp = [];
          var badgerecentTmp = [];
          var str = '';
          for (i = 0; i < data.length; i++) {
            if (data[i].CNUM === req.params.ind) {
              obj = {};
              obj.badgeName = data[i].BADGE_NAME;
              obj.completion = data[i].ISSUE_DATE;
              obj.profBadgeGroup = data[i].PROFESSION_BADGES_GRP;
              obj.badgeLevel = data[i].BADGE_LEVEL;
              results.badgerows.push(obj);
            }
            results.badgenames.push(data[i].BADGE_NAME);
            if (data[i].ISSUE_DATE !== null) {
              obj.end = data[i].ISSUE_DATE.substring(0, 7);
              str = data[i].ISSUE_DATE.substring(0, 4);
              if (str > 2015) {
                badgeyearsTmp.push(str);
              }
              if (str > 2019) {
                badgerecentTmp.push(data[i].ISSUE_DATE.substring(0, 7));
              }
            } else {
              obj.end = null;
            }
          }
          results.badgeyears = countAll(badgeyearsTmp);
          results.badgerecent = countAll(badgerecentTmp);
        }
      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        // data: JSON.parse(result)
        data: results
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
