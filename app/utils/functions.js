const moment = require("moment");
const formatMessage = (username, message) => {
  return {
    username,
    message,
    time: moment().format("hh:mm a"),
  };
};

module.exports = formatMessage;
