import { webpack } from "replugged";
import type { Backoff } from "replugged/dist/renderer/modules/common/api";
import type { Item, Upload } from "./Upload";

export enum CloudUploadStatus {
  NOT_STARTED = "NOT_STARTED",
  STARTED = "STARTED",
  UPLOADING = "UPLOADING",
  ERROR = "ERROR",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

interface RetryOptions {
  backoff: Backoff;
  retries: number;
  timeout: number;
}

interface RetryOptionsTimeout {
  response: number;
  deadline: number;
}

interface AttachmentUrlRetryOptions {
  backoff: Backoff;
  retries: number;
  timeout: number | RetryOptionsTimeout;
}

interface ChunkUpload {
  bufferedFileData?: Blob;
  contentType: string;
  fileSize: number;
}

interface ChunkData {
  chunk: Blob;
  contentType: string;
  end: number;
  sessionUrl: string;
  start: number;
  totalSize: number;
}

declare class UploadAnalytics {
  public compressAndExtractDisabled?: boolean;
  public convertedMimeType?: string;
  public fileAlreadyPrepped?: boolean;
  public imageCompressionQuality?: number;
  public numChunks?: number;
  public timing: Record<string, number>;
  public totalRequestCount?: number;
  public videoCompressionQuality?: number;
  public sourceMediaWidth?: string;
  public sourceMediaHeight?: string;
  public sourceMediaFormat?: string;
  public sourceVideoBitrate?: number;
}

export declare class CloudUpload extends Upload {
  public constructor(
    item: Item,
    channelId: string,
    showLargeMessageDialog: boolean,
    reactNativeFileIndex: number,
  );

  public static fromJson: (data: Record<string, unknown>) => CloudUpload;

  private _abortController: AbortController;
  private _xhr?: undefined;
  public _aborted: boolean;
  public channelId: string;
  public currentSize: number;
  public error?: string | undefined;
  public loaded: number;
  public postCompressionSize?: number;
  public preCompressionSize: number;
  public reactNativeFileIndex: number;
  public reactNativeFilePrepped: boolean;
  public responseUrl?: string | undefined;
  public RESUME_INCOMPLETE_CODES: number[];
  public startTime?: number | undefined;
  public status: CloudUploadStatus;
  public uploadAnalytics: UploadAnalytics;
  public uploadedFilename?: string | undefined;

  public cancel: () => void;
  public createAttachmentUrlRetryOpts: () => AttachmentUrlRetryOptions;
  public delete: () => Promise<void>;
  public getChunk: (
    start: number,
    end: number,
    fileData: Blob | undefined,
  ) => Promise<Blob | undefined>;
  public getSize: () => Promise<number>;
  public handleComplete: (response: Record<string, unknown>) => void;
  public handleError: (error: Error | number) => void;
  public isUnsuccessfulChunkUpload: (response: Record<string, unknown>, end: number) => boolean;
  public prepareChunkUploadItem: () => Promise<ChunkUpload>;
  public reactNativeCompressAndExtractData: () => Promise<this>;
  public resetState: () => this;
  public retryOpts: () => RetryOptions;
  public setFilename: (filename: string) => void;
  public setResponseUrl: (responseUrl: string) => void;
  public setStatus: (status: CloudUploadStatus) => void;
  public setUploadedFilename: (uploadedFilename: string) => void;
  public trackTime: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
  public trackUploadFinished: (state: string) => void;
  public trackUploadStart: () => void;
  public upload: () => Promise<void>;
  public uploadChunk: (data: ChunkData) => Promise<void>;
  public uploadFileToCloud: () => Record<string, unknown>;
  public uploadFileToCloudAsChunks: (chunkSize: number) => Promise<void>;
}

const cloudUploadStr = "uploadFileToCloud";

export default await webpack
  .waitForModule(webpack.filters.bySource(cloudUploadStr))
  .then((mod) => webpack.getFunctionBySource<typeof CloudUpload>(mod, cloudUploadStr)!);
