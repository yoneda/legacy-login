const fake = {
  users: [
    {
      id: 1,
      mail: "test@test.com",
      pass: "$2b$12$JnwQ9QUZWxo4qbam2fY98uplOjift9tKbF.DcQ6QleWcWgxwOsSpe"
    },
    {
      id: 2,
      mail: "test2@test.com",
      pass: "$2b$12$3NSBf0JMGhY0mACVlSG4r.mA5SlAmdhAiaSR2glHfVD/3P91jacuS"
    }
  ],
  bookmarks: [
    {
      id: 1,
      title: "dev.to",
      url: "https://dev.to/",
      user: 1
    },
    {
      id: 2,
      title: "Qiita",
      url: "https://qiita.com/",
      user: 1
    },
    {
      id: 3,
      title: "google",
      url: "https://www.google.com/",
      user: 2
    }
  ]
};

module.exports = fake;
