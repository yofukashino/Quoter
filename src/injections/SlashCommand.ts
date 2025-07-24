import { users as UltimateUserStore, constants as DiscordConstants } from "replugged/common";
import { ContextMenu } from "replugged/components";
import { PluginInjectorUtils, PluginLogger } from "../index";
import Modules from "../lib/requiredModules";
import Utils from "../lib/utils";
import Types from "../types";

export default (): void => {
  const { PermissionUtils } = Modules;
  PluginInjectorUtils.registerSlashCommand({
    name: "quote",
    description: "Make custom quote of text",
    options: [
      {
        name: "avatar",
        displayName: "Avatar url",
        description: "Link of avatar of the person you are quoting",
        type: Types.DefaultTypes.ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "name",
        displayName: "Username",
        description: "The username of the person you are quoting",
        type: Types.DefaultTypes.ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "quote",
        displayName: "Quote",
        description: "The quote you want printed",
        type: Types.DefaultTypes.ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "size",
        displayName: "Size",
        description: "Size of generate image (Default. 1024)",
        type: Types.DefaultTypes.ApplicationCommandOptionType.Number,
        required: false,
      },
      {
        name: "send",
        displayName: "Send",
        description: "Share the quote publicly in chat",
        type: Types.DefaultTypes.ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    executor: async (interaction) => {
      try {
        const avatarUrl = interaction.getValue("avatar");
        const author = interaction.getValue("name");
        const content = interaction.getValue("quote");
        const channel = interaction.channel;
        const size = interaction.getValue("size") ?? 1024;

        if (interaction.getValue("send")) {
          Utils.sendQuote({
            avatarUrl,
            author,
            content,
            channel,
            size,
          });
          return;
        }
        const imgBlob = await Utils.generateQuote({ avatarUrl, text: content, author, size: size });
        const imgUrl = URL.createObjectURL(imgBlob);
        return {
          send: false,
          embeds: [
            {
              image: {
                contentType: "image/png",
                flags: 0,
                placeholderVersion: 1,
                url: imgUrl,
                proxyURL: imgUrl,
                width: (21 / 9) * size,
                height: size,
              },
              contentScanVersion: 2,
              fields: [],
              flags: undefined,
              type: "image",
              url: imgUrl,
            },
          ],
        };
      } catch (error) {
        PluginLogger.error(error);
        return {
          send: false,
          result: error,
        };
      }
    },
  });
};
