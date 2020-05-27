module.exports = function (req, res, next) {
  let ibmdb = require('ibm_db');
  ibmdb.open(process.env.DB2_URL, function (err, conn) {
    if (err) return console.log(err);
    conn.query(`SELECT DISTINCT
    e.CNUM, e.EMP_NAME, e.EMAIL,
    e.REGION,
    e.MARKET,
    e.COUNTRY,
    e.CIC_LOCATION,
    e.JRSS,
    e.BAND,
    e.GLOBAL_MGR_NAME,
    e.INCOUNTRY_MGR_NAME,
    e.PROFESSION,
    e.BUSINESS_MODEL,
    e.SERVICE_LINE,
    e.SERVICE_NAME,
    e.SERVICE_AREA
    FROM zzz.V_JRSS_BADGES e
    INNER JOIN zzz.YL_MANAGERS_GLOBAL m ON e.CNUM = m.EMP_CNUM AND m.LEVEL = 1
    AND e.REPORT_GRP = '` + req.params.org + `'
    AND m.MGR_CNUM = '` + req.params.mgr + `'`, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        var results = {
          erows: [],
          eregion: [],
          ejrss: [],
          eband: [],
          eprofession: [],
          eserline: []
        };
        var str = '';
        for (i = 0; i < data.length; i++) {
          obj = {};
          obj.employee = data[i].EMP_NAME;
          obj.email = data[i].EMAIL;
          obj.region = data[i].REGION;
          obj.market = data[i].MARKET;
          obj.country = data[i].COUNTRY;
          obj.ciclocation = data[i].CIC_LOCATION;
          obj.jrss = data[i].JRSS;
          obj.band = data[i].BAND;
          obj.profession = data[i].PROFESSION;
          obj.busmodel = data[i].BUSINESS_MODEL;
          obj.serline = data[i].SERVICE_LINE;
          obj.sername = data[i].SERVICE_NAME;
          obj.serarea = data[i].SERVICE_AREA;
          results.erows.push(obj);
          results.eregion.push(data[i].REGION);
          results.ejrss.push(data[i].JRSS);
          results.eband.push(data[i].BAND);
          results.eprofession.push(data[i].PROFESSION);
          results.eserline.push(data[i].SERVICE_LINE);
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
