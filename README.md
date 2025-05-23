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
// @version      1.1
// @description  Bloqueia resposta GraphQL que contenha "não faz parte da residência Netflix"
// @author       Você
// @match        https://www.netflix.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const originalFetch = window.fetch;

  function shouldBlockResponse(json) {
    const jsonStr = JSON.stringify(json);
    return jsonStr.includes("não faz parte da residência Netflix");
  }

  window.fetch = async function (...args) {
    const [resource] = args;
    const url = typeof resource === "string" ? resource : resource?.url || "";

    if (!url.includes("graphql")) {
      return originalFetch.apply(this, args);
    }

    try {
      const response = await originalFetch.apply(this, args);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return response;
      }

      const clone = response.clone();
      const data = await clone.json();

      if (shouldBlockResponse(data)) {
        console.warn(
          "[fetch-interceptor] Bloqueando resposta com mensagem proibida:",
          url
        );
        return Promise.reject(
          new Error(
            "Resposta bloqueada pelo interceptor: mensagem proibida encontrada."
          )
        );
      }

      return response;
    } catch (err) {
      console.error("[fetch-interceptor] Erro durante interceptação:", err);
      throw err; // mantém o comportamento original em caso de erro inesperado
    }
  };

  console.log(
    "[fetch-interceptor] Ativo para GraphQL com verificação de conteúdo."
  );
})();
```
