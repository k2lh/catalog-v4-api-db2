module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
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
      and xxx.CNUM = '` + req.params.cnum + `'`, function (err, data) {
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
