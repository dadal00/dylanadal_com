let wasm

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

function __wbg_adapter_4(arg0, arg1, arg2, arg3) {
	wasm.__wbindgen_export_5(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3))
}

function __wbg_adapter_7(arg0, arg1) {
	wasm.__wbindgen_export_6(arg0, arg1)
}

function __wbg_adapter_10(arg0, arg1, arg2) {
	wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2))
}

function __wbg_adapter_25(arg0, arg1, arg2) {
	wasm.__wbindgen_export_8(arg0, arg1, addHeapObject(arg2))
}

const __wbindgen_enum_ResizeObserverBoxOptions = [
	'border-box',
	'content-box',
	'device-pixel-content-box'
]

const __wbindgen_enum_VisibilityState = ['hidden', 'visible']

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default'])

async function __wbg_load(module, imports) {
	if (typeof Response === 'function' && module instanceof Response) {
		if (typeof WebAssembly.instantiateStreaming === 'function') {
			try {
				return await WebAssembly.instantiateStreaming(module, imports)
			} catch (e) {
				const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type)

				if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
					console.warn(
						'`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
						e
					)
				} else {
					throw e
				}
			}
		}

		const bytes = await module.arrayBuffer()
		return await WebAssembly.instantiate(bytes, imports)
	} else {
		const instance = await WebAssembly.instantiate(module, imports)

		if (instance instanceof WebAssembly.Instance) {
			return { instance, module }
		} else {
			return instance
		}
	}
}

function __wbg_get_imports() {
	const imports = {}
	imports.wbg = {}
	imports.wbg.__wbg_Window_d1bf622f71ff0629 = function (arg0) {
		const ret = getObject(arg0).Window
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_abort_67e1b49bf6614565 = function (arg0) {
		getObject(arg0).abort()
	}
	imports.wbg.__wbg_activeElement_da57789542a03158 = function (arg0) {
		const ret = getObject(arg0).activeElement
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_addEventListener_775911544ac9d643 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3))
		}, arguments)
	}
	imports.wbg.__wbg_addListener_0a8e8bf396edbcf2 = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).addListener(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_altKey_5ac2d88882a93598 = function (arg0) {
		const ret = getObject(arg0).altKey
		return ret
	}
	imports.wbg.__wbg_altKey_a8b663f4f5755ab0 = function (arg0) {
		const ret = getObject(arg0).altKey
		return ret
	}
	imports.wbg.__wbg_animate_6ec571f163cf6f8d = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).animate(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_appendChild_87a6cc0aeb132c06 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).appendChild(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_blockSize_e6b651d3754c4602 = function (arg0) {
		const ret = getObject(arg0).blockSize
		return ret
	}
	imports.wbg.__wbg_body_8822ca55cb3730d2 = function (arg0) {
		const ret = getObject(arg0).body
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_brand_9562792cbb4735c3 = function (arg0, arg1) {
		const ret = getObject(arg1).brand
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_brands_a1e7a2bce052128f = function (arg0) {
		const ret = getObject(arg0).brands
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_button_47b736693b6dd97f = function (arg0) {
		const ret = getObject(arg0).button
		return ret
	}
	imports.wbg.__wbg_buttons_acf5180ad8f6ae06 = function (arg0) {
		const ret = getObject(arg0).buttons
		return ret
	}
	imports.wbg.__wbg_call_13410aac570ffff7 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).call(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_cancelAnimationFrame_a3b3c0d5b5c0056d = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).cancelAnimationFrame(arg1)
		}, arguments)
	}
	imports.wbg.__wbg_cancelIdleCallback_fea12ddf6a573e29 = function (arg0, arg1) {
		getObject(arg0).cancelIdleCallback(arg1 >>> 0)
	}
	imports.wbg.__wbg_cancel_09c394f0894744eb = function (arg0) {
		getObject(arg0).cancel()
	}
	imports.wbg.__wbg_catch_c80ecae90cb8ed4e = function (arg0, arg1) {
		const ret = getObject(arg0).catch(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_clearTimeout_50a601223dd18306 = function (arg0, arg1) {
		getObject(arg0).clearTimeout(arg1)
	}
	imports.wbg.__wbg_close_19bc0b26bb42f409 = function (arg0) {
		getObject(arg0).close()
	}
	imports.wbg.__wbg_code_9c657b2df9e85331 = function (arg0, arg1) {
		const ret = getObject(arg1).code
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_contains_d71a802f20288218 = function (arg0, arg1) {
		const ret = getObject(arg0).contains(getObject(arg1))
		return ret
	}
	imports.wbg.__wbg_contentRect_4fac166d7cf7a578 = function (arg0) {
		const ret = getObject(arg0).contentRect
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_createElement_4909dfa2011f2abe = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_createObjectURL_c80225986d2b928b = function () {
		return handleError(function (arg0, arg1) {
			const ret = URL.createObjectURL(getObject(arg1))
			const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
			const len1 = WASM_VECTOR_LEN
			getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
			getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
		}, arguments)
	}
	imports.wbg.__wbg_ctrlKey_d6452dce5a5af017 = function (arg0) {
		const ret = getObject(arg0).ctrlKey
		return ret
	}
	imports.wbg.__wbg_ctrlKey_d85b3ef2e41e6483 = function (arg0) {
		const ret = getObject(arg0).ctrlKey
		return ret
	}
	imports.wbg.__wbg_debug_c906769d2f88c17b = function (arg0) {
		console.debug(getObject(arg0))
	}
	imports.wbg.__wbg_deltaMode_b39c7bf656cadad6 = function (arg0) {
		const ret = getObject(arg0).deltaMode
		return ret
	}
	imports.wbg.__wbg_deltaX_e639e6be7245bedc = function (arg0) {
		const ret = getObject(arg0).deltaX
		return ret
	}
	imports.wbg.__wbg_deltaY_2d352968f40fb71a = function (arg0) {
		const ret = getObject(arg0).deltaY
		return ret
	}
	imports.wbg.__wbg_devicePixelContentBoxSize_6e79a8ed6b36cd2c = function (arg0) {
		const ret = getObject(arg0).devicePixelContentBoxSize
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_devicePixelRatio_de772f7b570607fa = function (arg0) {
		const ret = getObject(arg0).devicePixelRatio
		return ret
	}
	imports.wbg.__wbg_disconnect_240ad3fbb76010b8 = function (arg0) {
		getObject(arg0).disconnect()
	}
	imports.wbg.__wbg_disconnect_9a156f531f823310 = function (arg0) {
		getObject(arg0).disconnect()
	}
	imports.wbg.__wbg_document_7d29d139bd619045 = function (arg0) {
		const ret = getObject(arg0).document
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_error_4700bbeb78363714 = function (arg0, arg1) {
		console.error(getObject(arg0), getObject(arg1))
	}
	imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function (arg0, arg1) {
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
	imports.wbg.__wbg_error_99981e16d476aa5c = function (arg0) {
		console.error(getObject(arg0))
	}
	imports.wbg.__wbg_focus_8541343802c6721b = function () {
		return handleError(function (arg0) {
			getObject(arg0).focus()
		}, arguments)
	}
	imports.wbg.__wbg_fullscreenElement_46b4e1ed8248950d = function (arg0) {
		const ret = getObject(arg0).fullscreenElement
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_getCoalescedEvents_14265d8b5a22b7c5 = function (arg0) {
		const ret = getObject(arg0).getCoalescedEvents()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_getCoalescedEvents_21492912fd0145ec = function (arg0) {
		const ret = getObject(arg0).getCoalescedEvents
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_getComputedStyle_06167bcde483501e = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).getComputedStyle(getObject(arg1))
			return isLikeNone(ret) ? 0 : addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_getElementById_3c3d00d9a16a01dd = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2))
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_getOwnPropertyDescriptor_b58e9c0d5f644b26 = function (arg0, arg1) {
		const ret = Object.getOwnPropertyDescriptor(getObject(arg0), getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_getPropertyValue_da119dca19ff1bd7 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			const ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3))
			const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
			const len1 = WASM_VECTOR_LEN
			getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
			getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
		}, arguments)
	}
	imports.wbg.__wbg_get_0da715ceaecea5c8 = function (arg0, arg1) {
		const ret = getObject(arg0)[arg1 >>> 0]
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_height_4b1c53fac682bfa2 = function (arg0) {
		const ret = getObject(arg0).height
		return ret
	}
	imports.wbg.__wbg_info_6cf68c1a86a92f6a = function (arg0) {
		console.info(getObject(arg0))
	}
	imports.wbg.__wbg_inlineSize_28bb3208ec333a04 = function (arg0) {
		const ret = getObject(arg0).inlineSize
		return ret
	}
	imports.wbg.__wbg_instanceof_Window_12d20d558ef92592 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof Window
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_isIntersecting_31dfa252ee048a6f = function (arg0) {
		const ret = getObject(arg0).isIntersecting
		return ret
	}
	imports.wbg.__wbg_is_8346b6c36feaf71a = function (arg0, arg1) {
		const ret = Object.is(getObject(arg0), getObject(arg1))
		return ret
	}
	imports.wbg.__wbg_key_caac8fafdd6d5317 = function (arg0, arg1) {
		const ret = getObject(arg1).key
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_length_186546c51cd61acd = function (arg0) {
		const ret = getObject(arg0).length
		return ret
	}
	imports.wbg.__wbg_location_b9a1887cb231e862 = function (arg0) {
		const ret = getObject(arg0).location
		return ret
	}
	imports.wbg.__wbg_log_6c7b5f4f00b8ce3f = function (arg0) {
		console.log(getObject(arg0))
	}
	imports.wbg.__wbg_matchMedia_19600e31a5612b23 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2))
			return isLikeNone(ret) ? 0 : addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_matches_12ebc1caa30f1e42 = function (arg0) {
		const ret = getObject(arg0).matches
		return ret
	}
	imports.wbg.__wbg_media_ec233ae1b636ce31 = function (arg0, arg1) {
		const ret = getObject(arg1).media
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_metaKey_3faf4a14e870c3d6 = function (arg0) {
		const ret = getObject(arg0).metaKey
		return ret
	}
	imports.wbg.__wbg_metaKey_48d6907eef50622b = function (arg0) {
		const ret = getObject(arg0).metaKey
		return ret
	}
	imports.wbg.__wbg_movementX_0ef0e79f7b9168fc = function (arg0) {
		const ret = getObject(arg0).movementX
		return ret
	}
	imports.wbg.__wbg_movementY_875c2fc2aabd99bf = function (arg0) {
		const ret = getObject(arg0).movementY
		return ret
	}
	imports.wbg.__wbg_navigator_65d5ad763926b868 = function (arg0) {
		const ret = getObject(arg0).navigator
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_19c25a3f2fa63a02 = function () {
		const ret = new Object()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_3955c3ac4df3b2a7 = function () {
		return handleError(function () {
			const ret = new MessageChannel()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_new_66b9434b4e59b63e = function () {
		return handleError(function () {
			const ret = new AbortController()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_new_8a6f238a6ece86ea = function () {
		const ret = new Error()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_9d476835fd376de6 = function () {
		return handleError(function (arg0, arg1) {
			const ret = new Worker(getStringFromWasm0(arg0, arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_new_a306f04fbb289085 = function () {
		return handleError(function (arg0) {
			const ret = new IntersectionObserver(getObject(arg0))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_new_c949fe92f1151b4b = function () {
		return handleError(function (arg0) {
			const ret = new ResizeObserver(getObject(arg0))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_newnoargs_254190557c45b4ec = function (arg0, arg1) {
		const ret = new Function(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_newwithstrsequenceandoptions_5b257525e688af7d = function () {
		return handleError(function (arg0, arg1) {
			const ret = new Blob(getObject(arg0), getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_now_2c95c9de01293173 = function (arg0) {
		const ret = getObject(arg0).now()
		return ret
	}
	imports.wbg.__wbg_observe_1191c7319883ed4f = function (arg0, arg1, arg2) {
		getObject(arg0).observe(getObject(arg1), getObject(arg2))
	}
	imports.wbg.__wbg_observe_7c27e1799599c503 = function (arg0, arg1) {
		getObject(arg0).observe(getObject(arg1))
	}
	imports.wbg.__wbg_observe_d5620e0d99e20a09 = function (arg0, arg1) {
		getObject(arg0).observe(getObject(arg1))
	}
	imports.wbg.__wbg_of_30e97a7ad6e3518b = function (arg0) {
		const ret = Array.of(getObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_of_d0e190785e1ebbb6 = function (arg0, arg1) {
		const ret = Array.of(getObject(arg0), getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_offsetX_cb6a38e6f23cb4a6 = function (arg0) {
		const ret = getObject(arg0).offsetX
		return ret
	}
	imports.wbg.__wbg_offsetY_43e21941c5c1f8bf = function (arg0) {
		const ret = getObject(arg0).offsetY
		return ret
	}
	imports.wbg.__wbg_performance_7a3ffd0b17f663ad = function (arg0) {
		const ret = getObject(arg0).performance
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_persisted_13ec492f01565fa5 = function (arg0) {
		const ret = getObject(arg0).persisted
		return ret
	}
	imports.wbg.__wbg_play_63bc12f42e16af91 = function (arg0) {
		getObject(arg0).play()
	}
	imports.wbg.__wbg_pointerId_6bf7f6b01d55295b = function (arg0) {
		const ret = getObject(arg0).pointerId
		return ret
	}
	imports.wbg.__wbg_pointerType_7853885b50da7698 = function (arg0, arg1) {
		const ret = getObject(arg1).pointerType
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_port1_9bfdb70bf361065d = function (arg0) {
		const ret = getObject(arg0).port1
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_port2_4dad3e9374ecfa63 = function (arg0) {
		const ret = getObject(arg0).port2
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_postMessage_0e07159f7ab2518e = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).postMessage(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_postMessage_775fdcd73133235f = function () {
		return handleError(function (arg0, arg1, arg2) {
			getObject(arg0).postMessage(getObject(arg1), getObject(arg2))
		}, arguments)
	}
	imports.wbg.__wbg_postTask_41d93e93941e4a3d = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).postTask(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_pressure_eed52402b4cd13a9 = function (arg0) {
		const ret = getObject(arg0).pressure
		return ret
	}
	imports.wbg.__wbg_preventDefault_fab9a085b3006058 = function (arg0) {
		getObject(arg0).preventDefault()
	}
	imports.wbg.__wbg_prototype_c28bca39c45aba9b = function () {
		const ret = ResizeObserverEntry.prototype
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_queueMicrotask_19632579d2a4b200 = function (arg0, arg1) {
		getObject(arg0).queueMicrotask(getObject(arg1))
	}
	imports.wbg.__wbg_queueMicrotask_25d0739ac89e8c88 = function (arg0) {
		queueMicrotask(getObject(arg0))
	}
	imports.wbg.__wbg_queueMicrotask_4488407636f5bf24 = function (arg0) {
		const ret = getObject(arg0).queueMicrotask
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_removeEventListener_6d5be9c2821a511e = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3))
		}, arguments)
	}
	imports.wbg.__wbg_removeListener_182fbcdf2441ee87 = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).removeListener(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_removeProperty_8912427f4d0f6361 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3))
			const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
			const len1 = WASM_VECTOR_LEN
			getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
			getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
		}, arguments)
	}
	imports.wbg.__wbg_repeat_fa67d2825d6e556f = function (arg0) {
		const ret = getObject(arg0).repeat
		return ret
	}
	imports.wbg.__wbg_requestAnimationFrame_ddc84a7def436784 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).requestAnimationFrame(getObject(arg1))
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_requestFullscreen_86fc6cdb76000482 = function (arg0) {
		const ret = getObject(arg0).requestFullscreen
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_requestFullscreen_9f0611438eb929cf = function (arg0) {
		const ret = getObject(arg0).requestFullscreen()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_requestIdleCallback_1b8d644ff564208f = function (arg0) {
		const ret = getObject(arg0).requestIdleCallback
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_requestIdleCallback_de48528fbbe27518 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).requestIdleCallback(getObject(arg1))
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_resolve_4055c623acdd6a1b = function (arg0) {
		const ret = Promise.resolve(getObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_revokeObjectURL_651b859c81bf1af0 = function () {
		return handleError(function (arg0, arg1) {
			URL.revokeObjectURL(getStringFromWasm0(arg0, arg1))
		}, arguments)
	}
	imports.wbg.__wbg_scheduler_48482a9974eeacbd = function (arg0) {
		const ret = getObject(arg0).scheduler
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_scheduler_5156bb61cc1cf589 = function (arg0) {
		const ret = getObject(arg0).scheduler
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setAttribute_d1baf9023ad5696f = function () {
		return handleError(function (arg0, arg1, arg2, arg3, arg4) {
			getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4))
		}, arguments)
	}
	imports.wbg.__wbg_setPointerCapture_50d37dfb10244aba = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).setPointerCapture(arg1)
		}, arguments)
	}
	imports.wbg.__wbg_setProperty_a4431938dd3e6945 = function () {
		return handleError(function (arg0, arg1, arg2, arg3, arg4) {
			getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4))
		}, arguments)
	}
	imports.wbg.__wbg_setTimeout_2966518f28aef92e = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).setTimeout(getObject(arg1), arg2)
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_setTimeout_b3de16ce9694711c = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).setTimeout(getObject(arg1))
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_set_453345bcda80b89a = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2))
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_setbox_3751928f4f6acf2f = function (arg0, arg1) {
		getObject(arg0).box = __wbindgen_enum_ResizeObserverBoxOptions[arg1]
	}
	imports.wbg.__wbg_setonmessage_9052f86e36e1d6a4 = function (arg0, arg1) {
		getObject(arg0).onmessage = getObject(arg1)
	}
	imports.wbg.__wbg_settype_298968e371b58a33 = function (arg0, arg1, arg2) {
		getObject(arg0).type = getStringFromWasm0(arg1, arg2)
	}
	imports.wbg.__wbg_shiftKey_7793232603bd5f81 = function (arg0) {
		const ret = getObject(arg0).shiftKey
		return ret
	}
	imports.wbg.__wbg_shiftKey_cf32e1142cac9fca = function (arg0) {
		const ret = getObject(arg0).shiftKey
		return ret
	}
	imports.wbg.__wbg_signal_da4d466ce86118b5 = function (arg0) {
		const ret = getObject(arg0).signal
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_stack_0ed75d68575b0f3c = function (arg0, arg1) {
		const ret = getObject(arg1).stack
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_start_28944199627e705c = function (arg0) {
		getObject(arg0).start()
	}
	imports.wbg.__wbg_static_accessor_GLOBAL_8921f820c2ce3f12 = function () {
		const ret = typeof global === 'undefined' ? null : global
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_static_accessor_GLOBAL_THIS_f0a4409105898184 = function () {
		const ret = typeof globalThis === 'undefined' ? null : globalThis
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_static_accessor_SELF_995b214ae681ff99 = function () {
		const ret = typeof self === 'undefined' ? null : self
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_static_accessor_WINDOW_cde3890479c675ea = function () {
		const ret = typeof window === 'undefined' ? null : window
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_style_32a3c8393b46a115 = function (arg0) {
		const ret = getObject(arg0).style
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_then_e22500defe16819f = function (arg0, arg1) {
		const ret = getObject(arg0).then(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_unobserve_189df9b98a2bf3d9 = function (arg0, arg1) {
		getObject(arg0).unobserve(getObject(arg1))
	}
	imports.wbg.__wbg_userAgentData_f7b0e61c05c54315 = function (arg0) {
		const ret = getObject(arg0).userAgentData
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_userAgent_2e89808dc5dc17d7 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg1).userAgent
			const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
			const len1 = WASM_VECTOR_LEN
			getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
			getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
		}, arguments)
	}
	imports.wbg.__wbg_visibilityState_06994c9580901647 = function (arg0) {
		const ret = getObject(arg0).visibilityState
		return (__wbindgen_enum_VisibilityState.indexOf(ret) + 1 || 3) - 1
	}
	imports.wbg.__wbg_warn_e2ada06313f92f09 = function (arg0) {
		console.warn(getObject(arg0))
	}
	imports.wbg.__wbg_wbindgencbdrop_eb10308566512b88 = function (arg0) {
		const obj = getObject(arg0).original
		if (obj.cnt-- == 1) {
			obj.a = 0
			return true
		}
		const ret = false
		return ret
	}
	imports.wbg.__wbg_wbindgendebugstring_99ef257a3ddda34d = function (arg0, arg1) {
		const ret = debugString(getObject(arg1))
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_1, wasm.__wbindgen_export_2)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}
	imports.wbg.__wbg_wbindgenisfunction_8cee7dce3725ae74 = function (arg0) {
		const ret = typeof getObject(arg0) === 'function'
		return ret
	}
	imports.wbg.__wbg_wbindgenisundefined_c4b71d073b92f3c5 = function (arg0) {
		const ret = getObject(arg0) === undefined
		return ret
	}
	imports.wbg.__wbg_wbindgenthrow_451ec1a8469d7eb6 = function (arg0, arg1) {
		throw new Error(getStringFromWasm0(arg0, arg1))
	}
	imports.wbg.__wbg_webkitFullscreenElement_a9ca38b7214d1567 = function (arg0) {
		const ret = getObject(arg0).webkitFullscreenElement
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_webkitRequestFullscreen_23664c63833ff0e5 = function (arg0) {
		getObject(arg0).webkitRequestFullscreen()
	}
	imports.wbg.__wbg_width_092500fcef82abcd = function (arg0) {
		const ret = getObject(arg0).width
		return ret
	}
	imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function (arg0, arg1) {
		// Cast intrinsic for `Ref(String) -> Externref`.
		const ret = getStringFromWasm0(arg0, arg1)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_393a4fcb4212444a = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("Event")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_3dfc7e389255604d = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 383, function: Function { arguments: [Externref], shim_idx: 384, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 383, __wbg_adapter_25)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_495d5e9d081acb42 = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("FocusEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_4baf5ec14114eaff = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_57e18b0392771163 = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [], shim_idx: 347, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_7)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_878157acbbdb94cb = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("PointerEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_8e11c51f35e7af93 = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("KeyboardEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_a3ad0c82c9deece2 = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("Array<any>")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_b9eb8afa4181a748 = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("PageTransitionEvent")], shim_idx: 343, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_10)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function (arg0) {
		// Cast intrinsic for `F64 -> Externref`.
		const ret = arg0
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cast_dd848cf806364d81 = function (arg0, arg1) {
		// Cast intrinsic for `Closure(Closure { dtor_idx: 342, function: Function { arguments: [NamedExternref("Array<any>"), NamedExternref("ResizeObserver")], shim_idx: 353, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
		const ret = makeMutClosure(arg0, arg1, 342, __wbg_adapter_4)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
		const ret = getObject(arg0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
		takeObject(arg0)
	}

	return imports
}

function __wbg_init_memory(imports, memory) {}

function __wbg_finalize_init(instance, module) {
	wasm = instance.exports
	__wbg_init.__wbindgen_wasm_module = module
	cachedDataViewMemory0 = null
	cachedUint8ArrayMemory0 = null

	wasm.__wbindgen_start()
	return wasm
}

function initSync(module) {
	if (wasm !== undefined) return wasm

	if (typeof module !== 'undefined') {
		if (Object.getPrototypeOf(module) === Object.prototype) {
			;({ module } = module)
		} else {
			console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
		}
	}

	const imports = __wbg_get_imports()

	__wbg_init_memory(imports)

	if (!(module instanceof WebAssembly.Module)) {
		module = new WebAssembly.Module(module)
	}

	const instance = new WebAssembly.Instance(module, imports)

	return __wbg_finalize_init(instance, module)
}

async function __wbg_init(module_or_path) {
	if (wasm !== undefined) return wasm

	if (typeof module_or_path !== 'undefined') {
		if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
			;({ module_or_path } = module_or_path)
		} else {
			console.warn(
				'using deprecated parameters for the initialization function; pass a single object instead'
			)
		}
	}

	if (typeof module_or_path === 'undefined') {
		module_or_path = new URL('simulation_bg.wasm', import.meta.url)
	}
	const imports = __wbg_get_imports()

	if (
		typeof module_or_path === 'string' ||
		(typeof Request === 'function' && module_or_path instanceof Request) ||
		(typeof URL === 'function' && module_or_path instanceof URL)
	) {
		module_or_path = fetch(module_or_path)
	}

	__wbg_init_memory(imports)

	const { instance, module } = await __wbg_load(await module_or_path, imports)

	return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
