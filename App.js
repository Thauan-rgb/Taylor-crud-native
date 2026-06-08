import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView,
  TextInput, Modal, ActivityIndicator, Alert, FlatList, SafeAreaView, Platform,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_PUBLICA = 'https://taylor-swift-api.vercel.app/api/songs/random';
// Troque pelo seu IP ao usar Expo Go físico: 'http://192.168.x.x:3000'
const API_BACKEND = 'http://192.168.1.4:3000';

// ─── TELAS ────────────────────────────────────────────────────────────────────
// 'sortear' | 'salvas'
// ─────────────────────────────────────────────────────────────────────────────

function corAlbum(album) {
  switch (album) {
    case 'Taylor Swift':       return '#3A9D82';
    case 'Fearless':           return '#FFD54F';
    case 'Speak Now':          return '#7E57C2';
    case 'Red':                return '#C62828';
    case '1989':               return '#64B5F6';
    case 'Reputation':         return '#424242';
    case 'Lover':              return '#FF80AB';
    case 'Folklore':           return '#adb5bd';
    case 'evermore':           return '#8D6E63';
    case 'Midnights':          return '#0041c2';
    case 'The Tortured Poets Department': return '#C5C0B7';
    case 'The life of a showgirl':        return '#7FFFD4';
    default:                   return '#888';
  }
}

function estrelas(nota) {
  if (!nota) return null;
  return '★'.repeat(nota) + '☆'.repeat(5 - nota);
}

// ─── MODAL EDITAR ─────────────────────────────────────────────────────────────
function ModalEditar({ musica, onFechar, onSalvar, salvando }) {
  const [nota, setNota] = useState(musica?.nota || null);
  const [comentario, setComentario] = useState(musica?.comentario || '');

  useEffect(() => {
    setNota(musica?.nota || null);
    setComentario(musica?.comentario || '');
  }, [musica]);

  if (!musica) return null;
  const cor = corAlbum(musica.album);

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitulo, { color: cor }]} numberOfLines={1}>
              {musica.name}
            </Text>
            <TouchableOpacity onPress={onFechar}>
              <Text style={styles.modalFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalAlbum}>{musica.album}</Text>

          <Text style={styles.label}>Sua nota</Text>
          <View style={styles.seletorNota}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setNota(nota === n ? null : n)}>
                <Text style={[styles.estrelaBtn, { color: n <= (nota || 0) ? '#FFD54F' : '#555' }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Comentário</Text>
          <TextInput
            style={styles.input}
            value={comentario}
            onChangeText={setComentario}
            placeholder="O que você achou dessa música?"
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.btnSalvar, { backgroundColor: cor }, salvando && { opacity: 0.6 }]}
            onPress={() => onSalvar({ nota, comentario })}
            disabled={salvando}
          >
            {salvando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnSalvarTexto}>Salvar</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── TELA: MÚSICAS SALVAS ─────────────────────────────────────────────────────
function TelaSalvas({ onVoltar }) {
  const [musicas, setMusicas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_BACKEND}/musicas`);
      const data = await res.json();
      setMusicas(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as músicas salvas.\nVerifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleAtualizar({ nota, comentario }) {
    try {
      setSalvando(true);
      const res = await fetch(`${API_BACKEND}/musicas/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota, comentario }),
      });
      if (!res.ok) throw new Error();
      setEditando(null);
      await carregar();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(musica) {
    Alert.alert(
      'Remover música',
      `Remover "${musica.name}" das suas salvas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive', onPress: async () => {
            try {
              await fetch(`${API_BACKEND}/musicas/${musica.id}`, { method: 'DELETE' });
              await carregar();
            } catch {
              Alert.alert('Erro', 'Não foi possível remover.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/b2.jpg')} style={styles.imagem} />

      <View style={styles.telaHeader}>
        <TouchableOpacity onPress={onVoltar}>
          <Text style={styles.btnVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.texto}>Músicas Salvas</Text>
      </View>

      {carregando ? (
        <View style={styles.box}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : musicas.length === 0 ? (
        <View style={styles.box}>
          <Text style={styles.boxTexto}>Nenhuma música salva ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={musicas}
          keyExtractor={(item) => item.id}
          style={styles.lista}
          contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
          renderItem={({ item }) => {
            const cor = corAlbum(item.album);
            return (
              <View style={[styles.cardSalva, { borderLeftColor: cor, borderLeftWidth: 4 }]}>
                <Text style={[styles.cardNome, { color: cor }]}>{item.name}</Text>
                <Text style={styles.cardAlbum}>{item.album}</Text>
                {item.nota && <Text style={[styles.cardEstrelas, { color: cor }]}>{estrelas(item.nota)}</Text>}
                {item.comentario ? <Text style={styles.cardComentario}>"{item.comentario}"</Text> : null}
                <View style={styles.cardAcoes}>
                  <TouchableOpacity style={styles.btnEditar} onPress={() => setEditando(item)}>
                    <Text style={styles.btnEditarTexto}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnDeletar} onPress={() => handleDeletar(item)}>
                    <Text style={styles.btnDeletarTexto}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {editando && (
        <ModalEditar
          musica={editando}
          onFechar={() => setEditando(null)}
          onSalvar={handleAtualizar}
          salvando={salvando}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

// ─── TELA: SORTEAR ────────────────────────────────────────────────────────────
function TelaSortear({ onVerSalvas }) {
  const [musica, setMusica] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function sortearMusica() {
    try {
      const response = await fetch(API_PUBLICA);
      const data = await response.json();
      setMusica(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível sortear uma música.');
    }
  }

  async function salvarMusica() {
    if (!musica) return;
    try {
      setSalvando(true);
      const res = await fetch(`${API_BACKEND}/musicas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: musica.name,
          album: musica.album,
          lyrics: musica.lyrics,
        }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('Salvo! 🎉', `"${musica.name}" foi salva na sua lista.`);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Backend está rodando?');
    } finally {
      setSalvando(false);
    }
  }

  const cor = musica ? corAlbum(musica.album) : '#fff';

  return (
    <View style={styles.container}>
      <Image source={require('./assets/b2.jpg')} style={styles.imagem} />

      <Text style={styles.texto}>Descubra músicas aleatórias da Taylor Swift</Text>

      <View style={styles.botoesRow}>
        <TouchableOpacity style={styles.botao} onPress={sortearMusica}>
          <Text style={styles.botaoTexto}>Sortear música</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, { backgroundColor: '#7E57C2' }]} onPress={onVerSalvas}>
          <Text style={styles.botaoTexto}>Ver salvas ♥</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        {!musica ? (
          <Text style={styles.boxTexto}>Nenhuma música sorteada</Text>
        ) : (
          <ScrollView>
            <Text style={[styles.nome, { color: cor }]}>{musica.name}</Text>
            <Text style={[styles.album, { color: cor }]}>Álbum: {musica.album}</Text>

            <TouchableOpacity
              style={[styles.btnSalvarMusica, { borderColor: cor, backgroundColor: cor + '22' }, salvando && { opacity: 0.6 }]}
              onPress={salvarMusica}
              disabled={salvando}
            >
              {salvando
                ? <ActivityIndicator color={cor} />
                : <Text style={[styles.btnSalvarMusicaTexto, { color: cor }]}>♥ Salvar esta música</Text>
              }
            </TouchableOpacity>

            <Text style={[styles.letra, { color: cor }]}>{musica.lyrics}</Text>
          </ScrollView>
        )}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tela, setTela] = useState('sortear');

  if (tela === 'salvas') {
    return <TelaSalvas onVoltar={() => setTela('sortear')} />;
  }
  return <TelaSortear onVerSalvas={() => setTela('salvas')} />;
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9f9784',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 20,
  },

  imagem: {
    width: 160,
    height: 240,
    borderRadius: 100,
    resizeMode: 'cover',
    marginBottom: 20,
  },

  texto: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },

  botoesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    marginBottom: 5,
  },

  botao: {
    backgroundColor: '#b5b6a8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  box: {
    width: '100%',
    flex: 1,
    backgroundColor: '#FFFAF0',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 50,
  },

  boxTexto: {
    color: '#555',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },

  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  album: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },

  btnSalvarMusica: {
    borderWidth: 1.5,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 20,
  },

  btnSalvarMusicaTexto: {
    fontWeight: 'bold',
    fontSize: 15,
  },

  letra: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },

  // TELA SALVAS
  telaHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },

  btnVoltar: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 6,
  },

  lista: {
    width: '100%',
    flex: 1,
  },

  cardSalva: {
    backgroundColor: '#FFFAF0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
  },

  cardNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  cardAlbum: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },

  cardEstrelas: {
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 4,
  },

  cardComentario: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 8,
  },

  cardAcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },

  btnEditar: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#eee',
  },

  btnEditarTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  btnDeletar: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fde8e8',
  },

  btnDeletarTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
  },

  // MODAL EDITAR
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'flex-end',
  },

  modalBox: {
    backgroundColor: '#FFFAF0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },

  modalFechar: {
    fontSize: 20,
    color: '#888',
  },

  modalAlbum: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },

  seletorNota: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },

  estrelaBtn: {
    fontSize: 32,
  },

  input: {
    backgroundColor: '#f5f0e8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    color: '#333',
    fontSize: 14,
    textAlignVertical: 'top',
  },

  btnSalvar: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  btnSalvarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
