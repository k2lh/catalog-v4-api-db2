module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
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
        if (Object.entries(counts)[j][1] > 3) {
          var obj = {
            datestamp: Object.entries(counts)[j][0],
            data: Object.entries(counts)[j][1]
          };
          result.push(obj);
        }
      }
      return result;
    };
    conn.query(`select cnum, emp_name, Learningactivitytitle, LearningStartdate, LearningCompletionDate, Duration_Hours
      from zzz.ZZZ_employees a inner join zzz.YL_MANAGERS_GLOBAL m ON a.CNUM = m.EMP_CNUM AND m.LEVEL = 1 inner join (
      select learnercnum, Learningactivitytitle, LearningStartdate, LearnerCompletiondate LearningCompletionDate, Duration/60 Duration_Hours
      from zzz.f_yl_learner_transcripts b where learnertranscriptstatus_key in (1,18,22,25) union all
      select cnum, plantitle, dateenrolled, datecomplete, null Duration_Hours
      from zzz.edvisor_global_completion_report where complete =1 ) l on a.cnum = l.learnercnum
      where report_grp='` + req.params.org + `'
      AND m.MGR_CNUM = '` + req.params.mgr + `'`, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        var results = {
          learnrows: [],
          classyears: [],
          classrecent: []
        };
        var classyearsTmp = [];
        var classrecentTmp = [];
        var obj = {};
        var str = '';
        for (i = 0; i < data.length; i++) {
          if (data[i].CNUM.trim() === req.params.ind) {
            obj = {};
            obj.cnum = data[i].CNUM.trim();
            obj.hours = Math.round(data[i].DURATION_HOURS);
            obj.classtitle = data[i].LEARNINGACTIVITYTITLE.trim();
            if (data[i].LEARNINGSTARTDATE !== null) {
              obj.start = data[i].LEARNINGSTARTDATE.substring(0, 7);
            } else {
              obj.start = null;
            }
            results.learnrows.push(obj);
          }
          if (data[i].LEARNINGCOMPLETIONDATE !== null) {
            obj.end = data[i].LEARNINGCOMPLETIONDATE.substring(0, 7);
            str = data[i].LEARNINGCOMPLETIONDATE.substring(0, 4);
            if (str > 2015) {
              classyearsTmp.push(str);
            }
            if (str > 2019) {
              classrecentTmp.push(data[i].LEARNINGCOMPLETIONDATE.substring(0, 7));
            }
          } else {
            obj.end = null;
          }
        }
        results.classyears = countAll(classyearsTmp);
        results.classrecent = countAll(classrecentTmp);
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
