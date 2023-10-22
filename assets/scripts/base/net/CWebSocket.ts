import { ISocket, TData } from "./NetChannel";

export class CWebSocket implements ISocket{
    private _ws: WebSocket | null = null; 
    onConnected: null;
    onMessage: null;
    onError: null;
    onClosed: null;


connect(config: any) {
        if (this._ws) {
            if (this._ws.readyState === WebSocket.CONNECTING) {
                console.log("websocket connecting, wait for a moment...")
                return false;
            }
        }


        let url = null;
        if(config.url && config.token) {
            url = config.url + "?token=" + config.token;
        }

        this._ws = new WebSocket(url);
        // this._ws.binaryType = options.binaryType ? options.binaryType : "arraybuffer";
        this._ws.onmessage = (event) => {
            let onMessage : (msg: TData) => void = this.onMessage!;
            onMessage(event.data);
        };
        this._ws.onopen = this.onConnected;
        this._ws.onerror = this.onError;
        this._ws.onclose = this.onClosed;
        return true;
    }

    send(data: TData) : number {
        if (this._ws && this._ws.readyState == WebSocket.OPEN) {
            this._ws.send(data);
            return 1;
        }
        return -1;
    }

    close(code?: number, reason?: string) {
        if(this._ws) {
            this._ws.close(code, reason);
        }
    }

}