// Types
export type {
  TrackType,
  Clip,
  Track,
  EditorState,
  EditorAction,
  CompositionEntry,
} from "./types.js";

// Theme
export { colors } from "./theme/colors.js";
export type { ColorKey } from "./theme/colors.js";
export {
  TOOLBAR_HEIGHT,
  TIMELINE_TRACK_HEIGHT,
  TIMELINE_RULER_HEIGHT,
  SIDEBAR_MIN_WIDTH,
  BORDER_RADIUS,
  FONT_FAMILY,
  MONO_FONT,
  TRANSITION,
  TRANSITION_PANEL,
  TRACK_LABEL_WIDTH,
  GLOBAL_STYLES,
} from "./theme/styles.js";

// State
export {
  editorReducer,
  initialEditorState,
  EditorContext,
  EditorDispatchContext,
  useEditor,
} from "./state/editor-state.js";
export {
  historyReducer,
  HistoryContext,
  HistoryDispatchContext,
  useHistory,
} from "./state/history.js";
export type { HistoryState, HistoryAction } from "./state/history.js";

// Layout
export { Splitter } from "./layout/Splitter.js";
export { SplitterContainer } from "./layout/SplitterContainer.js";
export { EditorLayout } from "./layout/EditorLayout.js";

// Timeline
export { Timeline } from "./timeline/Timeline.js";
export { TimelineRuler } from "./timeline/TimelineRuler.js";
export { TimelineTrack } from "./timeline/TimelineTrack.js";
export type { TimelineTrackProps } from "./timeline/TimelineTrack.js";
export { TimelineClip } from "./timeline/TimelineClip.js";
export { TimelineCursor } from "./timeline/TimelineCursor.js";
export { TimelineScrollbar } from "./timeline/TimelineScrollbar.js";
export { AudioWaveformTrack } from "./timeline/AudioWaveformTrack.js";
export { SubtitleTrack } from "./timeline/SubtitleTrack.js";
export { DragGhost } from "./timeline/DragGhost.js";

// Sidebar
export { PropertiesPanel } from "./sidebar/PropertiesPanel.js";
export { SceneList } from "./sidebar/SceneList.js";
export { AddTrackMenu } from "./sidebar/AddTrackMenu.js";
export {
  NumberInput,
  TextInput,
  TextAreaInput,
  SliderInput,
  ToggleInput,
  SelectInput,
  ColorInput,
} from "./sidebar/PropEditor.js";

// Modals
export { AddSceneModal } from "./modals/AddSceneModal.js";
export { AddAudioModal } from "./modals/AddAudioModal.js";
export { AddSubtitleModal } from "./modals/AddSubtitleModal.js";
export { ExportModal } from "./modals/ExportModal.js";
export { KeyboardShortcutsModal } from "./modals/KeyboardShortcutsModal.js";

// Canvas
export { Canvas } from "./canvas/Canvas.js";

// Toolbar
export { Toolbar } from "./toolbar/Toolbar.js";
export { PlaybackControls } from "./toolbar/PlaybackControls.js";

// Hooks
export { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts.js";
export { useTimelineDrag } from "./hooks/use-timeline-drag.js";
export type { DragState, DragMode } from "./hooks/use-timeline-drag.js";

// Components
export { EditorProvider, CompositionsContext, useCompositions } from "./EditorProvider.js";
export { Editor } from "./Editor.js";
export type { EditorProps } from "./Editor.js";
