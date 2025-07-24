import Modules from "../lib/requiredModules";
import injectMessageContext from "./MessageContext";
import injectSlashCommand from "./SlashCommand";

export const applyInjections = async (): Promise<void> => {
  await Modules.loadModules();
  injectMessageContext();
  injectSlashCommand();
};

export default { applyInjections };
