const fs = require('fs'); // pull in the file system module
const url = require('url');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const respond = (request, response, status, content, type) => {
  response.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  response.write(content);
  response.end();
};

const respondJSON = (request, response, status, responseJSON) => {
  const responseString = JSON.stringify(responseJSON);

  respond(request, response, status, responseString, 'application/json');
};

const respondXML = (request, response, status, responseJSON) => {
  let responseXML = '<response>';
  responseXML = `${responseXML}<message>${responseJSON.message}</message>`;
  if (responseJSON.id) {
    responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
  }
  responseXML = `${responseXML}</response>`;

  respond(request, response, status, responseXML, 'text/xml');
};

const getProperType = (request, response, status, message) => {
  if (request.headers.accept === 'text/xml') {
    respondXML(request, response, status, message);
  } else {
    respondJSON(request, response, status, message);
  }
};

const getIndex = (request, response) => {
  respond(request, response, 200, index, 'text/html');
};

const getCSS = (request, response) => {
  respond(request, response, 200, style, 'text/css');
};

const getSuccess = (request, response) => {
  const responseJSON = {
    message: 'This is a successful response',
  };

  getProperType(request, response, 200, responseJSON);
};

const getBadRequest = (request, response) => {
  const responseJSON = {
    message: 'This request has the required parameters',
  };

  const queryData = url.parse(request.url, true).query;
  if (!queryData.valid || queryData.valid !== 'true') {
    responseJSON.message = 'Missing valid query parameter set to true';
    responseJSON.id = 'badRequest';
    return getProperType(request, response, 400, responseJSON);
  }

  return getProperType(request, response, 200, responseJSON);
};

const getUnauthorizedRequest = (request, response) => {
  const responseJSON = {
    message: 'Logged in successfully',
  };

  const queryData = url.parse(request.url, true).query;
  if (!queryData.loggedIn || queryData.loggedIn !== 'true') {
    responseJSON.message = 'Missing loggedIn query parameter set to true';
    responseJSON.id = 'unauthorized';
    return getProperType(request, response, 401, responseJSON);
  }

  return getProperType(request, response, 200, responseJSON);
};

const getForbidden = (request, response) => {
  const responseJSON = {
    message: 'You have access to this content.',
  };

  if (true) { // Emulate forbidden-ness
    responseJSON.message = 'You do not have access to this content.';
    responseJSON.id = 'forbidden';
    return getProperType(request, response, 403, responseJSON);
  }

  return getProperType(request, response, 200, responseJSON);
};

const getInternalServerError = (request, response) => {
  const responseJSON = {};

  responseJSON.message = 'Internal Server Error. Something went wrong.';
  responseJSON.id = 'internalError';

  return getProperType(request, response, 500, responseJSON);
};

const getUnimplemented = (request, response) => {
  const responseJSON = {};

  responseJSON.message = 'Internal Server Error. Something went wrong.';
  responseJSON.id = 'internalError';

  return getProperType(request, response, 501, responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'This is not the page you\'re looking for...',
    id: 'notFound',
  };

  getProperType(request, response, 404, responseJSON);
};

module.exports = {
  getIndex,
  getCSS,
  getSuccess,
  getBadRequest,
  getUnauthorizedRequest,
  getForbidden,
  getInternalServerError,
  getUnimplemented,
  notFound,
};
