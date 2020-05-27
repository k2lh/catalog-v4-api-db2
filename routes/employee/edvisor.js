module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);

    let completiondate = req.query.completiondate || '2019-01-01'
    conn.query(`Select
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
      and yyy.cnum = '` + req.params.cnum + `'`, function (err, data) {
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
