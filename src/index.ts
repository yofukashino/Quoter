import { Injector, Logger } from "replugged";
export const PluginLogger = Logger.plugin("Quoter", "#ffebeb");
export const PluginInjector = new Injector();
export const { utils: PluginInjectorUtils } = PluginInjector;
import Injections from "./injections/index";

export const start = (): void => {
  void Injections.applyInjections().catch((err) => PluginLogger.error(err));
};

export const stop = (): void => {
  PluginInjector.uninjectAll();
};
