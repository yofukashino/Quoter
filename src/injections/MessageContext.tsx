import { ContextMenu } from "replugged/components";
import { PluginInjectorUtils } from "../index";
import Modules from "../lib/requiredModules";
import Utils from "../lib/utils";
import Types from "../types";

export default (): void => {
  PluginInjectorUtils.addMenuItem(
    Types.DefaultTypes.ContextMenuTypes.Message,
    ({ message, channel }: { message: Types.Message; channel: Types.Channel }) => {
      if (!message.content) return;
      return (
        <ContextMenu.MenuItem
          id="yofukashino-quote"
          label="Quote Message"
          action={() => {
            console.log(message, channel);
            Utils.sendQuote({ message, channel });
          }}
        />
      );
    },
  );
};
