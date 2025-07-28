import {
  constants as DiscordConstants,
  users as UltimateUserStore,
  parser,
} from "replugged/common";
import { ContextMenu } from "replugged/components";
import { PluginInjectorUtils } from "../index";
import Modules from "../lib/requiredModules";
import Utils from "../lib/utils";
import Types from "../types";

export default (): void => {
  const { IconUtils, PermissionUtils } = Modules;
  PluginInjectorUtils.addMenuItem(
    Types.DefaultTypes.ContextMenuTypes.Message,
    ({ message, channel }: { message: Types.Message; channel: Types.Channel }) => {
      const user = UltimateUserStore.getCurrentUser();
      if (
        !message.content ||
        (channel.getGuildId() &&
          !PermissionUtils.can({
            permission: DiscordConstants.Permissions.SEND_MESSAGES,
            context: channel,
            user,
          }) &&
          !PermissionUtils.can({
            permission: DiscordConstants.Permissions.ATTACH_FILES,
            context: channel,
            user,
          }))
      )
        return null;

      const content = Utils.extractTextFromAst(parser.parseToAST(message.content) as Types.ASTNode);

      return (
        <ContextMenu.MenuItem
          id="yofukashino-quote"
          label="Quote Message"
          action={() => {
            const avatarUrl = IconUtils.getUserAvatarURL(
              {
                id: message?.author?.id,
                avatar: message?.author?.avatar,
              },
              true,
              1024,
              "png",
            );

            Utils.sendQuote({
              avatarUrl,
              author: message.author.username,
              content,
              channel,
            });
          }}
        />
      );
    },
  );
};
