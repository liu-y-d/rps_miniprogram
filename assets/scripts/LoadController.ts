import { _decorator, Component, Node } from 'cc';
import {ProcessStateMachineManager} from "db://assets/scripts/stateMachine/ProcessStateMachineManager";
import {ProcessStateEnum} from "db://assets/scripts/stateMachine/ProcessStateEnum";
const { ccclass, property } = _decorator;
import { director } from "cc";
@ccclass('LoadController')
export class LoadController extends Component {
    start() {
        ProcessStateMachineManager.getInstance().init();
        ProcessStateMachineManager.getInstance().change(ProcessStateEnum.load);

    }

    update(deltaTime: number) {
        
    }
}

