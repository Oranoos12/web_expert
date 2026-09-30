const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');

const app = express();
const PORT = 3000;

const CONFIG = process.argv.slice(2)[0] || 'config.yaml';

let config;

try {
  config = yaml.load(
    fs.readFileSync(path.join(__dirname, CONFIG), 'utf8')
  );
} catch (error) {
  console.error('Error reading or parsing config:', error);
  process.exit(1);
}

app.use(express.json());

//template files staat in de views folder en gebruik van hbs
app.set('views', path.join(__dirname , 'views'));
app.set('view engine', 'hbs');

function checkRoute(req, res, next) {
  const route = req.params.route;

  if (!config.routes.includes(route)) {
    return res.status(404).json({
      error: `Route ${route} not found`
    });
  }

  next();
}

app.get('/', (req, res) => {
 const routes = config.routes.map(name => {  //config.routes is list name  van yaml , map maak name voor elke object
    const data = config[name] || [];
    return { name: name, count: data.length };
  });

  res.render('index', { routes: routes });
});

app.get('/:route', checkRoute, (req, res) => {
  const route = req.params.route;
  const data = config[route] || [];

  res.json(data);
});

app.get('/:route/:id', checkRoute, (req, res) => {
  const route = req.params.route;
  const id = req.params.id;
  const data = config[route] || [];

  const record = data.find(item => item.id == id);

  if (!record) {
    return res.status(404).json({
      error: `Record with ID ${id} not found in ${route}`
    });
  }

  res.json(record);
});

app.post('/:route', checkRoute, (req, res) => {
  const route = req.params.route;

  // als er nog geen lijst is voor deze route, maak een lege lijst
  if (!config[route]) {
    config[route] = [];
  }
  const data = config[route];

  // body moet er zijn
  if (!req.body) {
    return res.status(400).json({ error: 'Body is verplicht' });
  }

  // zoek het hoogste id
  let maxId = 0;
  for (const item of data) {
    if (item.id > maxId) {
      maxId = item.id;
    }
  }

  // maak het nieuwe record
  const newRecord = req.body;
  newRecord.id = maxId + 1;

  data.push(newRecord);

  res.status(201).json(newRecord);
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

const shutdown = () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
