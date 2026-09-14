/**
 * Figma Plugin Protocol Definition
 * Defines bidirectional WebSocket communication between Agent and Figma Plugin runtime.
 */

export type ActionType =
  // Read actions
  | 'GET_DOCUMENT_TREE'
  | 'GET_SELECTION'
  | 'GET_NODE_DETAILS'
  | 'EXPORT_NODE_IMAGE'
  | 'GET_STYLES'
  | 'GET_COMPONENTS'
  // Write actions
  | 'CREATE_FRAME'
  | 'CREATE_TEXT'
  | 'CREATE_SHAPE'
  | 'UPDATE_NODE'
  | 'DELETE_NODE'
  | 'CLONE_NODE'
  | 'APPLY_AUTOLAYOUT'
  | 'CREATE_COMPONENT'
  | 'INSTANTIATE_COMPONENT'
  | 'CREATE_DESIGN_SYSTEM'
  | 'EXECUTE_SCRIPT';

export interface ColorRGBA {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
  a?: number; // 0..1
}

export interface NodeStyleProps {
  fillColor?: string | ColorRGBA; // hex string e.g. "#FF5733" or RGBA object
  strokeColor?: string | ColorRGBA;
  strokeWeight?: number;
  cornerRadius?: number | number[]; // single number or [topLeft, topRight, bottomRight, bottomLeft]
  opacity?: number;
  visible?: boolean;
}

export interface LayoutProps {
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface CreateFramePayload extends NodeStyleProps, LayoutProps {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  parentId?: string;
  clipsContent?: boolean;
}

export interface CreateTextPayload extends NodeStyleProps {
  text: string;
  name?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string; // e.g., "Inter", "Roboto"
  fontStyle?: string;  // e.g., "Regular", "Bold", "Medium"
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY';
  parentId?: string;
  width?: number;
  autoResize?: 'NONE' | 'HEIGHT' | 'WIDTH_AND_HEIGHT' | 'TRUNCATE';
}

export interface CreateShapePayload extends NodeStyleProps {
  shapeType: 'RECTANGLE' | 'ELLIPSE' | 'POLYGON' | 'STAR' | 'LINE';
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  parentId?: string;
}

export interface UpdateNodePayload extends NodeStyleProps, LayoutProps {
  nodeId?: string; // If omitted, targets current selection
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
}

export interface ApplyAutoLayoutPayload extends LayoutProps {
  nodeId?: string; // Targets selection if omitted
}

export interface ExecuteScriptPayload {
  code: string; // JavaScript code to execute inside Figma sandbox
}

export interface ExportImagePayload {
  nodeId?: string;
  format?: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  scale?: number;
}

export interface CreateDesignSystemPayload {
  themeName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  x?: number;
  y?: number;
}

export interface PluginMessage {
  id: string;
  type: 'REGISTER_PLUGIN' | 'EXECUTE_ACTION' | 'ACTION_RESULT' | 'SELECTION_CHANGE' | 'PING' | 'PONG' | 'ERROR';
  action?: ActionType;
  payload?: any;
  result?: any;
  error?: string;
  status?: 'success' | 'error';
  timestamp?: number;
  info?: {
    documentName?: string;
    pageName?: string;
    selectionCount?: number;
    fileKey?: string;
  };
}

export interface SerializedNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  opacity: number;
  fills?: any[];
  strokes?: any[];
  strokeWeight?: number;
  cornerRadius?: number;
  layoutMode?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  childrenCount?: number;
  children?: SerializedNode[];
}
