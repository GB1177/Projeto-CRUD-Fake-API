# Fake Store Admin

Aplicação desenvolvida como desafio técnico Front-End em Angular para gerenciamento de produtos consumindo a [Fake Store API](https://fakestoreapi.com/).

O projeto implementa um CRUD completo de produtos, com listagem, filtros, formulário reativo, preservação de estado local durante a sessão, responsividade e testes automatizados.

## Visão geral

O Fake Store Admin permite consultar, criar, editar e excluir produtos a partir da Fake Store API.

Como a API utilizada simula operações de escrita, a aplicação mantém as alterações de criação, edição e exclusão no estado local da sessão. Dessa forma, o usuário vê o resultado das ações imediatamente, mesmo que o backend não persista essas mudanças de forma definitiva.

## Funcionalidades

- Listagem de produtos.
- Detalhe do produto.
- Criação de produto.
- Edição de produto.
- Exclusão com modal de confirmação.
- Busca com autocomplete local.
- Filtro por categoria.
- Paginação client-side.
- Preview de imagem por URL no formulário.
- Campo de preço com formatação visual e envio como `number`.
- Estados de loading, erro e vazio.
- Layout responsivo.
- Header com link para a listagem de produtos.
- Preservação local de criação, edição e exclusão durante a sessão.

## Stack

- Angular 21
- Standalone Components
- TypeScript em modo strict
- SCSS
- Routing com lazy loading
- HttpClient com `provideHttpClient(withFetch())`
- Signals para estado local e dados derivados
- RxJS para fluxos assíncronos e autocomplete
- Reactive Forms
- ChangeDetectionStrategy.OnPush
- Jest para testes unitários
- Playwright para testes E2E

## Arquitetura

A aplicação segue uma organização por responsabilidade, separando código compartilhado, infraestrutura da aplicação e features.

```text
src/app/
  core/
    api/
    layout/
    models/

  shared/
    components/

  features/
    products/
      data-access/
      models/
      pages/
      ui/
      products.routes.ts
```

O fluxo principal da feature de produtos é:

```text
Page Component
  -> ProductsStoreService
  -> ProductsApiService
  -> Fake Store API
```

Responsabilidades principais:

- `ProductsApiService` centraliza as chamadas HTTP da feature.
- `ProductsStoreService` centraliza o estado, filtros, paginação e regras de atualização local.
- Pages orquestram o fluxo de tela, navegação e ações do usuário.
- Componentes em `ui` são apresentacionais e recebem dados por input, emitindo ações por output.
- Componentes compartilhados em `shared/components` são reutilizáveis entre telas.

## Decisões técnicas

Signals foram usados para estado local da feature e dados derivados, como produtos filtrados, sugestões de busca, paginação e estados de UI.

RxJS foi usado nos fluxos assíncronos e no autocomplete, especialmente com `valueChanges`, `debounceTime`, `distinctUntilChanged` e encerramento seguro de subscriptions.

A busca com autocomplete é local e trabalha sobre a lista de produtos já carregada na sessão. Essa estratégia é adequada ao escopo da Fake Store API, que retorna uma lista pequena de produtos, e evita chamadas HTTP a cada caractere digitado.

Em um cenário com maior volume de dados, a busca e a paginação deveriam ser tratadas no backend, com parâmetros de consulta, paginação server-side e estratégias como debounce, cache e cancelamento de requisições.

A paginação é client-side porque a Fake Store API retorna uma lista pequena e não oferece uma paginação real adequada ao fluxo do desafio.

Os componentes principais usam `ChangeDetectionStrategy.OnPush`, e as listas utilizam `track` nos loops do Angular para evitar renderizações desnecessárias.

Selects nativos foram mantidos para categoria e tamanho da página, evitando complexidade desnecessária para o escopo do projeto.

## Integração com a Fake Store API

URL base:

```text
https://fakestoreapi.com
```

Endpoints utilizados:

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

A Fake Store API simula `POST`, `PUT` e `DELETE`, mas não persiste os dados no backend.

Por esse motivo, a aplicação atualiza o estado local após criar, editar ou excluir um produto. As alterações permanecem visíveis durante a sessão atual. Após recarregar a página, os dados voltam ao estado original retornado pela API.

## Como rodar o projeto

Instale as dependências:

```bash
npm install
```

Execute a aplicação:

```bash
npm start
```

Por padrão, a aplicação fica disponível em:

```text
http://localhost:4200
```

Gere o build de produção:

```bash
npm run build
```

O build é gerado no diretório `dist/`.

## Testes

Execute os testes unitários:

```bash
npm test
```

Execute os testes E2E:

```bash
npm run e2e
```

Execute os testes E2E com interface do Playwright:

```bash
npm run e2e:ui
```

Execute os testes E2E em modo headed:

```bash
npm run e2e:headed
```

Os testes E2E cobrem:

- Listagem de produtos.
- Busca com autocomplete.
- Paginação.
- Detalhe do produto.
- Criação de produto.
- Validação de formulário inválido.
- Edição de produto.
- Exclusão com confirmação e cancelamento.

Os testes Playwright usam mocks determinísticos da Fake Store API para manter estabilidade e previsibilidade na suíte E2E. Em runtime, a aplicação continua consumindo a API real.

Os artefatos locais gerados pelo Playwright, como `playwright-report/`, `test-results/`, `blob-report/` e `playwright/.cache/`, são ignorados pelo `.gitignore`.

## Estrutura de pastas

```text
src/app/
  core/
    api/
      api-endpoints.ts
    layout/
      app-layout.component.*
    models/
      product.model.ts

  shared/
    components/
      confirm-dialog/
      empty-state/
      error-state/
      loading-state/

  features/
    products/
      data-access/
        products-api.service.ts
        products-store.service.ts
      models/
        product-form.model.ts
      pages/
        product-detail-page/
        product-form-page/
        product-list-page/
      ui/
        product-card/
        product-filters/
        product-form/
        product-pagination/
      products.routes.ts
```

## Melhorias futuras

- Paginação server-side, caso a API ofereça suporte real para esse fluxo.
- Busca e autocomplete server-side para bases maiores de produtos.
- Upload real de imagem, caso exista um endpoint para arquivos.
- Autenticação e autorização em um cenário com usuários reais.
- Persistência em backend próprio para manter alterações após reload.

## Permissão para verificação

Autorizo a equipe avaliadora a escanear este repositório público para fins de verificação de originalidade e plágio, conforme solicitado nas instruções do desafio técnico.
