import {
  fluxDispatcher as FluxDispatcher,
  toast as Toast,
  messages as UltimateMessageStore,
} from "replugged/common";
import Types from "../types";
import Modules from "./requiredModules";
import { PluginLogger } from "..";
import { webpack } from "replugged";

export const isObject = (testMaterial: unknown): boolean =>
  typeof testMaterial === "object" && !Array.isArray(testMaterial) && testMaterial != null;

const generateQuote = ({
  avatarUrl,
  text,
  author,
  size = 1024,
  grayscale,
}: {
  avatarUrl: string;
  text: string;
  author: string;
  size?: number;
  grayscale?: boolean;
}): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    text = `"${text}"`;
    const canvas = document.createElement("canvas");
    const height = size;
    // cinematic screen ratio for width
    const width = (21 / 9) * size;
    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext("2d");
    if (grayscale) canvasContext.filter = "grayscale(1)";

    const img = new Image();

    img.onload = () => {
      // width 0.1 larger than original for a little stretch effect
      const avatarWidth = size * 1.1;
      canvasContext.drawImage(img, 0, 0, avatarWidth, size);

      const grad = canvasContext.createLinearGradient(0, 45, size, 0);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(1, "rgba(0, 0, 0, 1)");
      canvasContext.fillStyle = grad;
      canvasContext.fillRect(0, 0, width, height);

      // 25 for padding
      const textWidth = (width - avatarWidth) * 0.75;

      const charCount = text.length;
      // we use half the size to begin with
      // 0.6 based of arial
      // get the max size we can use for width
      const fontArea = 0.6;

      const textArea = textWidth * height;

      // scale font size based on square root of area per char
      const baseSize = Math.sqrt((textArea / charCount) * fontArea);

      const fontSize = Math.max(1, Math.min(baseSize, 60));

      const lineHeight = fontSize * 1.2;

      canvasContext.fillStyle = "white";
      canvasContext.font = `bold ${fontSize}px Arial`;

      // center of the whole image
      const centerX = width / 2;
      const centerY = height / 2;

      // seperate text into lines based on width
      const chars = text.split("");
      const { lines, line } = chars.reduce(
        ({ lines, line }, char, i) => {
          const newLine = `${line}${char}`;
          const lineWidth = canvasContext.measureText(newLine).width;

          if (lineWidth > textWidth && line) {
            const spaceIndex = line.lastIndexOf(" ");
            if (chars[i] !== " " && chars[i + 1] !== " " && spaceIndex !== -1)
              return {
                lines: [...lines, line.slice(0, spaceIndex).trim()],
                line: `${line.slice(spaceIndex + 1)}${char}`,
              };
            return { lines: [...lines, line.trim()], line: `${char}` };
          }
          return { lines, line: newLine };
        },
        { lines: [], line: "" },
      );
      lines.push(line.trim());

      const totalHeight = lines.length * lineHeight;
      const startHeight = centerY - totalHeight / 2 + lineHeight;

      lines.forEach((line, i) => {
        const lineWidth = canvasContext.measureText(line).width;
        const drawX = centerX + (textWidth - lineWidth) / 2;
        canvasContext.fillText(line, drawX, startHeight + i * lineHeight);
      });

      canvasContext.fillStyle = "rgba(255, 255, 255, 0.5)";
      canvasContext.font = "italic 20px Arial";

      const lineWidth = canvasContext.measureText(author).width;
      canvasContext.fillText(
        `- @${author}`,
        centerX + (textWidth - lineWidth) / 2,
        centerY + totalHeight / 2 + lineHeight,
      );

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.crossOrigin = "anonymous";
    img.src = avatarUrl;
  });
};

export const timestampToSnowflake = (timestamp: number): string => {
  const DISCORD_EPOCH = BigInt(1420070400000);
  const SHIFT = BigInt(22);

  const ms = BigInt(timestamp) - DISCORD_EPOCH;
  return ms <= BigInt(0) ? "0" : (ms << SHIFT).toString();
};

export const sendQuote = async ({
  avatarUrl,
  author,
  content,
  channel,
  size = 1024,
  grayscale,
}: {
  avatarUrl: string;
  author: string;
  content: string;
  channel: Types.Channel;
  size?: number;
  grayscale?: boolean;
}): Promise<void> => {
  const { CloudUpload, PendingReplyStore } = Modules;

  const QuoteImg = await generateQuote({
    avatarUrl,
    text: content,
    author,
    size,
    grayscale,
  }).catch((...args) => {
    PluginLogger.error("Failed to generate quote", ...args);
    Toast.toast("Failed to generate quote", Toast.Kind.FAILURE);
  });
  if (!QuoteImg) return;
  const replyOptions: Types.SendMessageOptionsForReply =
    UltimateMessageStore.getSendMessageOptionsForReply(
      PendingReplyStore.getPendingReply(channel.id),
    );
  if (replyOptions.messageReference) {
    FluxDispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId: channel.id });
  }
  const nonce = timestampToSnowflake(Date.now());

  const cloudUpload = new CloudUpload(
    {
      file: new File([QuoteImg], `quote-${nonce}.png`, { type: "image/png" }),
      isThumbnail: false,
      platform: 1,
    },
    channel.id,
    false,
    0,
  );

  const messagePayload = {
    flags: 0,
    channel_id: channel.id,
    content: "",
    sticker_ids: [],
    validNonShortcutEmojis: [],
    type: 0,
    message_reference: replyOptions?.messageReference || null,
    nonce,
  };

  const failed = (...args): void => {
    PluginLogger.error("Failed to upload quote", ...args);
    Toast.toast("Failed to upload quote", Toast.Kind.FAILURE);
    UltimateMessageStore.clearChannel(channel.id);
  };

  cloudUpload.on("error", failed);

  if (cloudUpload.status !== "ERROR")
    void UltimateMessageStore.sendMessage(channel.id, messagePayload, null, {
      // @ts-expect-error not typed in replugged yet
      attachmentsToUpload: [cloudUpload],
      onAttachmentUploadError: failed,
      ...messagePayload,
    }).then(() => {
      if (cloudUpload._aborted) Toast.toast("Successfully uploaded quote", Toast.Kind.SUCCESS);
    });
};

export const unmangleExports = <T>(
  moduleFilter: Types.DefaultTypes.Filter | Types.DefaultTypes.RawModule,
  map: Record<string, string | string[] | RegExp | Types.DefaultTypes.AnyFunction>,
): T => {
  const getExportKeyFinder = (
    mapValue: string | string[] | RegExp | Types.DefaultTypes.AnyFunction,
  ): Types.DefaultTypes.AnyFunction => {
    if (typeof mapValue === "function") {
      return (mod: Types.DefaultTypes.RawModule["exports"]) => {
        return mapValue(mod);
      };
    }

    if (Array.isArray(mapValue)) {
      return (mod: Types.DefaultTypes.RawModule["exports"]) => {
        if (!isObject(mod)) return "";
        for (const [k, exported] of Object.entries(mod)) {
          if (mapValue.every((p) => Object.hasOwnProperty.call(exported, p))) return k;
        }
      };
    }

    return (mod: Types.DefaultTypes.RawModule["exports"]) =>
      webpack.getFunctionKeyBySource(mod, mapValue as string);
  };

  const mod: Types.DefaultTypes.RawModule =
    typeof moduleFilter === "function"
      ? webpack.getModule(moduleFilter, { raw: true })
      : moduleFilter;

  if (!mod) return {} as T;

  const unmangled = {} as T;

  for (const key in map) {
    const findKey = getExportKeyFinder(map[key]);
    const valueKey = findKey(mod.exports) as string;
    Object.defineProperty(unmangled, key, {
      get: () => mod.exports[valueKey],
      set: (v) => {
        mod.exports[valueKey] = v;
      },
    });
  }

  return unmangled;
};

export const extractTextFromAst = (node: Types.ASTNode | Types.ASTNode[]): string => {
  if (node == null) return "";

  if (Array.isArray(node)) return node.map(extractTextFromAst).join("");

  if (typeof node !== "object") return "";

  if (typeof node.content === "string") return node.content;

  if (typeof node.content !== "string") return extractTextFromAst(node.content);
};

export default {
  isObject,
  generateQuote,
  timestampToSnowflake,
  sendQuote,
  unmangleExports,
  extractTextFromAst,
};
