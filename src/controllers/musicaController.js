const MusicaModel = require('../models/musicaModel');

const MusicaController = {
  listarTodas(req, res) {
    return res.status(200).json(MusicaModel.findAll());
  },

  buscarPorId(req, res) {
    const musica = MusicaModel.findById(req.params.id);
    if (!musica) return res.status(404).json({ erro: 'Música não encontrada.' });
    return res.status(200).json(musica);
  },

  salvar(req, res) {
    const { name, album, lyrics, nota, comentario } = req.body;
    if (!name || !album) return res.status(400).json({ erro: 'name e album são obrigatórios.' });
    const nova = MusicaModel.create({ name, album, lyrics, nota, comentario });
    return res.status(201).json(nova);
  },

  atualizar(req, res) {
    const { nota, comentario } = req.body;
    const atualizada = MusicaModel.update(req.params.id, { nota, comentario });
    if (!atualizada) return res.status(404).json({ erro: 'Música não encontrada.' });
    return res.status(200).json(atualizada);
  },

  deletar(req, res) {
    const removida = MusicaModel.delete(req.params.id);
    if (!removida) return res.status(404).json({ erro: 'Música não encontrada.' });
    return res.status(200).json({ mensagem: 'Música removida com sucesso.' });
  },
};

module.exports = MusicaController;
