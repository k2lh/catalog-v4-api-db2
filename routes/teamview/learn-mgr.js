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
          tablerows: [],
          classPast: [],
          classRecent: {
            columns: ['datestamp', 'data'],
            rows: []
          },
          classNames: []
        };
        var classPastTmp = [];
        var classRecentTmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var obj = {};
        var str = '';
        var datestr = '';
        for (i = 0; i < data.length; i++) {
          obj = {};
          obj.cnum = data[i].CNUM.trim();
          obj.employee = data[i].EMP_NAME.trim();
          obj.hours = Math.round(data[i].DURATION_HOURS);
          obj.classtitle = data[i].LEARNINGACTIVITYTITLE.trim();
          if (data[i].LEARNINGSTARTDATE !== null) {
            obj.start = data[i].LEARNINGSTARTDATE.substring(0, 7);
          } else {
            obj.start = data[i].LEARNINGCOMPLETIONDATE.substring(0, 7);
          }
          obj.end = data[i].LEARNINGCOMPLETIONDATE.substring(0, 7);
          results.tablerows.push(obj);
          results.classNames.push(data[i].LEARNINGACTIVITYTITLE.trim());
          str = data[i].LEARNINGCOMPLETIONDATE.substring(0, 4);
          if (str > 2017) {
            classPastTmp.push(str);
          }
          if (str > 2019) {
            datestr = parseInt(data[i].LEARNINGCOMPLETIONDATE.substring(5, 7), 10);
            var set = datestr - 1;
            classRecentTmp[set] = classRecentTmp[set] + Math.round(data[i].DURATION_HOURS);
          }
        }
        results.classPast = countAll(classPastTmp);
        for (i = 0; i < classRecentTmp.length; i++) {
          obj = {};
          var j = i + 1;
          if (j < 10) {
            obj.datestamp = '0' + j + '/20';
          } else {
            obj.datestamp = j + '/20';
          }
          obj.data = classRecentTmp[i];
          results.classRecent.rows.push(obj);
        }
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
