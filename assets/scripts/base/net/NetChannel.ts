/**
 * 连接服务器配置
 */
export interface ServerConfig {
    url: string;
    token?: string;
    heartInterval: number;// 心跳间隔                                   // 心跳间隔
    receiveTimeOutInterval: number;// 接收消息超时间隔                               // 多久没收到数据断开
    reconnectInterval: number;// 重连间隔                           // 重连间隔
    autoReconnect?: number;// -1 不重连 0 重连 >0 重连次数
}

/**
 * 连接通道状态
 */
export enum NetChannelState {
    Closed,// 已关闭
    Connecting,// 连接中
    Checking,// 验证中
    Working,// 可传输数据
}
/**
 * 传输数据
 */
export type TData = (string | ArrayBuffer);
/**
 * 回调对象
 */
export interface CallbackObj {
    target: any,// 回调对象，不为null时调用target.callback(xxx)
    callback: (code: number, data: any) => void,// 回调函数
}
/**
 * 请求对象
 */
export interface RequestObj {
    data: TData,            // 请求的数据
    rspCode: number,             // 响应code
    rspObject: CallbackObj | null,  // 响应的回调
}
// Socket接口
export interface ISocket {
    onConnected: (event: any) => void | null;
    onMessage: (data: TData) => void | null;
    onError: (event: any) => void | null;
    onClosed: (event: any) => void | null;

    connect(config:any): any;
    send(data: TData): number;// 数据发送接口
    close(code?: number, reason?: string): void;    // 关闭接口
}
/**
 * 网络通道
 */
export class NetChannel {
    protected _server_config: ServerConfig | null = null;
    protected _reconnect_times: number | null = null;
    protected _is_socket_init: boolean = false;// Socket是否初始化
    protected _is_socket_open: boolean = false;// Socket是否连接成功
    protected _socket: ISocket | null = null;// Socket对象（可能是原生socket、websocket、wx.socket...)
    protected _state: NetChannelState = NetChannelState.Closed;// 通道当前状态
    protected _connectedCallback: () => void | null = null;// 连接完成回调
    protected _disconnect_callback: () => boolean | null = null;// 断线回调
    protected _callback_executor: (callback: CallbackObj, data: TData) => void;// 回调执行
    protected _heart_timer: any = null;// 心跳定时器
    protected _receive_timer: any = null;// 接收数据定时器
    protected _reconnect_timer: any = null;// 重连定时器
    protected _request_array: RequestObj[] = Array<RequestObj>();// 请求列表
    protected _listener: { [code: number]: CallbackObj[] | null } = {}// 监听者列表

    constructor(_server_config: ServerConfig) {
        this._server_config = _server_config;
        this._reconnect_times = _server_config.autoReconnect;
    }

    /**
     * 初始化
     * @param socket
     * @param execFunc
     * @param connectedCallBack
     */
    public init(socket: ISocket, execFunc: (callback: CallbackObj, data: TData) => void | null = null,connectedCallBack: () => void ) {
        console.log(`NetNode init socket`);
        this._socket = socket;
        this._connectedCallback = connectedCallBack ;
        this._callback_executor = execFunc ? execFunc : (callback: CallbackObj, data: TData) => {
            callback.callback.call(callback.target, 0, data);
        }
    }

    public setToken(token:string) {
        this._server_config.token = token;
    }

    public connect(): boolean {
        if (this._socket && this._state == NetChannelState.Closed) {
            if (!this._is_socket_init) {
                this.initSocket();
            }
            this._state = NetChannelState.Connecting;
            if (!this._socket.connect(this._server_config)) {
                return false;
            }
            return true;
        }
        return false;
    }

    protected initSocket() {
        if (this._socket) {
            this._socket.onConnected = (event) => { this.onConnected(event) };
            this._socket.onMessage = (msg) => { this.onMessage(msg) };
            this._socket.onError = (event) => { this.onError(event) };
            this._socket.onClosed = (event) => { this.onClosed(event) };
            this._is_socket_init = true;
        }
    }


    // 网络连接成功
    protected onConnected(event: any) {
        debugger
        console.log("NetNode onConnected!")
        this._is_socket_open = true;
        // 如果设置了鉴权回调，在连接完成后进入鉴权阶段，等待鉴权结束
        if (this._connectedCallback !== null) {
            this._state = NetChannelState.Checking;
            this._connectedCallback();
        } else {
            this.onChecked();
        }

        this.onChecked();
        console.log("NetNode onConnected! state =" + this._state);
    }

    // 连接验证成功，进入工作状态
    protected onChecked() {
        console.log("NetNode onChecked!")
        this._state = NetChannelState.Working;

        // 重发待发送信息
        console.log(`NetNode flush ${this._request_array.length} request`)
        if (this._request_array.length > 0) {
            for (var i = 0; i < this._request_array.length;) {
                let req = this._request_array[i];
                this._socket!.send(req.data);
                if (req.rspObject == null || req.rspCode <= 0) {
                    this._request_array.splice(i, 1);
                } else {
                    ++i;
                }
            }
        }
    }
    // 接收到一个完整的消息包
    protected onMessage(msg: any): void {
        // console.log(`NetNode onMessage status = ` + this._state);
        this.resetReceiveTimer();

        this.resetHeartTimer();

        let rspCode = 11123;
        console.log(`NetNode onMessage rspCode = ` + rspCode);
        // 优先触发request队列
        if (this._request_array.length > 0) {
            for (let reqIdx in this._request_array) {
                let req = this._request_array[reqIdx];
                if (req.rspCode == rspCode && req.rspObject) {
                    console.log(`NetNode execute request rspCode ${rspCode}`);
                    this._callback_executor!(req.rspObject, msg);
                    this._request_array.splice(parseInt(reqIdx), 1);
                    break;
                }
            }
            console.log(`NetNode still has ${this._request_array.length} request watting`);
            if (this._request_array.length == 0) {
                // todo 
            }
        }

        let listeners = this._listener[rspCode];
        if (null != listeners) {
            for (const rsp of listeners) {
                console.log(`NetNode execute listener cmd ${rspCode}`);
                this._callback_executor!(rsp, msg);
            }
        }
    }

    protected resetReceiveTimer() {
        if (this._receive_timer !== null) {
            clearTimeout(this._receive_timer);
        }

        this._receive_timer = setTimeout(() => {
            console.warn("NetNode _receive_timer close socket!");
            this._socket!.close();
        }, this._server_config.receiveTimeOutInterval);
    }

    protected resetHeartTimer() {
        if (this._heart_timer !== null) {
            clearTimeout(this._heart_timer);
        }

        this._heart_timer = setTimeout(() => {
            console.log("NetNode _heart_timer send Hearbeat")
            // todo send heartbeat
            this.send(JSON.stringify({code:"heartbeat",data:"ping"}));
        }, this._server_config.heartInterval);
    }
    protected onError(event: any) {
        console.error(event);
    }

    protected clearTimer() {
        if (this._receive_timer !== null) {
            clearTimeout(this._receive_timer);
        }
        if (this._heart_timer !== null) {
            clearTimeout(this._heart_timer);
        }
        if (this._reconnect_timer !== null) {
            clearTimeout(this._reconnect_timer);
        }
    }
    protected isAutoReconnect() {
        console.log(this._reconnect_times)
        return this._reconnect_times >= 0;
    }
    protected onClosed(event: any) {
        this.clearTimer();

        // 执行断线回调，返回false表示不进行重连
        if (this._disconnect_callback && !this._disconnect_callback()) {
            console.log(`disconnect return!`)
            return;
        }

        // 自动重连
        if (this.isAutoReconnect()) {
            console.log("reconnet")
            this._reconnect_timer = setTimeout(() => {
                debugger
                this._socket!.close();
                this._state = NetChannelState.Closed;
                this.connect();
                if (this._reconnect_times >= 0) {
                    this._reconnect_times -= 1;
                }
            }, this._server_config.reconnectInterval);
        } else {
            this._state = NetChannelState.Closed;
        }
    }

    public close(code?: number, reason?: string) {
        this.clearTimer();
        this._listener = {};
        this._request_array.length = 0;

        if (this._socket) {
            this._socket.close(code, reason);
        } else {
            this._state = NetChannelState.Closed;
        }
    }

    // 只是关闭Socket套接字（仍然重用缓存与当前状态）
    public closeSocket(code?: number, reason?: string) {
        if (this._socket) {
            this._socket.close(code, reason);
        }
    }

    // 发起请求，如果当前处于重连中，进入缓存列表等待重连完成后发送
    public send(buf: TData, force: boolean = false): number {
        if (this._state == NetChannelState.Working || force) {
            console.log(`socket send ...`);
            return this._socket!.send(buf);
        } else if (this._state == NetChannelState.Checking ||
            this._state == NetChannelState.Connecting) {
            this._request_array.push({
                data: buf,
                rspCode: 0,
                rspObject: null
            });
            console.log("NetNode socket is busy, push to send buffer, current state is " + this._state);
            return 0;
        } else {
            console.error("NetNode request error! current state is " + this._state);
            return -1;
        }
    }

    // 发起请求，并进入缓存列表
    public request(data: TData, rspCode: number, rspObject: CallbackObj, force: boolean = false) {
        if (this._state == NetChannelState.Working || force) {
            this._socket!.send(data);
        }
        console.log(`NetNode request with timeout for ${rspCode}`);
        // 进入发送缓存列表
        this._request_array.push({
            data, rspCode, rspObject
        });

    }

    // 唯一request，确保没有同一响应的请求（避免一个请求重复发送，netTips界面的屏蔽也是一个好的方法）
    public requestUnique(data: TData, rspCode: number, rspObject: CallbackObj, force: boolean = false): boolean {
        for (let i = 0; i < this._request_array.length; ++i) {
            if (this._request_array[i].rspCode == rspCode) {
                console.log(`NetNode requestUnique faile for ${rspCode}`);
                return false;
            }
        }
        this.request(data, rspCode, rspObject, force);
        return true;
    }

    /********************** 回调相关处理 *********************/
    public setResponeHandler(code: number, callback: (code: number, data: any) => void, target?: any): boolean {
        if (callback == null) {
            console.error(`NetNode setResponeHandler error ${code}`);
            return false;
        }
        this._listener[code] = [{ target, callback }];
        return true;
    }

    public addResponeHandler(code: number, callback: (code: number, data: any) => void, target?: any): boolean {
        if (callback == null) {
            console.error(`NetNode addResponeHandler error ${code}`);
            return false;
        }
        let rspObject = { target, callback };
        if (null == this._listener[code]) {
            this._listener[code] = [rspObject];
        } else {
            let index = this.getNetListenersIndex(code, rspObject);
            if (-1 == index) {
                this._listener[code]!.push(rspObject);
            }
        }
        return true;
    }
    protected getNetListenersIndex(code: number, rspObject: CallbackObj): number {
        let index = -1;
        for (let i = 0; i < this._listener[code]!.length; i++) {
            let iterator = this._listener[code]![i];
            if (iterator.callback == rspObject.callback
                && iterator.target == rspObject.target) {
                index = i;
                break;
            }
        }
        return index;
    }

    
    public rejectReconnect() {
        this._reconnect_times = -1;
        this.clearTimer();
    }
}