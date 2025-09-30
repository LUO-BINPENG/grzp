// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有视频元素和错误提示元素
    const videoContainers = document.querySelectorAll('.video-container');
    const videos = document.querySelectorAll('.video-player');
    const videoErrors = document.querySelectorAll('.video-error');
    
    // 视频加载状态缓存
    const videoLoadStates = {};
    
    // 当前正在播放的视频索引
    let currentPlayingIndex = -1;
    
    console.log('页面加载完成，检测到 ' + videos.length + ' 个视频元素');
    
    // 简化的视频加载和播放逻辑
    function initVideo(video, index) {
        const container = videoContainers[index];
        const containerId = container.getAttribute('data-id');
        const videoSrc = container.getAttribute('data-src');
        
        console.log('初始化视频 ' + (index + 1) + '，路径: ' + videoSrc);
        
        // 直接设置视频源，不创建额外的source元素
        video.src = videoSrc;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        
        // 视频加载完成后尝试播放
        video.onloadeddata = function() {
            console.log('视频 ' + (index + 1) + ' 加载完成');
            videoLoadStates[containerId] = 'loaded';
            container.classList.add('visible');
            
            // 直接尝试播放
            tryPlayVideo(video, index);
        };
        
        // 视频加载进度
        video.onprogress = function() {
            const buffered = video.buffered;
            if (buffered.length > 0) {
                const bufferedEnd = buffered.end(buffered.length - 1);
                const duration = video.duration;
                if (duration > 0) {
                    const percentLoaded = (bufferedEnd / duration) * 100;
                    console.log('视频 ' + (index + 1) + ' 加载进度: ' + percentLoaded.toFixed(2) + '%');
                }
            }
        };
        
        // 视频加载失败处理
        video.onerror = function(e) {
            console.error('视频 ' + (index + 1) + ' 加载失败:', e);
            videoLoadStates[containerId] = 'error';
            if (videoErrors[index]) {
                videoErrors[index].style.display = 'flex';
            }
        };
        
        // 添加点击播放/暂停功能
        video.addEventListener('click', function(e) {
            if (video.paused) {
                console.log('用户点击播放视频 ' + (index + 1));
                tryPlayVideo(video, index);
            } else {
                console.log('用户点击暂停视频 ' + (index + 1));
                video.pause();
                currentPlayingIndex = -1;
            }
        });
        
        // 立即开始加载视频
        video.load();
    }
    
    // 尝试播放视频的辅助函数
    function tryPlayVideo(video, index) {
        // 检查当前是否有其他视频正在播放，如果有则暂停
        if (currentPlayingIndex !== -1 && currentPlayingIndex !== index) {
            videos[currentPlayingIndex].pause();
        }
        
        // 尝试播放当前视频
        try {
            video.muted = true;
            video.play().then(() => {
                console.log('视频 ' + (index + 1) + ' 开始播放');
                currentPlayingIndex = index;
            }).catch(error => {
                console.log('视频自动播放被阻止，点击视频尝试播放:', error);
                // 即使自动播放失败，仍然显示视频容器
                videoContainers[index].classList.add('visible');
            });
        } catch (error) {
            console.error('视频播放错误:', error);
        }
    }
    
    // 为每个视频容器初始化视频
    videoContainers.forEach((container, i) => {
        const video = videos[i];
        
        // 添加点击容器跳转到对应3D文件夹里的1.html页面
        container.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const id = this.getAttribute('data-id');
            console.log('点击容器，跳转到 3D/' + category + '/' + id + '/1.html');
            window.location.href = `3D/${category}/${id}/1.html`;
        });
        
        // 初始化视频
        initVideo(video, i);
    });
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', function() {
        // 释放视频资源
        videos.forEach(video => {
            video.pause();
            video.src = '';
        });
        
        currentPlayingIndex = -1;
    });
});