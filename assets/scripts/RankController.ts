import { _decorator, Component, Node, Button,find,Prefab,instantiate,Sprite } from 'cc';
import {PrefabController} from "db://assets/scripts/PrefabController";
import {Global} from "db://assets/scripts/base/Global";
const { ccclass, property } = _decorator;

@ccclass('RankController')
export class RankController extends Component {

    @property(Node)
    private closeBtnNode: Node = null;

    private static instance: RankController = null;

    protected onLoad() {
        RankController.instance = this;

        // RankController.instance.node.addChild(instantiate(find('Canvas').getComponent(PrefabController).loading));

        // this.closeBtnNode.on('touchend', RankController.hide, this);
        this.closeBtnNode.on(Button.EventType.CLICK, RankController.hide, this);
        /**
         * 向开放数据域发送消息
         */
        window['wx'].getOpenDataContext().postMessage({
            value: 'rankData',
            userId: Global.getInstance().getPlayerInfo().playerId
        });
    }

    public static hide() {
        RankController.instance.node.removeFromParent();
    }

    update () {
        // console.log(RankController.instance.node.getChildByName('WXSubContentView'))
        // if (RankController.instance.node.getChildByName('WXSubContentView').getComponent(Sprite).spriteFrame!=null) {
        //     let loading = RankController.instance.node.getChildByName('Loading');
        //     if (loading) {
        //         loading.removeFromParent();
        //     }
        // }
    }
    /**
     * 设置用户的分数
     * @param value
     */
    // public static setScore(value: number) {
    //     const wx = window['wx'];
    //     wx.postMessage({
    //         event: 'setScore',
    //         score: value
    //     });
    // }
    //
    // /**
    //  * 获取排行榜
    //  */
    // public static getRank() {
    //     const wx = window['wx'];
    //     wx.postMessage({
    //         event: 'getRank'
    //     });
    // }
}

