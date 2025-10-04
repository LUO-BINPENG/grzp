// 视频云服务加载器 - 用于替换本地视频路径为云服务视频链接
// 此文件需要在script-product-details.js之前加载

document.addEventListener('DOMContentLoaded', function() {
    // 检测是否在开发环境
    const isDevEnvironment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // 只有在非开发环境下才替换视频链接
    if (!isDevEnvironment) {
        replaceLocalVideosWithCloudVideos();
    }
});

/**
 * 替换本地视频路径为云服务视频链接
 */
function replaceLocalVideosWithCloudVideos() {
    // 获取所有视频容器
    const videoContainers = document.querySelectorAll('.video-container');
    
    if (videoContainers.length === 0) {
        return;
    }
    
    console.log('正在替换本地视频为酷播云视频...');
    
    videoContainers.forEach((container, index) => {
        const category = container.getAttribute('data-category');
        const id = container.getAttribute('data-id');
        const originalSrc = container.getAttribute('data-src');
        
        // 生成酷播云视频链接
        // 注意：这里使用的是模拟链接，您需要将其替换为实际的酷播云视频链接
        const cloudVideoUrl = generateCloudVideoUrl(category, id, index + 1);
        
        // 替换data-src属性
        if (cloudVideoUrl) {
            container.setAttribute('data-src', cloudVideoUrl);
            console.log(`已替换视频${index + 1}：${originalSrc} -> ${cloudVideoUrl}`);
        }
    });
}

/**
 * 生成酷播云视频链接
 * @param {string} category - 视频分类
 * @param {string} id - 视频ID
 * @param {number} videoIndex - 视频索引
 * @returns {string} 酷播云视频链接
 */
function generateCloudVideoUrl(category, id, videoIndex) {
    // 这里是酷播云视频链接的模拟生成
    // 实际使用时，您需要将这里替换为您在酷播云上实际的视频链接
    // 示例格式：https://v.cdn.cuplayer.com/[您的用户ID]/[视频ID].mp4
    
    // 注意：以下链接是示例，请根据您实际上传到酷播云的视频链接进行修改
    const cloudBaseUrl = 'https://v.cdn.cuplayer.com/your-user-id';
    
    // 根据不同的分类和ID生成不同的视频链接
    // 您需要根据实际上传的情况修改这里的映射关系
    const videoMap = {
        '恒温杯': {
            '1': `${cloudBaseUrl}/thermo-cup-1.mp4`,
            '2': `${cloudBaseUrl}/thermo-cup-2.mp4`,
            '3': `${cloudBaseUrl}/thermo-cup-3.mp4`,
            '4': `${cloudBaseUrl}/thermo-cup-4.mp4`,
            '5': `${cloudBaseUrl}/thermo-cup-5.mp4`
        },
        '家电': {
            '1': `${cloudBaseUrl}/appliance-1.mp4`,
            '2': `${cloudBaseUrl}/appliance-2.mp4`,
            '3': `${cloudBaseUrl}/appliance-3.mp4`,
            '4': `${cloudBaseUrl}/appliance-4.mp4`,
            '5': `${cloudBaseUrl}/appliance-5.mp4`
        },
        '电脑': {
            '1': `${cloudBaseUrl}/computer-1.mp4`,
            '2': `${cloudBaseUrl}/computer-2.mp4`,
            '3': `${cloudBaseUrl}/computer-3.mp4`,
            '4': `${cloudBaseUrl}/computer-4.mp4`,
            '5': `${cloudBaseUrl}/computer-5.mp4`
        }
    };
    
    // 返回对应的云视频链接，如果没有找到则返回null
    if (videoMap[category] && videoMap[category][id]) {
        return videoMap[category][id];
    }
    
    // 如果没有找到对应的映射，返回一个默认的视频链接
    return `${cloudBaseUrl}/default-${category}-${id}.mp4`;
}

// 导出函数以便调试（仅在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.VideoCloudLoader = {
        replaceLocalVideos: replaceLocalVideosWithCloudVideos,
        generateCloudUrl: generateCloudVideoUrl
    };
}