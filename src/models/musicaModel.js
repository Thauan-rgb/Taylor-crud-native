const { v4: uuidv4 } = require('uuid');

let musicas = [];

const MusicaModel = {
  findAll() {
    return musicas;
  },

  findById(id) {
    return musicas.find((m) => m.id === id) || null;
  },

  create({ name, album, lyrics, nota, comentario }) {
    const nova = {
      id: uuidv4(),
      name,
      album,
      lyrics,
      nota: nota || null,
      comentario: comentario || '',
      salvaEm: new Date().toISOString(),
    };
    musicas.push(nova);
    return nova;
  },

  update(id, { nota, comentario }) {
    const index = musicas.findIndex((m) => m.id === id);
    if (index === -1) return null;
    musicas[index] = {
      ...musicas[index],
      nota: nota !== undefined ? nota : musicas[index].nota,
      comentario: comentario !== undefined ? comentario : musicas[index].comentario,
    };
    return musicas[index];
  },

  delete(id) {
    const index = musicas.findIndex((m) => m.id === id);
    if (index === -1) return false;
    musicas.splice(index, 1);
    return true;
  },
};

module.exports = MusicaModel;
