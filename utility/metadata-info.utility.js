const getMetadataInfo = (req) => {
  return {
    currentDatetime: req.datetime
  };
}

module.exports = {
  getMetadataInfo
}
