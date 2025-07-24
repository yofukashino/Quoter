import { webpack } from "replugged";
import Utils from "./utils";
import Types from "../types";

export const Modules: Types.Modules = {};

Modules.loadModules = async (): Promise<void> => {
  Modules.CloudUpload = await webpack
    .waitForModule(webpack.filters.bySource("uploadFileToCloud"), {
      timeout: 10000,
    })
    .then((mod) => webpack.getFunctionBySource<Types.CloudUpload>(mod, "uploadFileToCloud"))
    .catch(() => {
      throw new Error("Failed To Find CloudUpload Module");
    });

  Modules.IconUtils ??= await webpack
    .waitForProps<Types.IconUtils>(["getUserAvatarURL"], {
      timeout: 10000,
    })
    .catch(() => {
      throw new Error("Failed To Find IconUtils Module");
    });

  Modules.PermissionUtils ??= await webpack
    .waitForModule<Types.DefaultTypes.RawModule>(
      webpack.filters.bySource(".computeLurkerPermissionsAllowList()"),
      { timeout: 10000, raw: true },
    )
    .then((v) =>
      Utils.unmangleExports<Types.PermissionUtils>(v, {
        can: "excludeGuildPermissions:",
        getGuildVisualOwnerId: ".ownerId",
        getHighestHoistedRole: ".hoistRoleId?",
        getHighestRole: ".position).first()",
        isRoleHigher: /\w+\.indexOf\(\w+\.id\)>/,
      }),
    )
    .catch(() => {
      throw new Error("Failed To Find PermissionUtils Module");
    });
  Modules.PendingReplyStore = webpack.getByStoreName<Types.PendingReplyStore>("PendingReplyStore")!;
};

export default Modules;
