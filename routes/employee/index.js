module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    let completiondate = req.query.completiondate || '2019-01-01'
    conn.query(`Select
        cast (bd.CNUM as varchar(9)) as "CNUM",
        xxx.EMAIL,
        xxx.REGION,
        xxx.COUNTRY,
        xxx.CIC,
        xxx.CIC_LOCATION,
        xxx.TSS_IS,
        xxx.SERVICE_NAME,
        xxx.SERVICE_AREA,
        xxx.JRSS,
        xxx.BAND,
        xxx.EMP_NAME,
        xxx.BADGE_NAME as "LEARNING_NAME",
        xxx.ISSUE_DATE as "COMPLETION_DATE",
        xxx.BADGE_STATUS,
        xxx.EXPIRES,
        xxx.REPORT_GRP,
        xxx.PROFESSION_BADGES_GRP,
        xxx.GLOBAL_MGR_NAME,
        xxx.INCOUNTRY_MGR_NAME,
        xxx.PROFESSION,
        xxx.BADGE_DISPLAY_NAME,
        xxx.BADGE_LEVEL,
        xxx.MARKET,
        bbb.MGR_CNUM,
        NULL as "ENROLLED_PROGRAM",
        'Badges' as "SOURCE"
        from zzz.V_JRSS_BADGES bd
        join zzz.YL_MANAGERS_GLOBAL ylm on xxx.cnum=ylm.emp_cnum
        Where xxx.badge_status in ('accepted','queued')
        and xxx.CNUM = '` + req.params.cnum + `'
        UNION ALL
        --Pull in YL Data
        Select
        aaa.LEARNERCNUM as "CNUM",
        aaa.LEARNERINTRANETID as "EMAIL",
        yyy.REGION as "REGION",
        yyy.COUNTRY,
        yyy.CIC,
        yyy.CIC_LOCATION,
        yyy.TSS_IS,
        yyy.Svc_Nm      Service_Name,
          yyy.Svc_area_Nm Service_Area,
        yyy.JRSS,
        gd.BAND,
        yyy.EMP_NAME,
        aaa.LEARNINGACTIVITYTITLE as "LEARNING_NAME",
        aaa.LEARNERCOMPLETIONDATE as "COMPLETION_DATE",
        NULL,
        NULL,
        yyy.REPORT_GRP,
        NULL,
        yyy.GLOBAL_MGR_NAME,
        yyy.INCOUNTRY_MGR_NAME,
        djr.pjc_name AS "profession",
        NULL,
        NULL,
        yyy.MARKET,
        bbb.MGR_CNUM,
        NULL,
        'YL' as "SOURCE"
        from zzz.F_YL_LEARNER_TRANSCRIPTS lt
        join zzz.YL_MANAGERS_GLOBAL ylm on aaa.LEARNERCNUM=ylm.EMP_CNUM
        join zzz.ZZZ_EMPLOYEES ZZZ on aaa.LEARNERCNUM = yyy.cnum
        LEFT JOIN
          zzz.d_job_role djr
        ON
          djr.jr_id = yyy.jobrole_id
        LEFT JOIN
          zzz.d_yl_generic_demographics gd
        ON
          yyy.cnum = gd.learnercnum
        AND current_flag='Y'
        Where aaa.learnercompletiondate >= '` + completiondate + `'
        and yyy.cnum = '` + req.params.cnum + `'
        UNION ALL
        --Pull in EDVISOR DATA
        Select
        ed.CNUM,
        ed.INTERNETEMAIL as "EMAIL",
        yyy.REGION,
        yyy.COUNTRY,
        yyy.CIC,
        yyy.CIC_LOCATION,
        yyy.TSS_IS,
        yyy.Svc_Nm as "Service_Name",
        yyy.Svc_area_Nm as "Service_Area",
        yyy.JRSS,
        gd.BAND,
        yyy.EMP_NAME,
        ed.PLANTITLE as "LEARNING_NAME",
        ed.DATECOMPLETE as "COMPLETION_DATE",
        NULL,
        NULL,
        yyy.REPORT_GRP,
        NULL,
        yyy.GLOBAL_MGR_NAME,
        yyy.INCOUNTRY_MGR_NAME,
        djr.pjc_name AS "profession",
        NULL,
        NULL,
        yyy.MARKET,
        bbb.MGR_CNUM,
        ed.ENROLLEDPROGRAM AS "ENROLLED_PROGRAM",
        'Edvisor' as "SOURCE"
        from zzz.EDVISOR_GLOBAL_COMPLETION_REPORT ed
        join zzz.YL_MANAGERS_GLOBAL ylm on ed.cnum=ylm.emp_cnum
        join zzz.ZZZ_EMPLOYEES ZZZ on ed.cnum = yyy.cnum
        LEFT JOIN
          zzz.d_job_role djr
        ON
          djr.jr_id = yyy.jobrole_id
        LEFT JOIN
          zzz.d_yl_generic_demographics gd
        ON
          yyy.cnum = gd.learnercnum
        AND current_flag='Y'
        Where Ed.Datecomplete >= '` + completiondate + `'
        and yyy.cnum = '` + req.params.cnum + `'

        `, function (err, data) {
      if (err) console.log(err);
      else console.log(data);
      let currentYearData = [];
      let oneYearAgoData = [];
      let twoYearAgoData = [];
      let threeYearAgoData = [];
      let fourYearAgoData = [];

      let badge_hist = [
        {
          year: 2020,
          quantity: 0
        },
        {
          year: 2020,
          quantity: 0
        },
        {
          year: 2020,
          quantity: 0
        },
        {
          year: 2020,
          quantity: 0
        },
        {
          year: 2020,
          quantity: 0
        },
      ]

      let class_hist = [
        {
          month: "Jan",
          quantity: 0
        },
        {
          month: "Feb",
          quantity: 0
        },
        {
          month: "Mar",
          quantity: 0
        },
        {
          month: "Apr",
          quantity: 0
        },
        {
          month: "May",
          quantity: 0
        },
        {
          month: "June",
          quantity: 0
        },
        {
          month: "July",
          quantity: 0
        },
        {
          month: "Aug",
          quantity: 0
        },
        {
          month: "Sep",
          quantity: 0
        },
        {
          month: "Oct",
          quantity: 0
        },

        {
          month: "Nov",
          quantity: 0
        },
        {
          month: "Dec",
          quantity: 0
        },
      ];

      let inProgressBadgeData = []
      for (let i = 0; i < data.length; i++) {
        if (data[i].BADGE_STATUS == "queued") {
          inProgressBadgeData.push(data[i].BADGE_DISPLAY_NAME)
        }
      }

      let zz = []
      let xx = inProgressBadgeData
      let inProgressBadgeDataList = zz.concat(xx);
      for (let i = 0, len = inProgressBadgeDataList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (inProgressBadgeDataList[i] == inProgressBadgeDataList[j]) {
            inProgressBadgeDataList.splice(j, 1);

            len--;
            j--;
          }
        }
      }

      badges_prog = inProgressBadgeDataList.length;

      let date = new Date;
      let year = date.getFullYear();
      let thisYear = ""
      thisYear = year.toString()

      console.log(year, "---------------------------")
      console.log(thisYear, "---------------------------")

      for (let i = 0; i < data.length; i++) {
        if (data[i].COMPLETION_DATE) {
          let completedDate = data[i].COMPLETION_DATE.toString()
          console.log(completedDate)

          if (completedDate.substring(0, 4).toString() == thisYear) {
            currentYearData.push(data[i])
          }

          if (completedDate.substring(0, 4).toString() == parseInt(thisYear) - 1) {
            oneYearAgoData.push(data[i])
          }

          if (completedDate.substring(0, 4).toString() == parseInt(thisYear) - 2) {
            twoYearAgoData.push(data[i])
          }

          if (completedDate.substring(0, 4).toString() == parseInt(thisYear) - 3) {
            threeYearAgoData.push(data[i])
          }

          if (completedDate.substring(0, 4).toString() == parseInt(thisYear) - 4) {
            fourYearAgoData.push(data[i])
          }
        }
      }
      //delete the same className
      let arr = []
      for (let i = 0; i < currentYearData.length; i++) {
        if (currentYearData[i].LEARNING_NAME in arr) {
          return
        } else {
          arr.push(currentYearData[i].LEARNING_NAME)
        }
      }

      let a = []
      let b = arr
      let classList = a.concat(b);
      for (let i = 0, len = classList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (classList[i] == classList[j]) {
            classList.splice(j, 1);

            len--;
            j--;
          }
        }
      }

      //delete the same completedDate
      let arrDate = []
      for (let i = 0; i < currentYearData.length; i++) {
        if (currentYearData[i].COMPLETION_DATE in arr) {
          return
        } else {
          arrDate.push(currentYearData[i].COMPLETION_DATE)
        }
      }

      let c = []
      let d = arrDate
      let datecomplete = c.concat(d);
      for (let i = 0, len = datecomplete.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (datecomplete[i] == datecomplete[j]) {
            datecomplete.splice(j, 1);

            len--;
            j--;
          }
        }
      }
      if (datecomplete.length != 0) {
        for (let i = 0; i < datecomplete.length; i++) {
          if (datecomplete[i].substring(5, 7) == "01") {
            class_hist[0].quantity = class_hist[0].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "02") {
            class_hist[1].quantity = class_hist[1].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "03") {
            class_hist[2].quantity = class_hist[2].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "04") {
            class_hist[3].quantity = class_hist[3].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "05") {
            class_hist[4].quantity = class_hist[4].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "06") {
            class_hist[5].quantity = class_hist[5].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "07") {
            class_hist[6].quantity = class_hist[6].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "08") {
            class_hist[7].quantity = class_hist[7].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "09") {
            class_hist[8].quantity = class_hist[8].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "10") {
            class_hist[9].quantity = class_hist[9].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "11") {
            class_hist[10].quantity = class_hist[10].quantity + 1;
          } else if (datecomplete[i].substring(5, 7) == "12") {
            class_hist[11].quantity = class_hist[11].quantity + 1;
          }

        }
      }

      //currentYearBadge list and num
      let currentYearBadge = []
      let currentYearBadgeNum = 0
      for (let i = 0; i < currentYearData.length; i++) {
        if (currentYearData[i].BADGE_DISPLAY_NAME != null) {
          currentYearBadge.push(currentYearData[i].BADGE_DISPLAY_NAME)
        } else {
          console.log("");
        }
      }

      let e = []
      let f = currentYearBadge
      let currentYearBadgeList = e.concat(f);
      for (let i = 0, len = currentYearBadgeList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (currentYearBadgeList[i] == currentYearBadgeList[j]) {
            currentYearBadgeList.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      currentYearBadgeNum = currentYearBadgeList.length;

      //oneYearAgoBadge list and num
      let oneYearAgoBadge = []
      let oneYearAgoBadgeNum = 0
      for (let i = 0; i < oneYearAgoData.length; i++) {
        if (oneYearAgoData[i].BADGE_DISPLAY_NAME != null) {
          oneYearAgoBadge.push(oneYearAgoData[i].BADGE_DISPLAY_NAME)
        } else {
          console.log("");
        }
      }

      let aa = []
      let bb = oneYearAgoBadge
      let oneYearAgoBadgeList = aa.concat(bb);
      for (let i = 0, len = oneYearAgoBadgeList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (oneYearAgoBadgeList[i] == oneYearAgoBadgeList[j]) {
            oneYearAgoBadgeList.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      oneYearAgoBadgeNum = oneYearAgoBadgeList.length;

      //twoYearAgoBadge list and num
      let twoYearAgoBadge = []
      let twoYearAgoBadgeNum = 0
      for (let i = 0; i < twoYearAgoData.length; i++) {
        if (twoYearAgoData[i].BADGE_DISPLAY_NAME != null) {
          twoYearAgoBadge.push(twoYearAgoData[i].BADGE_DISPLAY_NAME)
        } else {
          console.log("");
        }
      }

      let cc = []
      let dd = twoYearAgoBadge
      let twoYearAgoBadgeList = cc.concat(dd);
      for (let i = 0, len = twoYearAgoBadgeList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (twoYearAgoBadgeList[i] == twoYearAgoBadgeList[j]) {
            twoYearAgoBadgeList.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      twoYearAgoBadgeNum = twoYearAgoBadgeList.length;

      //threeYearAgoBadge list and num
      let threeYearAgoBadge = []
      let threeYearAgoBadgeNum = 0
      for (let i = 0; i < threeYearAgoData.length; i++) {
        if (threeYearAgoData[i].BADGE_DISPLAY_NAME != null) {
          threeYearAgoBadge.push(threeYearAgoData[i].BADGE_DISPLAY_NAME)
        } else {
          console.log("");
        }
      }

      let ee = []
      let ff = threeYearAgoBadge
      let threeYearAgoBadgeList = ee.concat(ff);
      for (let i = 0, len = threeYearAgoBadgeList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (threeYearAgoBadgeList[i] == threeYearAgoBadgeList[j]) {
            threeYearAgoBadgeList.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      threeYearAgoBadgeNum = threeYearAgoBadgeList.length;

      //fourYearAgoBadge list and num
      let fourYearAgoBadge = []
      let fourYearAgoBadgeNum = 0
      for (let i = 0; i < fourYearAgoData.length; i++) {
        if (fourYearAgoData[i].BADGE_DISPLAY_NAME != null) {
          fourYearAgoBadge.push(fourYearAgoData[i].BADGE_DISPLAY_NAME)
        } else {
          console.log("");
        }
      }

      let jj = []
      let hh = fourYearAgoBadge
      let fourYearAgoBadgeList = jj.concat(hh);
      for (let i = 0, len = fourYearAgoBadgeList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (fourYearAgoBadgeList[i] == fourYearAgoBadgeList[j]) {
            fourYearAgoBadgeList.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      fourYearAgoBadgeNum = fourYearAgoBadgeList.length;

      badge_hist[0].year = parseInt(thisYear) - 4
      badge_hist[0].quantity = fourYearAgoBadgeNum

      badge_hist[1].year = parseInt(thisYear) - 3
      badge_hist[1].quantity = threeYearAgoBadgeNum

      badge_hist[2].year = parseInt(thisYear) - 2
      badge_hist[2].quantity = twoYearAgoBadgeNum

      badge_hist[3].year = parseInt(thisYear) - 1
      badge_hist[3].quantity = oneYearAgoBadgeNum

      badge_hist[4].year = parseInt(thisYear)
      badge_hist[4].quantity = currentYearBadgeNum

      //allYearBadge list and num
      let allYearBadge = [];
      let allYearBadgeNum = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].BADGE_DISPLAY_NAME != null) {
          allYearBadge.push(data[i].BADGE_DISPLAY_NAME)
          // badges = badges + 1
        } else {
          console.log("");
        }
      }

      let j = []
      let h = allYearBadge
      let allYearBadgeList = j.concat(h);
      for (let i = 0, len = allYearBadgeList.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (allYearBadgeList[i] == allYearBadgeList[j]) {
            allYearBadgeList.splice(j, 1);
            len--;
            j--;
          }
        }
      }

      allYearBadgeNum = allYearBadgeList.length;

      let learningDataset = {}
      let classes = classList.length
      let userid = req.params.cnum

      learningDataset.userid = userid
      learningDataset.currentYearBadgeNum = currentYearBadgeNum
      learningDataset.currentYearBadgeList = currentYearBadgeList
      learningDataset.badges_prog = badges_prog
      learningDataset.badge_hist = badge_hist
      learningDataset.allYearBadgeNum = allYearBadgeNum
      learningDataset.allYearBadgeList = allYearBadgeList
      learningDataset.classes = classes
      learningDataset.classList = classList
      learningDataset.class_hist = class_hist

      res.status(200).send({
        success: 'true',
        message: 'file retrieved successfully',
        // data: JSON.parse(result)
        data: learningDataset
        // data: data
      })
      conn.close(function () {
        console.log('done');
      });
    })
  });
}
