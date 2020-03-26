import fake from "../fake";

exports.seed = knex =>
  knex("bookmarks")
    .del()
    .then(() => knex("bookmarks").insert(fake.bookmarks));
