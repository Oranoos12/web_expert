// service.js - alle logica rond de data (in het geheugen)
let config = {};
const { randomUUID } = require('crypto');

// app.js geeft hier de config door na het inlezen
function setConfig(newConfig) {
  config = newConfig;
}

// voegt gerelateerde records toe, bv. ?embed=owners
function addEmbed(route, record, embedName) {
  let relations = [];
  if (config.relationships && config.relationships[route]) {
    relations = config.relationships[route];
  }

  for (const relation of relations) {
    // ownerIds -> owners
    const name = relation.foreignKey.replace('Ids', '') + 's';

    if (name === embedName) {
      const relatedData = config[relation.relatedRoute] || [];
      const ids = record[relation.foreignKey] || [];
      const found = relatedData.filter(item => ids.includes(item.id));

      const copy = { ...record };
    
      copy[embedName] = found;
      return copy;
    }
  }

  return record;
}

function getAll(route, query = {}) {
  let data = config[route] || [];

  // filter: elke parameter die geen embed is en niet met _ begint
  for (const key in query) {
    if (key === 'embed' || key.startsWith('_')) {
      continue;
    }
    data = data.filter(item => String(item[key]) === String(query[key]));
  }

  // sorteren: ?_sort=name of ?_sort=-name (aflopend)
  if (query._sort) {
    let field = query._sort;
    let direction = 1;

    if (field.startsWith('-')) {
      direction = -1;
      field = field.slice(1);
    }

    data = [...data].sort((a, b) => {
      if (a[field] < b[field]) {
        return -1 * direction;
      }
      if (a[field] > b[field]) {
        return 1 * direction;
      }
      return 0;
    });
  }

  // range: ?_start=0&_end=2 of ?_start=1&_limit=2
  if (query._start || query._end || query._limit) {
    const start = Number(query._start) || 0;
    let end = data.length;

    if (query._end) {
      end = Number(query._end);
    }
    if (query._limit) {
      end = start + Number(query._limit);
    }

    data = data.slice(start, end);
  }

  if (query.embed) {
    return data.map(record => addEmbed(route, record, query.embed));
  }
  return data;
}

// geeft null terug als het record niet bestaat
function getById(route, id, embed) {
  const data = config[route] || [];
  const record = data.find(item => item.id == id);

  if (!record) {
    return null;
  }
  if (embed) {
    return addEmbed(route, record, embed);
  }
  return record;
}

function create(route, body) {
  if (!config[route]) {
    config[route] = [];
  }
  const data = config[route];

  const newRecord = body;
  newRecord.id = randomUUID();
  data.push(newRecord);

  return newRecord;
}

// geeft null terug als het record niet bestaat
function update(route, id, body) {
  const data = config[route] || [];
  const index = data.findIndex(item => item.id == id);

  if (index === -1) {
    return null;
  }

  const updated = body;
  updated.id = data[index].id;
  data[index] = updated;

  return updated;
}

// geeft null terug als het record niet bestaat
function remove(route, id) {
  const data = config[route] || [];
  const index = data.findIndex(item => item.id == id);

  if (index === -1) {
    return null;
  }

  return data.splice(index, 1)[0];
}

module.exports = { setConfig, getAll, getById, create, update, remove };