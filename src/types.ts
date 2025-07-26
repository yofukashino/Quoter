import { types } from "replugged";
import type util from "replugged/util";
import GeneralDiscordTypes from "discord-types/general";
import type { CloudUpload as CloudUploadType } from "./uploaderTypes-fede/CloudUpload";
import { Store } from "replugged/dist/renderer/modules/common/flux";
import type {
  SendMessageForReplyOptions,
  SendMessageOptionsForReply as SendMessageOptionsForReplyType,
} from "replugged/dist/renderer/modules/common/messages";

export namespace Types {
  export import DefaultTypes = types;
  export type ReactTree = util.Tree & React.ReactElement;
  export type Channel = GeneralDiscordTypes.Channel;
  export type User = GeneralDiscordTypes.User;
  export type Message = GeneralDiscordTypes.Message;
  export type SendMessageOptionsForReply = SendMessageOptionsForReplyType;
  export type CloudUpload = typeof CloudUploadType & (typeof CloudUploadType)["prototype"];
  export interface ASTNode extends React.ReactElement {
    type: string;
    content?: string | ASTNode[];
  }
  export interface IconUtils {
    getAnimatableSourceWithFallback: DefaultTypes.AnyFunction;
    getApplicationIconSource: DefaultTypes.AnyFunction;
    getApplicationIconURL: DefaultTypes.AnyFunction;
    getAvatarDecorationURL: DefaultTypes.AnyFunction;
    getChannelIconSource: DefaultTypes.AnyFunction;
    getChannelIconURL: DefaultTypes.AnyFunction;
    getDefaultAvatarURL: DefaultTypes.AnyFunction;
    getEmojiURL: DefaultTypes.AnyFunction;
    getGameAssetSource: DefaultTypes.AnyFunction;
    getGameAssetURL: DefaultTypes.AnyFunction;
    getGuildBannerSource: DefaultTypes.AnyFunction;
    getGuildBannerURL: DefaultTypes.AnyFunction;
    getGuildDiscoverySplashSource: DefaultTypes.AnyFunction;
    getGuildDiscoverySplashURL: DefaultTypes.AnyFunction;
    getGuildHomeHeaderSource: DefaultTypes.AnyFunction;
    getGuildHomeHeaderURL: DefaultTypes.AnyFunction;
    getGuildIconSource: DefaultTypes.AnyFunction;
    getGuildIconURL: DefaultTypes.AnyFunction;
    getGuildMemberAvatarSource: DefaultTypes.AnyFunction;
    getGuildMemberAvatarURL: DefaultTypes.AnyFunction;
    getGuildMemberAvatarURLSimple: DefaultTypes.AnyFunction;
    getGuildMemberBannerURL: DefaultTypes.AnyFunction;
    getGuildSplashSource: DefaultTypes.AnyFunction;
    getGuildSplashURL: DefaultTypes.AnyFunction;
    getGuildTemplateIconSource: DefaultTypes.AnyFunction;
    getGuildTemplateIconURL: DefaultTypes.AnyFunction;
    getUserAvatarColor: DefaultTypes.AnyFunction;
    getUserAvatarSource: DefaultTypes.AnyFunction;
    getUserAvatarURL: (...args: unknown[]) => string;
    getUserBannerURL: DefaultTypes.AnyFunction;
    getVideoFilterAssetURL: DefaultTypes.AnyFunction;
    hasAnimatedGuildIcon: DefaultTypes.AnyFunction;
    isAnimatedIconHash: DefaultTypes.AnyFunction;
    makeSource: DefaultTypes.AnyFunction;
  }
  export interface PendingReplyStore extends Store {
    getPendingReply: (channelId: string) => SendMessageForReplyOptions;
  }
  export interface PermissionUtils {
    applyThreadPermissions?: DefaultTypes.AnyFunction;
    areChannelsLocked?: DefaultTypes.AnyFunction;
    can: DefaultTypes.AnyFunction;
    canEveryone?: DefaultTypes.AnyFunction;
    canEveryoneRole?: DefaultTypes.AnyFunction;
    canManageACategory?: DefaultTypes.AnyFunction;
    computePermissions?: DefaultTypes.AnyFunction;
    computePermissionsForRoles?: DefaultTypes.AnyFunction;
    getGuildVisualOwnerId?: DefaultTypes.AnyFunction;
    getHighestHoistedRole?: DefaultTypes.AnyFunction;
    getHighestRole?: DefaultTypes.AnyFunction;
    isRoleHigher?: DefaultTypes.AnyFunction;
    makeEveryoneOverwrite?: DefaultTypes.AnyFunction;
  }
  export interface Modules {
    loadModules?: () => Promise<void>;
    CloudUpload?: CloudUpload;
    IconUtils?: IconUtils;
    PendingReplyStore?: PendingReplyStore;
    PermissionUtils?: PermissionUtils;
  }
}
export default Types;
