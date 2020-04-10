const config = require("./knexfile");
const knex = require("knex")(config);

const initialDB = {
  users: [
    {
      id: 1,
      mail: "test@test.com",
      pass: "$2b$12$JnwQ9QUZWxo4qbam2fY98uplOjift9tKbF.DcQ6QleWcWgxwOsSpe",
    },
    {
      id: 2,
      mail: "test2@test.com",
      pass: "$2b$12$3NSBf0JMGhY0mACVlSG4r.mA5SlAmdhAiaSR2glHfVD/3P91jacuS",
    },
  ],
  bookmarks: [
    {
      id: 1,
      title: "dev.to",
      url: "https://dev.to/",
      user: 1,
    },
    {
      id: 2,
      title: "Qiita",
      url: "https://qiita.com/",
      user: 1,
    },
    {
      id: 3,
      title: "google",
      url: "https://www.google.com/",
      user: 2,
    },
  ],
};

const seed = async function () {
  await knex("users")
    .del()
    .then(() => knex("users").insert(initialDB.users));
  await knex("bookmarks")
    .del()
    .then(() => knex("bookmarks").insert(initialDB.bookmarks));
};

const migrate = async function () {
  return await knex.schema
    .createTable("users", (table) => {
      table.increments("id");
      table.string("mail");
      table.string("pass");
    })
    .createTable("bookmarks", (table) => {
      table.increments("id");
      table.string("title");
      table.string("url");
      table.integer("user");
    });
};

const drop = async function () {
  await knex.schema.dropTable("users").dropTable("bookmarks");
};

(async function () {
  const arg = process.argv[2];
  if (arg === "--migrate") {
    await migrate();
  } else if (arg === "--seed") {
    await seed();
  } else if (arg === "--drop") {
    await drop();
  }
  process.exit();
})();
