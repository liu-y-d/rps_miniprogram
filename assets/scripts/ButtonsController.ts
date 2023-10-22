import { _decorator, Component, Node,Button,find,instantiate } from 'cc';
import {RankController} from "db://assets/scripts/RankController";
import {PrefabController} from "db://assets/scripts/PrefabController";
const { ccclass, property } = _decorator;

@ccclass('ButtonsController')
export class ButtonsController extends Component {

    @property(Node)
    private RankBtn:Node = null;

    onLoad() {
        console.log(123123)
        // this.RankBtn.on('touchend', RankController.show, this);
        this.RankBtn.on(Button.EventType.CLICK, this.rankOnClick, this);
    }
    start() {

    }

    update(deltaTime: number) {
        
    }

    rankOnClick() {
        let canvas = find('Canvas');
        canvas.addChild(instantiate(canvas.getComponent(PrefabController).rankPrefab));
    }
}

