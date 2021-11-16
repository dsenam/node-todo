const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const todos = [];

  const duplicateUsers = users.some((user) => user.username === username);

  if (duplicateUsers) {
    return response.status(400).json({
      error: "Username already exists",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos,
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({
      error: "Should not be able to update a non existing todo",
    });
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.json(foundTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({
      error: "Should not be able to update a non existing todo",
    });
  }

  foundTodo.done = true;

  return response.json(foundTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const foundTodo = user.todos.findIndex((todo) => todo.id === id);

  if (foundTodo === - 1) {
    return response.status(404).json({
      error: "Should not be able to update a non existing todo",
    });
  }

  user.todos.splice(foundTodo, 1);

  return response.status(204).json();
});

module.exports = app;
