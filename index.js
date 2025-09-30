const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World! GET');
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.send('Hello World! POST');
});

app.put('/', (req, res) => {
    console.log(req.body);
    res.send('Hello World! PUT');
});

app.patch('/', (req, res) => {
    console.log(req.body);
    res.send('Hello World! PATCH');
});

app.delete('/', (req, res) => {
    console.log(req.body);
    res.send('Hello World! DELETE');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
