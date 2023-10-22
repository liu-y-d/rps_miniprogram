import { IProcessStateNode } from "./IProcessStateNode";
import {ProcessStateEnum} from "db://assets/scripts/stateMachine/ProcessStateEnum";
import {NetChannelManager} from "db://assets/scripts/base/net/NetChannelManager";
import {ProcessStateMachineManager} from "db://assets/scripts/stateMachine/ProcessStateMachineManager";
import { sys } from 'cc';
import {Global} from "db://assets/scripts/base/Global";
export class LoginProcessState implements IProcessStateNode {
    readonly key = ProcessStateEnum.login;

    onExit() {
    }

    onHandlerMessage() {
    }

    onInit() {
        const wx = window['wx'];//避开ts语法检测
        const info = wx.getSystemInfoSync();//立即获取系统信息
        const w = info.screenWidth;//屏幕宽
        const h = info.screenHeight;//屏幕高
        let playerInfo = {
            playerId:'',
            nickName:'',
            avatarUrl:''
        };
        wx.login({
            success(res) {
                if (res.code) {
                    // window.wx.getSystemInfoSync().screenHeight
                    // window.wx.getSystemInfoSync().screenHeight
                    console.log("code:",res.code)
                    let button = wx.createUserInfoButton({
                        type: 'text',
                        text: '点击屏幕任意地方进入游戏',
                        style: {
                            left: 0,
                            top: 0,
                            width: w,
                            height: h,
                            backgroundColor: '#00000000',//最后两位为透明度
                            color: '#ffffff',
                            fontSize: 20,
                            textAlign: "center",
                            lineHeight: h,
                        }
                    })
                    let code = res.code;
                    button.onTap((res) => {
                        // 此处可以获取到用户信息
                        console.log("userInfo",res)
                        playerInfo.nickName = res.userInfo.nickName;
                        playerInfo.avatarUrl = res.userInfo.avatarUrl;
                        //发起网络请求
                        wx.request({
                            url: "http://127.0.0.1:9000/rps-admin/auth/getToken", //仅为示例，并非真实的接口地址
                            method: "POST",
                            header: {
                                'content-type': 'application/json' // 默认值
                            },
                            data: {
                                "code": code,
                                "rawData": res.rawData,
                                "signature":res.signature,
                                "encryptedData": res.encryptedData,
                                "iv": res.iv
                            },
                            dataType:"json",
                            success(res) {
                                console.log("playerId",res.data.data.playerId)
                                console.log("accessToken",res.data.data.accessToken)
                                playerInfo.playerId = res.data.data.playerId;
                                Global.getInstance().setPlayerInfo(playerInfo);
                                NetChannelManager.getInstance().connect("main", "bearer " + res.data.data.accessToken);
                                button.destroy();
                            }
                        })
                    })

                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })

    }

    onUpdate() {
    }
    
}