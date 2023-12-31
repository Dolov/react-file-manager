import React from 'react'

/** 类名前缀 */
export const prefixCls = 'doraa-file-manager'

export const ROOT_ID = Symbol('rootId') as unknown as string

export interface FileItemProps {
	id: string
	name: string
	leaf: boolean
	url?: string
	size?: number,
	status?: "success" | "error" | "uploading"
	progress?: number
	children?: FileItemProps[]
}

export interface ViewerRefProps {
	open(file: FileItemProps): void
}

/** 监听元素宽度变化 */
export const useDomWidth = () => {
	const ref = React.useRef<HTMLDivElement>(null)
	const [width, setWidth] = React.useState<number>(0)

	React.useEffect(() => {
		const element = ref.current
		if (!element) return
		const observer = new ResizeObserver(entries => {
			for (let entry of entries) {
				const width = entry.contentRect.width;
				setWidth(width)
			}
		});

		observer.observe(element);

		return () => {
			observer.unobserve(element);
			observer.disconnect();
		}
	}, [ref.current])

	return { ref, width }
}

/** 获取文件后缀 */
export const getExt = (name: string) => {
	if (!name) return null
	const type = name.substr(name.lastIndexOf(".") + 1)
	return type.toLowerCase()
}


export const classnames = (...args: any[]) => {
	let classnameStr = ''
	args.forEach(item => {
		if (classnameStr !== '') {
			classnameStr += ' '
		}
		if (typeof item === 'string') {
			classnameStr += `${item}`
		}
		if (item && typeof item === 'object') {
			Object.keys(item).forEach(className => {
				if (item[className]) {
					classnameStr += `${className}`
				}
			})
		}
	})
	return classnameStr
}

export interface StateContextProps {
	managerId: number,
	onSelectFile(file: FileItemProps): void
	selectedFiles: FileItemProps[]
	onRename?(file: FileItemProps, newName: string): void
	FileIcon?: React.FC<{fileType: string, file: FileItemProps, size: number, [key: string]: any}>
	loadingColor?: string
	showImageThumb?: boolean | ((file: FileItemProps) => string)
}

export const StateContext = React.createContext<StateContextProps>({
	managerId: 0,
	onSelectFile() { },
	selectedFiles: [],
})

export const ConfigContext = React.createContext<{

}>({

})


export const usePressKey = (keyName: string, fn: () => void, options?: {
	deps?: any[]
	metaKey?: boolean
	preventDefault?: boolean
}) => {
	const { metaKey, deps = [], preventDefault } = options || {}
	const callback = React.useCallback((e: KeyboardEvent) => {
		if (e.key !== keyName) return
		if (metaKey && !e.metaKey) return
		fn()
		if (preventDefault) {
			e.preventDefault()
		}
	}, deps)

	React.useEffect(() => {
		document.addEventListener('keydown', callback)
		return () => {
			document.removeEventListener('keydown', callback)
		}
	}, deps)
}

export const useKey = (keyName: string) => {
	const isDownRef = React.useRef(false)

	const downCallback = React.useCallback((e: KeyboardEvent) => {
		if (e.key !== keyName) return
		isDownRef.current = true
	}, [])

	const upCallback = React.useCallback((e: KeyboardEvent) => {
		if (e.key !== keyName) return
		isDownRef.current = false
	}, [])

	React.useEffect(() => {
		document.addEventListener('keydown', downCallback)
		document.addEventListener('keyup', upCallback)
		return () => {
			document.removeEventListener('keydown', downCallback)
			document.removeEventListener('keyup', upCallback)
		}
	}, [])
	return isDownRef
}

export const mdTypes = ['markdown', 'md']
export const imgTypes = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp', 'svg', 'svgz']
export const wordTypes = ['doc', 'docx']
export const excelTypes = ['xls', 'xlsx']
export const fontTypes = ['ttf']

/** 处理文件图标类型 */
export const transformType = (name: string) => {
	const ext = getExt(name)
	if (!ext) return 'unknow'
	if (mdTypes.includes(ext)) return 'markdown'
	if (imgTypes.includes(ext)) return 'image'
	if (wordTypes.includes(ext)) return 'word'
	if (excelTypes.includes(ext)) return 'excel'
	if (fontTypes.includes(ext)) return 'font'
	return ext
}

/** 处理文件预览类型 */
export const getFileViewType = (name: string) => {
	const ext = getExt(name)
	if (!ext) return
	if (mdTypes.includes(ext)) return 'markdown'
	if (imgTypes.includes(ext)) return 'image'

	const textType = ['gitignore']
	if (textType.includes(ext)) return 'text'
}

export const getTheParent = (
	item: FileItemProps, treeData: FileItemProps[], parent?: FileItemProps
): FileItemProps | undefined => {
	if (!item) return
	if (!Array.isArray(treeData)) return
	for (let index = 0; index < treeData.length; index++) {
		const { id, children } = treeData[index];
		if (id === item.id) {
			// @ts-ignore
			return parent || { children: treeData }
		}
		const parentNode = getTheParent(item, children!, treeData[index])
		if (parentNode) {
			return parentNode
		}
	}
}

export const getTargetElement = (dom: Element, id: number): Element | null => {
	if (!dom) return null
	const dataId = dom.getAttribute('data-id')
	if (dataId === `${id}`) return dom
	const parent = dom.parentElement
	if (parent) {
		const node = getTargetElement(parent, id)
		if (node) return node
	}
	return null
}


export const uuid = () => {
  let d = new Date().getTime();

  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return uuid;
}


export const base64Encode = (str: string) => {
	const frags = str.split('/')
	const filename = frags[frags.length - 1]
	frags[frags.length - 1] = encodeURIComponent(filename)
	const url = frags.join('/')
	console.log('url: ', url);
  const encodedStr = encodeURIComponent(url).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
  return btoa(encodedStr);
}
