const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const service = require('./service.js')

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
service.setConfig(config);

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
    return { name: name, count: service.getAll(name).length };
  });

  res.render('index', { routes: routes });
});

app.get('/:route', checkRoute, (req, res) => {
 
  res.json(service.getAll(req.params.route, req.query.embed));
});

app.get('/:route/:id', checkRoute, (req, res) => {
  const route = req.params.route;
  const id = req.params.id;
 

  const record = service.getById(route, id, req.query.embed);

  if (!record) {
    return res.status(404).json({
      error: 'Record with ID ${id} not found in ${route}'
    });
  }

  res.json(record);
});

app.post('/:route', checkRoute, (req, res) => {

  if(!req.body){
    return res.status(400).json({ error: 'Body is verplicht'})
  }
  const route = req.params.route;

  const newRecord = service.create(req.params.route, req.body);
  res.status(201).json(newRecord);

});

app.delete('/:route/:id', checkRoute, (req, res) => {
  const route = req.params.route;
  const id = req.params.id;

  const removed = service.remove(route, id);

  if (!removed) {
    return res.status(404).json({
      error: 'Record with ID ${id} not found in ${route}'
    });
  }

  res.json(removed);
});


app.put('/:route/:id', checkRoute, (req, res) => {
  const route = req.params.route;
  const id = req.params.id;

  if (!req.body) {
    return res.status(400).json({ error: 'Body is verplicht' });
  }

  const updated = service.update(route, id, req.body);

  if (!updated) {
    return res.status(404).json({
      error: 'Record with ID ${id} not found in ${route}'
    });
  }

  res.json(updated);
});


const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

const shutdown = () => {
  console.log('Shutting down...');
    // schrijf de huidige toestand terug naar het yaml-bestand
  try {
    const text = yaml.dump(config);
    fs.writeFileSync(path.join(__dirname, CONFIG), text, 'utf8');
    console.log('Data opgeslagen in ' + CONFIG);
  } catch (error) {
    console.error('Opslaan mislukt:', error);
  }
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
