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

exports.newPage = `
<div>
  ${header}
  ${authedMenu}
  <h3>New:</h3>
  <form action="/new/done" method="post" autocomplete="off">
    <input type="text" name="title" placeholder="title" /><br />
    <input type="text" name="url" placeholder="url" /><br />
    <input type="submit" value="submit" /><br />
  </form>
</div>
`;

