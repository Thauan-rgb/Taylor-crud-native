# Taylor CRUD Native

Aplicativo desenvolvido em React Native com Expo para gerenciar músicas favoritas da Taylor Swift.

## Requisitos

- Node.js
- npm
- Expo Go (Android/iOS) ou navegador web

## Instalação

Clone o repositório:

```bash
git clone <LINK_DO_REPOSITORIO>
cd taylor-crud-native
```

Instale as dependências:

```bash
npm install
```

## Configuração

No arquivo `App.js`, configure a URL da API:

```js
const API_BACKEND = 'http://SEU_IP:3000';
```

Substitua `SEU_IP` pelo endereço IP da máquina onde o backend está sendo executado.

## Executando o projeto

Inicie o Expo:

```bash
npx expo start
```

Para executar na web:

```bash
npx expo start --web
```

## Funcionalidades

- Buscar músicas da API
- Salvar músicas favoritas
- Avaliar músicas
- Adicionar comentários
- Excluir músicas salvas

## Tecnologias Utilizadas

- React Native
- Expo
- JavaScript
- Fetch API
