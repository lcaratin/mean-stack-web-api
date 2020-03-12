// biblioteca js que faz o mapeamento das pastas em função do server.js
require('rootpath')(); 
// Inicialização do express. Notem que fiz aqui uma modificação do projeto original. criei duas variáveis de express
// separando de vez api e app. Em um desenvolvimento mais sofisticado, onde você deseje fazer balanceamento de carga
// separadamente para cada ponto da solução, você teria que criar dois server.js e quebrar de vez a aplicação
var express = require('express');
var api = express();
var cors = require('cors');
// bibloteca que ajuda no parse de mensagens requisitadas que contém JSON
var bodyParser = require('body-parser');
// essa biblioteca será utilizada na API para fazer autenticaçao seguindo o método JWT. 
// Se quiser estudar um pouco mais sobre JWT, pesquise aqui
// https://jwt.io/introduction/
var expressJwt = require('express-jwt');
// carrega as configurações mapeadas no json
var config = require('config.json');
// agora escutando em uma porta diferente a api.
var apiPort = process.env.PORT || 9050;
var ambiente = process.env.NODE_ENV || 'development';

// separação da api
// uso do JWT para garantir a segurança da API e o uso de json no body para transferir dados de uma camada para a outra 
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

// Definição do CORS para permitir acesso externo
// Isso tem que acontecer antes da criação das rotas
if (ambiente === 'development'){
    api.use(cors());
}

// Essa configuração na API indica que haverá JWT para cada endpoint / rota método, com exceção dos métodos
// de autenticação e registro de usuários. Essa camada de segurança é muito boa, porque ajuda
// na diminuição do tratamento de mensagens indevidas na aplicação

api.use('/api', expressJwt({ secret: config.secret }).unless({ path: [
    '/api/users/authenticate', 
    '/api/users/register', 
    /^\/api\/questions\/.*/
] }));

// Aqui o mapemanto das rotas da aplicação. Todos esses mapeamentos fazem parte da aplicação
// A cada require, o js é inicializado
api.use('/api/users', require('./controllers/api/users.controller'));
api.use('/api/questions', require('./controllers/api/questions.controller'));

// start server API
var serverAPI = api.listen(apiPort, function () {
    console.log('Server API listening at http://' + serverAPI.address().address + ':' + serverAPI.address().port);
});