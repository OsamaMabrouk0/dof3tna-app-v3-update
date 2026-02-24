(function(App) {
    'use strict';
    
    // Session cache مع حد أقصى
    const MAX_CACHE_SIZE = 50;
    const cacheQueue = [];
    
    App.API.sessionCache = {};
    
    // إلغاء الطلبات الجارية
    App.API.abortControllers = {};
    
    // LRU Cache implementation
    function addToCache(key, data) {
        if (cacheQueue.length >= MAX_CACHE_SIZE) {
            const oldKey = cacheQueue.shift();
            delete App.API.sessionCache[oldKey];
        }
        
        App.API.sessionCache[key] = data;
        cacheQueue.push(key);
    }
    
    App.API.fetchWithCache = function(url, cacheKey, forceRefresh) {
        return new Promise(function(resolve, reject) {
            // التحقق من session cache
            if (!forceRefresh && App.API.sessionCache[cacheKey]) {
                resolve({
                    data: App.API.sessionCache[cacheKey],
                    fromCache: true,
                    fromSession: true
                });
                return;
            }
            
            // التحقق من localStorage cache
            const cached = App.Cache.get(cacheKey);
            if (!forceRefresh && cached && !navigator.onLine) {
                addToCache(cacheKey, cached);
                resolve({
                    data: cached,
                    fromCache: true,
                    fromSession: false
                });
                return;
            }
            
            if (navigator.onLine) {
                // إلغاء الطلب السابق إن وجد
                if (App.API.abortControllers[cacheKey]) {
                    App.API.abortControllers[cacheKey].abort();
                }
                
                const controller = new AbortController();
                App.API.abortControllers[cacheKey] = controller;
                
                fetch(url, { signal: controller.signal })
                    .then(response => {
                        if (!response.ok) throw new Error('Network error');
                        return response.json();
                    })
                    .then(data => {
                        addToCache(cacheKey, data);
                        App.Cache.set(cacheKey, data);
                        delete App.API.abortControllers[cacheKey];
                        
                        resolve({
                            data: data,
                            fromCache: false,
                            fromSession: false
                        });
                    })
                    .catch(error => {
                        if (error.name === 'AbortError') {
                            console.log('Request aborted:', cacheKey);
                            return;
                        }
                        
                        console.error('⚠️ [API] Network error:', error);
                        if (cached) {
                            addToCache(cacheKey, cached);
                            resolve({
                                data: cached,
                                fromCache: true,
                                fromSession: false
                            });
                        } else {
                            reject(error);
                        }
                    });
            } else {
                if (cached) {
                    addToCache(cacheKey, cached);
                    resolve({
                        data: cached,
                        fromCache: true,
                        fromSession: false
                    });
                } else {
                    reject(new Error('No internet and no cache available'));
                }
            }
        });
    };
    
    App.API.clearSessionCache = function(pattern) {
        if (!pattern) {
            App.API.sessionCache = {};
            cacheQueue.length = 0;
            return;
        }
        
        Object.keys(App.API.sessionCache).forEach(function(key) {
            if (key.includes(pattern)) {
                delete App.API.sessionCache[key];
                const index = cacheQueue.indexOf(key);
                if (index > -1) {
                    cacheQueue.splice(index, 1);
                }
            }
        });
    };
    
    // ✅ حل محسّن: جلب الملفات الحديثة مباشرة بدون recursive
    App.API.fetchRecentFiles = function(folderId, source, maxResults = 10) {
        const cacheKey = `recent_files_${folderId}_${maxResults}`;
        
        const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
            `q='${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'` +
            `&key=${App.GOOGLE_DRIVE.API_KEY}` +
            `&fields=files(id,name,mimeType,modifiedTime,webViewLink,size,parents)` +
            `&orderBy=modifiedTime desc` +
            `&pageSize=${maxResults}`;
        
        return App.API.fetchWithCache(url, cacheKey)
            .then(result => {
                const files = result.data.files || [];
                files.forEach(f => f.source = source);
                return files;
            });
    };
    
    // ✅ حل محسّن: جلب الملفات مع معلومات المسار
    App.API.fetchFilesWithPath = function(folderId, source, path = []) {
        const cacheKey = `files_with_path_${folderId}`;
        
        if (App.API.sessionCache[cacheKey]) {
            return Promise.resolve(App.API.sessionCache[cacheKey]);
        }
        
        const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
            `q='${folderId}' in parents and trashed=false` +
            `&key=${App.GOOGLE_DRIVE.API_KEY}` +
            `&fields=files(id,name,mimeType,modifiedTime,webViewLink,size,parents)` +
            `&orderBy=folder,name`;
        
        return fetch(url)
            .then(r => r.json())
            .then(data => {
                const files = data.files || [];
                const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
                const nonFolders = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
                
                // إضافة معلومات المسار للملفات
                nonFolders.forEach(f => {
                    f.source = source;
                    f.path = [...path];
                });
                
                // جلب الملفات من المجلدات الفرعية (حد أقصى 3 مستويات)
                if (folders.length > 0 && path.length < 3) {
                    const subPromises = folders.map(folder => 
                        App.API.fetchFilesWithPath(
                            folder.id, 
                            source, 
                            [...path, { id: folder.id, name: folder.name }]
                        )
                    );
                    
                    return Promise.all(subPromises).then(results => {
                        const allFiles = [...nonFolders, ...results.flat()];
                        addToCache(cacheKey, allFiles);
                        return allFiles;
                    });
                }
                
                addToCache(cacheKey, nonFolders);
                return nonFolders;
            });
    };
    
    // ✅ حل محسّن: حساب الإحصائيات الدقيقة
    App.API.fetchAccurateStats = function() {
        const cacheKey = 'accurate_stats_v2';
        
        // التحقق من cache (صالح لمدة ساعة)
        const cached = App.Cache.get(cacheKey);
        const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
        
        if (cached && cacheAge < 3600000) { // ساعة واحدة
            return Promise.resolve(cached.data);
        }
        
        // جلب الإحصائيات من كلا المجلدين
        const lecturesUrl = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
            `q='${App.GOOGLE_DRIVE.LECTURES_FOLDER_ID}' in parents and trashed=false` +
            `&key=${App.GOOGLE_DRIVE.API_KEY}` +
            `&fields=files(id,mimeType)`;
        
        const summariesUrl = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
            `q='${App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID}' in parents and trashed=false` +
            `&key=${App.GOOGLE_DRIVE.API_KEY}` +
            `&fields=files(id,mimeType)`;
        
        return Promise.all([
            fetch(lecturesUrl).then(r => r.json()),
            fetch(summariesUrl).then(r => r.json())
        ]).then(([lecturesData, summariesData]) => {
            const lecturesFiles = (lecturesData.files || [])
                .filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
            const summariesFiles = (summariesData.files || [])
                .filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
            
            const stats = {
                lecturesCount: lecturesFiles.length,
                summariesCount: summariesFiles.length,
                totalCount: lecturesFiles.length + summariesFiles.length,
                timestamp: Date.now()
            };
            
            // حفظ في cache
            App.Cache.set(cacheKey, { data: stats, timestamp: Date.now() });
            
            return stats;
        });
    };
    
    // حساب إحصائيات تفصيلية من الملفات
    App.API.calculateStats = function(files) {
        const stats = {
            total: 0,
            videos: 0,
            pdfs: 0,
            docs: 0,
            others: 0,
            totalSize: 0,
            folders: 0
        };
        
        files.forEach(function(file) {
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                stats.folders++;
                return; // لا نحسب المجلدات في الإجمالي
            }
            
            stats.total++;
            
            if (file.mimeType && file.mimeType.indexOf('video') > -1) {
                stats.videos++;
            } else if (file.mimeType && file.mimeType.indexOf('pdf') > -1) {
                stats.pdfs++;
            } else if (file.mimeType && (file.mimeType.indexOf('document') > -1 || file.mimeType.indexOf('word') > -1)) {
                stats.docs++;
            } else {
                stats.others++;
            }
            
            if (file.size) {
                stats.totalSize += parseInt(file.size);
            }
        });
        
        return stats;
    };
    
    // Batch requests للمجلدات (حل N+1)
    App.API.fetchFoldersCounts = function(folderIds) {
        const cacheKey = `folders_counts_${folderIds.join('_')}`;
        
        if (App.API.sessionCache[cacheKey]) {
            return Promise.resolve(App.API.sessionCache[cacheKey]);
        }
        
        // جلب عدد الملفات لكل المجلدات دفعة واحدة
        const promises = folderIds.map(folderId => {
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=files(id)&pageSize=1000`;
            
            return fetch(url)
                .then(r => r.json())
                .then(data => ({
                    folderId: folderId,
                    count: data.files ? data.files.length : 0
                }))
                .catch(() => ({
                    folderId: folderId,
                    count: 0
                }));
        });
        
        return Promise.all(promises).then(results => {
            const countsMap = {};
            results.forEach(r => {
                countsMap[r.folderId] = r.count;
            });
            
            addToCache(cacheKey, countsMap);
            return countsMap;
        });
    };
    
})(window.App);

function retryLecturesConnection() {
    const errorEl = document.getElementById('lectures-error');
    const container = document.getElementById('lectures-container');
    
    if (errorEl) errorEl.classList.add('hidden');
    
    if (!navigator.onLine) {
        App.Toast.warning('لا يوجد اتصال بالإنترنت', 'غير متصل');
        
        setTimeout(() => {
            if (errorEl) errorEl.classList.remove('hidden');
        }, 500);
        return;
    }
    
    App.Toast.info('جاري إعادة المحاولة...', 'انتظر');
    
    App.API.clearSessionCache('lectures');
    
    setTimeout(() => {
        App.Router.go('lectures', false, false);
    }, 500);
}

function retrySummariesConnection() {
    const errorEl = document.getElementById('summaries-error');
    const container = document.getElementById('summaries-container');
    
    if (errorEl) errorEl.classList.add('hidden');
    
    if (!navigator.onLine) {
        App.Toast.warning('لا يوجد اتصال بالإنترنت', 'غير متصل');
        
        setTimeout(() => {
            if (errorEl) errorEl.classList.remove('hidden');
        }, 500);
        return;
    }
    
    App.Toast.info('جاري إعادة المحاولة...', 'انتظر');
    
    App.API.clearSessionCache('summaries');
    
    setTimeout(() => {
        App.Router.go('summaries', false, false);
    }, 500);
}