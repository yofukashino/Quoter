import type EventEmitter from "events";
import { webpack } from "replugged";

export enum UploadPlatform {
  REACT_NATIVE,
  WEB,
}

type FileType =
  | "photoshop"
  | "webcode"
  | "image"
  | "video"
  | "acrobat"
  | "ae"
  | "sketch"
  | "ai"
  | "archive"
  | "code"
  | "document"
  | "spreadsheet"
  | "webcode"
  | "audio"
  | "unknown";

export interface Item {
  clip?: boolean;
  file: File;
  isThumbnail: boolean;
  platform: UploadPlatform;
  durationSecs?: number;
  filename?: string;
  isRemix?: boolean;
  mimeType?: string;
  origin?: string;
  uri?: string;
  waveform?: string;
}

export declare class Upload extends EventEmitter {
  public constructor(item: Item, showLargeMessageDialog: boolean);

  public classification?: FileType;
  public clip?: boolean | undefined;
  public description?: string | null;
  public durationSecs?: number;
  public filename?: string;
  public id?: string;
  public isImage?: boolean;
  public isRemix?: boolean;
  public isThumbnail?: boolean | undefined;
  public isVideo?: boolean;
  public item?: Item;
  public mimeType?: string;
  public origin?: string;
  public showLargeMessageDialog?: boolean;
  public spoiler?: boolean;
  public uniqueId?: string;
  public uploadedFilename?: string;
  public uri?: string;
  public waveform?: string;

  public cancel: () => void;
  public resetState: () => this;
}

const uploadStr = "this.classification";

export default await webpack
  .waitForModule(webpack.filters.bySource(uploadStr))
  .then((mod) => webpack.getFunctionBySource<typeof Upload>(mod, uploadStr)!);
