import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Loading')
export class Loading extends Component {
    start() {

    }

    update(deltaTime: number) {
        this.node.angle -= 1;
    }

    show() {
        this.node.active =true;
    }
    hide() {
        this.node.active =false;
    }
}

