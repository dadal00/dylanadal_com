let wasm
export function __wbg_set_wasm(val) {
	wasm = val
}

let heap = new Array(128).fill(undefined)

heap.push(undefined, null, true, false)

function getObject(idx) {
	return heap[idx]
}

let heap_next = heap.length

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1)
	const idx = heap_next
	heap_next = heap[idx]

	heap[idx] = obj
	return idx
}

function isLikeNone(x) {
	return x === undefined || x === null
}

let cachedUint8ArrayMemory0 = null

function getUint8ArrayMemory0() {
	if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
		cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer)
	}
	return cachedUint8ArrayMemory0
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })

cachedTextDecoder.decode()

const MAX_SAFARI_DECODE_BYTES = 2146435072
let numBytesDecoded = 0
function decodeText(ptr, len) {
	numBytesDecoded += len
	if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
		cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })
		cachedTextDecoder.decode()
		numBytesDecoded = len
	}
	return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len))
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0
	return decodeText(ptr, len)
}

function handleError(f, args) {
	try {
		return f.apply(this, args)
	} catch (e) {
		wasm.__wbindgen_export_0(addHeapObject(e))
	}
}

let WASM_VECTOR_LEN = 0

const cachedTextEncoder = new TextEncoder()

if (!('encodeInto' in cachedTextEncoder)) {
	cachedTextEncoder.encodeInto = function (arg, view) {
		const buf = cachedTextEncoder.encode(arg)
		view.set(buf)
		return {
			read: arg.length,
			written: buf.length
		}
	}
}

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg)
		const ptr = malloc(buf.length, 1) >>> 0
		getUint8ArrayMemory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf)
		WASM_VECTOR_LEN = buf.length
		return ptr
	}

	let len = arg.length
	let ptr = malloc(len, 1) >>> 0

	const mem = getUint8ArrayMemory0()

	let offset = 0

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset)
		if (code > 0x7f) break
		mem[ptr + offset] = code
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset)
		}
		ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0
		const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len)
		const ret = cachedTextEncoder.encodeInto(arg, view)

		offset += ret.written
		ptr = realloc(ptr, len, offset, 1) >>> 0
	}

	WASM_VECTOR_LEN = offset
	return ptr
}

let cachedDataViewMemory0 = null

function getDataViewMemory0() {
	if (
		cachedDataViewMemory0 === null ||
		cachedDataViewMemory0.buffer.detached === true ||
		(cachedDataViewMemory0.buffer.detached === undefined &&
			cachedDataViewMemory0.buffer !== wasm.memory.buffer)
	) {
		cachedDataViewMemory0 = new DataView(wasm.memory.buffer)
	}
	return cachedDataViewMemory0
}

function debugString(val) {
	// primitive types
	const type = typeof val
	if (type == 'number' || type == 'boolean' || val == null) {
		return `${val}`
	}
	if (type == 'string') {
		return `"${val}"`
	}
	if (type == 'symbol') {
		const description = val.description
		if (description == null) {
			return 'Symbol'
		} else {
			return `Symbol(${description})`
		}
	}
	if (type == 'function') {
		const name = val.name
		if (typeof name == 'string' && name.length > 0) {
			return `Function(${name})`
		} else {
			return 'Function'
		}
	}
	// objects
	if (Array.isArray(val)) {
		const length = val.length
		let debug = '['
		if (length > 0) {
			debug += debugString(val[0])
		}
		for (let i = 1; i < length; i++) {
			debug += ', ' + debugString(val[i])
		}
		debug += ']'
		return debug
	}
	// Test for built-in
	const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val))
	let className
	if (builtInMatches && builtInMatches.length > 1) {
		className = builtInMatches[1]
	} else {
		// Failed to match the standard '[object ClassName]'
		return toString.call(val)
	}
	if (className == 'Object') {
		// we're a user defined class or Object
		// JSON.stringify avoids problems with cycles, and is generally much
		// easier than looping through ownProperties of `val`.
		try {
			return 'Object(' + JSON.stringify(val) + ')'
		} catch (_) {
			return 'Object'
		}
	}
	// errors
	if (val instanceof Error) {
		return `${val.name}: ${val.message}\n${val.stack}`
	}
	// TODO we could test for more things here, like `Set`s and `Map`s.
	return className
}

const CLOSURE_DTORS =
	typeof FinalizationRegistry === 'undefined'
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((state) => {
				wasm.__wbindgen_export_4.get(state.dtor)(state.a, state.b)
			})

function makeMutClosure(arg0, arg1, dtor, f) {
	const state = { a: arg0, b: arg1, cnt: 1, dtor }
	const real = (...args) => {
		// First up with a closure we increment the internal reference
		// count. This ensures that the Rust closure environment won't
		// be deallocated while we're invoking it.
		state.cnt++
		const a = state.a
		state.a = 0
		try {
			return f(a, state.b, ...args)
		} finally {
			if (--state.cnt === 0) {
				wasm.__wbindgen_export_4.get(state.dtor)(a, state.b)
				CLOSURE_DTORS.unregister(state)
			} else {
				state.a = a
			}
		}
	}
	real.original = state
	CLOSURE_DTORS.register(real, state, state)
	return real
}

function dropObject(idx) {
	if (idx < 132) return
	heap[idx] = heap_next
	heap_next = idx
}

function takeObject(idx) {
	const ret = getObject(idx)
	dropObject(idx)
	return ret
}

export function run_web() {
	wasm.run_web()
}

function __wbg_adapter_6(arg0, arg1, arg2) {
	wasm.__wbindgen_export_5(arg0, arg1, addHeapObject(arg2))
}

function __wbg_adapter_15(arg0, arg1) {
	wasm.__wbindgen_export_6(arg0, arg1)
}

function __wbg_adapter_22(arg0, arg1, arg2, arg3) {
	wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3))
}

function __wbg_adapter_27(arg0, arg1, arg2) {
	wasm.__wbindgen_export_8(arg0, arg1, addHeapObject(arg2))
}

const __wbindgen_enum_ResizeObserverBoxOptions = [
	'border-box',
	'content-box',
	'device-pixel-content-box'
]

const __wbindgen_enum_VisibilityState = ['hidden', 'visible']

export function __wbg_Window_d1bf622f71ff0629(arg0) {
	const ret = getObject(arg0).Window
	return addHeapObject(ret)
}

export function __wbg_abort_67e1b49bf6614565(arg0) {
	getObject(arg0).abort()
}

export function __wbg_activeElement_da57789542a03158(arg0) {
	const ret = getObject(arg0).activeElement
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_addEventListener_775911544ac9d643() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3))
	}, arguments)
}

export function __wbg_addListener_0a8e8bf396edbcf2() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).addListener(getObject(arg1))
	}, arguments)
}

export function __wbg_altKey_5ac2d88882a93598(arg0) {
	const ret = getObject(arg0).altKey
	return ret
}

export function __wbg_altKey_a8b663f4f5755ab0(arg0) {
	const ret = getObject(arg0).altKey
	return ret
}

export function __wbg_animate_6ec571f163cf6f8d(arg0, arg1, arg2) {
	const ret = getObject(arg0).animate(getObject(arg1), getObject(arg2))
	return addHeapObject(ret)
}

export function __wbg_appendChild_87a6cc0aeb132c06() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).appendChild(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_blockSize_e6b651d3754c4602(arg0) {
	const ret = getObject(arg0).blockSize
	return ret
}

export function __wbg_body_8822ca55cb3730d2(arg0) {
	const ret = getObject(arg0).body
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_brand_9562792cbb4735c3(arg0, arg1) {
	const ret = getObject(arg1).brand
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_brands_a1e7a2bce052128f(arg0) {
	const ret = getObject(arg0).brands
	return addHeapObject(ret)
}

export function __wbg_button_47b736693b6dd97f(arg0) {
	const ret = getObject(arg0).button
	return ret
}

export function __wbg_buttons_acf5180ad8f6ae06(arg0) {
	const ret = getObject(arg0).buttons
	return ret
}

export function __wbg_call_13410aac570ffff7() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).call(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_cancelAnimationFrame_a3b3c0d5b5c0056d() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).cancelAnimationFrame(arg1)
	}, arguments)
}

export function __wbg_cancelIdleCallback_fea12ddf6a573e29(arg0, arg1) {
	getObject(arg0).cancelIdleCallback(arg1 >>> 0)
}

export function __wbg_cancel_09c394f0894744eb(arg0) {
	getObject(arg0).cancel()
}

export function __wbg_catch_c80ecae90cb8ed4e(arg0, arg1) {
	const ret = getObject(arg0).catch(getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_clearTimeout_50a601223dd18306(arg0, arg1) {
	getObject(arg0).clearTimeout(arg1)
}

export function __wbg_close_19bc0b26bb42f409(arg0) {
	getObject(arg0).close()
}

export function __wbg_code_9c657b2df9e85331(arg0, arg1) {
	const ret = getObject(arg1).code
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_contains_d71a802f20288218(arg0, arg1) {
	const ret = getObject(arg0).contains(getObject(arg1))
	return ret
}

export function __wbg_contentRect_4fac166d7cf7a578(arg0) {
	const ret = getObject(arg0).contentRect
	return addHeapObject(ret)
}

export function __wbg_createElement_4909dfa2011f2abe() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_createObjectURL_c80225986d2b928b() {
	return handleError(function (arg0, arg1) {
		const ret = URL.createObjectURL(getObject(arg1))
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}, arguments)
}

export function __wbg_ctrlKey_d6452dce5a5af017(arg0) {
	const ret = getObject(arg0).ctrlKey
	return ret
}

export function __wbg_ctrlKey_d85b3ef2e41e6483(arg0) {
	const ret = getObject(arg0).ctrlKey
	return ret
}

export function __wbg_debug_c906769d2f88c17b(arg0) {
	console.debug(getObject(arg0))
}

export function __wbg_deltaMode_b39c7bf656cadad6(arg0) {
	const ret = getObject(arg0).deltaMode
	return ret
}

export function __wbg_deltaX_e639e6be7245bedc(arg0) {
	const ret = getObject(arg0).deltaX
	return ret
}

export function __wbg_deltaY_2d352968f40fb71a(arg0) {
	const ret = getObject(arg0).deltaY
	return ret
}

export function __wbg_devicePixelContentBoxSize_6e79a8ed6b36cd2c(arg0) {
	const ret = getObject(arg0).devicePixelContentBoxSize
	return addHeapObject(ret)
}

export function __wbg_devicePixelRatio_de772f7b570607fa(arg0) {
	const ret = getObject(arg0).devicePixelRatio
	return ret
}

export function __wbg_disconnect_240ad3fbb76010b8(arg0) {
	getObject(arg0).disconnect()
}

export function __wbg_disconnect_9a156f531f823310(arg0) {
	getObject(arg0).disconnect()
}

export function __wbg_document_7d29d139bd619045(arg0) {
	const ret = getObject(arg0).document
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_error_4700bbeb78363714(arg0, arg1) {
	console.error(getObject(arg0), getObject(arg1))
}

export function __wbg_error_7534b8e9a36f1ab4(arg0, arg1) {
	let deferred0_0
	let deferred0_1
	try {
		deferred0_0 = arg0
		deferred0_1 = arg1
		console.error(getStringFromWasm0(arg0, arg1))
	} finally {
		wasm.__wbindgen_export_3(deferred0_0, deferred0_1, 1)
	}
}

export function __wbg_error_99981e16d476aa5c(arg0) {
	console.error(getObject(arg0))
}

export function __wbg_focus_8541343802c6721b() {
	return handleError(function (arg0) {
		getObject(arg0).focus()
	}, arguments)
}

export function __wbg_fullscreenElement_46b4e1ed8248950d(arg0) {
	const ret = getObject(arg0).fullscreenElement
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_getCoalescedEvents_14265d8b5a22b7c5(arg0) {
	const ret = getObject(arg0).getCoalescedEvents()
	return addHeapObject(ret)
}

export function __wbg_getCoalescedEvents_21492912fd0145ec(arg0) {
	const ret = getObject(arg0).getCoalescedEvents
	return addHeapObject(ret)
}

export function __wbg_getComputedStyle_06167bcde483501e() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).getComputedStyle(getObject(arg1))
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}, arguments)
}

export function __wbg_getElementById_3c3d00d9a16a01dd(arg0, arg1, arg2) {
	const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2))
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_getOwnPropertyDescriptor_b58e9c0d5f644b26(arg0, arg1) {
	const ret = Object.getOwnPropertyDescriptor(getObject(arg0), getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_getPropertyValue_da119dca19ff1bd7() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		const ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3))
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}, arguments)
}

export function __wbg_get_0da715ceaecea5c8(arg0, arg1) {
	const ret = getObject(arg0)[arg1 >>> 0]
	return addHeapObject(ret)
}

export function __wbg_height_4b1c53fac682bfa2(arg0) {
	const ret = getObject(arg0).height
	return ret
}

export function __wbg_info_6cf68c1a86a92f6a(arg0) {
	console.info(getObject(arg0))
}

export function __wbg_inlineSize_28bb3208ec333a04(arg0) {
	const ret = getObject(arg0).inlineSize
	return ret
}

export function __wbg_instanceof_Window_12d20d558ef92592(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof Window
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_isIntersecting_31dfa252ee048a6f(arg0) {
	const ret = getObject(arg0).isIntersecting
	return ret
}

export function __wbg_is_8346b6c36feaf71a(arg0, arg1) {
	const ret = Object.is(getObject(arg0), getObject(arg1))
	return ret
}

export function __wbg_key_caac8fafdd6d5317(arg0, arg1) {
	const ret = getObject(arg1).key
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_length_186546c51cd61acd(arg0) {
	const ret = getObject(arg0).length
	return ret
}

export function __wbg_location_b9a1887cb231e862(arg0) {
	const ret = getObject(arg0).location
	return ret
}

export function __wbg_log_6c7b5f4f00b8ce3f(arg0) {
	console.log(getObject(arg0))
}

export function __wbg_matchMedia_19600e31a5612b23() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2))
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}, arguments)
}

export function __wbg_matches_12ebc1caa30f1e42(arg0) {
	const ret = getObject(arg0).matches
	return ret
}

export function __wbg_media_ec233ae1b636ce31(arg0, arg1) {
	const ret = getObject(arg1).media
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_metaKey_3faf4a14e870c3d6(arg0) {
	const ret = getObject(arg0).metaKey
	return ret
}

export function __wbg_metaKey_48d6907eef50622b(arg0) {
	const ret = getObject(arg0).metaKey
	return ret
}

export function __wbg_movementX_0ef0e79f7b9168fc(arg0) {
	const ret = getObject(arg0).movementX
	return ret
}

export function __wbg_movementY_875c2fc2aabd99bf(arg0) {
	const ret = getObject(arg0).movementY
	return ret
}

export function __wbg_navigator_65d5ad763926b868(arg0) {
	const ret = getObject(arg0).navigator
	return addHeapObject(ret)
}

export function __wbg_new_19c25a3f2fa63a02() {
	const ret = new Object()
	return addHeapObject(ret)
}

export function __wbg_new_3955c3ac4df3b2a7() {
	return handleError(function () {
		const ret = new MessageChannel()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_new_66b9434b4e59b63e() {
	return handleError(function () {
		const ret = new AbortController()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_new_8a6f238a6ece86ea() {
	const ret = new Error()
	return addHeapObject(ret)
}

export function __wbg_new_9d476835fd376de6() {
	return handleError(function (arg0, arg1) {
		const ret = new Worker(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_new_a306f04fbb289085() {
	return handleError(function (arg0) {
		const ret = new IntersectionObserver(getObject(arg0))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_new_c949fe92f1151b4b() {
	return handleError(function (arg0) {
		const ret = new ResizeObserver(getObject(arg0))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_newnoargs_254190557c45b4ec(arg0, arg1) {
	const ret = new Function(getStringFromWasm0(arg0, arg1))
	return addHeapObject(ret)
}

export function __wbg_newwithstrsequenceandoptions_5b257525e688af7d() {
	return handleError(function (arg0, arg1) {
		const ret = new Blob(getObject(arg0), getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_now_2c95c9de01293173(arg0) {
	const ret = getObject(arg0).now()
	return ret
}

export function __wbg_observe_1191c7319883ed4f(arg0, arg1, arg2) {
	getObject(arg0).observe(getObject(arg1), getObject(arg2))
}

export function __wbg_observe_7c27e1799599c503(arg0, arg1) {
	getObject(arg0).observe(getObject(arg1))
}

export function __wbg_observe_d5620e0d99e20a09(arg0, arg1) {
	getObject(arg0).observe(getObject(arg1))
}

export function __wbg_of_30e97a7ad6e3518b(arg0) {
	const ret = Array.of(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_of_d0e190785e1ebbb6(arg0, arg1) {
	const ret = Array.of(getObject(arg0), getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_offsetX_cb6a38e6f23cb4a6(arg0) {
	const ret = getObject(arg0).offsetX
	return ret
}

export function __wbg_offsetY_43e21941c5c1f8bf(arg0) {
	const ret = getObject(arg0).offsetY
	return ret
}

export function __wbg_performance_7a3ffd0b17f663ad(arg0) {
	const ret = getObject(arg0).performance
	return addHeapObject(ret)
}

export function __wbg_persisted_13ec492f01565fa5(arg0) {
	const ret = getObject(arg0).persisted
	return ret
}

export function __wbg_play_63bc12f42e16af91(arg0) {
	getObject(arg0).play()
}

export function __wbg_pointerId_6bf7f6b01d55295b(arg0) {
	const ret = getObject(arg0).pointerId
	return ret
}

export function __wbg_pointerType_7853885b50da7698(arg0, arg1) {
	const ret = getObject(arg1).pointerType
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_port1_9bfdb70bf361065d(arg0) {
	const ret = getObject(arg0).port1
	return addHeapObject(ret)
}

export function __wbg_port2_4dad3e9374ecfa63(arg0) {
	const ret = getObject(arg0).port2
	return addHeapObject(ret)
}

export function __wbg_postMessage_0e07159f7ab2518e() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).postMessage(getObject(arg1))
	}, arguments)
}

export function __wbg_postMessage_775fdcd73133235f() {
	return handleError(function (arg0, arg1, arg2) {
		getObject(arg0).postMessage(getObject(arg1), getObject(arg2))
	}, arguments)
}

export function __wbg_postTask_41d93e93941e4a3d(arg0, arg1, arg2) {
	const ret = getObject(arg0).postTask(getObject(arg1), getObject(arg2))
	return addHeapObject(ret)
}

export function __wbg_pressure_eed52402b4cd13a9(arg0) {
	const ret = getObject(arg0).pressure
	return ret
}

export function __wbg_preventDefault_fab9a085b3006058(arg0) {
	getObject(arg0).preventDefault()
}

export function __wbg_prototype_c28bca39c45aba9b() {
	const ret = ResizeObserverEntry.prototype
	return addHeapObject(ret)
}

export function __wbg_queueMicrotask_19632579d2a4b200(arg0, arg1) {
	getObject(arg0).queueMicrotask(getObject(arg1))
}

export function __wbg_queueMicrotask_25d0739ac89e8c88(arg0) {
	queueMicrotask(getObject(arg0))
}

export function __wbg_queueMicrotask_4488407636f5bf24(arg0) {
	const ret = getObject(arg0).queueMicrotask
	return addHeapObject(ret)
}

export function __wbg_removeEventListener_6d5be9c2821a511e() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3))
	}, arguments)
}

export function __wbg_removeListener_182fbcdf2441ee87() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).removeListener(getObject(arg1))
	}, arguments)
}

export function __wbg_removeProperty_8912427f4d0f6361() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3))
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}, arguments)
}

export function __wbg_repeat_fa67d2825d6e556f(arg0) {
	const ret = getObject(arg0).repeat
	return ret
}

export function __wbg_requestAnimationFrame_ddc84a7def436784() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).requestAnimationFrame(getObject(arg1))
		return ret
	}, arguments)
}

export function __wbg_requestFullscreen_86fc6cdb76000482(arg0) {
	const ret = getObject(arg0).requestFullscreen
	return addHeapObject(ret)
}

export function __wbg_requestFullscreen_9f0611438eb929cf(arg0) {
	const ret = getObject(arg0).requestFullscreen()
	return addHeapObject(ret)
}

export function __wbg_requestIdleCallback_1b8d644ff564208f(arg0) {
	const ret = getObject(arg0).requestIdleCallback
	return addHeapObject(ret)
}

export function __wbg_requestIdleCallback_de48528fbbe27518() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).requestIdleCallback(getObject(arg1))
		return ret
	}, arguments)
}

export function __wbg_resolve_4055c623acdd6a1b(arg0) {
	const ret = Promise.resolve(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_revokeObjectURL_651b859c81bf1af0() {
	return handleError(function (arg0, arg1) {
		URL.revokeObjectURL(getStringFromWasm0(arg0, arg1))
	}, arguments)
}

export function __wbg_scheduler_48482a9974eeacbd(arg0) {
	const ret = getObject(arg0).scheduler
	return addHeapObject(ret)
}

export function __wbg_scheduler_5156bb61cc1cf589(arg0) {
	const ret = getObject(arg0).scheduler
	return addHeapObject(ret)
}

export function __wbg_setAttribute_d1baf9023ad5696f() {
	return handleError(function (arg0, arg1, arg2, arg3, arg4) {
		getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4))
	}, arguments)
}

export function __wbg_setPointerCapture_50d37dfb10244aba() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).setPointerCapture(arg1)
	}, arguments)
}

export function __wbg_setProperty_a4431938dd3e6945() {
	return handleError(function (arg0, arg1, arg2, arg3, arg4) {
		getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4))
	}, arguments)
}

export function __wbg_setTimeout_2966518f28aef92e() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).setTimeout(getObject(arg1), arg2)
		return ret
	}, arguments)
}

export function __wbg_setTimeout_b3de16ce9694711c() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).setTimeout(getObject(arg1))
		return ret
	}, arguments)
}

export function __wbg_set_453345bcda80b89a() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2))
		return ret
	}, arguments)
}

export function __wbg_setbox_3751928f4f6acf2f(arg0, arg1) {
	getObject(arg0).box = __wbindgen_enum_ResizeObserverBoxOptions[arg1]
}

export function __wbg_setonmessage_9052f86e36e1d6a4(arg0, arg1) {
	getObject(arg0).onmessage = getObject(arg1)
}

export function __wbg_settype_298968e371b58a33(arg0, arg1, arg2) {
	getObject(arg0).type = getStringFromWasm0(arg1, arg2)
}

export function __wbg_shiftKey_7793232603bd5f81(arg0) {
	const ret = getObject(arg0).shiftKey
	return ret
}

export function __wbg_shiftKey_cf32e1142cac9fca(arg0) {
	const ret = getObject(arg0).shiftKey
	return ret
}

export function __wbg_signal_da4d466ce86118b5(arg0) {
	const ret = getObject(arg0).signal
	return addHeapObject(ret)
}

export function __wbg_stack_0ed75d68575b0f3c(arg0, arg1) {
	const ret = getObject(arg1).stack
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_start_28944199627e705c(arg0) {
	getObject(arg0).start()
}

export function __wbg_static_accessor_GLOBAL_8921f820c2ce3f12() {
	const ret = typeof global === 'undefined' ? null : global
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_static_accessor_GLOBAL_THIS_f0a4409105898184() {
	const ret = typeof globalThis === 'undefined' ? null : globalThis
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_static_accessor_SELF_995b214ae681ff99() {
	const ret = typeof self === 'undefined' ? null : self
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_static_accessor_WINDOW_cde3890479c675ea() {
	const ret = typeof window === 'undefined' ? null : window
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_style_32a3c8393b46a115(arg0) {
	const ret = getObject(arg0).style
	return addHeapObject(ret)
}

export function __wbg_then_e22500defe16819f(arg0, arg1) {
	const ret = getObject(arg0).then(getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_unobserve_189df9b98a2bf3d9(arg0, arg1) {
	getObject(arg0).unobserve(getObject(arg1))
}

export function __wbg_userAgentData_f7b0e61c05c54315(arg0) {
	const ret = getObject(arg0).userAgentData
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_userAgent_2e89808dc5dc17d7() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg1).userAgent
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}, arguments)
}

export function __wbg_visibilityState_06994c9580901647(arg0) {
	const ret = getObject(arg0).visibilityState
	return (__wbindgen_enum_VisibilityState.indexOf(ret) + 1 || 3) - 1
}

export function __wbg_warn_e2ada06313f92f09(arg0) {
	console.warn(getObject(arg0))
}

export function __wbg_wbindgencbdrop_eb10308566512b88(arg0) {
	const obj = getObject(arg0).original
	if (obj.cnt-- == 1) {
		obj.a = 0
		return true
	}
	const ret = false
	return ret
}

export function __wbg_wbindgendebugstring_99ef257a3ddda34d(arg0, arg1) {
	const ret = debugString(getObject(arg1))
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_wbindgenisfunction_8cee7dce3725ae74(arg0) {
	const ret = typeof getObject(arg0) === 'function'
	return ret
}

export function __wbg_wbindgenisundefined_c4b71d073b92f3c5(arg0) {
	const ret = getObject(arg0) === undefined
	return ret
}

export function __wbg_wbindgenthrow_451ec1a8469d7eb6(arg0, arg1) {
	throw new Error(getStringFromWasm0(arg0, arg1))
}

export function __wbg_webkitFullscreenElement_a9ca38b7214d1567(arg0) {
	const ret = getObject(arg0).webkitFullscreenElement
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_webkitRequestFullscreen_23664c63833ff0e5(arg0) {
	getObject(arg0).webkitRequestFullscreen()
}

export function __wbg_width_092500fcef82abcd(arg0) {
	const ret = getObject(arg0).width
	return ret
}

export function __wbindgen_cast_2241b6af4c4b2941(arg0, arg1) {
	// Cast intrinsic for `Ref(String) -> Externref`.
	const ret = getStringFromWasm0(arg0, arg1)
	return addHeapObject(ret)
}

export function __wbindgen_cast_393a4fcb4212444a(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("Event")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_3dfc7e389255604d(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 383, function: Function { arguments: [Externref], shim_idx: 384, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 383, __wbg_adapter_27)
	return addHeapObject(ret)
}

export function __wbindgen_cast_495d5e9d081acb42(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("FocusEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_4baf5ec14114eaff(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_57e18b0392771163(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [], shim_idx: 347, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_15)
	return addHeapObject(ret)
}

export function __wbindgen_cast_878157acbbdb94cb(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("PointerEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_8e11c51f35e7af93(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("KeyboardEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_a3ad0c82c9deece2(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("Array<any>")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_b9eb8afa4181a748(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("PageTransitionEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_6)
	return addHeapObject(ret)
}

export function __wbindgen_cast_d6cd19b81560fd6e(arg0) {
	// Cast intrinsic for `F64 -> Externref`.
	const ret = arg0
	return addHeapObject(ret)
}

export function __wbindgen_cast_dd848cf806364d81(arg0, arg1) {
	// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("Array<any>"), NamedExternref("ResizeObserver")], shim_idx: 353, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
	const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_22)
	return addHeapObject(ret)
}

export function __wbindgen_object_clone_ref(arg0) {
	const ret = getObject(arg0)
	return addHeapObject(ret)
}

export function __wbindgen_object_drop_ref(arg0) {
	takeObject(arg0)
}
