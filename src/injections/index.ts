import Modules from "../lib/requiredModules";
import injectMessageContext from "./MessageContext";

export const applyInjections = async (): Promise<void> => {
  await Modules.loadModules();
  injectMessageContext();
};

export default { applyInjections };
