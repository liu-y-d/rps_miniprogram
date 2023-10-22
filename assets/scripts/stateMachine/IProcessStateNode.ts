/**
 * 流程状态机节点接口
 */
export interface IProcessStateNode {
    /**
     * 节点key
     */
    key: string,
    /**
     * 节点初始化
     */
    onInit(),

    /**
     * 节点 退出
     */
    onExit(),

    /**
     * 帧调用
     */
    onUpdate(),

    /**
     * 触发消息事件
     */
    onHandlerMessage()
}