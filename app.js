const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Willian', email: 'willian@email.com' },
];

app.get('/users', (req, res) => res.json(users));

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  user ? res.json(user) : res.status(404).send("Not Found");
});

app.post('/users', (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index >= 0) {
    users[index] = { id: Number(req.params.id), ...req.body };
    res.json(users[index]);
  } else res.status(404).send("Not Found");
});

app.delete('/users/:id', (req, res) => {
  users = users.filter(u => u.id != req.params.id);
  res.status(204).send();
});

if (require.main === module) {
  app.listen(3000, () => console.log("API rodando na porta 3000"));
} else {
  module.exports = app;
}
