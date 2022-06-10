const fs = require("fs-extra");
const Handlebars = require("handlebars");
const moment = require("moment");

function injectMetadata(compiledTemplate, version) {
  return `
[//]: # (s-${version})

${compiledTemplate}
[//]: # (e-${version})
`;
}

module.exports.renderTemplate = function (changelogTemplate, data, version) {
  const compiledTemplate = Handlebars.compile(changelogTemplate);
  return injectMetadata(compiledTemplate(data), version);
};

module.exports.saveChangelogToFile = function (
  filePath,
  renderedTemplate,
  startString
) {
  let oldData = fs.readFileSync(filePath);
  fs.truncate(filePath);
  const stream = fs.createWriteStream(filePath, { flags: "a" });

  if (startString) {
    const [oldDataBeforeStartString, ...oldDataAfterStartString] = fs
      .readFileSync(filePath)
      .toString()
      .split(startString);

    stream.write(oldDataBeforeStartString);

    // If `startString` occurs multiple times in the current file, we'll loose the text
    // after the second occurrence. We fix this by joining the list of oldDataAfterStartString
    // with the startString.
    oldData = oldDataAfterStartString.join(startString);
  }

  if (startString) {
    stream.write(startString + "\n");
  }

  stream.write(renderedTemplate);

  if (oldData) {
    stream.write(oldData);
  }

  stream.end();
};

module.exports.generateTemplateData = function (
  newVersion,
  dateFormat,
  fragments
) {
  return {
    newVersion,
    bumpDate: moment().format(dateFormat),
    fragments,
  };
};
