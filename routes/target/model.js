module.exports = function (req, res) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    let queryString=''
    if (req.query.year !== undefined) {
      queryString = 'select * from zzz.v_segment_counts_2019 order by 2,3'
    } else {
      queryString = 'select * from zzz.v_segment_counts_current order by 2,3'
    }
    conn.query(queryString, function (err, data) {
      if (err) console.log(err);

      let map = {},
        groups = [];
      for (let i = 0; i < data.length; i++) {
        let tmp = data[i];
        if (!map[tmp.GROUP]) {
          groups.push({
            order: i + 1,
            group: tmp.GROUP,
            rows: [tmp]
          });
          map[tmp.GROUP] = tmp;
        } else {
          for (let j = 0; j < groups.length; j++) {
            let tmp2 = groups[j];
            if (tmp2.group == tmp.GROUP) {
              tmp2.rows.push(tmp);
              break;
            }
          }
        }
      }
      let groupData = [];
      groups.map((item, index) => {
        groupData.push(
          Object.assign({}, item, {
            totals: {
              upskillEnrolled: {
                displayName: "Total Upskill Enrolled",
                value: 0
              },
              reskillEnrolled: {
                displayName: "Total Reskill Enrolled",
                value: 0
              },
              upskillCompleted: {
                displayName: "Total Upskill Completed",
                value: 0
              },
              reskillCompleted: {
                displayName: "Total Reskill Completed",
                value: 0
              },
              totalInProgress: {
                displayName: "Total in Progress, by unique employees",
                value: 0
              },
            }
          })
        )
      });
      let rowsGroup = []
      let groupTotalUpskillEnrolled = 0
      let groupTotalUpskillCompleted = 0
      let groupTotalReskillEnrolled = 0
      let groupTotalReskillCompleted = 0
      let groupTotalInProgress = 0
      for (let i = 0; i < groupData.length; i++) {

        rowsGroup = groupData[i].rows
        let upskillEnrolledItem = 0
        let upskillCompletedItem = 0
        let reskillEnrolledItem = 0
        let reskillCompletedItem = 0
        let reskilTotalInProgress = 0
        let upskilTotalInProgress = 0

        for (let j = 0; j < rowsGroup.length; j++) {

          if (rowsGroup[j].EFFORT == "UPSKILL") {
            upskillEnrolledItem += rowsGroup[j].VALIDATED_ENROLLED
            upskillCompletedItem += rowsGroup[j].VALIDATED_COMPLETED
            upskilTotalInProgress += rowsGroup[j].VALIDATED_INPROGRESS

          }
          if (rowsGroup[j].EFFORT == "RESKILL") {
            reskillEnrolledItem += rowsGroup[j].VALIDATED_ENROLLED
            reskillCompletedItem += rowsGroup[j].VALIDATED_COMPLETED
            reskilTotalInProgress += rowsGroup[j].VALIDATED_INPROGRESS
          }
        }
        groupData[i].totals.upskillEnrolled.value = upskillEnrolledItem
        groupData[i].totals.upskillCompleted.value = upskillCompletedItem
        groupData[i].totals.reskillEnrolled.value = reskillEnrolledItem
        console.log(groupData[i].totals.reskillEnrolled.value, "groupData[i].totals.reskillEnrolled.value")
        groupData[i].totals.reskillCompleted.value = reskillCompletedItem
        groupData[i].totals.totalInProgress.value = reskilTotalInProgress + upskilTotalInProgress

        groupTotalUpskillEnrolled += groupData[i].totals.upskillEnrolled.value
        groupTotalUpskillCompleted += groupData[i].totals.upskillCompleted.value
        groupTotalReskillEnrolled += groupData[i].totals.reskillEnrolled.value
        groupTotalReskillCompleted += groupData[i].totals.reskillCompleted.value
        groupTotalInProgress += groupData[i].totals.totalInProgress.value

      }

      let targetsModelData = {
        totals: {
          upskillEnrolled: {
            displayName: "Total Upskill Enrolled",
            value: 0
          },
          upskillCompleted: {
            displayName: "Total Upskill Completed",
            value: 0
          },
          reskillEnrolled: {
            displayName: "Total Reskill Enrolled",
            value: 0
          },
          reskillCompleted: {
            displayName: "Total Reskill Completed",
            value: 0
          },
          totalInProgress: {
            displayName: "Total in Progress, by unique employees",
            value: 0
          }
        },
        groups: []
      }
      targetsModelData.groups = groupData
      targetsModelData.totals.upskillEnrolled.value = groupTotalUpskillEnrolled
      targetsModelData.totals.upskillCompleted.value = groupTotalUpskillCompleted
      targetsModelData.totals.reskillEnrolled.value = groupTotalReskillEnrolled
      targetsModelData.totals.reskillCompleted.value = groupTotalReskillCompleted
      targetsModelData.totals.totalInProgress.value = groupTotalInProgress

      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        data: targetsModelData
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
