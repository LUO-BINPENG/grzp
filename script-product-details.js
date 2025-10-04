// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有视频容器
    const videoContainers = document.querySelectorAll('.video-container');
    
    // 性能优化：增加并发加载视频数量，提高初始加载效率
    const MAX_CONCURRENT_LOADS = 3;
    
    // 视频加载状态缓存
    const videoLoadStates = new Map();
    
    // 当前正在播放的视频
    let currentPlayingVideo = null;
    
    // 待加载的视频队列
    const pendingVideos = [];
    
    // 当前正在加载的视频数量
    let activeLoadCount = 0;
    
    // 节流函数，避免频繁触发，调整等待时间
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
    
    // 初始化视频函数
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
        
        // 视频加载完成后显示容器
        video.onloadeddata = function() {
            // 只在开发环境下输出日志
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('视频 ' + (index + 1) + ' 加载完成');
            }
            videoLoadStates.set(containerId, 'loaded');
            container.classList.add('visible');
            
            // 自动尝试播放视频，但减少延迟
            setTimeout(() => {
                try {
                    video.play().then(() => {
                        // 只在开发环境下输出日志
                        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            console.log('视频 ' + (index + 1) + ' 自动播放成功');
                        }
                        // 隐藏占位符
                        const placeholder = container.querySelector('.video-placeholder');
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }
                    }).catch(error => {
                        // 只在开发环境下输出日志
                        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            console.log('视频 ' + (index + 1) + ' 自动播放被阻止:', error);
                        }
                    });
                } catch (error) {
                    // 只在开发环境下输出错误
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.error('视频 ' + (index + 1) + ' 播放异常:', error);
                    }
                }
            }, 50);
            
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
    
    // 暂停视频并释放不可见的视频资源
    function pauseAndReleaseVideo(video) {
        if (!video.paused) {
            video.pause();
        }
        
        // 对于不可见的视频，如果已经加载完成，可以考虑释放资源
        // 注意：这里我们不释放资源，因为如果用户再次滚动回来，需要重新加载
        // 如果视频文件很大，可以考虑在这里设置video.src = ''来释放资源
    }
    
    // 初始化IntersectionObserver来实现懒加载和按需播放
    // 优化配置：增加rootMargin以提前加载，降低throttle延迟以提高响应速度
    const observer = new IntersectionObserver(
        throttle((entries) => {
            entries.forEach(entry => {
                const container = entry.target;
                const video = container.querySelector('.video-player');
                const index = Array.from(videoContainers).indexOf(container);
                const containerId = container.getAttribute('data-id');
                
                // 只在开发环境下输出日志
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log(`视频${index+1} 可见性变化: ${entry.isIntersecting ? '进入视口' : '离开视口'}`);
                }
                
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
                    } else {
                        // 视频已加载，尝试播放
                        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            console.log(`视频${index+1} 已加载，尝试播放`);
                        }
                        playVideo(video);
                    }
                } else {
                    // 元素离开视口
                    if (currentPlayingVideo === video) {
                        console.log(`视频${index+1} 离开视口，暂停播放`);
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
        }, 50), // 降低节流时间，提高响应速度
        {
            root: null, // 使用视口
            rootMargin: '100px 0px', // 增加提前触发距离，改善用户体验
            threshold: 0.05 // 当5%的元素可见时触发
        }
    );
    
    // 为每个视频容器添加点击事件和观察器
    videoContainers.forEach((container, index) => {
        // 添加点击跳转到3D模型页面
        container.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const id = this.getAttribute('data-id');
            // 只在开发环境下输出日志
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('点击容器，跳转到 3D/' + category + '/' + id + '/1.html');
            }
            window.location.href = `3D/${category}/${id}/1.html`;
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