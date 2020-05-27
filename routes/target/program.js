module.exports = function (req, res) {
  let result = fs.readFileSync(path.join(__dirname, '../static/segment_counts_current.json'), 'utf-8')
  let targetsProgramList = []
  JSON.parse(result).forEach(element => {
    targetsProgramList.push({
      program: element.SEGMENT_NAME,
      effort: element.EFFORT,
      enrolled: element.VALIDATED_ENROLLED,
      target: element.TARGET,
      completed: element.VALIDATED_COMPLETED,
      IdentifiedPotentialPractioners: element.IDENTIFIED_POTENTIAL_PRACTITIONERS
    })
  })
  for (let i = 0; i < targetsProgramList.length; i++) {
    targetsProgramList[i].percent = (targetsProgramList[i].completed / targetsProgramList[i].target).toFixed(2) * 100 || 0
  }
  res.status(200).send({
    success: 'true',
    message: 'file retrieved successfully',
    data: targetsProgramList
  })
}
