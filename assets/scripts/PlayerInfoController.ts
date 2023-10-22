import { _decorator, Component, Node, assetManager,ImageAsset,SpriteFrame,Texture2D,Sprite,Label } from 'cc';
import {Global} from "db://assets/scripts/base/Global";
const { ccclass, property } = _decorator;

@ccclass('PlayerInfoController')
export class PlayerInfoController extends Component {

    onLoad() {
        let self = this;
        assetManager.loadRemote<ImageAsset>(Global.getInstance().getPlayerInfo().avatarUrl, {ext: '.png'}, function (err, imageAsset) {
            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = imageAsset;
            spriteFrame.texture = texture;
            self.node.getChildByName('Avatar').getComponent(Sprite).spriteFrame = spriteFrame;
        });
        self.node.getChildByName('NickName').getComponent(Label).string = Global.getInstance().getPlayerInfo().nickName;
    }
}

