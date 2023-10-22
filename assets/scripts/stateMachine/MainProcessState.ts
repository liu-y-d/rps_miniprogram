import {IProcessStateNode} from "db://assets/scripts/stateMachine/IProcessStateNode";
import {ProcessStateEnum} from "db://assets/scripts/stateMachine/ProcessStateEnum";
import {find} from 'cc';
export class MainProcessState implements IProcessStateNode {
    readonly key =  ProcessStateEnum.main;

    mainNode = null;

    onExit() {
    }

    onHandlerMessage() {
    }

    onInit() {
        window['wx'].setUserCloudStorage({
            KVDataList: [{"key":'friendRank', "value": '{"actual_rank":"大神1", "actual_score":"100"}'}]
            // KVDataList: [{"key":'friendRank', "value": '19'}]
        }).then(res=>{
            console.log("上传成功")
        }).catch(err=>{
        });
        // window['wx'].setUserCloudStorage({
        //     KVDataList: [{"key":'friendRank', "value": '{"actual_rank":"大神2", "actual_score":"90"}'}]
        //     // KVDataList: [{"key":'friendRank', "value": '19'}]
        // }).then(res=>{
        //     console.log("上传成功")
        // }).catch(err=>{
        // });
    }

    onUpdate() {
    }

}