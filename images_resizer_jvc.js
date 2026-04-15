// ==UserScript==
// @name          Images Resizer pour JVC
// @namespace     risibank.fr
// @description   Resize les images #large suite à la maj du 15/04/26
// @version       0.1
// @grant         none
// @match         https://www.jeuxvideo.com/forums/*
// @match         https://www.jeuxvideo.com/recherche/forums/*
// @match         https://www.jeuxvideo.com/messages-prives/message.php?folder=*&id*
// @match         https://www.jeuxvideo.com/messages-prives/message.php?id=*
// @match         https://www.jeuxvideo.com/messages-prives/nouveau.php*
// @match         https://m.jeuxvideo.com/forums/create_topic.php*
// @match         https://m.jeuxvideo.com/forums/create_message.php*
// @match         https://m.jeuxvideo.com/forums/*
// @run-at        document-start
// ==/UserScript==

(function() {
    'use strict';

    let currentSize = localStorage.getItem('jvcImageSize');
    
    function addStyleToPage(cssContent) {
        const style = document.createElement('style');
        style.textContent = cssContent;
        
        if (document.head) {
            document.head.appendChild(style);
        } else if (document.documentElement) {
            document.documentElement.appendChild(style);
        } else {
            setTimeout(() => addStyleToPage(cssContent), 10);
        }
        
        return style;
    }
    
    if (currentSize) {
        addStyleToPage(`
            .message__urlImg.message__urlImgLarge,
            .message__urlImgLarge,
            .message__urlImg {
                width: ${currentSize}px !important;
                max-width: none !important;
                height: auto !important;
            }
        `);
    }
    
    function addResizeOption(menu) {
        if (!menu) return;
        
        if (menu.querySelector('.jvc-resize-item')) return;

        const li = document.createElement('li');
        li.className = 'dropdownCustom__item jvc-resize-item';

        const container = document.createElement('div');
        container.className = 'userParameters__parameterItem';

        const label = document.createElement('span');
        label.className = 'userParameters__parameterText';
        label.textContent = 'Taille images';

        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'px';
        input.style.width = '60px';
        input.style.marginLeft = '10px';

        if (currentSize) input.value = currentSize;

        input.addEventListener('change', (e) => {
            const size = e.target.value;
            if (!size) return;
            
            currentSize = size;
            localStorage.setItem('jvcImageSize', size);
            
            addStyleToPage(`
                .message__urlImg.message__urlImgLarge,
                .message__urlImgLarge,
                .message__urlImg {
                    width: ${size}px !important;
                    max-width: none !important;
                    height: auto !important;
                }
            `);
            
            const images = document.querySelectorAll('.message__urlImg, .message__urlImgLarge');
            images.forEach(img => {
                img.style.setProperty('width', size + 'px', 'important');
                img.style.setProperty('max-width', 'none', 'important');
            });
        });

        container.appendChild(label);
        container.appendChild(input);
        li.appendChild(container);

        const cancel = menu.querySelector('.dropdownCustom__cancel')?.closest('li');
        if (cancel) {
            menu.insertBefore(li, cancel);
        } else {
            menu.appendChild(li);
        }
    }
    
    function forceResize() {
        if (!currentSize) return;
        
        const images = document.querySelectorAll('.message__urlImg, .message__urlImgLarge');
        images.forEach(img => {
            img.style.setProperty('width', currentSize + 'px', 'important');
            img.style.setProperty('max-width', 'none', 'important');
        });
    }
    
    const menuObserver = new MutationObserver(() => {
        const menu = document.querySelector('.dropdownCustom__list');
        if (menu) {
            addResizeOption(menu);
        }
    });
    
    const imageObserver = new MutationObserver(() => {
        if (!currentSize) return;
        
        const images = document.querySelectorAll('.message__urlImg, .message__urlImgLarge');
        images.forEach(img => {
            if (img.style.width !== currentSize + 'px') {
                img.style.setProperty('width', currentSize + 'px', 'important');
                img.style.setProperty('max-width', 'none', 'important');
            }
        });
    });
    
    function startObservers() {
        if (document.body) {
            menuObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            imageObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        } else {
            setTimeout(startObservers, 50);
        }
    }
    
    if (currentSize) {
        document.addEventListener('DOMContentLoaded', forceResize);
        window.addEventListener('load', forceResize);
        window.addEventListener('pageshow', forceResize);
        
        if (document.readyState !== 'loading') {
            forceResize();
        }
    }
    
    startObservers();
    
    setInterval(() => {
        const menu = document.querySelector('.dropdownCustom__list');
        if (menu) {
            addResizeOption(menu);
        }
    }, 1000);
})();
