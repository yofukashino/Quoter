import {
  constants as DiscordConstants,
  toast as Toast,
  users as UltimateUserStore,
} from "replugged/common";
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
        displayName: "Avatar",
        description: "Avatar of the person you are quoting",
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
        name: "grayscale",
        displayName: "Grayscale",
        description: "Make the quote grayscale",
        type: Types.DefaultTypes.ApplicationCommandOptionType.Boolean,
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
        const grayscale = interaction.getValue("grayscale", false);
        const { channel } = interaction;
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
          await Utils.sendQuote({
            avatarUrl,
            author,
            content,
            channel,
            size,
            grayscale,
          });
          return;
        }
        if (noPermissions)
          Toast.toast("Lacks Permission to send the quote here.", Toast.Kind.FAILURE);
        const imgBlob = await Utils.generateQuote({
          avatarUrl,
          text: content,
          author,
          size,
          grayscale,
        });
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
