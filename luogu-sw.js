//d0j1a_1701 IntelligentCache sw.js for Luogu Ver 1
const CACHE_NAME = 'luoguCache';
let cachelist = [], whitelist = ['localhost'];
self.addEventListener('install', async function (installEvent) {
    self.skipWaiting();
    console.info('[Service Worker] Service Worker加载成功');
    installEvent.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.info('[Service Worker] 缓存已加载');
                return cache.addAll(cachelist);
            })
    );
});
self.addEventListener('fetch', async event => {
    try {
        event.respondWith(handle(event.request))
    } catch (msg) {
        event.respondWith(handleerr(event.request, msg))
    }
});
const handleerr = async (req, msg) => {
    return new Response(`<h1>Service Worker遇到了致命错误</h1><b>${msg}</b>`, { headers: { "content-type": "text/html; charset=utf-8" } })
}
const fetchFromCache = function (req) {
    if (req.method != 'GET') {
        resolve(fetch(req));
        return;
    }
    return fetch(req.url).then(function (res) {
        if (!res.ok) { throw res }
        return caches.open(CACHE_NAME).then(function (cache) {
            cache.delete(req);
            cache.put(req, res.clone());
            return res;
        });
    }).catch(function (res) {
        return caches.match(req).then(function (resp) {
            return resp || res;
        })
    });
}
const handle = async function (req) {
    const cache_url_list = [
        /(http:\/\/|https:\/\/)cdn\.luogu\.com\.cn/g,
        /(http:\/\/|https:\/\/)ipic\.luogu\.com\.cn/g
    ]
    for (var i in cache_url_list) {
        if (req.url.match(cache_url_list[i])) {
            return caches.match(req).then(function (resp) {
                return resp || fetch(req).then(function (res) {
                    return caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(req, res.clone());
                        return res;
                    });
                });
            })
        }
    }
    //IntelligentCache
    return fetchFromCache(req)
}
