import { FigmaWebSocketBridge } from '../server/wsBridge';
import { FigmaRestClient } from '../figma/restClient';
import { ActionType } from '../figma/pluginProtocol';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any, bridge: FigmaWebSocketBridge, restClient: FigmaRestClient) => Promise<any>;
}

export const figmaTools: ToolDefinition[] = [
  // READ TOOLS
  {
    name: 'get_document_tree',
    description: 'Fetch the document node tree hierarchy from the active Figma page',
    parameters: {
      type: 'object',
      properties: {}
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('GET_DOCUMENT_TREE');
    }
  },
  {
    name: 'get_selection',
    description: 'Get details and properties of currently selected nodes on the Figma canvas',
    parameters: {
      type: 'object',
      properties: {}
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('GET_SELECTION');
    }
  },
  {
    name: 'get_node_details',
    description: 'Get detailed properties for a specific node by its Figma node ID',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The Figma node ID (e.g., 1:23)' }
      },
      required: ['nodeId']
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('GET_NODE_DETAILS', args);
    }
  },
  {
    name: 'export_node_image',
    description: 'Export selected node or specified node ID as an image (PNG, JPG, SVG)',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'Node ID to export (optional, defaults to selection)' },
        format: { type: 'string', enum: ['PNG', 'JPG', 'SVG', 'PDF'], description: 'Image format' },
        scale: { type: 'number', description: 'Export scale factor (e.g. 1, 2, 3)' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('EXPORT_NODE_IMAGE', args);
    }
  },
  {
    name: 'get_styles',
    description: 'Get all local color styles and text styles from current Figma file',
    parameters: {
      type: 'object',
      properties: {}
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('GET_STYLES');
    }
  },
  {
    name: 'fetch_figma_rest_file',
    description: 'Fetch file tree using Figma REST API (works without plugin using FIGMA_ACCESS_TOKEN)',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key from URL (e.g. figma.com/file/FILE_KEY/...)' },
        depth: { type: 'number', description: 'Tree depth limit' }
      },
      required: ['fileKey']
    },
    handler: async (args, bridge, restClient) => {
      return restClient.getFile(args.fileKey, args.depth);
    }
  },

  // WRITE TOOLS
  {
    name: 'create_frame',
    description: 'Create a new Frame on Figma canvas with optional dimensions, background color, auto-layout settings',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the frame' },
        x: { type: 'number', description: 'X position' },
        y: { type: 'number', description: 'Y position' },
        width: { type: 'number', description: 'Frame width in px' },
        height: { type: 'number', description: 'Frame height in px' },
        fillColor: { type: 'string', description: 'Hex background color e.g. #FFFFFF or #1E1E24' },
        strokeColor: { type: 'string', description: 'Hex border color' },
        strokeWeight: { type: 'number', description: 'Border thickness' },
        cornerRadius: { type: 'number', description: 'Corner radius in px' },
        layoutMode: { type: 'string', enum: ['NONE', 'HORIZONTAL', 'VERTICAL'], description: 'Auto-layout direction' },
        itemSpacing: { type: 'number', description: 'Gap between items in auto-layout' },
        paddingLeft: { type: 'number' },
        paddingRight: { type: 'number' },
        paddingTop: { type: 'number' },
        paddingBottom: { type: 'number' },
        parentId: { type: 'string', description: 'Target parent node ID to nest this frame inside' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('CREATE_FRAME', args);
    }
  },
  {
    name: 'create_text',
    description: 'Create a Text element in Figma with font family, size, content, and alignment',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text content string' },
        name: { type: 'string', description: 'Layer name' },
        x: { type: 'number' },
        y: { type: 'number' },
        fontSize: { type: 'number', description: 'Font size in px' },
        fontFamily: { type: 'string', description: 'Font family name e.g. Inter, Roboto' },
        fontStyle: { type: 'string', description: 'Font weight/style e.g. Regular, Bold, Medium' },
        fillColor: { type: 'string', description: 'Hex color string' },
        textAlign: { type: 'string', enum: ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY'] },
        parentId: { type: 'string', description: 'Target parent node ID' }
      },
      required: ['text']
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('CREATE_TEXT', args);
    }
  },
  {
    name: 'create_shape',
    description: 'Create a geometric shape (Rectangle, Ellipse, Polygon, Star, Line)',
    parameters: {
      type: 'object',
      properties: {
        shapeType: { type: 'string', enum: ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE'] },
        name: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        fillColor: { type: 'string' },
        strokeColor: { type: 'string' },
        cornerRadius: { type: 'number' },
        parentId: { type: 'string' }
      },
      required: ['shapeType']
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('CREATE_SHAPE', args);
    }
  },
  {
    name: 'update_node',
    description: 'Update properties of an existing node or current selected node (color, text, size, position)',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'Node ID to update (optional, defaults to selection)' },
        name: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        fillColor: { type: 'string' },
        strokeColor: { type: 'string' },
        cornerRadius: { type: 'number' },
        text: { type: 'string' },
        fontSize: { type: 'number' },
        fontFamily: { type: 'string' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('UPDATE_NODE', args);
    }
  },
  {
    name: 'delete_node',
    description: 'Delete a node by ID or delete current selected nodes',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'Node ID to delete (optional, defaults to current selection)' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('DELETE_NODE', args);
    }
  },
  {
    name: 'clone_node',
    description: 'Duplicate a node by ID or duplicate current selection',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('CLONE_NODE', args);
    }
  },
  {
    name: 'apply_autolayout',
    description: 'Enable and configure auto-layout on a Frame node',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
        layoutMode: { type: 'string', enum: ['HORIZONTAL', 'VERTICAL'] },
        itemSpacing: { type: 'number' },
        paddingLeft: { type: 'number' },
        paddingRight: { type: 'number' },
        paddingTop: { type: 'number' },
        paddingBottom: { type: 'number' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('APPLY_AUTOLAYOUT', args);
    }
  },
  {
    name: 'create_design_system',
    description: 'Batch create a design system palette and UI component sheet on canvas',
    parameters: {
      type: 'object',
      properties: {
        themeName: { type: 'string', description: 'Theme or project name' },
        primaryColor: { type: 'string', description: 'Primary brand hex color' },
        secondaryColor: { type: 'string', description: 'Secondary hex color' },
        backgroundColor: { type: 'string', description: 'Background hex color' },
        textColor: { type: 'string', description: 'Text hex color' }
      }
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('CREATE_DESIGN_SYSTEM', args);
    }
  },
  {
    name: 'execute_custom_figma_script',
    description: 'Execute custom JavaScript code directly inside Figma plugin environment using the figma JS SDK',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code snippet to execute inside Figma (e.g., figma.currentPage.selection...)' }
      },
      required: ['code']
    },
    handler: async (args, bridge) => {
      return bridge.executeAction('EXECUTE_SCRIPT', args);
    }
  }
];
