(function(App) {
    'use strict';

    App.Cache = {};

    const CACHE_KEYS = {
        LECTURES: 'cache_lectures',
        SUMMARIES: 'cache_summaries',
        NOTIFICATIONS: 'cache_notifications',
        STATS: 'cache_stats',
        RECENT_FILES: 'cache_recent_files',
        LECTURES_STRUCTURE: 'cache_lectures_structure',
        SUMMARIES_STRUCTURE: 'cache_summaries_structure'
    };

    const CACHE_DURATION = 24 * 60 * 60 * 1000;


    const MAX_CACHE_SIZE = 5 * 1024 * 1024;


    function calculateSize(data) {
        const str = JSON.stringify(data);
        return new Blob([str]).size;
    }


    function getTotalCacheSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                const item = localStorage.getItem(key);
                if (item) {
                    total += new Blob([item]).size;
                }
            }
        }
        return total;
    }


    function cleanupOldCache() {
        const now = Date.now();
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const data = JSON.parse(item);
                        const age = now - (data.timestamp || 0);


                        if (age > 7 * 24 * 60 * 60 * 1000) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (e) {

                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        return keysToRemove.length;
    }


    function makeSpaceInCache(requiredSize) {
        let currentSize = getTotalCacheSize();


        if (currentSize + requiredSize < MAX_CACHE_SIZE) {
            return true;
        }


        const cleaned = cleanupOldCache();
        currentSize = getTotalCacheSize();

        if (currentSize + requiredSize < MAX_CACHE_SIZE) {
            return true;
        }


        const cacheItems = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const data = JSON.parse(item);
                        cacheItems.push({
                            key: key,
                            timestamp: data.timestamp || 0,
                            size: new Blob([item]).size
                        });
                    }
                } catch (e) {

                }
            }
        }


        cacheItems.sort((a, b) => a.timestamp - b.timestamp);


        let freedSpace = 0;
        for (const item of cacheItems) {
            localStorage.removeItem(item.key);
            freedSpace += item.size;

            if (getTotalCacheSize() + requiredSize < MAX_CACHE_SIZE) {
                return true;
            }
        }


        return false;
    }


    App.Cache.set = function(key, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };

            const dataString = JSON.stringify(cacheData);
            const dataSize = new Blob([dataString]).size;


            if (!makeSpaceInCache(dataSize)) {
                console.warn('⚠️ Cache is full, cannot save:', key);
                return false;
            }

            localStorage.setItem(key, dataString);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('❌ localStorage quota exceeded');

                cleanupOldCache();
                try {
                    localStorage.setItem(key, JSON.stringify({
                        data: data,
                        timestamp: Date.now()
                    }));
                    return true;
                } catch (e2) {
                    console.error('❌ Still cannot save to cache');
                    return false;
                }
            }
            console.error('Error saving to cache:', e);
            return false;
        }
    };

    App.Cache.get = function(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;


            if (age > CACHE_DURATION) {
                localStorage.removeItem(key);
                return null;
            }

            return cacheData.data;
        } catch (e) {
            console.error('Error reading from cache:', e);

            try {
                localStorage.removeItem(key);
            } catch (e2) {

            }
            return null;
        }
    };

    App.Cache.clear = function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error clearing cache:', e);
            return false;
        }
    };

    App.Cache.clearAll = function() {
        try {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });


            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            return true;
        } catch (e) {
            console.error('Error clearing all cache:', e);
            return false;
        }
    };


    App.Cache.getInfo = function() {
        const totalSize = getTotalCacheSize();
        const itemCount = Object.values(CACHE_KEYS).filter(key =>
            localStorage.getItem(key) !== null
        ).length;

        return {
            totalSize: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            itemCount: itemCount,
            maxSize: MAX_CACHE_SIZE,
            maxSizeMB: (MAX_CACHE_SIZE / (1024 * 1024)).toFixed(2),
            percentageUsed: ((totalSize / MAX_CACHE_SIZE) * 100).toFixed(1)
        };
    };

    App.Cache.fetchWithCache = function(url, cacheKey) {
        return new Promise(function(resolve, reject) {
            const cached = App.Cache.get(cacheKey);
            if (cached && !navigator.onLine) {
                resolve({ data: cached, fromCache: true });
                return;
            }

            if (navigator.onLine) {
                fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error('Network error');
                        return response.json();
                    })
                    .then(data => {
                        App.Cache.set(cacheKey, data);
                        resolve({ data: data, fromCache: false });
                    })
                    .catch(error => {
                        if (cached) {
                            resolve({ data: cached, fromCache: true });
                        } else {
                            reject(error);
                        }
                    });
            } else {
                if (cached) {
                    resolve({ data: cached, fromCache: true });
                } else {
                    reject(new Error('No internet and no cache available'));
                }
            }
        });
    };

    App.Cache.KEYS = CACHE_KEYS;


    setTimeout(function() {
        const cleaned = cleanupOldCache();
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} old cache items`);
        }

        const info = App.Cache.getInfo();
        console.log(`💾 Cache: ${info.totalSizeMB} MB / ${info.maxSizeMB} MB (${info.percentageUsed}%)`);
    }, 2000);

})(window.App);