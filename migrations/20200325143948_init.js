exports.up = function(knex) {
  return knex.schema
    .createTable("users", table => {
      table.increments("id");
      table.string("mail");
      table.string("pass");
    })
    .createTable("bookmarks", table => {
      table.increments("id");
      table.string("title");
      table.string("url");
      table.integer("user");
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable("users").dropTable("bookmarks");
};
