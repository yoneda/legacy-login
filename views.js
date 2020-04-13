const ejs = require("ejs");

const header = `
<div>
  <h2>BookMark</h2>
</div>
`;

const authedMenu = `
<div>
  <span><a href="/">home</a></span>
  <span> |</span>
  <span><a href="/new">new</a></span>
  <span> |</span>
  <span><a href="/setting">setting</a></span>
</div>
`;

const menu = `
<div>
  <span><a href="/signup">signup</a></span>
  <span> |</span>
  <span><a href="/login">login</a></span>
  <span> |</span>
</div>
`;

exports.new = function () {
  const view = `
  <div>
    ${header}
    ${authedMenu}
    <h3>New:</h3>
    <form action="/new" method="post" autocomplete="off">
      <input type="text" name="title" placeholder="title" /><br />
      <input type="text" name="url" placeholder="url" /><br />
      <input type="submit" value="submit" /><br />
    </form>
  </div>
  `;
  return ejs.render(view);
};

exports.home = function ({ user, bookmarks }) {
  const view = `
  <div>
    ${header}
    ${authedMenu}
    <h3>User:</h3>
    <%= user.mail && user.mail + " (mail)" %>
    <%= user.github && user.github + " (github)"  %>
    <h3>Contents:</h3>
    <% bookmarks.forEach(item=>{ %>
      <div>title: <%= item.title %></div>
      <div>url: <%= item.url %></div>
    <% }); %>
  </div>
  `;
  return ejs.render(view, { user, bookmarks });
};

exports.signup = function ({ error }) {
  const view = `
  <div>
    ${header}
    ${menu}
    <h3>Sighup:</h3>
      <button onclick="onClick()">github</button><br /><br />
      <% if(error) { %>
        <div style="color: red;"><%= error %></div><br />
      <% } %>
      <form action="/signup" method="post" autocomplete="off">
        <input type="text" name="mail" placeholder="mail" /><br />
        <input type="text" name="password" placeholder="password" /><br />
        <input type="submit" value="create" /><br />
      </form>
      <script>
        const onClick = () => {
          const url = "https://github.com/login/oauth/authorize";
          const params = "?client_id=c0a3887ca38ee7f8a7fc";
          window.location.href = url + "/" + params;
        }
      </script>
  </div>
  `;
  return ejs.render(view, { error });
};

exports.login = function ({ error }) {
  const view = `
    <div>
      ${header}
      ${menu}
      <h3>Login:</h3>
      <button onclick="onClick()">github</button><br /><br />
      <% if(error) { %>
        <div style="color: red;"><%= error %></div><br />
      <% } %>
      <form action="/login" method="post" autocomplete="off">
        <input type="text" name="mail" placeholder="mail" /><br />
        <input type="text" name="password" placeholder="password" /><br />
        <input type="submit" value="login" /><br />
      </form>
      <script>
        const onClick = () => {
          const url = "https://github.com/login/oauth/authorize";
          const params = "?client_id=c0a3887ca38ee7f8a7fc";
          window.location.href = url + "/" + params;
        }
      </script>
    </div>
    `;
  return ejs.render(view, { error });
};

exports.setting = function ({ user, error }) {
  const view = `
    <div>
      ${header}
      ${authedMenu}
      <% if(user.mail){ %>
        <h3>Change:</h3>
        <% if(error) { %>
          <div style="color: red;"><%= error %></div><br />
        <% } %>
        <form action="/update" method="post" autocomplete="off">
          <input type="text" name="current" placeholder="current" /><br />
          <input type="text" name="fresh" placeholder="fresh" /><br />
          <input type="submit" value="update" /><br />
        </form>
      <% } %>
      <h3>Logout:</h3>
      <form action="/logout" method="post" autocomplete="off">
        <input type="submit" value="logout" /><br />
      </form>
    </div>
    `;
  return ejs.render(view, { user, error });
};
