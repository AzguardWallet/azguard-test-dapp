<script setup>
/** Vendor */
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { EditorView } from "codemirror"
import { EditorState } from "@codemirror/state"
import { keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection } from "@codemirror/view"
import { bracketMatching, foldGutter } from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { json } from "@codemirror/lang-json"
import { indentationMarkers } from '@replit/codemirror-indentation-markers';

/** Services */
import { customViewerTheme } from "./theme.js";

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
	modal: {
		type: Boolean,
		default: false,
	}
})

const emit = defineEmits(["update:data", "close"]);

const editorRef = ref(null)
let editorState = null
const editorView = ref()

const fullscreen = ref(props.modal)
const fullscreenSettings = [
	lineNumbers(),
	foldGutter(),
	indentationMarkers(
		{
			markerType: "codeOnly",
			thickness: 1,
		},
	),
]
const initViewer = () => {
	editorState = EditorState.create({
		doc: JSON.stringify(props.data, null, 2),
		extensions: [
			highlightActiveLine(),
			highlightActiveLineGutter(),
			highlightSpecialChars(),
			// drawSelection(),
			bracketMatching(),
			highlightSelectionMatches(),
			fullscreen.value ? [...fullscreenSettings] : [],
			keymap.of([...defaultKeymap, ...searchKeymap]),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const updatedText = update.state.doc.toString();
					try {
						const parsedJson = JSON.parse(updatedText);
						emit("update:data", parsedJson);
					} catch {
						
					}
				}
			}),
			customViewerTheme,
			// EditorState.readOnly.of(true),
			// EditorView.lineWrapping,
			json(),
		],
	})

	editorView.value = new EditorView({
		// state,
		state: editorState,
		parent: editorRef.value,
	})
}

const isCopied = ref(false)

const handleCopy = () => {
	isCopied.value = true

	window.navigator.clipboard.writeText(JSON.stringify(props.data))

	setTimeout(() => {
		isCopied.value = false
	}, 1_500)
}

const handleCloseModal = () => {
	emit("close");
	fullscreen.value = false
}

const onKeydown = (e) => {
	if (e.code === "Escape") handleCloseModal()
}

watch(
	() => fullscreen.value,
	() => {
		if (editorView.value) {
			editorView.value.destroy();
			editorView.value = null;
		}

		if (props.modal) return

		nextTick(() => {
			initViewer()
		})
	}
)

watch(
	() => props.data,
	(newData) => {
		if (editorView.value) {
			const updatedDoc = JSON.stringify(newData, null, 2)
			const currentDoc = editorView.value.state.doc.toString()
			if (updatedDoc !== currentDoc) {
				editorView.value.dispatch({
					changes: { from: 0, to: editorView.value.state.doc.length, insert: updatedDoc },
				})
			}
		}
	},
	{ deep: true }
)

onMounted(() => {
	nextTick(() => {
		initViewer()
		document.addEventListener("keydown", onKeydown)
	})
})

onUnmounted(() => {
	document.removeEventListener("keydown", onKeydown)
})
</script>

<template>
	<div :class="$style.wrapper">
		<Icon
			v-if="!fullscreen && !modal"
			@click="fullscreen = true"
			name="expand"
			size="16"
			color="tertiary"
			:class="$style.fullscreen_icon"
		/>

		<Icon
			v-if="!modal"
			@click="handleCopy"
			:name="isCopied ? 'check' : 'copy'"
			size="16"
			:color="isCopied ? 'green' : 'tertiary'"
			:class="[$style.copy_icon, isCopied && $style.copied_icon]"
		/>

		<div v-if="!modal" ref="editorRef" :class="$style.editor" />

		<Flex v-if="fullscreen" :class="$style.fullscreen_wrapper">
			<Icon
				@click="handleCloseModal"
				name="close"
				size="16"
				color="tertiary"
				:class="$style.fullscreen_icon"
			/>
			
			<Icon
				@click="handleCopy"
				:name="isCopied ? 'check' : 'copy'"
				size="16"
				:color="isCopied ? 'green' : 'tertiary'"
				:class="[$style.copy_icon, isCopied && $style.copied_icon]"
			/>

			<div ref="editorRef" :class="$style.fullscreen_modal" />
		</Flex>		

	</div>
</template>

<style module>
.wrapper {
	position: relative;
	width: 100%;
	height: 100%;

	overflow: auto;
	overscroll-behavior: contain;
}

.editor {
	padding: 0 8px;
	width: 100%;
	height: 100%;
	overflow: auto;

	background-color: var(--tooltip-background);
	border: solid 1px var(--txt-support);
	border-radius: 4px;
}

.copy_icon {
	position: absolute;
	right: 40px;
	transform: translateY(5px);
	z-index: 1;

	background: transparent;
	box-sizing: content-box;
	cursor: pointer;
	border-radius: 5px;

	padding: 4px;

	transition: all 0.5s ease;

	&:hover {
		fill: var(--txt-secondary);
	}
}

.copied_icon {
	&:hover {
		fill: var(--green);
	}
}

.fullscreen_icon {
	position: absolute;
	right: 16px;
	transform: translateY(5px);
	z-index: 1;

	background: transparent;
	box-sizing: content-box;
	cursor: pointer;
	border-radius: 5px;

	padding: 4px;

	transition: all 0.5s ease;

	&:hover {
		fill: var(--txt-secondary);
	}
}

.fullscreen_wrapper {
	width: 700px;
	height: 500px;

	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: var(--tooltip-background);
	border: solid 1px var(--txt-support);
	border-radius: 4px;

	z-index: 1000;
}

.fullscreen_modal {
	padding: 0 8px;

	overflow: auto;
	overscroll-behavior: contain;
}

::selection {
	background-color: var(--txt-support);
}
</style>
