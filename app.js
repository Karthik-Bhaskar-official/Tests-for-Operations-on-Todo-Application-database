const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error is ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasStatusProperty = (status) => {
  return status !== undefined;
};

const hasPriorityProperty = (priority) => {
  return priority !== undefined;
};

const hasPriorityAndStatusProperties = (status, priority) => {
  return status !== undefined && priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  //   console.log(status);
  let getTodo = null;
  switch (true) {
    case hasStatusProperty(status):
      getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              status = '${status}';`;
      break;
    case hasPriorityProperty(priority):
      getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              priority = '${priority}';`;
      break;
    case hasPriorityAndStatusProperties(status, priority):
      getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              status = '${status}' AND 
              priority = '${priority}';`;
      break;

    default:
      getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              todo LIKE '%${search_q}%';`;
      break;
  }

  const dbResponse = await db.all(getTodo);
  response.send(dbResponse);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              id = '${todoId}';`;
  const dbResponse = await db.get(getTodo);
  response.send(dbResponse);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  //   console.log(id);
  //   console.log(todo);
  //   console.log(priority);
  //   console.log(status);
  const postTodo = `
    INSERT INTO 
      todo(id, todo, priority, status)
    VALUES
      (${id},
      '${todo}',
      '${priority}',
      '${status}');`;
  await db.run(postTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  console.log(status);
  let getTodo = null;
  switch (true) {
    case hasStatusProperty(status):
      putTodo = `
            UPDATE
              todo
            SET
              status = '${status}'
            WHERE
              id = ${todoId};`;
      await db.run(putTodo);
      response.send("Status Updated");
      break;
    case hasPriorityProperty(priority):
      putTodo = `
            UPDATE
              todo
            SET
              priority = '${priority}'
            WHERE
              id = ${todoId};`;
      await db.run(putTodo);
      response.send("Priority Updated");
      break;

    default:
      putTodo = `
            UPDATE
              todo
            SET
              todo = '${todo}'
            WHERE
              id = ${todoId};`;
      await db.run(putTodo);
      response.send("Todo Updated");
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
