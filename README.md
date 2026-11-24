# TaskFlow

Gerenciador de tarefas web com login, pastas, prazos e sincronização em tempo real via Firebase.
Entre em [Releases](../../releases) para acessar o TaskList. 
## Funcionalidades

- Cadastro, login com e-mail/senha ou Google, e recuperação de senha
- Tarefas com título, descrição, prazo, prioridade e pasta
- Visões: **Meu Dia** (vence hoje ou está atrasada), **Caixa de Entrada** (sem pasta), **Próximos 7 dias** e **Concluídas**
- Pastas com cor, renomear e excluir (mantendo ou apagando as tarefas)
- Desfazer ao concluir ou excluir uma tarefa
- Perfil com nome e foto
- Funciona offline: as alterações são enviadas quando a conexão volta
- Layout responsivo

## Tecnologias

- HTML, CSS e JavaScript (ES Modules), sem framework e sem etapa de build
- Firebase Authentication e Cloud Firestore (SDK 11 via CDN)
- Font Awesome e fonte Inter via CDN

## Estrutura

```
task-list/
├── index.html            Redireciona para o login ou para as tarefas
├── firestore.rules       Regras de segurança do Firestore
├── assets/               Ícones e imagens
├── shared/               Código usado por mais de uma página
│   ├── base.css          Reset, variáveis de tema e utilitários
│   ├── firebase.js       Inicialização do Firebase e reexportação do SDK
│   ├── auth-errors.js    Tradução dos erros do Firebase Auth
│   ├── form-ui.js        Helpers de formulário (erros, senha, loading)
│   ├── user-service.js   Documento do usuário no Firestore
│   └── validation.js     Regras de e-mail e senha
├── login/                Páginas de autenticação
│   ├── auth.css
│   ├── login.html / login.js
│   ├── cadastro.html / cadastro.js
│   └── recuperar.html / recuperar.js
└── home/                 Aplicação de tarefas
    ├── home.html / home.css
    ├── home.js           Estado da tela, eventos e sessão
    ├── task-repository.js  Leitura e escrita no Firestore
    ├── task-views.js     Regras de cada visão e ordenação
    ├── render.js         Monta a lista de tarefas e pastas no DOM
    ├── date-utils.js     Leitura e formatação de prazos
    ├── task-dialog.js / folder-dialog.js / profile-dialog.js
    └── toast.js          Notificações com ação de desfazer
```

## Banco de dados

```
usuarios/{uid}                 nome, email, criadoEm
usuarios/{uid}/tarefas/{id}    name, description, dueDate, priority, folderId, completed, criadoEm, concluidoEm
usuarios/{uid}/pastas/{id}     name, color, criadoEm
usuarios/{uid}/dados/perfil    displayName, photo
```

`dueDate` é salvo no formato do `<input type="datetime-local">` (`2026-11-22T21:00`) e interpretado no fuso do usuário.

## Como rodar

O projeto usa ES Modules, então precisa ser aberto por um servidor HTTP (abrir o arquivo direto com `file://` não funciona).

- **XAMPP:** coloque a pasta em `htdocs` e acesse `http://localhost/task-list`
- **VS Code:** extensão Live Server, botão "Go Live" com o `index.html` aberto

No [console do Firebase](https://console.firebase.google.com/), em **Authentication → Settings → Authorized domains**, o domínio usado (por exemplo `localhost` ou `127.0.0.1`) precisa estar na lista para o login com Google funcionar.

## Regras do Firestore

O arquivo `firestore.rules` é a fonte da verdade. Para publicar, cole o conteúdo em **Firestore Database → Rules** no console do Firebase, ou use a Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

A chave `apiKey` em `shared/firebase.js` não é secreta: ela só identifica o projeto. A proteção dos dados vem das regras do Firestore.

## Convenções

- Código (variáveis, funções, classes CSS, ids) em inglês; textos da interface em português
- Nomes de coleções e campos do Firestore mantidos como estão, para continuar compatível com o app mobile
- Um módulo por responsabilidade; páginas importam só o que usam de `shared/`
