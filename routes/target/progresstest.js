module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    conn.query('select * from ccc.v_segment_counts_current order by 2,3', function (err, data) {
      if (err) console.log(err);
      let targetsProgressList = []
      let targetsProgressOption1List = []

      data.forEach(element => {
        targetsProgressList.push({
          program: element.SEGMENT_NAME,
          effort: element.EFFORT,
          enrolled: element.VALIDATED_ENROLLED,
          target: element.TARGET,
          completed: element.VALIDATED_COMPLETED,
          inProgress: element.VALIDATED_INPROGRESS
        })
      })
      for (let i = 0; i < targetsProgressList.length; i++) {
        targetsProgressList[i].percent = (targetsProgressList[i].completed / targetsProgressList[i].target).toFixed(2) * 100 || 0
      }

      let uniqueList = []
      for (let i = 0; i < targetsProgressList.length; i++) {
        if (targetsProgressList[i].program in uniqueList) {
          return
        } else {
          uniqueList.push(targetsProgressList[i].program)
        }
      }

      let a = []
      let b = uniqueList
      let arr = a.concat(b);
      for (let i = 0, len = arr.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (arr[i] == arr[j]) {
            arr.splice(j, 1);

            len--;
            j--;
          }
        }
      }

      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < targetsProgressList.length; j++) {

          if (targetsProgressList[j].program == arr[i] && targetsProgressList[j].effort == 'RESKILL') {
            targetsProgressOption1List.push({
              program: targetsProgressList[j].program,
              reskillCompleted: targetsProgressList[j].completed,
              reskillEnrolled: targetsProgressList[j].enrolled,
              reskillInprogress: targetsProgressList[j].inProgress,
            })
          }

          if (targetsProgressList[j].program == arr[i] && targetsProgressList[j].effort == 'UPSKILL') {
            targetsProgressOption1List.push({
              program: targetsProgressList[j].program,
              upskillCompleted: targetsProgressList[j].completed,
              upskillEnrolled: targetsProgressList[j].enrolled,
              upskillInprogress: targetsProgressList[j].inProgress,
            })
          }
        }
      }

      for (let i = 0; i < targetsProgressOption1List.length; i++) {
        for (let j = 0; j < targetsProgressOption1List.length; j++) {
          if (targetsProgressOption1List[i].program == targetsProgressOption1List[j].program) {
            targetsProgressOption1List[i]['upskillCompleted'] = targetsProgressOption1List[j].upskillCompleted
            targetsProgressOption1List[i]['upskillEnrolled'] = targetsProgressOption1List[j].upskillEnrolled
            targetsProgressOption1List[i]['upskillInprogress'] = targetsProgressOption1List[j].upskillInprogress
          }
        }
      }

      let aa = []
      let bb = targetsProgressOption1List
      let arr2 = aa.concat(bb);
      for (let i = 0, len = arr2.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (arr2[i].program == arr2[j].program) {
            arr2.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      for (let i = 0; i < arr2.length; i++) {
        if (!arr2[i].reskillEnrolled) {
          arr2[i].reskillEnrolled = 0
        }
        if (!arr2[i].upskillCompleted) {
          arr2[i].upskillCompleted = 0
        }
        if (!arr2[i].reskillCompleted) {
          arr2[i].reskillCompleted = 0
        }
        if (!arr2[i].upskillEnrolled) {
          arr2[i].upskillEnrolled = 0
        }
        if (!arr2[i].reskillInprogress) {
          arr2[i].reskillInprogress = 0
        }
        if (!arr2[i].upskillInprogress) {
          arr2[i].upskillInprogress = 0
        }
        arr2[i].totalCompleted = (arr2[i].reskillCompleted || 0) + (arr2[i].upskillCompleted || 0)
        arr2[i].totalEnrolled = (arr2[i].reskillEnrolled || 0) + (arr2[i].upskillEnrolled || 0)
        arr2[i].totalInprogress = (arr2[i].reskillInprogress || 0) + (arr2[i].upskillInprogress || 0)
      }

      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: arr2
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
