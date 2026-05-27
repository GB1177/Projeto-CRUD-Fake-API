# Fake Store Admin

Projeto desenvolvido como desafio tecnico Frontend Angular.

A aplicacao sera um painel de gerenciamento de produtos, com foco em um CRUD completo consumindo a [Fake Store API](https://fakestoreapi.com/). O objetivo e demonstrar organizacao, clareza arquitetural, componentizacao, manutencao, estado assincrono, formularios reativos e testes.

## Stack configurada

- Angular 21
- Standalone Components
- SCSS
- Routing com lazy loading
- TypeScript em modo strict
- HttpClient configurado com `provideHttpClient(withFetch())`
- Estrutura inicial separada em `core`, `shared` e `features`
- Feature inicial `products` carregada de forma lazy

## Arquitetura

A estrutura inicial segue uma organizacao por responsabilidade:

```text
src/app/
  core/
    api/
    errors/
    interceptors/
    layout/
    models/

  shared/
    components/
    pipes/
    utils/

  features/
    products/
      data-access/
      models/
      pages/
      ui/
      products.routes.ts
```

O fluxo planejado para a feature de produtos e:

```text
Page Component
  -> ProductsStoreService / Facade
  -> ProductsApiService
  -> Fake Store API
```

Essa separacao evita acoplamento direto entre componentes e API, mantendo regras de negocio e estado da feature em uma camada propria.

## Como instalar

```bash
npm install
```

## Como rodar

```bash
npm start
```

A aplicacao sera servida localmente pelo Angular CLI. Por padrao, acesse:

```text
http://localhost:4200
```

## Como gerar build

```bash
npm run build
```

O build de producao sera gerado no diretorio `dist/`.

## Status atual

- Projeto Angular 21 criado
- Routing configurado
- Lazy loading inicial da feature `products`
- Layout base criado
- Estrutura inicial `core/shared/features` criada
- Path aliases configurados para `@core/*`, `@shared/*` e `@features/*`
- HttpClient configurado no `app.config.ts`

O CRUD de produtos, formularios, integracao completa com a Fake Store API e testes ainda serao implementados nas proximas etapas.

## Proximos passos planejados

- Criar modelos de produto e payloads da feature
- Centralizar endpoints da Fake Store API
- Implementar `ProductsApiService`
- Implementar `ProductsStoreService` com Signals
- Criar listagem, criacao, edicao e exclusao de produtos
- Implementar formularios reativos com validacoes
- Adicionar tratamento de loading, vazio e erro
- Configurar e escrever testes unitarios com Jest
- Configurar e escrever testes E2E com Playwright
- Documentar as limitacoes da Fake Store API para `POST`, `PUT` e `DELETE`
