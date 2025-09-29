// DOM元素
const navbar = document.querySelector('.navbar');

// 页面滚动效果
window.addEventListener('scroll', function() {
    // 导航栏背景变化
    if (window.scrollY > 20) {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    } else {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 60, // 导航栏高度
                behavior: 'smooth'
            });
        }
    });
});

// 图片扩展名数组
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

// 检查文件是否为图片
function isImageFile(filename) {
    const lowerFilename = filename.toLowerCase();
    return imageExtensions.some(ext => lowerFilename.endsWith(ext));
}

// 自动加载指定文件夹中的图片
async function loadImagesForCategory(category, track) {
    // 清空现有轨道内容
    track.innerHTML = '';
    
    // 确定图片文件夹路径
    let folderPath;
    switch(category) {
        case '电脑':
            folderPath = '页面照片/电脑照片/';
            break;
        case '家电':
            folderPath = '页面照片/家电照片/';
            break;
        case '恒温杯':
            folderPath = '页面照片/恒温杯照片/';
            break;
        default:
            folderPath = '';
    }
    
    if (!folderPath) return;
    
    try {
        // 使用预先定义的图片列表，避免不必要的404请求
        // 这种方式比尝试加载多个不存在的图片更高效
        const predefinedImages = {
            '电脑': ['1.jpg', '2.svg'],
            '家电': ['1.jpg'],
            '恒温杯': ['1.jpg']
        };
        
        const images = predefinedImages[category] || [];
        let loadedImagesCount = 0;
        
        if (images.length > 0) {
            for (const imgName of images) {
                const imageUrl = `${folderPath}${imgName}`;
                
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                
                const imgElement = document.createElement('img');
                imgElement.className = 'carousel-image';
                imgElement.src = imageUrl;
                imgElement.alt = `${category}设计${loadedImagesCount + 1}`;
                imgElement.loading = 'lazy';
                
                // 添加错误处理
                imgElement.onerror = function() {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjxwYXRoIGQ9Ik0xNSAxMHY4MGMwIDUuNTIgNC40OCAxMCAxMCAxMGg2MGM1LjUyIDAgMTAtNC40OCAxMC0xMHYtODBtLTIwIDIwaDIwTTMwIDYwaDIwTTMwIDQwaDIwIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
                };
                
                slide.appendChild(imgElement);
                track.appendChild(slide);
                loadedImagesCount++;
            }
        } else {
            // 如果没有预定义图片，使用占位图
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            const imgElement = document.createElement('img');
            imgElement.className = 'carousel-image';
            imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjxwYXRoIGQ9Ik0xNSAxMHY4MGMwIDUuNTIgNC40OCAxMCAxMCAxMGg2MGM1LjUyIDAgMTAtNC40OCAxMC0xMHYtODBtLTIwIDIwaDIwTTMwIDYwaDIwTTMwIDQwaDIwIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
            imgElement.alt = `${category}设计`;
            
            slide.appendChild(imgElement);
            track.appendChild(slide);
        }
    } catch (error) {
        console.error(`加载${category}图片时出错:`, error);
    }
}

// 初始化图片轮播
async function initCarousels() {
    const carousels = document.querySelectorAll('.image-carousel');
    
    for (const carousel of carousels) {
        const track = carousel.querySelector('.carousel-track');
        const dots = carousel.querySelector('.carousel-dots');
        const category = carousel.getAttribute('data-category');
        
        // 自动加载该类别的图片
        await loadImagesForCategory(category, track);
        
        const slides = carousel.querySelectorAll('.carousel-slide');
        let currentIndex = 0;
        
        // 清空并创建新的指示器
        dots.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(index));
            dots.appendChild(dot);
        });
        
        // 切换到指定幻灯片
        function goToSlide(index) {
            currentIndex = index;
            const slideWidth = slides[0].offsetWidth;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            
            // 更新指示器
            document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
        
        // 点击图片跳转到详情页面
        slides.forEach(slide => {
            const image = slide.querySelector('.carousel-image');
            image.style.cursor = 'pointer';
            image.addEventListener('click', () => {
                switch(category) {
                    case '电脑':
                        window.location.href = 'computer-details.html';
                        break;
                    case '家电':
                        window.location.href = 'vacuum-details.html';
                        break;
                    case '恒温杯':
                        window.location.href = 'cup-details.html';
                        break;
                }
            });
        });
        
        // 窗口大小改变时更新轮播
        window.addEventListener('resize', () => {
            goToSlide(currentIndex);
        });
    }
}

// 图片加载效果
document.querySelectorAll('img').forEach(img => {
    // 初始透明度设为0
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    
    // 图片加载完成后淡入
    img.onload = function() {
        this.style.opacity = '1';
    };
    
    // 图片加载失败时显示占位图
    img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjxwYXRoIGQ9Ik0xNSAxMHY4MGMwIDUuNTIgNC40OCAxMCAxMCAxMGg2MGM1LjUyIDAgMTAtNC40OCAxMC0xMHYtODBtLTIwIDIwaDIwTTMwIDYwaDIwTTMwIDQwaDIwIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
        this.style.opacity = '1';
    };
    
    // 如果图片已经在缓存中
    if (img.complete) {
        img.style.opacity = '1';
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    await initCarousels();
    
    // 为所有产品项目添加淡入动画
    const productItems = document.querySelectorAll('.product-item');
    
    // 创建统一的Intersection Observer实例
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    productItems.forEach((item, index) => {
        // 设置初始样式
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        // 观察元素
        observer.observe(item);
    });
});

// 添加拖放功能，让用户可以直接拖放图片到页面上
document.addEventListener('dragover', function(event) {
    event.preventDefault();
});

document.addEventListener('drop', function(event) {
    event.preventDefault();
    
    if (event.dataTransfer.files.length > 0) {
        // 在实际应用中，这里可以处理拖放的文件
        // 但由于浏览器安全限制，JavaScript无法直接保存文件到本地文件系统
        alert('拖放功能需要后端支持才能保存图片到文件夹。请手动将图片复制到对应的文件夹中。');
    }
});