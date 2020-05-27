const express = require('express');
const router = express.Router();
const request = require('request');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const client_id = 'Iv1.8ba3cf1f5331cf44';
const client_secret = '286bbc6cddc4c9775245be3b01f795805beff723';

module.exports = function (app) {

  router.get("/employees/base/:cnum", require('./employee/base'))
  router.get("/employees/edvisor/:cnum", require('./employee/edvisor'))
  router.get("/employees/yl/:cnum", require('./employee/yl'))
  router.get("/employees/:cnum", require('./employee/index'))
  router.get("/test/employees/:cnum", require('./employee/test'))
  router.get("/redhat-lp", require('./rhlp'))

  // actuals to targets
  router.get("/targets/totals", require('./target/index'))
  router.get("/targets-backup", require('./target/backup'))
  router.get("/targets", require('./target/base'))
  router.get("/targets-model", require('./target/model'))
  router.get("/targets-weekly", require('./target/weekly'))
  router.get("/targets-learning-plan", require('./target/learningplan'))
  router.get("/targets-test-progress", require('./target/progresstest'))
  router.get("/targets-progress", require('./target/progress'))
  router.get("/targets-program", require('./target/program'))

  // ontology
  router.get("/user/:cnum/claims/total", require('./claim/total'))
  router.get("/user/:cnum/claims", require('./claim/index'))
  router.get("/spending/:cnum", require('./spending/index'))
  router.get("/spending/:cnum/total", require('./spending/total'))

  // time contribution files
  router.get("/timecontribution/all/portfolios", require('./timecontribution/all-portfolios'))
  router.get("/timecontribution/all/offerings", require('./timecontribution/all-offerings'))
  router.get("/timecontribution/all/segments", require('./timecontribution/all-segments'))
    // get a single set of totals
    router.get("/timecontribution/one/portfolios/:id", require('./timecontribution/one-portfolio'))
    router.get("/timecontribution/one/offerings/:id", require('./timecontribution/one-offering'))
    router.get("/timecontribution/one/segments/:id", require('./timecontribution/one-segment'))
    // get all children by parent
    router.get("/timecontribution/offerings/:id", require('./timecontribution/batch-offering'))
    router.get("/timecontribution/segments/:id", require('./timecontribution/batch-segment'))
    // router.get("/timecontribution/segment/:id", require('./timecontribution/batch-claims'))
    router.get("/timecontribution/segments-mapped", require('./timecontribution/segments-mapped'))
    router.get("/timecontribution/raw/portfolios", require('./timecontribution/raw-portfolios'))
    router.get("/timecontribution/raw/segments", require('./timecontribution/raw-segments'))
    router.get("/timecontribution/raw/offerings", require('./timecontribution/raw-offerings'))

  // executive summ
  router.post("/executive/intentional", require('./executive/intentional'))
  router.post("/executive/metrics", require('./executive/metrics'))

  // teamviews
  router.get("/teamview/badges/:org/:mgr", require('./teamview/badges-mgr'))
  router.get("/teamview/badges/individual/:org/:mgr/:ind", require('./teamview/badges-ind'))
  router.get("/teamview/certs/:org/:mgr", require('./teamview/certs-mgr'))
  router.get("/teamview/certs/individual/:org/:mgr/:ind", require('./teamview/certs-ind'))
  router.get("/teamview/learning/:org/:mgr", require('./teamview/learn-mgr'))
  router.get("/teamview/learning/individual/:org/:mgr/:ind", require('./teamview/learn-ind'))
  router.get("/teamview/summary/:org/:mgr", require('./teamview/summary-mgr'))
  router.get("/teamview/summary/individual/:org/:mgr/:ind", require('./teamview/summary-ind'))
  // router.get("/teamview/classes/:cnum", require('./teamview/classes'))

  return router;
};
