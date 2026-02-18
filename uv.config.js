
/* Ultraviolet Configuration for Eternity Proxy - Optimized for Cloudflare */
self.__uv$config = {
    prefix: '/service/',
    // Using a more robust public bare server or local if hosted
    bare: 'https://bare.benroberts.dev/bare/', 
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: 'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.5/dist/uv.handler.js',
    bundle: 'https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.5/dist/uv.bundle.js',
    config: '/uv.config.js',
    sw: '/uv.sw.js',
};
