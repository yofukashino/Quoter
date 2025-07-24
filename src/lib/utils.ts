import {
  messages as UltimateMessageStore,
  fluxDispatcher as FluxDispatcher,
  toast as Toast,
} from "replugged/common";
import Types from "../types";
import Modules from "./requiredModules";
import { PluginLogger } from "..";

const generateQuote = ({
  avatarUrl,
  text,
  author,
  size = 1024,
}: {
  avatarUrl: string;
  text: string;
  author: string;
  size?: number;
}) => {
  return new Promise<Blob>((resolve, reject) => {
    text = `"${text}"`;
    const canvas = document.createElement("canvas");
    const height = size;
    // cinematic screen ratio for width
    const width = (21 / 9) * size;
    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext("2d");

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
      const { lines, line } = text.split(" ").reduce(
        ({ lines, line }, word) => {
          const newLine = `${line}${word} `;
          const lineWidth = canvasContext.measureText(newLine).width;

          return lineWidth > textWidth && line
            ? { lines: [...lines, line.trim()], line: `${word}  ` }
            : { lines, line: newLine };
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
  message,
  channel,
  size = 1024,
}: {
  message: Types.Message;
  channel: Types.Channel;
  size?: number;
}) => {
  const { IconUtils, CloudUpload, PendingReplyStore } = Modules;
  const avatarUrl = IconUtils.getUserAvatarURL(
    {
      id: message?.author?.id,
      avatar: message?.author?.avatar,
    },
    true,
    size,
    "png",
  );

  const QuoteImg = await generateQuote({
    avatarUrl,
    text: message.content,
    author: message?.author.username,
    size,
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

export default { generateQuote, timestampToSnowflake, sendQuote };
