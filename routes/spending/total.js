module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.BOULDER_URL, function (err, conn) {
    if (err) return console.log(err);
    conn.query(`Select e.cnum_id,
          case when l.acct_typ_cd = 'I' and l.CHARGABLE_FG = 'N'then 'Internal Account Non Billable'
          when l.acct_typ_cd = 'I' and l.CHARGABLE_FG = 'Y'then 'Internal Account Billable'
          when l.acct_typ_cd = 'C' and l.CHARGABLE_FG = 'Y' then 'Contract Account Billable'
          when l.acct_typ_cd = 'C' and l.CHARGABLE_FG = 'N' then 'Contract Account Non Billable'
          when l.acct_typ_cd = 'O' and l.CHARGABLE_FG = 'Y' then 'Opportunity Account Billable'
          when l.acct_typ_cd = 'O' and l.CHARGABLE_FG = 'N' then 'Opportunity Account Non Billable'
          when l.acct_typ_cd = 'T' and l.CHARGABLE_FG = 'Y' then 'Internal/Transfer Price Account Billable'
          when l.acct_typ_cd = 'T' and l.CHARGABLE_FG = 'N' then 'Internal/Transfer Price Account Non Billable'
          else 'N/A' end as "LABEL",
          case when sum(l.ORIGINAL_USAGE_QTY) > 0 then sum(l.ORIGINAL_USAGE_QTY) else sum(USAGE_QTY) end as "YTD_HOURS"
          FROM BDWDM.CHRG_LBR19_ALL_V L
          LEFT OUTER JOIN BMSIW.EMP_MASTER_FILE_V E
          ON l.ORIG_COUNTRY_CD = E.COUNTRY_CODE
          AND l.ORIG_COMPANY_CD = E.COMPANY_CODE
          AND l.ORIG_EMP_NUM = E.EMP_SER_NUM
        Inner join ZZZteam.ZZZ_CNUM C ON E.CNUM_ID = C.CNUM
        WHERE replace(E.CNUM_ID, ' ', '') <> ''
        and e.cnum_id = '` + req.params.cnum + `'
        AND YEAR(WEEK_ENDING_DATE) = '2019'
        GROUP BY
        e.cnum_id,
        case when l.acct_typ_cd = 'I' and l.CHARGABLE_FG = 'N'then 'Internal Account Non Billable'
        when l.acct_typ_cd = 'I' and l.CHARGABLE_FG = 'Y'then 'Internal Account Billable'
        when l.acct_typ_cd = 'C' and l.CHARGABLE_FG = 'Y' then 'Contract Account Billable'
        when l.acct_typ_cd = 'C' and l.CHARGABLE_FG = 'N' then 'Contract Account Non Billable'
        when l.acct_typ_cd = 'O' and l.CHARGABLE_FG = 'Y' then 'Opportunity Account Billable'
        when l.acct_typ_cd = 'O' and l.CHARGABLE_FG = 'N' then 'Opportunity Account Non Billable'
        when l.acct_typ_cd = 'T' and l.CHARGABLE_FG = 'Y' then 'Internal/Transfer Price Account Billable'
        when l.acct_typ_cd = 'T' and l.CHARGABLE_FG = 'N' then 'Internal/Transfer Price Account Non Billable'
        else 'N/A' end
        With UR;
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
