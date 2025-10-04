// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有视频容器
    const videoContainers = document.querySelectorAll('.video-container');
    
    // 核心性能优化：降低并发加载数量，避免过多资源竞争
    const MAX_CONCURRENT_LOADS = 1;
    
    // 视频加载状态缓存
    const videoLoadStates = new Map();
    
    // 当前正在播放的视频
    let currentPlayingVideo = null;
    
    // 待加载的视频队列
    const pendingVideos = [];
    
    // 当前正在加载的视频数量
    let activeLoadCount = 0;
    
    // 节流函数优化
    function throttle(func, wait) {
        let timeout = null;
        let previous = 0;
        return function() {
            const now = Date.now();
            const remaining = wait - (now - previous);
            const context = this;
            const args = arguments;
            if (remaining <= 0) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(function() {
                    previous = Date.now();
                    timeout = null;
                    func.apply(context, args);
                }, remaining);
            }
        };
    }
    
    // 尝试从队列中加载下一个视频
    function loadNextVideoFromQueue() {
        if (pendingVideos.length > 0 && activeLoadCount < MAX_CONCURRENT_LOADS) {
            const { video, container, index } = pendingVideos.shift();
            activeLoadCount++;
            initVideo(video, container, index);
        }
    }
    
    // 视频加载完成回调
    function onVideoLoadComplete() {
        activeLoadCount--;
        // 加载队列中的下一个视频
        loadNextVideoFromQueue();
    }
    
    // 初始化视频函数 - 大幅优化
    function initVideo(video, container, index) {
        const containerId = container.getAttribute('data-id');
        const videoSrc = container.getAttribute('data-src');
        
        // 如果已经加载过，不再重复加载
        if (videoLoadStates.has(containerId)) {
            onVideoLoadComplete();
            return;
        }
        
        // 只在开发环境下输出日志
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('懒加载视频 ' + (index + 1) + '，路径: ' + videoSrc);
        }
        
        // 设置视频源
        video.src = videoSrc;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = false; // 不自动播放
        video.preload = 'metadata'; // 只预加载元数据，大幅减少初始加载量
        
        // 视频加载完成后显示容器
        video.onloadedmetadata = function() {
            // 只在开发环境下输出日志
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('视频 ' + (index + 1) + ' 元数据加载完成');
            }
            videoLoadStates.set(containerId, 'loaded');
            container.classList.add('visible');
            
            // 完全移除自动播放尝试，减少不必要的资源消耗
            onVideoLoadComplete();
        };
        
        // 视频加载失败处理
        video.onerror = function(e) {
            // 只在开发环境下输出错误
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.error('视频 ' + (index + 1) + ' 加载失败:', e);
            }
            videoLoadStates.set(containerId, 'error');
            const videoError = container.querySelector('.video-error');
            if (videoError) {
                videoError.style.display = 'flex';
            }
            onVideoLoadComplete();
        };
        
        // 开始加载视频
        try {
            video.load();
        } catch (error) {
            // 只在开发环境下输出错误
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.error('视频加载异常:', error);
            }
            onVideoLoadComplete();
        }
    }
    
    // 播放视频函数 - 优化性能
    function playVideo(video) {
        // 如果已经有视频在播放，则暂停
        if (currentPlayingVideo && currentPlayingVideo !== video) {
            currentPlayingVideo.pause();
            // 显示上一个视频的占位符
            const prevPlaceholder = currentPlayingVideo.parentElement.querySelector('.video-placeholder');
            if (prevPlaceholder) {
                prevPlaceholder.style.display = 'flex';
            }
        }
        
        // 尝试播放当前视频
        if (video.paused) {
            try {
                video.play().then(() => {
                    currentPlayingVideo = video;
                    // 只在开发环境下输出日志
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.log('视频播放成功');
                    }
                    // 隐藏占位符
                    const placeholder = video.parentElement.querySelector('.video-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                }).catch(error => {
                    // 只在开发环境下输出日志
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.log('视频自动播放被阻止，需要用户交互:', error);
                    }
                });
            } catch (error) {
                // 只在开发环境下输出错误
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.error('视频播放错误:', error);
                }
            }
        }
    }
    
    // 暂停视频并释放不可见的视频资源 - 增强版
    function pauseAndReleaseVideo(video) {
        if (!video.paused) {
            video.pause();
        }
        
        // 对于不可见的视频，释放资源以减少内存占用
        // 只保留元数据，需要时会重新加载内容
        if (video.src) {
            const src = video.src;
            video.src = '';
            // 只在开发环境下输出日志
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('释放视频资源');
            }
        }
    }
    
    // 初始化IntersectionObserver来实现懒加载和按需播放
    // 优化配置：大幅提升性能
    const observer = new IntersectionObserver(
        throttle((entries) => {
            entries.forEach(entry => {
                const container = entry.target;
                const video = container.querySelector('.video-player');
                const index = Array.from(videoContainers).indexOf(container);
                const containerId = container.getAttribute('data-id');
                
                if (entry.isIntersecting) {
                    // 元素进入视口
                    container.classList.add('visible');
                    
                    if (!videoLoadStates.has(containerId) || videoLoadStates.get(containerId) !== 'loaded') {
                        // 如果视频尚未加载，加入加载队列
                        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            console.log(`视频${index+1} 开始加载`);
                        }
                        pendingVideos.push({ video, container, index });
                        loadNextVideoFromQueue();
                    }
                } else {
                    // 元素离开视口
                    if (currentPlayingVideo === video) {
                        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            console.log(`视频${index+1} 离开视口，暂停播放并释放资源`);
                        }
                        pauseAndReleaseVideo(video);
                        currentPlayingVideo = null;
                    }
                    // 显示占位符
                    const placeholder = container.querySelector('.video-placeholder');
                    if (placeholder && videoLoadStates.get(containerId) === 'loaded') {
                        placeholder.style.display = 'flex';
                    }
                }
            });
        }, 100), // 增加节流时间，减少不必要的处理
        {
            root: null, // 使用视口
            rootMargin: '200px 0px', // 增加提前触发距离
            threshold: 0.1 // 当10%的元素可见时触发
        }
    );
    
    // 为每个视频容器添加点击事件和观察器
    videoContainers.forEach((container, index) => {
        // 添加点击事件处理
        container.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const id = this.getAttribute('data-id');
            const video = this.querySelector('.video-player');
            
            // 如果视频未播放，先尝试播放；如果已播放，则跳转到3D模型
            if (video.paused || currentPlayingVideo !== video) {
                playVideo(video);
            } else {
                // 跳转到3D模型页面
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('点击容器，跳转到 3D/' + category + '/' + id + '/1.html');
                }
                window.location.href = `3D/${category}/${id}/1.html`;
            }
        });
        
        // 添加到观察器中
        observer.observe(container);
    });
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', function() {
        // 停止观察所有元素
        observer.disconnect();
        
        // 释放所有视频资源
        videoContainers.forEach(container => {
            const video = container.querySelector('.video-player');
            if (video) {
                video.pause();
                video.src = '';
            }
        });
        
        currentPlayingVideo = null;
        pendingVideos.length = 0;
        activeLoadCount = 0;
    });
    
    // 只在开发环境下输出日志
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('页面性能优化已应用，共检测到 ' + videoContainers.length + ' 个视频容器');
    }
});