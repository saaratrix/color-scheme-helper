
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // Modified source: https://codepen.io/pizza3/pen/BVzYNP
    function drawRGBStrip(canvas) {
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        // This gradient makes hue go from 360° -> 0°
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(1 / 6, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(2 / 6, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(3 / 6, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(4 / 6, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(5 / 6, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        // Because gradient.addColorStop doesn't always add the final colour we manually add the last color
        // So without this the final colour might be 255, 0, 3
        context.fillStyle = 'rgb(255, 0, 0)';
        context.fillRect(0, height - 1, width, 1);
    }
    // Modified source: https://codepen.io/pizza3/pen/BVzYNP
    /**
     *
     * @param color Example input: rgba(0, 0, 0, 1)
     */
    function drawHSVBlock(color, canvas, context) {
        const width = canvas.width;
        const height = canvas.height;
        context.fillStyle = color;
        context.fillRect(0, 0, width, height);
        // Draw a fully white gradient from left side to the right that will lose opacity.
        // So on the right side it's the full color.
        const whiteGradient = context.createLinearGradient(0, 0, width, 0);
        whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = whiteGradient;
        context.fillRect(0, 0, width, height);
        // Draw a fully black gradient from bottom to top.
        // So that on the bottom it's fully black and at the top it's the full color.
        const blackGradient = context.createLinearGradient(0, 0, 0, height);
        blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        context.fillStyle = blackGradient;
        context.fillRect(0, 0, width, height);
    }
    function drawAlphaBackground(width, height, context) {
        const darkColor = 'rgb(192, 192, 192)';
        const lightColor = 'rgb(255, 255, 255)';
        // Size in pixels
        const size = 8;
        const doubleSize = size * 2;
        context.fillStyle = darkColor;
        // Fill the whole draw area in dark
        context.fillRect(0, 0, width, height);
        context.fillStyle = lightColor;
        // Then we draw the tiles 2 blocks at a time like this repeated over x axis then y axis.
        // * l
        // l *
        // * is where the dark tile would have been but it's already dark because we filled the whole canvas.
        for (let y = 0; y < height; y += doubleSize) {
            for (let x = 0; x < width; x += doubleSize) {
                context.fillRect(x + size, y, size, size);
                context.fillRect(x, y + size, size, size);
            }
        }
    }

    /**
     * Convert RGB to rgb(red, green, blue)
     * @param red Range: [0, 255]
     * @param green Range: [0, 255]
     * @param blue Range: [0, 255]
     */
    /**
     * Convert RGBA to rgba(red, green, blue, alpha)
     * @param red Range: [0, 255]
     * @param green Range: [0, 255]
     * @param blue Range: [0, 255]
     * @param alpha Range: [0, 1]
     */
    function rgbaToCSS(red, green, blue, alpha) {
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    function hsvToRGBAToCSS(hue, saturation, value, alpha) {
        const rgb = hsvToRGB(hue, saturation, value);
        return rgbaToCSS(rgb.red, rgb.green, rgb.blue, alpha);
    }
    /**
     * Convert HSVA to HSLA
     * @param hue
     * @param saturation
     * @param value
     * @param alpha
     */
    function hsvaToCSS(hue, saturation, value, alpha) {
        let hsl = hsvToHSL(hue, saturation, value);
        hsl = getViewHSL(hsl.hue, hsl.saturation, hsl.lightness);
        return `hsla(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%, ${alpha})`;
    }
    /**
     * Convert RGB to Hex
     * @param red Range: [0, 255]
     * @param blue Range: [0, 255]
     * @param green Range: [0, 255]
     */
    function rgbToHex(red, green, blue) {
        let hexRed = componentToHex(red);
        let hexGreen = componentToHex(green);
        let hexBlue = componentToHex(blue);
        return `#${hexRed}${hexGreen}${hexBlue}`;
    }
    /**
     * Convert RGBA to HEX.
     * @param red Range: [0, 255]
     * @param blue Range: [0, 255]
     * @param green Range: [0, 255]
     * @param alpha Range: [0, 1]
     */
    function rgbaToHex(red, green, blue, alpha) {
        // We floor the alpha rounding so that if it's 0.99 it's still 245.
        alpha = Math.floor(alpha * 255);
        let hex = rgbToHex(red, green, blue);
        const alphaHex = componentToHex(alpha);
        return hex + alphaHex;
    }
    /**
     * Convert a color component from 0 -> 255 into hex.
     * @param color Range: [0, 255]
     */
    function componentToHex(color) {
        let hex = color.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    // Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    // Formula for hue: // Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
    /**
     * Convert RGB to HSV
     * @param red Range: [0, 255]
     * @param blue Range: [0, 255]
     * @param green Range: [0, 255]
     */
    function rgbToHSV(red, green, blue) {
        const r = red / 255;
        const g = green / 255;
        const b = blue / 255;
        const value = Math.max(r, g, b);
        const xMin = Math.min(r, g, b);
        const chroma = value - xMin;
        let saturation = 0;
        if (value !== 0) {
            saturation = chroma / value;
        }
        let hue = 0;
        if (chroma !== 0) {
            switch (value) {
                case 0:
                    break;
                case r:
                    hue = ((g - b) / chroma) % 6;
                    break;
                case g:
                    hue = ((b - r) / chroma) + 2;
                    break;
                case b:
                    hue = ((r - g) / chroma) + 4;
                    break;
            }
        }
        hue *= 60;
        if (hue < 0) {
            hue += 360;
        }
        hue = Math.round(hue);
        return {
            hue,
            saturation,
            value,
        };
    }
    // Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
    /**
     * Convert HSV values to RGB values.
     * @param hue Range: [0°, 360°]
     * @param saturation Range: [0, 1]
     * @param value Range: [0, 1]
     */
    function hsvToRGB(hue, saturation, value) {
        let red = 0;
        let green = 0;
        let blue = 0;
        let chroma = saturation * value;
        const deltaHue = hue / 60;
        let x = chroma * (1 - Math.abs((deltaHue % 2) - 1));
        // 5 < H' <= 6
        if (deltaHue > 5) {
            red = chroma;
            blue = x;
            // 4 < H' <= 5
        }
        else if (deltaHue > 4) {
            red = x;
            blue = chroma;
            // 3 < H' <= 4
        }
        else if (deltaHue > 3) {
            green = x;
            blue = chroma;
            // 2 < H' <= 3
        }
        else if (deltaHue > 2) {
            green = chroma;
            blue = x;
            // 1 < H' <= 2
        }
        else if (deltaHue > 1) {
            red = x;
            green = chroma;
            // 0 <= H' <= 1
        }
        else {
            red = chroma;
            green = x;
        }
        const m = value - chroma;
        red = Math.round((red + m) * 255);
        green = Math.round((green + m) * 255);
        blue = Math.round((blue + m) * 255);
        return {
            red,
            green,
            blue,
        };
    }
    // Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL
    /**
     * Convert HSV to HSL.
     * @param hue Range: [0°, 360°]
     * @param saturation Range: [0, 1]
     * @param value Range: [0, 1]
     */
    function hsvToHSL(hue, saturation, value) {
        const lightness = value * (1 - saturation / 2);
        // sv = 0 if value == 0
        let sl = 0;
        if (value !== 0) {
            sl = (value - lightness) / Math.min(lightness, 1 - lightness);
        }
        return {
            // Hl = Hv
            hue,
            saturation: sl,
            lightness,
        };
    }
    // Formula: https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_HSV
    /**
     * Convert HSL to HSV.
     * @param hue Range: [0°, 360°]
     * @param saturation Range: [0, 1]
     * @param lightness Range: [0, 1]
     */
    function hslToHSV(hue, saturation, lightness) {
        const value = lightness + saturation * Math.min(lightness, 1 - lightness);
        let sv = 0;
        if (value !== 0) {
            sv = 2 * (1 - lightness / value);
        }
        return {
            // Hv = Hl
            hue,
            saturation: sv,
            value,
        };
    }
    /**
     * Rounds and multiplies saturation & lightness so it's in the range of 0 -> 100.
     * @param hue Range: [0°, 360°]
     * @param saturation Range: [0, 1]
     * @param lightness Range: [0, 1]
     */
    function getViewHSL(hue, saturation, lightness) {
        return {
            hue,
            saturation: Math.round(saturation * 100),
            lightness: Math.round(lightness * 100),
        };
    }
    function roundAlpha(alpha) {
        // 3 decimal precision for alpha,  1 / 255 = 0.0039
        // Also round to 3 decimal precision or it could look like 0.12381624.
        return Math.floor(alpha * 1000) / 1000;
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var ColorSelectionMode;
    (function (ColorSelectionMode) {
        ColorSelectionMode[ColorSelectionMode["HSV"] = 0] = "HSV";
        ColorSelectionMode[ColorSelectionMode["HSL"] = 1] = "HSL";
    })(ColorSelectionMode || (ColorSelectionMode = {}));

    // TODO: All hell breaks loose if changing the colour space! Lots of refactoring!
    writable(ColorSelectionMode.HSV);
    /**
     * Range: [0, 1]
     */
    const alpha = writable(1);
    /**
     * Range: [0°, 360°]
     */
    const hue = writable(360);
    /**
     * Range: [0, 1]
     */
    const saturation = writable(1);
    // TODO: Rename to brightness to not compete naming with "value"?
    /**
     * Range: [0, 1]
     */
    const value = writable(1);

    /**
     * Create a custom store to handle the state if the user is currently dragging.
     */
    function createIsDragging() {
        let interactingCounts = 0;
        const { subscribe, set } = writable(false);
        return {
            subscribe,
            addDragging: () => {
                interactingCounts++;
                if (interactingCounts === 1) {
                    set(true);
                }
            },
            removeDragging: () => {
                interactingCounts--;
                if (interactingCounts < 0) {
                    console.log('nuu color picker: too many draggers were removed!');
                    interactingCounts = 0;
                }
                if (interactingCounts === 0) {
                    set(false);
                }
            },
        };
    }
    const isDragging = createIsDragging();

    /**
     * Clamp value between min & max.
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /* src\color-selector\ColorPicker.svelte generated by Svelte v3.38.2 */
    const file$4 = "src\\color-selector\\ColorPicker.svelte";

    function create_fragment$4(ctx) {
    	let div6;
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let canvas0;
    	let t1;
    	let div5;
    	let div4;
    	let div3;
    	let t2;
    	let canvas1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			canvas0 = element("canvas");
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			t2 = space();
    			canvas1 = element("canvas");
    			attr_dev(div0, "class", "color-picker-inner-circle svelte-1o9t59s");
    			add_location(div0, file$4, 158, 73, 4918);
    			attr_dev(div1, "class", "color-picker-circle-indicator svelte-1o9t59s");
    			add_location(div1, file$4, 158, 6, 4851);
    			attr_dev(canvas0, "width", "256");
    			attr_dev(canvas0, "height", "256");
    			attr_dev(canvas0, "class", "color-picker-saturation-lightness svelte-1o9t59s");
    			add_location(canvas0, file$4, 159, 6, 4977);
    			attr_dev(div2, "class", "color-picker-sv-container svelte-1o9t59s");
    			add_location(div2, file$4, 157, 4, 4804);
    			attr_dev(div3, "class", "color-picker-rgb-slider-inner svelte-1o9t59s");
    			add_location(div3, file$4, 162, 74, 5249);
    			attr_dev(div4, "class", "color-picker-rgb-slider svelte-1o9t59s");
    			add_location(div4, file$4, 162, 6, 5181);
    			attr_dev(canvas1, "class", "color-picker-rgb svelte-1o9t59s");
    			attr_dev(canvas1, "width", "20");
    			attr_dev(canvas1, "height", "256");
    			add_location(canvas1, file$4, 163, 6, 5312);
    			attr_dev(div5, "class", "color-picker-rgb-container svelte-1o9t59s");
    			add_location(div5, file$4, 161, 4, 5133);
    			attr_dev(div6, "class", "color-picker svelte-1o9t59s");
    			add_location(div6, file$4, 156, 0, 4772);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			/*div1_binding*/ ctx[6](div1);
    			append_dev(div2, t0);
    			append_dev(div2, canvas0);
    			/*canvas0_binding*/ ctx[7](canvas0);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			/*div4_binding*/ ctx[8](div4);
    			append_dev(div5, t2);
    			append_dev(div5, canvas1);
    			/*canvas1_binding*/ ctx[9](canvas1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(canvas0, "pointerdown", /*onSVPointerDown*/ ctx[4], false, false, false),
    					listen_dev(canvas1, "pointerdown", /*onRGBPointerDown*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			/*div1_binding*/ ctx[6](null);
    			/*canvas0_binding*/ ctx[7](null);
    			/*div4_binding*/ ctx[8](null);
    			/*canvas1_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $hue;
    	let $value;
    	let $saturation;
    	validate_store(hue, "hue");
    	component_subscribe($$self, hue, $$value => $$invalidate(13, $hue = $$value));
    	validate_store(value, "value");
    	component_subscribe($$self, value, $$value => $$invalidate(14, $value = $$value));
    	validate_store(saturation, "saturation");
    	component_subscribe($$self, saturation, $$value => $$invalidate(15, $saturation = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColorPicker", slots, []);
    	
    	let svCanvas;
    	let svContext;
    	let svIndicator;
    	let rgbCanvas;

    	// Indicator to transform up & down based on color!
    	let rgbPointyIndicator;

    	let svPointerDown = false;
    	let rgbPointerDown = false;
    	const subscriptions = [];

    	onMount(() => {
    		initEvents();
    		svContext = svCanvas.getContext("2d");
    		drawRGBStrip(rgbCanvas);
    		drawHSVBlock(hsvToRGBAToCSS($hue, 1, 1, 1), svCanvas, svContext);

    		subscriptions.push(
    			hue.subscribe(h => {
    				const rgba = hsvToRGBAToCSS(h, 1, 1, 1);
    				drawHSVBlock(rgba, svCanvas, svContext);
    				const rgbIndicatorTop = (360 - h) / 360 * rgbCanvas.height;
    				$$invalidate(3, rgbPointyIndicator.style.transform = `translate(-0.5px, ${rgbIndicatorTop}px)`, rgbPointyIndicator);
    				$$invalidate(3, rgbPointyIndicator.style.backgroundColor = rgba, rgbPointyIndicator);
    			}),
    			saturation.subscribe(s => {
    				$$invalidate(1, svIndicator.style.transform = getSVIndicatorTransform(s, $value), svIndicator);
    			}),
    			value.subscribe(v => {
    				$$invalidate(1, svIndicator.style.transform = getSVIndicatorTransform($saturation, v), svIndicator);
    			})
    		);
    	});

    	onDestroy(() => {
    		for (const subscription of subscriptions) {
    			subscription();
    		}

    		removeEvents();
    	});

    	function initEvents() {
    		window.addEventListener("pointerleave", onPointerLeave);
    		window.addEventListener("pointerup", onPointerUp);
    		window.addEventListener("pointermove", onPointerMove);
    	}

    	function removeEvents() {
    		window.removeEventListener("pointerleave", onPointerLeave);
    		window.removeEventListener("pointerup", onPointerUp);
    		window.removeEventListener("pointermove", onPointerMove);
    	}

    	function onPointerMove(event) {
    		onSLPointerMove(event);
    		onRGBPointerMove(event);
    	}

    	function onPointerUp() {
    		if (svPointerDown) {
    			isDragging.removeDragging();
    		}

    		if (rgbPointerDown) {
    			isDragging.removeDragging();
    		}

    		svPointerDown = false;
    		rgbPointerDown = false;
    	}

    	function onPointerLeave() {
    		onPointerUp();
    	}

    	function onSVPointerDown(event) {
    		svPointerDown = true;
    		onSLPointerMove(event);
    		isDragging.addDragging();
    	}

    	function onSLPointerMove(event) {
    		if (!svPointerDown) {
    			return;
    		}

    		const bounds = svCanvas.getBoundingClientRect();
    		const x = clamp(event.clientX - bounds.left, 0, svCanvas.width);
    		const y = clamp(event.clientY - bounds.top, 0, svCanvas.height);
    		const s = x / svCanvas.width;
    		const v = 1 - y / svCanvas.height;
    		saturation.set(s);
    		value.set(v);
    	}

    	function onRGBPointerDown(event) {
    		rgbPointerDown = true;
    		onRGBPointerMove(event);
    		isDragging.addDragging();
    	}

    	function onRGBPointerMove(event) {
    		if (!rgbPointerDown) {
    			return;
    		}

    		const bounds = rgbCanvas.getBoundingClientRect();

    		// Get y-pos within the canvas.
    		const y = clamp(event.clientY - bounds.top, 0, rgbCanvas.height);

    		// Because the top is 360 degrees we want the top to be 360 degrees and bottom 0 degrees.
    		// So 360 - value!
    		const h = 360 - Math.round(y / rgbCanvas.height * 360);

    		hue.set(h);
    	}

    	function getSVIndicatorTransform(saturation, value) {
    		const x = saturation * svCanvas.width - svIndicator.offsetWidth * 0.5;
    		const y = (1 - value) * svCanvas.height - svIndicator.offsetHeight * 0.5;
    		const transform = `translate(${x}px, ${y}px)`;
    		return transform;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			svIndicator = $$value;
    			$$invalidate(1, svIndicator);
    		});
    	}

    	function canvas0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			svCanvas = $$value;
    			$$invalidate(0, svCanvas);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			rgbPointyIndicator = $$value;
    			$$invalidate(3, rgbPointyIndicator);
    		});
    	}

    	function canvas1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			rgbCanvas = $$value;
    			$$invalidate(2, rgbCanvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		drawRGBStrip,
    		drawHSVBlock,
    		hsvToRGBAToCSS,
    		hue,
    		saturation,
    		value,
    		isDragging,
    		clamp,
    		svCanvas,
    		svContext,
    		svIndicator,
    		rgbCanvas,
    		rgbPointyIndicator,
    		svPointerDown,
    		rgbPointerDown,
    		subscriptions,
    		initEvents,
    		removeEvents,
    		onPointerMove,
    		onPointerUp,
    		onPointerLeave,
    		onSVPointerDown,
    		onSLPointerMove,
    		onRGBPointerDown,
    		onRGBPointerMove,
    		getSVIndicatorTransform,
    		$hue,
    		$value,
    		$saturation
    	});

    	$$self.$inject_state = $$props => {
    		if ("svCanvas" in $$props) $$invalidate(0, svCanvas = $$props.svCanvas);
    		if ("svContext" in $$props) svContext = $$props.svContext;
    		if ("svIndicator" in $$props) $$invalidate(1, svIndicator = $$props.svIndicator);
    		if ("rgbCanvas" in $$props) $$invalidate(2, rgbCanvas = $$props.rgbCanvas);
    		if ("rgbPointyIndicator" in $$props) $$invalidate(3, rgbPointyIndicator = $$props.rgbPointyIndicator);
    		if ("svPointerDown" in $$props) svPointerDown = $$props.svPointerDown;
    		if ("rgbPointerDown" in $$props) rgbPointerDown = $$props.rgbPointerDown;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		svCanvas,
    		svIndicator,
    		rgbCanvas,
    		rgbPointyIndicator,
    		onSVPointerDown,
    		onRGBPointerDown,
    		div1_binding,
    		canvas0_binding,
    		div4_binding,
    		canvas1_binding
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function parseAlpha(value) {
        // Result[5] exists if the alpha channel existed otherwise parseFloat(undefined) == NaN.
        let alpha = parseFloat(value);
        alpha = !isNaN(alpha) ? alpha : 1;
        alpha = roundAlpha(alpha);
        return alpha;
    }
    /**
     * Parses the following inputs:
     * hsl(0, 100%, 100%)
     * hsl(0, 100%, 100%, 1) -- This is alpha for dummies like me, hsvaToCSS returned hsl() instead of hsla()!
     * hsla(0, 100%; 100, 1)
     */
    function parseHSLFromCSS(color, targetColor) {
        const regex = /hsla?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3}%?)\s*,\s*([0-9]{1,3}%?)\s*(,\s*([0-9]+(\.+[0-9]+)?)\s*)?\)/m;
        // Example groups:
        // [0]: hsl(0, 50%, 75%, 0.1)
        // [1]:	0
        // [2]: 50%
        // [3]: 75%
        // [4]: , 0.1
        // [5]: 0.1
        // [6]: .1
        const result = color.match(regex);
        if (!result) {
            return;
        }
        const h = parseInt(result[1], 10);
        const s = parseInt(result[2], 10) / 100;
        const l = parseInt(result[3], 10) / 100;
        const hsv = hslToHSV(h, s, l);
        const a = parseAlpha(result[5]);
        targetColor.hue = hsv.hue;
        targetColor.saturation = hsv.saturation;
        targetColor.value = hsv.value;
        targetColor.alpha = a;
    }
    /**
     * Parses the following inputs:
     * rgb(255, 128, 0)
     * rgb(255, 128, 0, 0.2)
     * rgba(255, 128, 0, 0.2)
     */
    function parseRGBFromCSS(color, targetColor) {
        const regex = /rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*(,\s*([0-9]+(\.[0-9])?)\s*)?\)/m;
        // Example groups:
        // [0]: rgba(255, 128, 0, 0.2)
        // [1]:	255
        // [2]: 128
        // [3]: 0
        // [4]: , 0.2
        // [5]: 0.2
        // [6]: .2
        const result = color.match(regex);
        if (!result) {
            return;
        }
        const r = parseInt(result[1], 10);
        const g = parseInt(result[2], 10);
        const b = parseInt(result[3], 10);
        const hsv = rgbToHSV(r, g, b);
        const a = parseAlpha(result[5]);
        targetColor.hue = hsv.hue;
        targetColor.saturation = hsv.saturation;
        targetColor.value = hsv.value;
        targetColor.alpha = a;
    }
    // Regex source: https://stackoverflow.com/a/53936623/2437350
    /**
     * Finds hex values for for #fff, #ffff, #ffffff, #ffffffff and without #.
     */
    const getHexValuesRegex = /^#?([a-fA-F0-9]{3,4}){1,2}$/;
    /**
     * Hex string to RGB.
     * Example of input: #abc, #aabbccdd (alpha), #aabbcc #aabbccdd (alpha)
     */
    function parseHexToRGBA(hex) {
        const rgba = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1,
        };
        if (!getHexValuesRegex.test(hex)) {
            return rgba;
        }
        if (hex[0] === '#') {
            hex = hex.substring(1);
        }
        if (hex.length === 3) {
            extractHex(hex, rgba, 0, 0, 1, 1, 2, 2);
        }
        else if (hex.length === 6) {
            extractHex(hex, rgba, 0, 1, 2, 3, 4, 5);
        }
        else if (hex.length === 4) {
            extractHex(hex, rgba, 0, 0, 1, 1, 2, 2, 3, 3);
        }
        else if (hex.length === 8) {
            extractHex(hex, rgba, 0, 1, 2, 3, 4, 5, 6, 7);
        }
        return rgba;
    }
    function extractHex(hex, rgba, r1, r2, g1, g2, b1, b2, a1 = -1, a2 = -1) {
        rgba.red = parseInt(hex[r1] + hex[r2], 16);
        rgba.green = parseInt(hex[g1] + hex[g2], 16);
        rgba.blue = parseInt(hex[b1] + hex[b2], 16);
        if (a1 > 0) {
            const alpha = parseInt(hex[a1] + hex[a2], 16);
            rgba.alpha = alpha / 255;
        }
    }

    /* src\color-selector\ColorInput.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\color-selector\\ColorInput.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let label0;
    	let span0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let span1;
    	let t4;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let label2;
    	let span2;
    	let t7;
    	let input2;
    	let input2_value_value;
    	let t8;
    	let div1;
    	let label3;
    	let span3;
    	let t10;
    	let input3;
    	let input3_value_value;
    	let t11;
    	let label4;
    	let span4;
    	let t13;
    	let input4;
    	let input4_value_value;
    	let t14;
    	let label5;
    	let span5;
    	let t16;
    	let input5;
    	let input5_value_value;
    	let t17;
    	let label6;
    	let span6;
    	let t19;
    	let input6;
    	let t20;
    	let label7;
    	let span7;
    	let t22;
    	let input7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "H:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "S:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "V:";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div1 = element("div");
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "R:";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			label4 = element("label");
    			span4 = element("span");
    			span4.textContent = "G:";
    			t13 = space();
    			input4 = element("input");
    			t14 = space();
    			label5 = element("label");
    			span5 = element("span");
    			span5.textContent = "B:";
    			t16 = space();
    			input5 = element("input");
    			t17 = space();
    			label6 = element("label");
    			span6 = element("span");
    			span6.textContent = "A:";
    			t19 = space();
    			input6 = element("input");
    			t20 = space();
    			label7 = element("label");
    			span7 = element("span");
    			span7.textContent = "HEX:";
    			t22 = space();
    			input7 = element("input");
    			attr_dev(span0, "class", "label-text svelte-1hkho8o");
    			add_location(span0, file$3, 170, 6, 4955);
    			input0.value = /*$hue*/ ctx[2];
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "step", "1");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "360");
    			attr_dev(input0, "class", "svelte-1hkho8o");
    			add_location(input0, file$3, 171, 6, 4997);
    			attr_dev(label0, "class", "input-group svelte-1hkho8o");
    			add_location(label0, file$3, 169, 4, 4920);
    			attr_dev(span1, "class", "label-text svelte-1hkho8o");
    			add_location(span1, file$3, 174, 6, 5136);
    			input1.value = input1_value_value = Math.round(/*$saturation*/ ctx[3] * 100);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "1");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "class", "svelte-1hkho8o");
    			add_location(input1, file$3, 175, 6, 5178);
    			attr_dev(label1, "class", "input-group svelte-1hkho8o");
    			add_location(label1, file$3, 173, 4, 5101);
    			attr_dev(span2, "class", "label-text svelte-1hkho8o");
    			add_location(span2, file$3, 178, 6, 5349);
    			input2.value = input2_value_value = Math.round(/*$value*/ ctx[4] * 100);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "100");
    			attr_dev(input2, "class", "svelte-1hkho8o");
    			add_location(input2, file$3, 179, 6, 5391);
    			attr_dev(label2, "class", "input-group svelte-1hkho8o");
    			add_location(label2, file$3, 177, 4, 5314);
    			attr_dev(div0, "class", "color-group svelte-1hkho8o");
    			add_location(div0, file$3, 168, 2, 4889);
    			attr_dev(span3, "class", "label-text svelte-1hkho8o");
    			add_location(span3, file$3, 184, 6, 5591);
    			input3.value = input3_value_value = /*rgb*/ ctx[0].red;
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "1");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "255");
    			attr_dev(input3, "class", "svelte-1hkho8o");
    			add_location(input3, file$3, 185, 6, 5633);
    			attr_dev(label3, "class", "input-group svelte-1hkho8o");
    			add_location(label3, file$3, 183, 4, 5556);
    			attr_dev(span4, "class", "label-text svelte-1hkho8o");
    			add_location(span4, file$3, 188, 6, 5775);
    			input4.value = input4_value_value = /*rgb*/ ctx[0].green;
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "step", "1");
    			attr_dev(input4, "min", "0");
    			attr_dev(input4, "max", "255");
    			attr_dev(input4, "class", "svelte-1hkho8o");
    			add_location(input4, file$3, 189, 6, 5817);
    			attr_dev(label4, "class", "input-group svelte-1hkho8o");
    			add_location(label4, file$3, 187, 4, 5740);
    			attr_dev(span5, "class", "label-text svelte-1hkho8o");
    			add_location(span5, file$3, 192, 6, 5963);
    			input5.value = input5_value_value = /*rgb*/ ctx[0].blue;
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "step", "1");
    			attr_dev(input5, "min", "0");
    			attr_dev(input5, "max", "255");
    			attr_dev(input5, "class", "svelte-1hkho8o");
    			add_location(input5, file$3, 193, 6, 6005);
    			attr_dev(label5, "class", "input-group svelte-1hkho8o");
    			add_location(label5, file$3, 191, 4, 5928);
    			attr_dev(span6, "class", "label-text svelte-1hkho8o");
    			add_location(span6, file$3, 196, 6, 6149);
    			input6.value = /*$alpha*/ ctx[5];
    			attr_dev(input6, "type", "number");
    			attr_dev(input6, "step", "0.01");
    			attr_dev(input6, "min", "0");
    			attr_dev(input6, "max", "1");
    			attr_dev(input6, "class", "svelte-1hkho8o");
    			add_location(input6, file$3, 197, 6, 6191);
    			attr_dev(label6, "class", "input-group svelte-1hkho8o");
    			add_location(label6, file$3, 195, 4, 6114);
    			attr_dev(span7, "class", "label-text svelte-1hkho8o");
    			add_location(span7, file$3, 200, 6, 6335);
    			input7.value = /*hex*/ ctx[1];
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "svelte-1hkho8o");
    			add_location(input7, file$3, 201, 6, 6379);
    			attr_dev(label7, "class", "input-group svelte-1hkho8o");
    			add_location(label7, file$3, 199, 4, 6300);
    			attr_dev(div1, "class", "color-group svelte-1hkho8o");
    			add_location(div1, file$3, 182, 2, 5525);
    			attr_dev(div2, "class", "color-input-container svelte-1hkho8o");
    			add_location(div2, file$3, 167, 0, 4850);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			append_dev(div0, t2);
    			append_dev(div0, label1);
    			append_dev(label1, span1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			append_dev(div0, t5);
    			append_dev(div0, label2);
    			append_dev(label2, span2);
    			append_dev(label2, t7);
    			append_dev(label2, input2);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, label3);
    			append_dev(label3, span3);
    			append_dev(label3, t10);
    			append_dev(label3, input3);
    			append_dev(div1, t11);
    			append_dev(div1, label4);
    			append_dev(label4, span4);
    			append_dev(label4, t13);
    			append_dev(label4, input4);
    			append_dev(div1, t14);
    			append_dev(div1, label5);
    			append_dev(label5, span5);
    			append_dev(label5, t16);
    			append_dev(label5, input5);
    			append_dev(div1, t17);
    			append_dev(div1, label6);
    			append_dev(label6, span6);
    			append_dev(label6, t19);
    			append_dev(label6, input6);
    			append_dev(div1, t20);
    			append_dev(div1, label7);
    			append_dev(label7, span7);
    			append_dev(label7, t22);
    			append_dev(label7, input7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*onHueChange*/ ctx[6], false, false, false),
    					listen_dev(input1, "input", /*onSaturationChange*/ ctx[7], false, false, false),
    					listen_dev(input2, "input", /*onValueChange*/ ctx[8], false, false, false),
    					listen_dev(input3, "input", /*onRedChange*/ ctx[9], false, false, false),
    					listen_dev(input4, "input", /*onGreenChange*/ ctx[10], false, false, false),
    					listen_dev(input5, "input", /*onBlueChange*/ ctx[11], false, false, false),
    					listen_dev(input6, "input", /*onAlphaChange*/ ctx[12], false, false, false),
    					listen_dev(input7, "input", /*onHexChange*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$hue*/ 4) {
    				prop_dev(input0, "value", /*$hue*/ ctx[2]);
    			}

    			if (dirty & /*$saturation*/ 8 && input1_value_value !== (input1_value_value = Math.round(/*$saturation*/ ctx[3] * 100))) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*$value*/ 16 && input2_value_value !== (input2_value_value = Math.round(/*$value*/ ctx[4] * 100))) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty & /*rgb*/ 1 && input3_value_value !== (input3_value_value = /*rgb*/ ctx[0].red)) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (dirty & /*rgb*/ 1 && input4_value_value !== (input4_value_value = /*rgb*/ ctx[0].green)) {
    				prop_dev(input4, "value", input4_value_value);
    			}

    			if (dirty & /*rgb*/ 1 && input5_value_value !== (input5_value_value = /*rgb*/ ctx[0].blue)) {
    				prop_dev(input5, "value", input5_value_value);
    			}

    			if (dirty & /*$alpha*/ 32) {
    				prop_dev(input6, "value", /*$alpha*/ ctx[5]);
    			}

    			if (dirty & /*hex*/ 2 && input7.value !== /*hex*/ ctx[1]) {
    				prop_dev(input7, "value", /*hex*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getAndSetRoundedInputValue(event) {
    	const target = event.target;
    	const value = Math.round(parseFloat(target.value));
    	target.value = value.toString();
    	return value;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $hue;
    	let $saturation;
    	let $value;
    	let $alpha;
    	validate_store(hue, "hue");
    	component_subscribe($$self, hue, $$value => $$invalidate(2, $hue = $$value));
    	validate_store(saturation, "saturation");
    	component_subscribe($$self, saturation, $$value => $$invalidate(3, $saturation = $$value));
    	validate_store(value, "value");
    	component_subscribe($$self, value, $$value => $$invalidate(4, $value = $$value));
    	validate_store(alpha, "alpha");
    	component_subscribe($$self, alpha, $$value => $$invalidate(5, $alpha = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColorInput", slots, []);
    	
    	

    	// If we update RGB colors or hex directly we don't want to HSV events to update the RGB values because it makes it impossible to edit values!
    	let blockRGBHexUpdate = false;

    	let rgb = { red: 0, green: 0, blue: 0 };
    	let hex = "";
    	const subscriptions = [];

    	onMount(() => {
    		updateRGBAndHex($hue, $saturation, $value);

    		subscriptions.push(
    			hue.subscribe(h => {
    				updateRGBAndHex(h, $saturation, $value);
    			}),
    			saturation.subscribe(s => {
    				updateRGBAndHex($hue, s, $value);
    			}),
    			value.subscribe(v => {
    				updateRGBAndHex($hue, $saturation, v);
    			})
    		);
    	});

    	onDestroy(() => {
    		for (const subscription of subscriptions) {
    			subscription();
    		}
    	});

    	function onHueChange(event) {
    		const h = getAndSetRoundedInputValue(event);
    		const clampedValue = clampInput(h, 0, 360);
    		hue.set(clampedValue);
    	}

    	function onSaturationChange(event) {
    		const s = getAndSetRoundedInputValue(event);
    		const clampedValue = clampInput(s, 0, 100) / 100;
    		saturation.set(clampedValue);
    	}

    	function onValueChange(event) {
    		const s = getAndSetRoundedInputValue(event);
    		const clampedValue = clampInput(s, 0, 100) / 100;
    		value.set(clampedValue);
    	}

    	function onRedChange(event) {
    		let red = getAndSetRoundedInputValue(event);
    		red = clampInput(red, 0, 255);
    		$$invalidate(0, rgb.red = red, rgb);
    		$$invalidate(1, hex = rgbToHex(rgb.red, rgb.green, rgb.blue));
    		updateHSV();
    	}

    	function onGreenChange(event) {
    		let green = getAndSetRoundedInputValue(event);
    		green = clampInput(green, 0, 255);
    		$$invalidate(0, rgb.green = green, rgb);
    		$$invalidate(1, hex = rgbToHex(rgb.red, rgb.green, rgb.blue));
    		updateHSV();
    	}

    	function onBlueChange(event) {
    		let blue = getAndSetRoundedInputValue(event);
    		blue = clampInput(blue, 0, 255);
    		$$invalidate(0, rgb.blue = blue, rgb);
    		$$invalidate(1, hex = rgbToHex(rgb.red, rgb.green, rgb.blue));
    		updateHSV();
    	}

    	function onAlphaChange(event) {
    		const target = event.target;
    		let a = parseFloat(target.value);
    		a = clampInput(a, 0, 1);
    		alpha.set(a);
    		updateHex(rgb.red, rgb.green, rgb.blue, a);
    	}

    	function onHexChange(event) {
    		const element = event.target;
    		const hex = element.value;
    		const rgba = parseHexToRGBA(hex);
    		$$invalidate(0, rgb.red = rgba.red, rgb);
    		$$invalidate(0, rgb.green = rgba.green, rgb);
    		$$invalidate(0, rgb.blue = rgba.blue, rgb);
    		const a = roundAlpha(rgba.alpha);
    		alpha.set(a);
    		updateHSV();
    	}

    	function updateHSV() {
    		const oldHue = $hue;
    		const hsv = rgbToHSV(rgb.red, rgb.green, rgb.blue);
    		blockRGBHexUpdate = true;

    		// This is so that we don't jump with the hue if you are adjusting the RGB values and they all align
    		// Which makes it become a greyscale value and thus hue is calculated as 0.
    		if (rgb.red === rgb.green && rgb.red === rgb.blue && oldHue !== 0) {
    			hsv.hue = oldHue;
    		}

    		hue.set(hsv.hue);
    		saturation.set(hsv.saturation);
    		value.set(hsv.value);
    		blockRGBHexUpdate = false;
    	}

    	function updateRGBAndHex(h, s, v) {
    		if (blockRGBHexUpdate) {
    			return;
    		}

    		const color = hsvToRGB(h, s, v);
    		$$invalidate(0, rgb.red = color.red, rgb);
    		$$invalidate(0, rgb.green = color.green, rgb);
    		$$invalidate(0, rgb.blue = color.blue, rgb);
    		updateHex(rgb.red, rgb.green, rgb.red, $alpha);
    	}

    	/**
     * Update the hex and add alpha if less than 255.
     * @param red Range: [0, 255]
     * @param green Range: [0, 255]
     * @param blue Range: [0, 255]
     * @param a Range: [0, 1]
     */
    	function updateHex(red, green, blue, a) {
    		if (a === 1) {
    			$$invalidate(1, hex = rgbToHex(red, green, blue));
    		} else {
    			$$invalidate(1, hex = rgbaToHex(red, green, blue, a));
    		}
    	}

    	function clampInput(value, min, max) {
    		if (!isFinite(value) || isNaN(value)) {
    			value = min;
    		}

    		return clamp(value, min, max);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorInput> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		alpha,
    		hue,
    		saturation,
    		value,
    		clamp,
    		onDestroy,
    		onMount,
    		hsvToRGB,
    		rgbaToHex,
    		rgbToHex,
    		rgbToHSV,
    		roundAlpha,
    		parseHexToRGBA,
    		blockRGBHexUpdate,
    		rgb,
    		hex,
    		subscriptions,
    		onHueChange,
    		onSaturationChange,
    		onValueChange,
    		onRedChange,
    		onGreenChange,
    		onBlueChange,
    		onAlphaChange,
    		onHexChange,
    		updateHSV,
    		updateRGBAndHex,
    		updateHex,
    		getAndSetRoundedInputValue,
    		clampInput,
    		$hue,
    		$saturation,
    		$value,
    		$alpha
    	});

    	$$self.$inject_state = $$props => {
    		if ("blockRGBHexUpdate" in $$props) blockRGBHexUpdate = $$props.blockRGBHexUpdate;
    		if ("rgb" in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ("hex" in $$props) $$invalidate(1, hex = $$props.hex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		rgb,
    		hex,
    		$hue,
    		$saturation,
    		$value,
    		$alpha,
    		onHueChange,
    		onSaturationChange,
    		onValueChange,
    		onRedChange,
    		onGreenChange,
    		onBlueChange,
    		onAlphaChange,
    		onHexChange
    	];
    }

    class ColorInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorInput",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\color-selector\NuuSelectedColor.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\color-selector\\NuuSelectedColor.svelte";

    function create_fragment$2(ctx) {
    	let div0;
    	let canvas0;
    	let t;
    	let div1;
    	let canvas1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			canvas0 = element("canvas");
    			t = space();
    			div1 = element("div");
    			canvas1 = element("canvas");
    			attr_dev(canvas0, "width", canvasWidth);
    			attr_dev(canvas0, "height", canvasHeight);
    			add_location(canvas0, file$2, 71, 47, 2256);
    			attr_dev(div0, "class", "selected-color selected-color-new svelte-10bi7yp");
    			add_location(div0, file$2, 71, 0, 2209);
    			attr_dev(canvas1, "width", canvasWidth);
    			attr_dev(canvas1, "height", canvasHeight);
    			add_location(canvas1, file$2, 72, 69, 2414);
    			attr_dev(div1, "class", "selected-color selected-color-old svelte-10bi7yp");
    			add_location(div1, file$2, 72, 0, 2345);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, canvas0);
    			/*canvas0_binding*/ ctx[5](canvas0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, canvas1);
    			/*canvas1_binding*/ ctx[6](canvas1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*resetColor*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*canvas0_binding*/ ctx[5](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			/*canvas1_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const canvasWidth = 44;
    const canvasHeight = 32;

    function instance$2($$self, $$props, $$invalidate) {
    	let $hue;
    	let $saturation;
    	let $value;
    	let $alpha;
    	validate_store(hue, "hue");
    	component_subscribe($$self, hue, $$value => $$invalidate(8, $hue = $$value));
    	validate_store(saturation, "saturation");
    	component_subscribe($$self, saturation, $$value => $$invalidate(9, $saturation = $$value));
    	validate_store(value, "value");
    	component_subscribe($$self, value, $$value => $$invalidate(10, $value = $$value));
    	validate_store(alpha, "alpha");
    	component_subscribe($$self, alpha, $$value => $$invalidate(11, $alpha = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NuuSelectedColor", slots, []);
    	
    	
    	let { oldHSVAColor } = $$props;
    	
    	let newCanvas;
    	let newContext;
    	let oldCanvas;
    	let oldContext;
    	let subscriptions = [];

    	onMount(() => {
    		newContext = newCanvas.getContext("2d");
    		$$invalidate(4, oldContext = oldCanvas.getContext("2d"));

    		// Set the color to the input color.
    		resetColor();

    		drawColor(newContext, $hue, $saturation, $value, $alpha);

    		subscriptions.push(
    			hue.subscribe(h => {
    				drawColor(newContext, h, $saturation, $value, $alpha);
    			}),
    			saturation.subscribe(s => {
    				drawColor(newContext, $hue, s, $value, $alpha);
    			}),
    			value.subscribe(v => {
    				drawColor(newContext, $hue, $saturation, v, $alpha);
    			}),
    			alpha.subscribe(a => {
    				drawColor(newContext, $hue, $saturation, $value, a);
    			})
    		);
    	});

    	onDestroy(() => {
    		for (const subscription of subscriptions) {
    			subscription();
    		}
    	});

    	function drawColor(context, h, s, v, a) {
    		if (!context) {
    			return;
    		}

    		if (a < 1) {
    			// Draw alpha background!
    			drawAlphaBackground(canvasWidth, canvasHeight, context);
    		} else {
    			context.clearRect(0, 0, canvasWidth, canvasHeight);
    		}

    		const css = hsvaToCSS(h, s, v, a);
    		context.fillStyle = css;
    		context.fillRect(0, 0, canvasWidth, canvasHeight);
    	}

    	function resetColor() {
    		hue.set(oldHSVAColor.hue);
    		saturation.set(oldHSVAColor.saturation);
    		value.set(oldHSVAColor.value);
    		alpha.set(oldHSVAColor.alpha);
    	}

    	const writable_props = ["oldHSVAColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NuuSelectedColor> was created with unknown prop '${key}'`);
    	});

    	function canvas0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			newCanvas = $$value;
    			$$invalidate(0, newCanvas);
    		});
    	}

    	function canvas1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			oldCanvas = $$value;
    			$$invalidate(1, oldCanvas);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("oldHSVAColor" in $$props) $$invalidate(3, oldHSVAColor = $$props.oldHSVAColor);
    	};

    	$$self.$capture_state = () => ({
    		hsvaToCSS,
    		onDestroy,
    		onMount,
    		hue,
    		saturation,
    		value,
    		alpha,
    		drawAlphaBackground,
    		oldHSVAColor,
    		canvasWidth,
    		canvasHeight,
    		newCanvas,
    		newContext,
    		oldCanvas,
    		oldContext,
    		subscriptions,
    		drawColor,
    		resetColor,
    		$hue,
    		$saturation,
    		$value,
    		$alpha
    	});

    	$$self.$inject_state = $$props => {
    		if ("oldHSVAColor" in $$props) $$invalidate(3, oldHSVAColor = $$props.oldHSVAColor);
    		if ("newCanvas" in $$props) $$invalidate(0, newCanvas = $$props.newCanvas);
    		if ("newContext" in $$props) newContext = $$props.newContext;
    		if ("oldCanvas" in $$props) $$invalidate(1, oldCanvas = $$props.oldCanvas);
    		if ("oldContext" in $$props) $$invalidate(4, oldContext = $$props.oldContext);
    		if ("subscriptions" in $$props) subscriptions = $$props.subscriptions;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*oldHSVAColor, oldContext*/ 24) {
    			// If oldHSVAColor changes then we want to draw new color! This can be changed if a user confirms their colour selection.
    			if (oldHSVAColor) {
    				drawColor(oldContext, oldHSVAColor.hue, oldHSVAColor.saturation, oldHSVAColor.value, oldHSVAColor.alpha);
    			}
    		}
    	};

    	return [
    		newCanvas,
    		oldCanvas,
    		resetColor,
    		oldHSVAColor,
    		oldContext,
    		canvas0_binding,
    		canvas1_binding
    	];
    }

    class NuuSelectedColor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { oldHSVAColor: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuuSelectedColor",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*oldHSVAColor*/ ctx[3] === undefined && !("oldHSVAColor" in props)) {
    			console.warn("<NuuSelectedColor> was created without expected prop 'oldHSVAColor'");
    		}
    	}

    	get oldHSVAColor() {
    		throw new Error("<NuuSelectedColor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set oldHSVAColor(value) {
    		throw new Error("<NuuSelectedColor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\color-selector\ColorSelector.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$1 = "src\\color-selector\\ColorSelector.svelte";

    function create_fragment$1(ctx) {
    	let div5;
    	let div0;
    	let colorpicker;
    	let t0;
    	let div4;
    	let colorinput;
    	let t1;
    	let div3;
    	let div1;
    	let nuuselectedcolor;
    	let updating_oldHSVAColor;
    	let t2;
    	let div2;
    	let span;
    	let current;
    	let mounted;
    	let dispose;
    	colorpicker = new ColorPicker({ $$inline: true });
    	colorinput = new ColorInput({ $$inline: true });

    	function nuuselectedcolor_oldHSVAColor_binding(value) {
    		/*nuuselectedcolor_oldHSVAColor_binding*/ ctx[3](value);
    	}

    	let nuuselectedcolor_props = {};

    	if (/*oldHSVAColor*/ ctx[0] !== void 0) {
    		nuuselectedcolor_props.oldHSVAColor = /*oldHSVAColor*/ ctx[0];
    	}

    	nuuselectedcolor = new NuuSelectedColor({
    			props: nuuselectedcolor_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(nuuselectedcolor, "oldHSVAColor", nuuselectedcolor_oldHSVAColor_binding));

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			create_component(colorpicker.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			create_component(colorinput.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(nuuselectedcolor.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "✓";
    			attr_dev(div0, "class", "color-picker-container");
    			add_location(div0, file$1, 103, 2, 3084);
    			attr_dev(div1, "class", "selected-color-container svelte-1a2i7y");
    			add_location(div1, file$1, 109, 6, 3262);
    			attr_dev(span, "class", "color-confirm-button svelte-1a2i7y");
    			attr_dev(span, "title", "OK!");
    			add_location(span, file$1, 112, 56, 3437);
    			attr_dev(div2, "class", "color-confirm");
    			add_location(div2, file$1, 112, 6, 3387);
    			attr_dev(div3, "class", "color-selected-container svelte-1a2i7y");
    			add_location(div3, file$1, 108, 4, 3216);
    			attr_dev(div4, "class", "color-input-container svelte-1a2i7y");
    			add_location(div4, file$1, 106, 2, 3155);
    			attr_dev(div5, "class", "color-selector svelte-1a2i7y");
    			add_location(div5, file$1, 102, 0, 3052);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			mount_component(colorpicker, div0, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			mount_component(colorinput, div4, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			mount_component(nuuselectedcolor, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*selectColor*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const nuuselectedcolor_changes = {};

    			if (!updating_oldHSVAColor && dirty & /*oldHSVAColor*/ 1) {
    				updating_oldHSVAColor = true;
    				nuuselectedcolor_changes.oldHSVAColor = /*oldHSVAColor*/ ctx[0];
    				add_flush_callback(() => updating_oldHSVAColor = false);
    			}

    			nuuselectedcolor.$set(nuuselectedcolor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			transition_in(colorinput.$$.fragment, local);
    			transition_in(nuuselectedcolor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			transition_out(colorinput.$$.fragment, local);
    			transition_out(nuuselectedcolor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(colorpicker);
    			destroy_component(colorinput);
    			destroy_component(nuuselectedcolor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createDefaultHSVColor() {
    	return {
    		hue: 360,
    		saturation: 1,
    		value: 1,
    		alpha: 1
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $hue;
    	let $saturation;
    	let $value;
    	let $alpha;
    	validate_store(hue, "hue");
    	component_subscribe($$self, hue, $$value => $$invalidate(4, $hue = $$value));
    	validate_store(saturation, "saturation");
    	component_subscribe($$self, saturation, $$value => $$invalidate(5, $saturation = $$value));
    	validate_store(value, "value");
    	component_subscribe($$self, value, $$value => $$invalidate(6, $value = $$value));
    	validate_store(alpha, "alpha");
    	component_subscribe($$self, alpha, $$value => $$invalidate(7, $alpha = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColorSelector", slots, []);
    	
    	let { color = "" } = $$props;

    	// Give default value or it'll crash when mounting components.
    	let oldHSVAColor = createDefaultHSVColor();

    	onMount(() => {
    		parseColor();
    	});

    	function parseColor() {
    		let parsedColor = createDefaultHSVColor();

    		// For example `color` would make the value be true and then color.startsWith would fail.
    		if (!color || !color.startsWith) {
    			console.log("nuu color picker: could not parse input color.");
    			$$invalidate(0, oldHSVAColor = parsedColor);
    			return;
    		}

    		// Parse the input color!
    		if (color.includes("hsl")) {
    			// Parse it as HSL!
    			parseHSLFromCSS(color, parsedColor);
    		} else if (color.includes("rgb")) {
    			// Parse it as RGBA
    			parseRGBFromCSS(color, parsedColor);
    		} else {
    			parseHex(color, parsedColor);
    		}

    		// It's easier to set alpha first than to fix the event bug that changing hex would update alpha which would unset everything!
    		// So if the UI changes that bug needs to be solved.
    		alpha.set(parsedColor.alpha);

    		hue.set(parsedColor.hue);
    		saturation.set(parsedColor.saturation);
    		value.set(parsedColor.value);
    		$$invalidate(0, oldHSVAColor = parsedColor);
    	}

    	function parseHex(color, targetColor) {
    		// Parse it as HEX!
    		const rgba = parseHexToRGBA(color);

    		const hsv = rgbToHSV(rgba.red, rgba.green, rgba.blue);
    		const a = roundAlpha(rgba.alpha);
    		targetColor.hue = hsv.hue;
    		targetColor.saturation = hsv.saturation;
    		targetColor.value = hsv.value;
    		targetColor.alpha = a;
    	}

    	function selectColor() {
    		$$invalidate(0, oldHSVAColor.hue = $hue, oldHSVAColor);
    		$$invalidate(0, oldHSVAColor.saturation = $saturation, oldHSVAColor);
    		$$invalidate(0, oldHSVAColor.value = $value, oldHSVAColor);
    		$$invalidate(0, oldHSVAColor.alpha = $alpha, oldHSVAColor);
    	}

    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ColorSelector> was created with unknown prop '${key}'`);
    	});

    	function nuuselectedcolor_oldHSVAColor_binding(value) {
    		oldHSVAColor = value;
    		$$invalidate(0, oldHSVAColor);
    	}

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		ColorPicker,
    		ColorInput,
    		NuuSelectedColor,
    		hue,
    		saturation,
    		value,
    		alpha,
    		onMount,
    		parseHexToRGBA,
    		parseHSLFromCSS,
    		parseRGBFromCSS,
    		rgbToHSV,
    		roundAlpha,
    		color,
    		oldHSVAColor,
    		parseColor,
    		parseHex,
    		createDefaultHSVColor,
    		selectColor,
    		$hue,
    		$saturation,
    		$value,
    		$alpha
    	});

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("oldHSVAColor" in $$props) $$invalidate(0, oldHSVAColor = $$props.oldHSVAColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 4) {
    			(parseColor());
    		}
    	};

    	return [oldHSVAColor, selectColor, color, nuuselectedcolor_oldHSVAColor_binding];
    }

    class ColorSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorSelector",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get color() {
    		throw new Error("<ColorSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ColorSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let colorselector;
    	let updating_color;
    	let current;

    	function colorselector_color_binding(value) {
    		/*colorselector_color_binding*/ ctx[1](value);
    	}

    	let colorselector_props = {};

    	if (/*color*/ ctx[0] !== void 0) {
    		colorselector_props.color = /*color*/ ctx[0];
    	}

    	colorselector = new ColorSelector({
    			props: colorselector_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(colorselector, "color", colorselector_color_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(colorselector.$$.fragment);
    			add_location(main, file, 24, 0, 717);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(colorselector, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const colorselector_changes = {};

    			if (!updating_color && dirty & /*color*/ 1) {
    				updating_color = true;
    				colorselector_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			colorselector.$set(colorselector_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(colorselector);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	

    	isDragging.subscribe(value => {
    		if (value) {
    			document.body.classList.add("user-select-none");
    		} else {
    			document.body.classList.remove("user-select-none");
    		}
    	});

    	let colorHSVA = {
    		hue: Math.round(Math.random() * 360),
    		saturation: Math.random(),
    		value: Math.random(),
    		alpha: 1
    	};

    	let color = hsvaToCSS(colorHSVA.hue, colorHSVA.saturation, colorHSVA.value, colorHSVA.alpha);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function colorselector_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	$$self.$capture_state = () => ({
    		ColorSelector,
    		isDragging,
    		hsvaToCSS,
    		hsvToRGB,
    		hsvToRGBAToCSS,
    		rgbaToCSS,
    		rgbaToHex,
    		colorHSVA,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("colorHSVA" in $$props) colorHSVA = $$props.colorHSVA;
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, colorselector_color_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
