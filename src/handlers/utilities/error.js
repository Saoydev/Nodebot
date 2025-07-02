const vm = require('vm');

function checkCodeErrors(code) {
  try {
    new vm.Script(code);
    return null;
  } catch (err) {
    return err;
  }
}

module.exports = { checkCodeErrors };
