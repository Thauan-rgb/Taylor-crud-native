const express = require('express');
const router = express.Router();
const MusicaController = require('../controllers/musicaController');

router.get('/', MusicaController.listarTodas);
router.get('/:id', MusicaController.buscarPorId);
router.post('/', MusicaController.salvar);
router.put('/:id', MusicaController.atualizar);
router.delete('/:id', MusicaController.deletar);

module.exports = router;
