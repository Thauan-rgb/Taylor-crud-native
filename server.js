const express = require('express');
const cors = require('cors');
const musicaRoutes = require('./src/routes/musicaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/musicas', musicaRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Taylor Swift CRUD 🎵' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
