import { NetChannel, TData, CallbackObj } from "./NetChannel";

export class NetChannelManager {
    private static _instance: NetChannelManager;
    protected _channels: { [key: string]: NetChannel } = {};

    public static getInstance(): NetChannelManager {
        if (!this._instance) {
            this._instance = new NetChannelManager();
        }
        return this._instance;
    }

    // 添加Node，返回ChannelID
    public setNetNode(newChannel: NetChannel, key: string) {
        this._channels[key] = newChannel;
    }

    // 移除Node
    public removeNetNode(key: string) {
        delete this._channels[key];
    }

    // 调用Node连接
    public connect(key: string,token:string): boolean {
        if (this._channels[key]) {
            this._channels[key].setToken(token);
            return this._channels[key].connect();
        }
        return false;
    }

    // 调用Node发送
    public send(data: TData, force: boolean = false, key: string): number {
        let node = this._channels[key];
        if (node) {
            return node!.send(data, force);
        }
        return -1;
    }

    // 发起请求，并在在结果返回时调用指定好的回调函数
    public request(data: TData, rspCode: number, rspObject: CallbackObj, force: boolean = false, key: string) {
        let node = this._channels[key];
        if (node) {
            node.request(data, rspCode, rspObject, force);
        }
    }

    // 同request，但在request之前会先判断队列中是否已有rspCmd，如有重复的则直接返回
    public requestUnique(data: TData, rspCode: number, rspObject: CallbackObj, force: boolean = false, key: string): boolean {
        let node = this._channels[key];
        if (node) {
            return node.requestUnique(data, rspCode, rspObject, force);
        }
        return false;
    }

    // 调用Node关闭
    public close(code?: number, reason?: string, channelId: number = 0) {
        if (this._channels[channelId]) {
            return this._channels[channelId].closeSocket(code, reason);
        }
    }
}