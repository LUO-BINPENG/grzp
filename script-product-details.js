// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有视频元素和错误提示元素
    const videoContainers = document.querySelectorAll('.video-container');
    const videos = document.querySelectorAll('.video-player');
    const videoErrors = document.querySelectorAll('.video-error');
    
    // 当前正在播放的视频索引
    let currentPlayingIndex = -1;
    
    // 创建Intersection Observer来检测视频容器是否可见
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const container = entry.target;
            const index = Array.from(videoContainers).indexOf(container);
            
            if (entry.isIntersecting) {
                // 当视频容器进入视口时，显示它
                container.classList.add('visible');
                
                // 延迟加载视频：只有当视频进入视口时才加载视频源
                const video = videos[index];
                const videoSrc = container.getAttribute('data-src');
                
                // 如果视频尚未加载源
                if (!video.src || video.src.endsWith('.mp4') === false) {
                    const source = document.createElement('source');
                    source.src = videoSrc;
                    source.type = 'video/mp4';
                    
                    // 清空现有子元素
                    while (video.firstChild) {
                        video.removeChild(video.firstChild);
                    }
                    
                    // 添加新的视频源
                    video.appendChild(source);
                    
                    // 视频加载完成后尝试播放
                    video.onloadeddata = function() {
                        tryPlayVideo(video, index);
                    };
                    
                    // 视频加载失败处理
                    video.onerror = function() {
                        console.error(`视频 ${index + 1} 加载失败`);
                        if (videoErrors[index]) {
                            videoErrors[index].style.display = 'flex';
                        }
                    };
                } else {
                    // 视频已经加载，直接尝试播放
                    tryPlayVideo(video, index);
                }
            } else {
                // 当视频容器离开视口时，隐藏它并暂停视频
                container.classList.remove('visible');
                
                const video = videos[index];
                if (!video.paused && currentPlayingIndex === index) {
                    video.pause();
                    currentPlayingIndex = -1;
                }
            }
        });
    }, {
        threshold: 0.3, // 当视频容器30%可见时触发
        rootMargin: '150px' // 扩大检测范围150px，实现预加载效果
    });
    
    // 尝试播放视频的辅助函数
    function tryPlayVideo(video, index) {
        // 检查当前是否有其他视频正在播放，如果有则暂停
        if (currentPlayingIndex !== -1 && currentPlayingIndex !== index) {
            videos[currentPlayingIndex].pause();
        }
        
        // 尝试播放当前视频
        try {
            video.play();
            currentPlayingIndex = index;
        } catch (error) {
            console.log(`视频 ${index + 1} 自动播放被阻止，这是浏览器的安全限制`);
        }
    }
    
    // 为每个视频容器添加观察
    videoContainers.forEach(container => {
        observer.observe(container);
        
        // 添加点击事件，跳转到对应3D文件夹里的1.html页面
        container.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const id = this.getAttribute('data-id');
            window.location.href = `3D/${category}/${id}/1.html`;
        });
    });
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        observer.disconnect();
    });
});