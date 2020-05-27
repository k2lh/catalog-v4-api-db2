module.exports = function (req, res, next) {
  const fs = require('fs');
  const path = require('path');
  let result = fs.readFileSync(path.join(__dirname, '../../static/tc_segments_details.json'), 'utf-8')

  res.status(200).send({
    success: 'true',
    message: 'file retrieved successfully',
    data: JSON.parse(result)
  })
}
