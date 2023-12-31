/**
 * ToDo List:
 *
 * 1. Add tags (e.g. 'work', 'social', 'miscellaneous'...) so we can add one or more tag to todos
 * (many-to-many relationship between todos and tags). We should be able to add tags and find todos linked
 * to specific tag(s) directly from your REST API.
 *
 * 2. Add database persistence such that todos and tags are not lost upon server restart. You are free to choose
 * any database system you want (make sure you are using an asyncio-based DB driver/interface with Python).
 *
 * 3. Your API should comply with our specs (source code). As an example, a compliant API with swagger can be
 * tested from http://todospecs.thing.zone/?http://todo.thing.zone.
 *
 * Notes: ctx is probably the function which takes as parameter what is given from user as input
 *
 * @type {*|module:koa-router|Router|undefined}
 */

const router = require('koa-router')();
const Koa = require('koa');
const todo_model = require('./todoModel')
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const mongoose = require('mongoose'); // Add Mongoose for MongoDB integration
require('dotenv').config({ path: './config.env' })

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });

const app = new Koa();

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB...');
});

// delete after not needed anymore
todo_model.create([{'title': 'build an API', 'order': 1, 'completed': false},
  {'title': '?????', 'order': 2, 'completed': false},
  {'title': 'profit!', 'order': 3, 'completed': false}
]);

// Define routers
// tags: get, post, del, tags/:id
router.get('/todos/', listTodos)
    .get('/todos/:id/tags', listTags)
    .get('/tags/:id', listTodosGivenTags)
    .del('/todos/', clearAllTodos)
    .del('/todos/tags', clearAllTags)
    .post('/todos/', addTodo)
    .get('todo', '/todos/:id', showTodo)
    // .get('todo', '/todos/tags/:id', showTodoGivenTags)
    .get('tags', '/todos/:id/tags', showTags)
    .patch('/todos/:id', updateTodo)
    .patch('/todos/:id/tags', updateTags)
    .del('/todos/:id', removeTodo)
    .del('/todos/:id/tags', removeTags);

async function listTodos(ctx) {
  ctx.body = Object.keys(todos).map(k => {
    todos[k].id = k;
    return todos[k];
  });
}

async function listTags(ctx) {
  ctx.body = Object.keys(todos).map(k => {
    todos[k].tags = k;
    return todos[k].tags;
  });
}

// async function listTodosGivenTags(ctx) {
//     ctx.body = Object.keys(todos).map(k => {
//             todos.tags = k;
//             return todos[k];
//         }).filter(todo => todo.tags.includes(k)); // Assuming each todo has a 'tags' property
// }

async function listTodosGivenTags(ctx) {
  const tag = ctx.params.tags;
  const todo = todos.tags;

  if (!todos.tag) ctx.throw(404, {'error': 'Todo not found for matching tag'});

  todo.id = tag;
  ctx.body = todo;
}

// Delete all todos listed
async function clearAllTodos(ctx) {
  todos = {};
  ctx.status = 204;
}

async function clearAllTags(ctx) {
  todos.tags = {};
  ctx.status = 204;
}

async function addTodo(ctx) {
  const todo = ctx.request.body;
  if (!todo.title) ctx.throw(400, {'error': '"title" is a required field'});
  const title = todo.title;
  if (!typeof data === 'string' || !title.length) ctx.throw(400, {'error': '"title" must be a string with at least one character'});

  todo['completed'] = todo['completed'] || false;
  todo['url'] = 'http://' + ctx.host + router.url('todo', nextId);
  todo.tags = ['']
  todos[nextId++] = todo;

  ctx.status = 303;
  ctx.set('Location', todo['url']);
}

async function showTodo(ctx) {
  const id = ctx.params.id;
  const todo = todos[id];
  if (!todo) ctx.throw(404, {'error': 'Todo not found'});
  todo.id = id;
  ctx.body = todo;
}

async function showTags(ctx) {
  const id = ctx.params.id;
  const tags = todos[id].tags;
  if (!todos[id]) ctx.throw(404, {'error': 'Todo not found'});
  // todos[id].tags = id;
  ctx.body = tags;
}

async function updateTodo(ctx) {
  const id = ctx.params.id;
  const todo = todos[id];

  Object.assign(todo, ctx.request.body);

  ctx.body = todo;
}

async function updateTags(ctx) {
  const id = ctx.params.id;
  const tags = todos[id].tags;

  Object.assign(tags, ctx.request.body);

  ctx.body = tags;
}

async function removeTodo(ctx) {
  const id = ctx.params.id;
  if (!todos[id]) ctx.throw(404, {'error': 'Todo not found'});

  delete todos[id];

  ctx.status = 204;
}

async function removeTags(ctx) {
  const id = ctx.params.id;
  if (!todos[id]) ctx.throw(404, {'error': 'Todo not found'});

  delete todos[id];

  ctx.status = 204;
}

app
    .use(bodyParser())
    .use(cors())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
