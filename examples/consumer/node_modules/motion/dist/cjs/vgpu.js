'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dom = require('framer-motion/dom');

const axes = "xyzw";
const radiansPerDegree = Math.PI / 180;
const transforms = {
    x: ["position", 0],
    y: ["position", 1],
    z: ["position", 2],
    rotateX: ["rotation", 0, true],
    rotateY: ["rotation", 1, true],
    rotateZ: ["rotation", 2, true],
    scaleX: ["scale", 0],
    scaleY: ["scale", 1],
    scaleZ: ["scale", 2],
};
/**
 * Last vector written to each path. vgpu subjects like Effect and
 * SharedUniforms have no getters, and SceneNode stores rotation as a
 * quaternion, so this is how single components find their siblings.
 */
const shadows = new WeakMap();
/**
 * Values changed this frame, flushed into one set() per subject.
 */
const pending = new Map();
function flush() {
    pending.forEach(applyValues);
    pending.clear();
}
/**
 * Binds motion values to vgpu shared uniforms, Effect/Draw/Compute bindings
 * ("params.time"), scene nodes (x, rotateY, scale), cameras, lights,
 * materials, orbit controls and target clear colors.
 *
 * Register with `animate.addEffect(vgpuEffect)` so `animate()` can target
 * these subjects directly, or call it yourself to wire up existing motion
 * values:
 *
 * ```ts
 * vgpuEffect(wave, { "params.time": time })
 * vgpuEffect(cube, { x, rotateY })
 * ```
 *
 * Changed values are batched into a single set() per subject per frame in
 * `frame.preRender`, ahead of render loops scheduled with `frame.render`.
 */
const vgpuEffect = dom.createEffect((subject, state, key, value) => state.set(key, value, () => {
    const bag = pending.get(subject) ?? {};
    bag[key] = value.get();
    pending.set(subject, bag);
    dom.frame.preRender(flush, false, true);
}), {
    test: isVGPUSubject,
    read: readInitial,
    step: dom.frame.preRender,
});
/**
 * Claims vgpu shader units (Effect, Draw, Compute), shared uniforms, scene
 * nodes, materials, orbit controls and targets. Everything else, including
 * Three.js vectors and plain objects, is left alone.
 */
function isVGPUSubject(subject) {
    if (!subject || typeof subject !== "object")
        return false;
    const s = subject;
    return typeof s.set === "function"
        ? typeof s.kind === "string" ||
            "gpu" in s ||
            "reflection" in s ||
            typeof s.yaw === "number"
        : "clearColor" in s && "gpu" in s;
}
function isNode(subject) {
    return "quaternion" in subject;
}
function isVector(value) {
    return Array.isArray(value) || ArrayBuffer.isView(value);
}
function resolveKey(subject, key) {
    const transform = isNode(subject) && transforms[key];
    if (transform) {
        return {
            path: [transform[0]],
            index: transform[1],
            degrees: transform[2],
        };
    }
    const path = key.split(".");
    const last = path[path.length - 1];
    const index = axes.indexOf(last.slice(-1).toLowerCase());
    if (last.length > 1 && index !== -1) {
        const base = [...path.slice(0, -1), last.slice(0, -1)];
        if (getVector(subject, base))
            return { path: base, index };
    }
    return { path };
}
function readPath(subject, path) {
    return path.reduce((value, key) => value?.[key], subject);
}
/**
 * Reads a subject property, falling back to ShaderMaterial's `values` record.
 */
function readValue(subject, path) {
    return (readPath(subject, path) ??
        (subject.values && readPath(subject.values, path)));
}
function getVector(subject, path) {
    const value = readValue(subject, path);
    if (isVector(value))
        return Array.from(value);
    const shadow = shadows.get(subject)?.[path.join(".")];
    if (shadow)
        return shadow;
    return path[0] === "rotation" && isNode(subject)
        ? eulerFromQuaternion(subject.quaternion)
        : undefined;
}
function setShadow(subject, path, vector) {
    const shadow = shadows.get(subject) ?? {};
    shadow[path.join(".")] = vector;
    shadows.set(subject, shadow);
}
function setPath(target, path, value) {
    var _a;
    const last = path.length - 1;
    let current = target;
    for (let i = 0; i < last; i++) {
        current = current[_a = path[i]] ?? (current[_a] = {});
    }
    current[path[last]] = value;
}
function isColorTarget(target) {
    const sample = Array.isArray(target)
        ? target.find((value) => typeof value === "string")
        : target;
    return typeof sample === "string" && dom.color.test(sample);
}
function readInitial(subject, key, target) {
    const { path, index, degrees } = resolveKey(subject, key);
    if (index !== undefined) {
        const value = getVector(subject, path)?.[index];
        return degrees && value !== undefined ? value / radiansPerDegree : value;
    }
    const value = readValue(subject, path);
    if (typeof value === "number")
        return value;
    if (!isVector(value))
        return undefined;
    if (isColorTarget(target))
        return toColorString(value);
    const sample = Array.isArray(target)
        ? target.find((keyframe) => keyframe !== null)
        : target;
    // A numeric target on a vector reads the first component (uniform scale)
    return typeof sample === "string" ? Array.from(value).join(" ") : value[0];
}
function applyValues(values, subject) {
    const bag = {};
    const vectors = new Map();
    for (const key in values) {
        const target = resolveKey(subject, key);
        const { path, index, degrees } = target;
        const value = values[key];
        if (index === undefined) {
            const parsed = parseValue(value, getVector(subject, path));
            Array.isArray(parsed) && setShadow(subject, path, parsed);
            setPath(bag, path, parsed);
            continue;
        }
        const id = path.join(".");
        const entry = vectors.get(id) ?? {
            ...target,
            vector: getVector(subject, path) ?? [],
        };
        vectors.set(id, entry);
        entry.vector[index] = degrees
            ? value * radiansPerDegree
            : value;
    }
    vectors.forEach(({ path, vector }) => {
        setShadow(subject, path, vector);
        setPath(bag, path, vector);
    });
    typeof subject.set === "function"
        ? subject.set(bag)
        : Object.assign(subject, bag);
}
/**
 * Converts animated strings into vgpu values: CSS colors become linear RGB
 * (matching vgpu/scene's srgb()), "1 0 0" becomes [1, 0, 0].
 */
function parseValue(value, current) {
    if (typeof value !== "string")
        return value;
    if (dom.color.test(value)) {
        const parsed = dom.color.parse(value);
        const { red, green, blue, alpha = 1, } = "hue" in parsed ? dom.hslaToRgba(parsed) : parsed;
        const linear = [red, green, blue].map((channel) => toLinear(channel / 255));
        return current?.length === 4 ? [...linear, alpha] : linear;
    }
    const parts = value
        .split(",")
        .join(" ")
        .split(" ")
        .filter(Boolean)
        .map(Number);
    return parts.length > 1 && parts.every((part) => !isNaN(part))
        ? parts
        : value;
}
function toLinear(channel) {
    return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
}
function toSRGB(channel) {
    return channel <= 0.0031308
        ? channel * 12.92
        : 1.055 * channel ** (1 / 2.4) - 0.055;
}
function toColorString(linear) {
    const [red, green, blue, alpha = 1] = Array.from(linear).map((channel, i) => i < 3 ? toSRGB(channel) * 255 : channel);
    return dom.rgba.transform({ red, green, blue, alpha });
}
/**
 * Inverse of vgpu's quatFromEuler (intrinsic XYZ).
 */
function eulerFromQuaternion(quaternion) {
    const [x, y, z, w] = Array.from(quaternion);
    const m13 = 2 * (x * z + w * y);
    const singular = Math.abs(m13) > 0.9999999;
    return [
        singular
            ? Math.atan2(2 * (y * z + w * x), 1 - 2 * (x * x + z * z))
            : Math.atan2(-2 * (y * z - w * x), 1 - 2 * (x * x + y * y)),
        Math.asin(dom.clamp(-1, 1, m13)),
        singular
            ? 0
            : Math.atan2(-2 * (x * y - w * z), 1 - 2 * (y * y + z * z)),
    ];
}

exports.vgpuEffect = vgpuEffect;
