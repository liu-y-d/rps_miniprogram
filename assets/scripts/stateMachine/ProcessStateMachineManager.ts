import { ProcessStateMachine } from "./ProcessStateMachine";
import {LoadProcessState} from "db://assets/scripts/stateMachine/LoadProcessState";
import {LoginProcessState} from "db://assets/scripts/stateMachine/LoginProcessState";
import {MainProcessState} from "db://assets/scripts/stateMachine/MainProcessState";

/**
 * 流程状态机管理类
 */
export class ProcessStateMachineManager {
    private static _instance: ProcessStateMachineManager;
    public static getInstance(): ProcessStateMachineManager {
        if (!this._instance) {
            this._instance = new ProcessStateMachineManager();
        }
        return this._instance;
    }
    
    private _state_machine : ProcessStateMachine = new ProcessStateMachine();

    public init():void {
        let loadProcessState = new LoadProcessState();
        let loginProcessState = new LoginProcessState();
        let mainProcessState = new MainProcessState();
        this._state_machine.addNode(loadProcessState.key,loadProcessState);
        this._state_machine.addNode(loginProcessState.key,loginProcessState);
        this._state_machine.addNode(mainProcessState.key,mainProcessState);
    }

    /**
     * 转换流程
     * @param key
     */
    public change(key: string) {
        this._state_machine.swith(key);
    }
}