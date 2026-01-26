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
              if (jsonStr.includes('assinante')) {
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
