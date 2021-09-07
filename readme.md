# Boilerplate node-js with typescript

## Esse projeto contém

- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/pt-br/)
- [Nodemon](https://nodemon.io/)
- [Jest](https://jestjs.io/)
- [Docker](https://www.docker.com/)
- [Elastic APM](https://www.elastic.co/pt/apm)
- [Sentry](https://sentry.io/)
- [Fluent](https://www.npmjs.com/package/fluent-logger)
- [Redoc](https://redocly.github.io/redoc/)
- [Eslint](https://eslint.org/)
- [Prettier](https://prettier.io/)

<br/><br/>

## Pré-requisitos

| Plugin | README |
| ------ | ------ |
| Nodejs | https://nodejs.org/en/ |
| Git | https://git-scm.com/downloads |


<br/><br/>

## Começando
```sh
$ git clone http://gitlab.somosiris.com/backend/nodejs-boilerplate-typescript.git
$ cd nodejs-boilerplate-typescript
```

Instale as dependencias com npm
```sh
$ npm i
```

Gere seu .env a partir do .env.example
```sh
$ cp .env.example .env
```
*para habilitar o `fluent`, `apm` e `sentry`, é necessário alterar as suas variáveis*


<br/><br/>

## Acessos
| Nome | URL |
| ------ | ------ |
| Aplicação | http://0.0.0.0:3000/v1 |
| Documentação | http://0.0.0.0:3000/docs |
| Status | http://0.0.0.0:3000/status |


<br/><br/>


## Scripts
- `start`: Executa a aplicação com pm2
- `stop`: Para o processo do pm2
- `dev`: Executa a aplicação em modo de desenvolvimento (nodemon)
- `debug`: Executa a aplicação em modo debug (nodemon)
- `lint`: Executa o lint em todos os arquivos .ts exceto os de teste
- `npm run test`: Executa todos os testes funcionais e unitários
- `npm run test:unity`: Executa todos os testes unitários
- `npm run test:functional`: Executa todos os testes funcionais
- `npm run test:clear`: Limpa o cache
- `npm run test:watch`: Executa todos os testes com watcher
- `npm run test:coverage`: Executa testes para a geração de cobertura de código, disponível em `coverage/index.html`
- `build"`: Executa o build da aplicação
- `generate-docs"`: Gera a documentação do Redoc, agrupando todos os arquivos em um


<br/><br/>

## Debugger

O projeto possui um arquivo de configuração para executar o `debugger` pelo `VSCode`.

É aconselhado utilizar uma das configurações do debugger ao criar os `testes`, executando a configuração `Jest Current File Watch` após abrir o arquivo que deseja observar enquanto cria o teste.

<br/><br/>

## Documentação
- Como adicionar documentação de rotas criadas

<br/>

### Redoc

**Exemplo de como adicionar rota para usuários:**

`public/redoc/index.yml`

```yml
# Antes
...
  #ROTAS
  - name: status
    description: Rota disponível para verificação do status da aplicação.

x-tagGroups:
    ...
    tags:
      - status
...
```
```yml
# Depois
...
  #ROTAS
  - name: status
    description: Rota disponível para verificação do status da aplicação.

  - name: users
    description: Rotas para gereniamento de usuários.

x-tagGroups:
    ...
    tags:
      - status
      - users
...
```

`public/redoc/paths/index.yml`

```yml
# Antes
####################### STATUS #######################
"/status":
  $ref: "./status/index.yml"
####################### /STATUS #######################
```

```yml
# Depois
####################### STATUS #######################
"/status":
  $ref: "./status/index.yml"
####################### /STATUS #######################

####################### USERS #######################
"/users":
  $ref: "./users/index.yml"
####################### /USERS #######################
```
*Criar uma pasta para users se guiando pela de status*


### Gerando a documentação
Após ter sido adicionado os grupos e as rotas para os resources gerados,
deve ser criado um arquivo único para toda a documentação através do comando:

```sh
npm run generate-docs
```

<br/><br/>

## Criação de databases utilizando docker (opcional)
### Pré-requisitos

| Plugin | README |
| ------ | ------ |
| Docker | https://docs.docker.com/install |
| Docker Compose | https://docs.docker.com/compose/install |

<br/><br/>


### Começando
Para iniciar os containers mysql e redis, (na raiz do projeto) utilize o comando:
```sh
$ docker-compose up -d
```

Verifique se os containers estão disponiveis:
```sh
$ docker-compose logs mysql
$ docker-compose logs redis
```

<br/><br/>

### Acessos
| Nome | URL | Dados|
| ------ | ------ |------ |
| MySQL | http://0.0.0.0:3306 | user:root senha:root |
| Redis | http://0.0.0.0:6379 | n/d |

### API de permissionamento(opcional)
O repositório já contém a API de permissionamento para verificar se uma conta(através de um token)
possui ou não permissão para uma determinada ação.

É necessário passar um token(xref_audience_accounts_services.ds_api_token) que está vinculado a uma conta, audiencia e serviço.

O token deve ser passado no `header` das requisições através da key `x-api-key`.

Os controllers devem utilizar o middleware `isAuthenticated` no qual irá setar para o objeto req,
qual a account encontrada para o token, caso não seja encontrado será gerado um erro 401.

Os métodos dos controllers devem utilizar o middleware `hasPermission('MINHA_PERMISSAO')` passando por
parametro qual a permissão desejada, caso não tenha permissão será gerado um erro 403.
