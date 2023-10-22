import { IProcessStateNode } from "./IProcessStateNode";

/**
 * 流程状态机
 */
export class ProcessStateMachine {

    private _nodes: { [key: string]: IProcessStateNode } | null;

    private _cur_node: IProcessStateNode | null;

    private _pre_node: IProcessStateNode | null;
    constructor() {
        this._nodes = {};
    }

    /**
     * 添加状态节点
     * @param key 节点key
     * @param node 状态节点
     */
    public addNode(key: string, node: IProcessStateNode) {
        if (key && node) {
            if (!this._nodes.hasOwnProperty(key)) {
                this._nodes[key] = node;
            }
        }
    }

    /**
     * 获取当前运行的节点的key
     * @returns 当前运行的节点的key
     */
    public getCurNodeKey() {
        return this._cur_node != null ? this._cur_node.key : null;
    }

    /**
     * 获取上一个的节点的key
     * @returns 上一个的节点的key
     */
    public getPreNodeKey() {
        return this._pre_node != null ? this._pre_node.key : null;
    }
    
    /**
     * 启动状态机
     * @param key 节点key
     */
    public run(key:string) {
        if(!key) {
            console.error("key error",key);
        }
        let node = this._nodes[key];
        if(!node) {
            console.error("key not fount",key);
        }
        this._cur_node = node;
        this._pre_node = node;
        this._cur_node.onInit();
    }

    /**
     * 帧更新
     */
    public update() {
        if(this._cur_node) {
            this._cur_node.onUpdate();
        }
    }

    /**
     * 切换节点
     * @param key 
     */
    public swith(key: string) {
        if(!(key && this._nodes[key])) {
            console.error("key error",key);
        }
        this._pre_node = this._cur_node;
        if ( this._cur_node) {
            this._cur_node.onExit();
        }
        this._cur_node = this._nodes[key];
        this._cur_node.onInit();
    } 

    /**
     * 返回上一个节点
     */
    public revertToPreNode(){
        this.swith(this.getPreNodeKey());
    }


}