import {
  users as UltimateUserStore,
  constants as DiscordConstants,
  toast as Toast,
} from "replugged/common";
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
        type: Types.DefaultTypes.ApplicationCommandOptionType.Attachment,
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
        const avatarFile = interaction.getValue("avatar").file;
        if (!avatarFile.type.startsWith("image")) {
          return { send: false, content: "Please Select a valid image instead." };
        }
        const avatarUrl = URL.createObjectURL(interaction.getValue("avatar").file);
        const author = interaction.getValue("name");
        const content = interaction.getValue("quote");
        const size = interaction.getValue("size", 1024);
        const channel = interaction.channel;
        const user = UltimateUserStore.getCurrentUser();
        const noPermissions =
          channel.getGuildId() &&
          !PermissionUtils.can({
            permission: DiscordConstants.Permissions.SEND_MESSAGES,
            context: channel,
            user,
          }) &&
          !PermissionUtils.can({
            permission: DiscordConstants.Permissions.ATTACH_FILES,
            context: channel,
            user,
          });
        if (interaction.getValue("send", true) && !noPermissions) {
          Utils.sendQuote({
            avatarUrl,
            author,
            content,
            channel,
            size,
          });
          return;
        }
        if (noPermissions)
          Toast.toast("Lacks Permission to send the quote here.", Toast.Kind.FAILURE);
        const imgBlob = await Utils.generateQuote({ avatarUrl, text: content, author, size: size });
        const imgUrl = URL.createObjectURL(imgBlob);
        return {
          send: false,
          embeds: [
            {
              image: {
                url: imgUrl,
                width: (21 / 9) * size,
                height: size,
              },
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
