const request = require('request');
const website = 'https://api.ipify.org?format=json';

const fetchMyIP = (callback) => {
  request(website, (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
      return;
    }

    const { latitude, longitude } = JSON.parse(body);

    callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((err, ip) => {
    if (err) {
      callback(err, null);
      return;
    }
    fetchCoordsByIP(ip, (err, coords) => {
      if (err) {
        callback(err, null);
        return;
      }
      fetchISSFlyOverTimes(coords, (err, timesData) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!err) {
          callback(null, timesData);
        }
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };
// module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes};