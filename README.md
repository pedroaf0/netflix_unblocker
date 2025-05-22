# 🛡️ Netflix GraphQL Interceptor

Este userscript Tampermonkey **bloqueia a resposta da API GraphQL da Netflix** que exibe a mensagem:

> **"Seu aparelho não faz parte da residência Netflix desta conta"**

🔒 Útil para estudos e análises técnicas, este script impede que a tela de bloqueio se sobreponha ao conteúdo, desde que o vídeo já tenha sido carregado antes da verificação.

⚠️ **Atenção**: este script é apenas para fins educacionais. Não recomendamos o uso para burlar os termos de serviço da Netflix.

---

## 📦 O que o script faz?

- Intercepta chamadas `fetch` para URLs que contenham `graphql`;
- Verifica se a resposta JSON contém a frase `"não faz parte da residência Netflix"`;
- Se encontrar, **bloqueia** a resposta, simulando um erro (como se a API tivesse falhado);
- Assim, impede que o frontend da Netflix exiba a tela de bloqueio.

---

## 🚀 Como usar

### 1. Instale o Tampermonkey

- [https://www.tampermonkey.net/](https://www.tampermonkey.net/)

### 2. Crie um novo script

- Clique no ícone do Tampermonkey → **Create a new script**

### 3. Cole o código abaixo

```javascript
// ==UserScript==
// @name         Netflix GraphQL Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bloqueia resposta GraphQL que contenha "não faz parte da residência Netflix"
// @author       Você
// @match        https://www.netflix.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const [resource, config] = args;
    let url = '';

    if (typeof resource === 'string') url = resource;
    else if (resource && resource.url) url = resource.url;

    if (url.includes('graphql')) {
      return originalFetch.apply(this, args).then(async (response) => {
        const clone = response.clone();

        const contentType = clone.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          let data;
          try {
            data = await clone.json();

            const jsonStr = JSON.stringify(data);

            if (jsonStr.includes('não faz parte da residência Netflix')) {
              console.warn('Bloqueando resposta fetch por conter mensagem proibida.');
              return Promise.reject(new Error('Resposta bloqueada pelo interceptor: mensagem proibida encontrada.'));
            }
          } catch (e) {
            console.error('Erro ao ler JSON da resposta:', e);
          }
        }

        return response;
      });
    }

    return originalFetch.apply(this, args);
  };

  console.log('Interceptor fetch graphql ativo para bloquear mensagens proibidas.');
})();
