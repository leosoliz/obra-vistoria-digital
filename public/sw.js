
const CACHE_NAME = 'vistoria-obras-v1';
const API_CACHE_NAME = 'vistoria-api-v1';

// Arquivos essenciais para cache
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/865d3185-5d6c-416e-b9e1-79be88c6a8bd.png',
  '/lovable-uploads/216f61c9-3d63-4dfe-9f04-239b1cb9cd3b.png'
];

// URLs que devem usar estratégia network-first
const NETWORK_FIRST_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\//,
  /\/api\//,
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.otf$/
];

// Instalar o service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('Service Worker: Arquivos essenciais cachados');
        return self.skipWaiting();
      })
  );
});

// Ativar o service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativo');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições para outros domínios (exceto Supabase)
  if (url.origin !== location.origin && !url.hostname.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Estratégia: Network First, Cache Fallback
    console.log('Service Worker: Tentando buscar da rede:', url.pathname);
    
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('Service Worker: Resposta da rede obtida:', url.pathname);
      
      // Escolher o cache apropriado
      const cacheName = shouldUseApiCache(request) ? API_CACHE_NAME : CACHE_NAME;
      
      // Clonar a resposta para o cache
      const responseClone = networkResponse.clone();
      
      // Cache em background (não bloquear a resposta)
      caches.open(cacheName).then((cache) => {
        console.log('Service Worker: Cachando:', url.pathname);
        cache.put(request, responseClone);
      }).catch((error) => {
        console.warn('Service Worker: Erro ao cachear:', error);
      });
      
      return networkResponse;
    } else {
      throw new Error(`Network response not ok: ${networkResponse.status}`);
    }
    
  } catch (error) {
    console.log('Service Worker: Rede falhou, tentando cache:', url.pathname);
    
    // Se a rede falhar, tentar buscar do cache
    const cachedResponse = await getCachedResponse(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Servindo do cache:', url.pathname);
      return cachedResponse;
    }
    
    // Se não há cache, retornar página offline para navegação
    if (request.mode === 'navigate') {
      console.log('Service Worker: Servindo página offline');
      return getOfflinePage();
    }
    
    // Para outros recursos, re-lançar o erro
    throw error;
  }
}

async function getCachedResponse(request) {
  // Tentar cache da API primeiro
  let cache = await caches.open(API_CACHE_NAME);
  let response = await cache.match(request);
  
  if (response) {
    return response;
  }
  
  // Senão, tentar cache principal
  cache = await caches.open(CACHE_NAME);
  response = await cache.match(request);
  
  return response;
}

function shouldUseApiCache(request) {
  const url = new URL(request.url);
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.hostname.includes('supabase.co');
}

async function getOfflinePage() {
  const cache = await caches.open(CACHE_NAME);
  const cachedPage = await cache.match('/index.html');
  
  if (cachedPage) {
    return cachedPage;
  }
  
  // Página offline básica se o index.html não estiver cached
  return new Response(
    `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Vistoria de Obras</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background-color: #f5f5f5; 
        }
        .offline-container {
          max-width: 400px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .offline-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📵</div>
        <h1>Aplicativo Offline</h1>
        <p>Você está offline. Algumas funcionalidades podem estar limitadas.</p>
        <p>Conecte-se à internet para sincronizar seus dados.</p>
        <button onclick="window.location.reload()">Tentar Novamente</button>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }
  );
}

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Forçar atualização do cache
    updateCache();
  }
});

async function updateCache() {
  console.log('Service Worker: Atualizando cache...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ESSENTIAL_FILES);
    console.log('Service Worker: Cache atualizado');
  } catch (error) {
    console.error('Service Worker: Erro ao atualizar cache:', error);
  }
}
