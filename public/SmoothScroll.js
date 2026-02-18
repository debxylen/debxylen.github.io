(() => {
    // --- Options ---
    const defaultOptions = {
        frameRate: 150, // [Hz]
        animationTime: 400, // [ms]
        stepSize: 100, // [px]
        pulseAlgorithm: true,
        pulseScale: 4,
        pulseNormalize: 1,
        accelerationDelta: 50,
        accelerationMax: 3,
        keyboardSupport: true,
        arrowScroll: 50,
        fixedBackground: true,
        excluded: ''
    };

    let options = { ...defaultOptions };

    // --- Internal State ---
    let isExcluded = false;
    let isFrame = false;
    let direction = { x: 0, y: 0 };
    let initDone = false;
    let root = document.documentElement;
    let activeElement;
    let observer;
    let refreshSize;
    let deltaBuffer = [];
    let deltaBufferTimer;

    const userAgent = window.navigator.userAgent;
    const isEdge = /Edge/.test(userAgent);
    const isChrome = /chrome/i.test(userAgent) && !isEdge;
    const isSafari = /safari/i.test(userAgent) && !isEdge;
    const isMobile = /mobile/i.test(userAgent);
    const isIEWin7 = /Windows NT 6.1/i.test(userAgent) && /rv:11/i.test(userAgent);
    const isOldSafari = isSafari && (/Version\/8/i.test(userAgent) || /Version\/9/i.test(userAgent));
    const isMac = /^Mac/.test(navigator.platform);
    const isEnabledForBrowser = (isChrome || isSafari || isIEWin7) && !isMobile;

    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: () => { supportsPassive = true; return true; }
        });
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
    } catch (e) { }

    const wheelOpt = supportsPassive ? { passive: false } : false;
    const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // --- Help Functions ---
    const addEvent = (type, fn, arg = false) => window.addEventListener(type, fn, arg);
    const removeEvent = (type, fn, arg = false) => window.removeEventListener(type, fn, arg);
    const isNodeName = (el, tag) => el && (el.nodeName || '').toLowerCase() === tag.toLowerCase();

    const getEventTargetDeep = (event) => (event.composedPath ? event.composedPath()[0] : event.target);

    const getScrollRoot = (() => {
        let SCROLL_ROOT = document.scrollingElement;
        return () => {
            if (!SCROLL_ROOT) {
                const dummy = document.createElement('div');
                dummy.style.cssText = 'height:10000px;width:1px;';
                document.body.appendChild(dummy);
                const bodyScrollTop = document.body.scrollTop;
                window.scrollBy(0, 3);
                SCROLL_ROOT = (document.body.scrollTop !== bodyScrollTop) ? document.body : document.documentElement;
                window.scrollBy(0, -3);
                document.body.removeChild(dummy);
            }
            return SCROLL_ROOT;
        };
    })();

    const requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        ((callback, element, delay) => window.setTimeout(callback, delay || (1000 / 60)));

    const MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver;

    // --- Pulse Algorithm ---
    const pulseScale = () => options.pulseScale;
    const pulseNormalize = () => options.pulseNormalize;

    const pulse_ = (x) => {
        let val, start, expx;
        x = x * options.pulseScale;
        if (x < 1) {
            val = x - (1 - Math.exp(-x));
        } else {
            start = Math.exp(-1);
            x -= 1;
            expx = 1 - Math.exp(-x);
            val = start + (expx * (1 - start));
        }
        return val * options.pulseNormalize;
    };

    const pulse = (x) => {
        if (x >= 1) return 1;
        if (x <= 0) return 0;
        if (options.pulseNormalize === 1) {
            options.pulseNormalize /= pulse_(1);
        }
        return pulse_(x);
    };

    // --- Scrolling Core ---
    let queue = [];
    let pending = false;
    let lastScroll = performance.now();

    const directionCheck = (x, y) => {
        x = (x > 0) ? 1 : -1;
        y = (y > 0) ? 1 : -1;
        if (direction.x !== x || direction.y !== y) {
            direction.x = x;
            direction.y = y;
            queue = [];
            lastScroll = 0;
        }
    };

    const scrollArray = (elem, left, top) => {
        directionCheck(left, top);

        if (options.accelerationMax !== 1) {
            const now = performance.now();
            const elapsed = now - lastScroll;
            if (elapsed < options.accelerationDelta) {
                let factor = (1 + (50 / elapsed)) / 2;
                if (factor > 1) {
                    factor = Math.min(factor, options.accelerationMax);
                    left *= factor;
                    top *= factor;
                }
            }
            lastScroll = now;
        }

        queue.push({
            x: left,
            y: top,
            lastX: (left < 0) ? 0.99 : -0.99,
            lastY: (top < 0) ? 0.99 : -0.99,
            start: performance.now()
        });

        if (pending) return;

        const scrollRoot = getScrollRoot();
        const isWindowScroll = (elem === scrollRoot || elem === document.body);

        if (elem.$scrollBehavior == null && isScrollBehaviorSmooth(elem)) {
            elem.$scrollBehavior = elem.style.scrollBehavior;
            elem.style.scrollBehavior = 'auto';
        }

        const step = () => {
            const now = performance.now();
            let scrollX = 0;
            let scrollY = 0;

            for (let i = 0; i < queue.length; i++) {
                const item = queue[i];
                const elapsed = now - item.start;
                const finished = (elapsed >= options.animationTime);
                let position = finished ? 1 : elapsed / options.animationTime;

                if (options.pulseAlgorithm) {
                    position = pulse(position);
                }

                const x = (item.x * position - item.lastX) | 0;
                const y = (item.y * position - item.lastY) | 0;

                scrollX += x;
                scrollY += y;
                item.lastX += x;
                item.lastY += y;

                if (finished) {
                    queue.splice(i, 1);
                    i--;
                }
            }

            if (isWindowScroll) {
                window.scrollBy(scrollX, scrollY);
            } else {
                if (scrollX) elem.scrollLeft += scrollX;
                if (scrollY) elem.scrollTop += scrollY;
            }

            if (!left && !top) {
                queue = [];
            }

            if (queue.length) {
                requestFrame(step, elem, (1000 / options.frameRate + 1));
            } else {
                pending = false;
                if (elem.$scrollBehavior != null) {
                    elem.style.scrollBehavior = elem.$scrollBehavior;
                    elem.$scrollBehavior = null;
                }
            }
        };

        requestFrame(step, elem, 0);
        pending = true;
    };

    // --- Event Handlers ---
    const wheel = (event) => {
        if (!initDone) init();

        const target = getEventTargetDeep(event);
        if (event.defaultPrevented || event.ctrlKey) return true;

        if (isNodeName(activeElement, 'embed') ||
            (isNodeName(target, 'embed') && /\.pdf/i.test(target.src)) ||
            isNodeName(activeElement, 'object')) {
            return true;
        }

        let deltaX = -event.wheelDeltaX || event.deltaX || 0;
        let deltaY = -event.wheelDeltaY || event.deltaY || 0;

        if (isMac) {
            if (event.wheelDeltaX && isDivisible(event.wheelDeltaX, 120)) {
                deltaX = -120 * (event.wheelDeltaX / Math.abs(event.wheelDeltaX));
            }
            if (event.wheelDeltaY && isDivisible(event.wheelDeltaY, 120)) {
                deltaY = -120 * (event.wheelDeltaY / Math.abs(event.wheelDeltaY));
            }
        }

        if (!deltaX && !deltaY) {
            deltaY = -event.wheelDelta || 0;
        }

        if (event.deltaMode === 1) {
            deltaX *= 40;
            deltaY *= 40;
        }

        const overflowing = overflowingAncestor(target);
        if (!overflowing) {
            if (isFrame && isChrome) {
                Object.defineProperty(event, "target", { value: window.frameElement });
                return parent.wheel(event);
            }
            return true;
        }

        if (isTouchpad(deltaY)) return true;

        if (Math.abs(deltaX) > 1.2) deltaX *= options.stepSize / 120;
        if (Math.abs(deltaY) > 1.2) deltaY *= options.stepSize / 120;

        scrollArray(overflowing, deltaX, deltaY);
        event.preventDefault();
        scheduleClearCache();
    };

    const keydown = (event) => {
        const target = getEventTargetDeep(event);
        const modifier = event.ctrlKey || event.altKey || event.metaKey ||
            (event.shiftKey && event.code !== 'Space');

        if (!document.body.contains(activeElement)) {
            activeElement = document.activeElement;
        }

        const inputNodeNames = /^(textarea|select|embed|object)$/i;
        const buttonTypes = /^(button|submit|radio|checkbox|file|color|image)$/i;

        if (event.defaultPrevented ||
            inputNodeNames.test(target.nodeName) ||
            (isNodeName(target, 'input') && !buttonTypes.test(target.type)) ||
            isNodeName(activeElement, 'video') ||
            isInsideYoutubeVideo(event) ||
            target.isContentEditable ||
            modifier) {
            return true;
        }

        if ((isNodeName(target, 'button') || (isNodeName(target, 'input') && buttonTypes.test(target.type))) && event.code === 'Space') {
            return true;
        }

        if (isNodeName(target, 'input') && target.type === 'radio' &&
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
            return true;
        }

        let x = 0, y = 0;
        let overflowing = overflowingAncestor(activeElement);
        if (!overflowing) return (isFrame && isChrome) ? parent.keydown(event) : true;

        let clientHeight = overflowing.clientHeight;
        if (overflowing === document.body) clientHeight = window.innerHeight;

        switch (event.code) {
            case 'ArrowUp': y = -options.arrowScroll; break;
            case 'ArrowDown': y = options.arrowScroll; break;
            case 'Space': y = -(event.shiftKey ? 1 : -1) * clientHeight * 0.9; break;
            case 'PageUp': y = -clientHeight * 0.9; break;
            case 'PageDown': y = clientHeight * 0.9; break;
            case 'Home':
                if (overflowing === document.body && document.scrollingElement) overflowing = document.scrollingElement;
                y = -overflowing.scrollTop;
                break;
            case 'End': y = Math.max(0, overflowing.scrollHeight - overflowing.scrollTop - clientHeight + 10); break;
            case 'ArrowLeft': x = -options.arrowScroll; break;
            case 'ArrowRight': x = options.arrowScroll; break;
            default: return true;
        }

        scrollArray(overflowing, x, y);
        event.preventDefault();
        scheduleClearCache();
    };

    const mousedown = (event) => { activeElement = getEventTargetDeep(event); };

    // --- Cache & Overflow ---
    const uniqueID = (() => {
        let i = 0;
        return (el) => el.uniqueID || (el.uniqueID = i++);
    })();

    let cacheX = {};
    let cacheY = {};
    let clearCacheTimer;
    let smoothBehaviorForElement = {};

    const scheduleClearCache = () => {
        clearTimeout(clearCacheTimer);
        clearCacheTimer = setInterval(() => {
            cacheX = cacheY = smoothBehaviorForElement = {};
        }, 1000);
    };

    const setCache = (elems, overflowing, x) => {
        const cache = x ? cacheX : cacheY;
        for (let i = elems.length; i--;) cache[uniqueID(elems[i])] = overflowing;
        return overflowing;
    };

    const getCache = (el, x) => (x ? cacheX : cacheY)[uniqueID(el)];

    const overflowingAncestor = (el) => {
        const elems = [];
        const body = document.body;
        const rootScrollHeight = root.scrollHeight;
        while (el) {
            const cached = getCache(el, false);
            if (cached) return setCache(elems, cached);
            elems.push(el);
            if (rootScrollHeight === el.scrollHeight) {
                const topOverflowsNotHidden = overflowNotHidden(root) && overflowNotHidden(body);
                const isOverflowCSS = topOverflowsNotHidden || overflowAutoOrScroll(root);
                if ((isFrame && isContentOverflowing(root)) || (!isFrame && isOverflowCSS)) {
                    return setCache(elems, getScrollRoot());
                }
            } else if (isContentOverflowing(el) && overflowAutoOrScroll(el)) {
                return setCache(elems, el);
            }
            el = el.parentElement || (el.getRootNode && el.getRootNode().host);
        }
    };

    const isContentOverflowing = (el) => el.clientHeight + 10 < el.scrollHeight;
    const overflowNotHidden = (el) => getComputedStyle(el, '').getPropertyValue('overflow-y') !== 'hidden';
    const overflowAutoOrScroll = (el) => {
        const s = getComputedStyle(el, '').getPropertyValue('overflow-y');
        return s === 'scroll' || s === 'auto';
    };
    const isScrollBehaviorSmooth = (el) => {
        const id = uniqueID(el);
        if (smoothBehaviorForElement[id] == null) {
            smoothBehaviorForElement[id] = getComputedStyle(el, '')['scroll-behavior'] === 'smooth';
        }
        return smoothBehaviorForElement[id];
    };

    // --- Touchpad Detection ---
    const isTouchpad = (deltaY) => {
        if (!deltaY) return;
        if (!deltaBuffer.length) deltaBuffer = [deltaY, deltaY, deltaY];
        deltaY = Math.abs(deltaY);
        deltaBuffer.push(deltaY);
        deltaBuffer.shift();
        clearTimeout(deltaBufferTimer);
        deltaBufferTimer = setTimeout(() => {
            try { localStorage.SS_deltaBuffer = deltaBuffer.join(','); } catch (e) { }
        }, 1000);
        const dpiScaledWheelDelta = deltaY > 120 && allDeltasDivisibleBy(deltaY);
        const tp = !allDeltasDivisibleBy(120) && !allDeltasDivisibleBy(100) && !dpiScaledWheelDelta;
        return deltaY < 50 || tp;
    };

    const isDivisible = (n, divisor) => Math.floor(n / divisor) === n / divisor;
    const allDeltasDivisibleBy = (divisor) => deltaBuffer.every(d => isDivisible(d, divisor));

    const isInsideYoutubeVideo = (event) => {
        let elem = getEventTargetDeep(event);
        if (document.URL.indexOf('www.youtube.com/watch') === -1) return false;
        while (elem) {
            if (elem.classList && elem.classList.contains('html5-video-controls')) return true;
            elem = elem.parentNode;
        }
        return false;
    };

    // --- Initialization ---
    const init = () => {
        if (initDone || !document.body) return;
        initDone = true;
        const body = document.body;
        const html = document.documentElement;
        root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
        activeElement = body;
        if (options.keyboardSupport) addEvent('keydown', keydown);
        if (top !== self) isFrame = true;
        else if (isOldSafari && root.scrollHeight > window.innerHeight && (body.offsetHeight <= window.innerHeight || html.offsetHeight <= window.innerHeight)) {
            const fullPageElem = document.createElement('div');
            fullPageElem.style.cssText = `position:absolute; z-index:-10000; top:0; left:0; right:0; height:${root.scrollHeight}px`;
            document.body.appendChild(fullPageElem);
            let pendingRefresh;
            refreshSize = () => {
                if (pendingRefresh) return;
                pendingRefresh = setTimeout(() => {
                    if (isExcluded) return;
                    fullPageElem.style.height = '0';
                    fullPageElem.style.height = root.scrollHeight + 'px';
                    pendingRefresh = null;
                }, 500);
            };
            setTimeout(refreshSize, 10);
            addEvent('resize', refreshSize);
            observer = new MutationObserver(refreshSize);
            observer.observe(body, { attributes: true, childList: true, characterData: false });
            if (root.offsetHeight <= window.innerHeight) {
                const clearfix = document.createElement('div');
                clearfix.style.clear = 'both';
                body.appendChild(clearfix);
            }
        }
        if (!options.fixedBackground && !isExcluded) {
            body.style.backgroundAttachment = 'scroll';
            html.style.backgroundAttachment = 'scroll';
        }
    };

    const cleanup = () => {
        observer && observer.disconnect();
        removeEvent(wheelEvent, wheel, wheelOpt);
        removeEvent('mousedown', mousedown);
        removeEvent('keydown', keydown);
        removeEvent('resize', refreshSize);
        removeEvent('load', init);
    };

    // --- Public API ---
    const SmoothScroll = (optionsToSet) => {
        for (const key in optionsToSet) {
            if (defaultOptions.hasOwnProperty(key)) options[key] = optionsToSet[key];
        }
    };

    SmoothScroll.destroy = cleanup;

    if (window.SmoothScrollOptions) SmoothScroll(window.SmoothScrollOptions);

    if (typeof define === 'function' && define.amd) define(() => SmoothScroll);
    else if (typeof exports === 'object') module.exports = SmoothScroll;
    else window.SmoothScroll = SmoothScroll;

    try {
        if (localStorage.SS_deltaBuffer) deltaBuffer = localStorage.SS_deltaBuffer.split(',').map(Number);
    } catch (e) { }

    if (wheelEvent && isEnabledForBrowser) {
        addEvent(wheelEvent, wheel, wheelOpt);
        addEvent('mousedown', mousedown);
        addEvent('load', init);
    }
})();
