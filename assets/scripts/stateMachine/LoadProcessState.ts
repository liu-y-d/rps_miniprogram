import { CWebSocket } from "../base/net/CWebSocket";
import { NetChannel, TData } from "../base/net/NetChannel";
import { NetChannelManager } from "../base/net/NetChannelManager";
import { IProcessStateNode } from "./IProcessStateNode";
import {ProcessStateMachineManager} from "db://assets/scripts/stateMachine/ProcessStateMachineManager";
import {ProcessStateEnum} from "db://assets/scripts/stateMachine/ProcessStateEnum";
import { director,find } from "cc";
import CommonProgressBar from "db://assets/scripts/CommonProgressBar";

export class LoadProcessState implements IProcessStateNode {
    readonly key = ProcessStateEnum.load;
    onInit () {
        let channel = new NetChannel({
            url: 'ws://127.0.0.1:9000/rps-game/game',
            heartInterval: 1000,
            receiveTimeOutInterval: 6000,
            reconnectInterval: 3000,
            autoReconnect: 3
        });
        channel.init(new CWebSocket(),null,()=>{director.loadScene("Main",()=>{ProcessStateMachineManager.getInstance().change(ProcessStateEnum.main);})});
        channel.setResponeHandler(0, (code: number, data: TData) => {

        });
        let progressBarNode = find('Canvas/ProgressBar');
        let progressBar = progressBarNode.getComponent(CommonProgressBar);
        NetChannelManager.getInstance().setNetNode(channel, "main");
        director.preloadScene("Main", (completedCount, totalCount, item) =>{
            progressBar.num = completedCount / totalCount;
            progressBar.show();
        }, function(){
            progressBar.hide();
            ProcessStateMachineManager.getInstance().change(ProcessStateEnum.login);
        })
    }
    onExit() {

    }
    onUpdate() {

    }
    onHandlerMessage() {
        
    }


    //预加载场景并获得加载进度
    // director.preloadScene('Game', function (completedCount, totalCount, item) {
    //     //可以把进度数据打出来
    //     progressBar.num = completedCount / totalCount;
    //     progressBar.show();
    // }, function () {
    //     progressBar.hide();
    //     //加载场景
    //     cc.director.loadScene("Game", function (a, b, c) {
    //         СameraСontrol.newGame();
    //     });
    // });
    // onProgress (completedCount, totalCount, item){
    //     progressBar.num = completedCount / totalCount;
    //     progressBar.show();
    //
    //     // this.loader.string = Math.floor(completedCount/totalCount * 100) + "%";
    //
    // }
}