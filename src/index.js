import express from 'express';
import distance from 'gps-distance';

const app = express();
const users = {};

app.use((req, res, next) => {
  const { userId, latitude, longitude } = req.query;
  if (!!userId && !!+latitude && !!+longitude) {
    users[userId] = {
      latitude: +latitude,
      longitude: +longitude,
      updatedAt: new Date(),
    };
    req.hasPosition = true;
  }
  next();
});

app.get('/all-users', (req, res) => {
  res.send(
    Object.values(users)
      .map(({ latitude, longitude }) => [latitude, longitude]));
});

app.get('/distance-to-nearest-user', (req, res) => {
  if (!req.hasPosition) {
    res.status(400).end();
    return;
  }
  const currUser = users[req.query.userId];
  res.send(
    Object.values(users)
      .filter(user => user !== currUser)
      .reduce(
        (p, { latitude, longitude }) =>
          Math.min(p, distance(currUser.latitude, currUser.longitude, latitude, longitude)),
        Infinity)
      .toString());
});

setInterval(
  () =>
    Object.entries(users).forEach(([userId, { updatedAt }]) => {
      if (updatedAt < new Date() - 5000) delete users[userId];
    }),
  5000);

app.listen(4582);
