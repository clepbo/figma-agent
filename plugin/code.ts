/// <reference types="@figma/plugin-typings" />

import {
  ActionType,
  ColorRGBA,
  CreateFramePayload,
  CreateShapePayload,
  CreateTextPayload,
  ExecuteScriptPayload,
  ExportImagePayload,
  PluginMessage,
  SerializedNode,
  UpdateNodePayload,
  ApplyAutoLayoutPayload,
  CreateDesignSystemPayload
} from '../src/figma/pluginProtocol';

// Show Figma Plugin UI
figma.showUI(__html__, { width: 360, height: 500, title: 'Figma Agent Bridge' });

// Helper to convert hex or RGBA object to Figma Solid Paint
function parsePaint(fill: string | ColorRGBA | undefined): Paint[] {
  if (!fill) return [];
  if (typeof fill === 'string') {
    const hex = fill.replace('#', '').trim();
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
    return [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
  } else {
    return [{
      type: 'SOLID',
      color: { r: fill.r ?? 0, g: fill.g ?? 0, b: fill.b ?? 0 },
      opacity: fill.a ?? 1
    }];
  }
}

// Helper to serialize Figma scene node into clean JSON
function serializeNode(node: SceneNode, maxDepth = 3, currentDepth = 0): SerializedNode {
  const result: SerializedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: 'x' in node ? node.x : 0,
    y: 'y' in node ? node.y : 0,
    width: 'width' in node ? node.width : 0,
    height: 'height' in node ? node.height : 0,
    visible: node.visible,
    opacity: 'opacity' in node ? node.opacity : 1,
  };

  if ('fills' in node && Array.isArray(node.fills)) {
    result.fills = node.fills;
  }
  if ('strokes' in node && Array.isArray(node.strokes)) {
    result.strokes = node.strokes;
  }
  if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
    result.strokeWeight = node.strokeWeight;
  }
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
    result.cornerRadius = node.cornerRadius;
  }
  if ('layoutMode' in node) {
    result.layoutMode = node.layoutMode;
    result.itemSpacing = node.itemSpacing;
    result.paddingTop = node.paddingTop;
    result.paddingRight = node.paddingRight;
    result.paddingBottom = node.paddingBottom;
    result.paddingLeft = node.paddingLeft;
  }
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    result.textContent = textNode.characters;
    if (textNode.fontSize !== figma.mixed) {
      result.fontSize = textNode.fontSize;
    }
  }

  if ('children' in node && currentDepth < maxDepth) {
    const parentNode = node as ChildrenMixin;
    result.childrenCount = parentNode.children.length;
    result.children = parentNode.children.map(child => serializeNode(child, maxDepth, currentDepth + 1));
  } else if ('children' in node) {
    const parentNode = node as ChildrenMixin;
    result.childrenCount = parentNode.children.length;
  }

  return result;
}

// Find parent container or default to current page
function getParentContainer(parentId?: string): BaseNode & ChildrenMixin {
  if (parentId) {
    const found = figma.getNodeById(parentId);
    if (found && 'appendChild' in found) {
      return found as BaseNode & ChildrenMixin;
    }
  }
  if (figma.currentPage.selection.length === 1 && 'appendChild' in figma.currentPage.selection[0]) {
    return figma.currentPage.selection[0] as BaseNode & ChildrenMixin;
  }
  return figma.currentPage;
}

// Ensure font is loaded before setting text
async function ensureFont(family = 'Inter', style = 'Regular'): Promise<FontName> {
  const font: FontName = { family, style };
  try {
    await figma.loadFontAsync(font);
    return font;
  } catch (err) {
    console.warn(`Could not load requested font ${family} ${style}, falling back to Inter Regular`, err);
    const fallback: FontName = { family: 'Inter', style: 'Regular' };
    await figma.loadFontAsync(fallback);
    return fallback;
  }
}

// Listen to selection changes in Figma
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection.map(node => serializeNode(node, 1));
  figma.ui.postMessage({
    type: 'SELECTION_CHANGE',
    payload: {
      count: selection.length,
      nodes: selection
    }
  });
});

// Handle incoming action requests from Agent UI / WebSocket
figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === 'PING') {
    figma.ui.postMessage({ id: msg.id, type: 'PONG' });
    return;
  }

  if (msg.type !== 'EXECUTE_ACTION' || !msg.action) {
    return;
  }

  const { id, action, payload } = msg;

  try {
    let result: any = null;

    switch (action as ActionType) {
      case 'GET_DOCUMENT_TREE': {
        const rootNodes = figma.currentPage.children.map(child => serializeNode(child, 3));
        result = {
          documentName: figma.root.name,
          pageName: figma.currentPage.name,
          nodes: rootNodes
        };
        break;
      }

      case 'GET_SELECTION': {
        const selection = figma.currentPage.selection.map(node => serializeNode(node, 2));
        result = { count: selection.length, selection };
        break;
      }

      case 'GET_NODE_DETAILS': {
        const nodeId = payload?.nodeId;
        if (!nodeId) throw new Error('nodeId is required for GET_NODE_DETAILS');
        const node = figma.getNodeById(nodeId);
        if (!node) throw new Error(`Node with ID ${nodeId} not found`);
        result = serializeNode(node as SceneNode, 4);
        break;
      }

      case 'EXPORT_NODE_IMAGE': {
        const p: ExportImagePayload = payload || {};
        let targetNode: SceneNode | null = null;
        if (p.nodeId) {
          targetNode = figma.getNodeById(p.nodeId) as SceneNode;
        } else if (figma.currentPage.selection.length > 0) {
          targetNode = figma.currentPage.selection[0];
        } else {
          throw new Error('No node selected or nodeId provided for EXPORT_NODE_IMAGE');
        }

        const format = (p.format || 'PNG') as 'PNG' | 'JPG' | 'SVG' | 'PDF';
        const scale = p.scale || 2;
        const bytes = await targetNode.exportAsync({
          format: format,
          constraint: { type: 'SCALE', value: scale }
        });

        // Convert byte array to base64 string
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = figma.base64Encode ? figma.base64Encode(bytes) : '';
        result = {
          nodeId: targetNode.id,
          nodeName: targetNode.name,
          format,
          mimeType: format === 'SVG' ? 'image/svg+xml' : `image/${format.toLowerCase()}`,
          base64: base64
        };
        break;
      }

      case 'GET_STYLES': {
        const paints = figma.getLocalPaintStyles().map(s => ({ id: s.id, name: s.name, paints: s.paints }));
        const textStyles = figma.getLocalTextStyles().map(s => ({ id: s.id, name: s.name, fontSize: s.fontSize, fontName: s.fontName }));
        result = { paints, textStyles };
        break;
      }

      case 'GET_COMPONENTS': {
        const components = figma.currentPage.findAll(n => n.type === 'COMPONENT').map(c => ({
          id: c.id,
          name: c.name,
          description: (c as ComponentNode).description
        }));
        result = { count: components.length, components };
        break;
      }

      case 'CREATE_FRAME': {
        const p: CreateFramePayload = payload || {};
        const frame = figma.createFrame();
        frame.name = p.name || 'New Frame';
        frame.x = p.x ?? 100;
        frame.y = p.y ?? 100;
        frame.resize(p.width ?? 300, p.height ?? 200);

        if (p.fillColor) frame.fills = parsePaint(p.fillColor);
        if (p.strokeColor) {
          frame.strokes = parsePaint(p.strokeColor);
          frame.strokeWeight = p.strokeWeight ?? 1;
        }
        if (p.cornerRadius) {
          if (typeof p.cornerRadius === 'number') frame.cornerRadius = p.cornerRadius;
        }
        if (p.opacity !== undefined) frame.opacity = p.opacity;
        if (p.clipsContent !== undefined) frame.clipsContent = p.clipsContent;

        if (p.layoutMode && p.layoutMode !== 'NONE') {
          frame.layoutMode = p.layoutMode;
          if (p.itemSpacing !== undefined) frame.itemSpacing = p.itemSpacing;
          if (p.paddingLeft !== undefined) frame.paddingLeft = p.paddingLeft;
          if (p.paddingRight !== undefined) frame.paddingRight = p.paddingRight;
          if (p.paddingTop !== undefined) frame.paddingTop = p.paddingTop;
          if (p.paddingBottom !== undefined) frame.paddingBottom = p.paddingBottom;
          if (p.primaryAxisAlignItems) frame.primaryAxisAlignItems = p.primaryAxisAlignItems;
          if (p.counterAxisAlignItems) frame.counterAxisAlignItems = p.counterAxisAlignItems;
        }

        const parent = getParentContainer(p.parentId);
        parent.appendChild(frame);
        figma.currentPage.selection = [frame];
        result = serializeNode(frame, 2);
        break;
      }

      case 'CREATE_TEXT': {
        const p: CreateTextPayload = payload || {};
        const textNode = figma.createText();
        
        const fontName = await ensureFont(p.fontFamily || 'Inter', p.fontStyle || 'Regular');
        textNode.fontName = fontName;
        textNode.characters = p.text || 'Sample Text';
        textNode.fontSize = p.fontSize ?? 16;
        textNode.name = p.name || p.text.substring(0, 20) || 'Text';
        textNode.x = p.x ?? 100;
        textNode.y = p.y ?? 100;

        if (p.fillColor) textNode.fills = parsePaint(p.fillColor);
        if (p.textAlign) textNode.textAlignHorizontal = p.textAlign;

        const parent = getParentContainer(p.parentId);
        parent.appendChild(textNode);
        figma.currentPage.selection = [textNode];
        result = serializeNode(textNode, 1);
        break;
      }

      case 'CREATE_SHAPE': {
        const p: CreateShapePayload = payload || {};
        let shapeNode: SceneNode;

        switch (p.shapeType) {
          case 'ELLIPSE':
            shapeNode = figma.createEllipse();
            break;
          case 'POLYGON':
            shapeNode = figma.createPolygon();
            break;
          case 'STAR':
            shapeNode = figma.createStar();
            break;
          case 'LINE':
            shapeNode = figma.createLine();
            break;
          case 'RECTANGLE':
          default:
            shapeNode = figma.createRectangle();
            break;
        }

        shapeNode.name = p.name || p.shapeType;
        shapeNode.x = p.x ?? 100;
        shapeNode.y = p.y ?? 100;
        shapeNode.resize(p.width ?? 100, p.height ?? 100);

        if ('fills' in shapeNode && p.fillColor) shapeNode.fills = parsePaint(p.fillColor);
        if ('strokes' in shapeNode && p.strokeColor) {
          shapeNode.strokes = parsePaint(p.strokeColor);
          shapeNode.strokeWeight = p.strokeWeight ?? 1;
        }
        if ('cornerRadius' in shapeNode && p.cornerRadius) {
          if (typeof p.cornerRadius === 'number') shapeNode.cornerRadius = p.cornerRadius;
        }

        const parent = getParentContainer(p.parentId);
        parent.appendChild(shapeNode);
        figma.currentPage.selection = [shapeNode];
        result = serializeNode(shapeNode, 1);
        break;
      }

      case 'UPDATE_NODE': {
        const p: UpdateNodePayload = payload || {};
        let targetNode: SceneNode | null = null;
        if (p.nodeId) {
          targetNode = figma.getNodeById(p.nodeId) as SceneNode;
        } else if (figma.currentPage.selection.length > 0) {
          targetNode = figma.currentPage.selection[0];
        }

        if (!targetNode) {
          throw new Error('No target node found to update');
        }

        if (p.name) targetNode.name = p.name;
        if (p.x !== undefined) targetNode.x = p.x;
        if (p.y !== undefined) targetNode.y = p.y;
        if (p.width !== undefined || p.height !== undefined) {
          targetNode.resize(p.width ?? targetNode.width, p.height ?? targetNode.height);
        }

        if (p.fillColor && 'fills' in targetNode) targetNode.fills = parsePaint(p.fillColor);
        if (p.strokeColor && 'strokes' in targetNode) {
          targetNode.strokes = parsePaint(p.strokeColor);
          if (p.strokeWeight !== undefined) targetNode.strokeWeight = p.strokeWeight;
        }
        if (p.cornerRadius !== undefined && 'cornerRadius' in targetNode) {
          if (typeof p.cornerRadius === 'number') targetNode.cornerRadius = p.cornerRadius;
        }
        if (p.opacity !== undefined) targetNode.opacity = p.opacity;

        if (targetNode.type === 'TEXT' && p.text !== undefined) {
          const textNode = targetNode as TextNode;
          const font = (typeof textNode.fontName === 'object') ? textNode.fontName : { family: 'Inter', style: 'Regular' };
          await ensureFont(p.fontFamily || font.family, p.fontStyle || font.style);
          if (p.fontFamily || p.fontStyle) {
            textNode.fontName = { family: p.fontFamily || font.family, style: p.fontStyle || font.style };
          }
          if (p.fontSize) textNode.fontSize = p.fontSize;
          textNode.characters = p.text;
        }

        if ('layoutMode' in targetNode && p.layoutMode && p.layoutMode !== 'NONE') {
          const frameNode = targetNode as FrameNode;
          frameNode.layoutMode = p.layoutMode;
          if (p.itemSpacing !== undefined) frameNode.itemSpacing = p.itemSpacing;
          if (p.paddingLeft !== undefined) frameNode.paddingLeft = p.paddingLeft;
          if (p.paddingRight !== undefined) frameNode.paddingRight = p.paddingRight;
          if (p.paddingTop !== undefined) frameNode.paddingTop = p.paddingTop;
          if (p.paddingBottom !== undefined) frameNode.paddingBottom = p.paddingBottom;
        }

        result = serializeNode(targetNode, 2);
        break;
      }

      case 'DELETE_NODE': {
        const nodeId = payload?.nodeId;
        let targets: SceneNode[] = [];
        if (nodeId) {
          const found = figma.getNodeById(nodeId) as SceneNode;
          if (found) targets.push(found);
        } else {
          targets = [...figma.currentPage.selection];
        }

        if (targets.length === 0) {
          throw new Error('No nodes specified or selected to delete');
        }

        const deletedIds = targets.map(t => t.id);
        targets.forEach(t => t.remove());
        result = { deletedIds, count: deletedIds.length };
        break;
      }

      case 'CLONE_NODE': {
        const nodeId = payload?.nodeId;
        let sourceNode: SceneNode | null = null;
        if (nodeId) {
          sourceNode = figma.getNodeById(nodeId) as SceneNode;
        } else if (figma.currentPage.selection.length > 0) {
          sourceNode = figma.currentPage.selection[0];
        }

        if (!sourceNode) throw new Error('No source node found to clone');

        const clone = sourceNode.clone();
        clone.x += 20;
        clone.y += 20;
        figma.currentPage.selection = [clone];
        result = serializeNode(clone, 2);
        break;
      }

      case 'APPLY_AUTOLAYOUT': {
        const p: ApplyAutoLayoutPayload = payload || {};
        let targetFrame: FrameNode | null = null;
        if (p.nodeId) {
          targetFrame = figma.getNodeById(p.nodeId) as FrameNode;
        } else if (figma.currentPage.selection.length > 0 && figma.currentPage.selection[0].type === 'FRAME') {
          targetFrame = figma.currentPage.selection[0] as FrameNode;
        }

        if (!targetFrame) throw new Error('Selected node is not a Frame or not found');

        targetFrame.layoutMode = p.layoutMode || 'VERTICAL';
        if (p.itemSpacing !== undefined) targetFrame.itemSpacing = p.itemSpacing;
        if (p.paddingLeft !== undefined) targetFrame.paddingLeft = p.paddingLeft;
        if (p.paddingRight !== undefined) targetFrame.paddingRight = p.paddingRight;
        if (p.paddingTop !== undefined) targetFrame.paddingTop = p.paddingTop;
        if (p.paddingBottom !== undefined) targetFrame.paddingBottom = p.paddingBottom;
        if (p.primaryAxisAlignItems) targetFrame.primaryAxisAlignItems = p.primaryAxisAlignItems;
        if (p.counterAxisAlignItems) targetFrame.counterAxisAlignItems = p.counterAxisAlignItems;

        result = serializeNode(targetFrame, 2);
        break;
      }

      case 'CREATE_DESIGN_SYSTEM': {
        const p: CreateDesignSystemPayload = payload || {};
        const startX = p.x ?? 100;
        const startY = p.y ?? 100;
        const primaryColor = p.primaryColor || '#3B82F6'; // Blue
        const secondaryColor = p.secondaryColor || '#10B981'; // Green
        const bgColor = p.backgroundColor || '#0F172A'; // Slate dark
        const textColor = p.textColor || '#F8FAFC';

        await ensureFont('Inter', 'Bold');
        await ensureFont('Inter', 'Medium');
        await ensureFont('Inter', 'Regular');

        // Main Container Frame
        const dsFrame = figma.createFrame();
        dsFrame.name = `${p.themeName || 'Design System'} - Tokens & Components`;
        dsFrame.x = startX;
        dsFrame.y = startY;
        dsFrame.resize(800, 600);
        dsFrame.fills = parsePaint(bgColor);
        dsFrame.layoutMode = 'VERTICAL';
        dsFrame.paddingLeft = 40;
        dsFrame.paddingRight = 40;
        dsFrame.paddingTop = 40;
        dsFrame.paddingBottom = 40;
        dsFrame.itemSpacing = 32;
        dsFrame.cornerRadius = 16;

        // Title
        const title = figma.createText();
        title.fontName = { family: 'Inter', style: 'Bold' };
        title.characters = `${p.themeName || 'Design System'} UI Kit`;
        title.fontSize = 28;
        title.fills = parsePaint(textColor);
        dsFrame.appendChild(title);

        // Color Swatches Section
        const swatchFrame = figma.createFrame();
        swatchFrame.name = 'Color Tokens';
        swatchFrame.layoutMode = 'HORIZONTAL';
        swatchFrame.itemSpacing = 16;
        swatchFrame.fills = [];

        const colors = [
          { name: 'Primary', hex: primaryColor },
          { name: 'Secondary', hex: secondaryColor },
          { name: 'Background', hex: bgColor },
          { name: 'Surface', hex: '#1E293B' },
          { name: 'Text', hex: textColor }
        ];

        for (const col of colors) {
          const card = figma.createFrame();
          card.name = col.name;
          card.resize(120, 100);
          card.fills = parsePaint(col.hex);
          card.cornerRadius = 8;
          card.layoutMode = 'VERTICAL';
          card.paddingLeft = 12;
          card.paddingTop = 12;
          card.paddingRight = 12;
          card.paddingBottom = 12;
          card.primaryAxisAlignItems = 'MAX';

          const label = figma.createText();
          label.fontName = { family: 'Inter', style: 'Medium' };
          label.characters = col.name;
          label.fontSize = 12;
          label.fills = parsePaint('#FFFFFF');
          card.appendChild(label);
          swatchFrame.appendChild(card);
        }
        dsFrame.appendChild(swatchFrame);

        // Buttons Section
        const btnRow = figma.createFrame();
        btnRow.name = 'Buttons';
        btnRow.layoutMode = 'HORIZONTAL';
        btnRow.itemSpacing = 16;
        btnRow.fills = [];

        // Primary Button
        const btn1 = figma.createFrame();
        btn1.name = 'Primary Button';
        btn1.layoutMode = 'HORIZONTAL';
        btn1.paddingLeft = 20;
        btn1.paddingRight = 20;
        btn1.paddingTop = 12;
        btn1.paddingBottom = 12;
        btn1.fills = parsePaint(primaryColor);
        btn1.cornerRadius = 8;
        btn1.primaryAxisAlignItems = 'CENTER';
        btn1.counterAxisAlignItems = 'CENTER';

        const btn1Text = figma.createText();
        btn1Text.fontName = { family: 'Inter', style: 'Medium' };
        btn1Text.characters = 'Primary Action';
        btn1Text.fontSize = 14;
        btn1Text.fills = parsePaint('#FFFFFF');
        btn1.appendChild(btn1Text);
        btnRow.appendChild(btn1);

        // Secondary Button
        const btn2 = figma.createFrame();
        btn2.name = 'Secondary Button';
        btn2.layoutMode = 'HORIZONTAL';
        btn2.paddingLeft = 20;
        btn2.paddingRight = 20;
        btn2.paddingTop = 12;
        btn2.paddingBottom = 12;
        btn2.fills = parsePaint('#1E293B');
        btn2.strokes = parsePaint('#334155');
        btn2.strokeWeight = 1;
        btn2.cornerRadius = 8;
        btn2.primaryAxisAlignItems = 'CENTER';

        const btn2Text = figma.createText();
        btn2Text.fontName = { family: 'Inter', style: 'Medium' };
        btn2Text.characters = 'Secondary Action';
        btn2Text.fontSize = 14;
        btn2Text.fills = parsePaint(textColor);
        btn2.appendChild(btn2Text);
        btnRow.appendChild(btn2);

        dsFrame.appendChild(btnRow);

        figma.currentPage.selection = [dsFrame];
        result = serializeNode(dsFrame, 3);
        break;
      }

      case 'EXECUTE_SCRIPT': {
        const p: ExecuteScriptPayload = payload || {};
        if (!p.code) throw new Error('code string is required for EXECUTE_SCRIPT');

        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
          error: (...args: any[]) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' '))
        };

        const runner = new Function('figma', 'console', `
          return (async () => {
            ${p.code}
          })();
        `);

        const execReturnValue = await runner(figma, customConsole);
        result = {
          logs,
          returned: execReturnValue !== undefined ? execReturnValue : 'Execution completed successfully'
        };
        break;
      }

      default:
        throw new Error(`Unsupported action type: ${action}`);
    }

    figma.ui.postMessage({
      id,
      type: 'ACTION_RESULT',
      action,
      status: 'success',
      result
    });
  } catch (err: any) {
    console.error('Error executing action:', action, err);
    figma.ui.postMessage({
      id,
      type: 'ACTION_RESULT',
      action,
      status: 'error',
      error: err?.message || String(err)
    });
  }
};
