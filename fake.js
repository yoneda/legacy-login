const dayjs = require("dayjs");

const randDatetime = () =>
  dayjs()
    .subtract(Math.floor(Math.random() * 60), "day")
    .format("YYYY-M-D H:mm:ss");

const fake = {
  users: [
    {
      id: 1,
      mail: "test@test.com",
      pass: "test"
    },
    {
      id: 2,
      mail: "test2@test.com",
      pass: "test2"
    }
  ],
  bookmarks: [
    {
      id: 1,
      title: "dev.to",
      url: "https://dev.to/",
      createdAt: randDatetime(),
      user: 1
    },
    {
      id: 2,
      title: "Qiita",
      url: "https://qiita.com/",
      createdAt: randDatetime(),
      user: 1
    },
    {
      id: 3,
      title: "google",
      url: "https://www.google.com/",
      createdAt: randDatetime(),
      user: 2
    }
  ]
};

module.exports = fake;
