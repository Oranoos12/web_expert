// service.js - alle logica rond de data (in het geheugen)
let config = {};

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

function getAll(route, embed) {
  const data = config[route] || [];

  if (embed) {
    return data.map(record => addEmbed(route, record, embed));
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

  let maxId = 0;
  for (const item of data) {
    if (item.id > maxId) {
      maxId = item.id;
    }
  }

  const newRecord = body;
  newRecord.id = maxId + 1;
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