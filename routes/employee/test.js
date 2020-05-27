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
      Where xxx.badge_status in ('accepted','pending')
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
