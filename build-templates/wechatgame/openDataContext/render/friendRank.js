import {showLoading} from "../index";

export let friendRankData = {
    data: [
        /*
        {
            rankScore: 0,
            avatarUrl: '',
            nickname: '',
        },
        */
    ],
    self: null,
    selfIndex: null,
};
/**
 * 获取好友排行榜列表
 */
export function getFriendRankData(key,userId, callback) {
    wx.getFriendCloudStorage({
        keyList: [key],
        success: res => {
            friendRankData.data = res.data;
            friendRankData.data.sort((a, b) => {
                return b.KVDataList[0].value.actual_score - a.KVDataList[0].value.actual_score
            });
            friendRankData.data.forEach((value, index)=>{
                if (friendRankData.self == null && value.openid === userId) {
                    friendRankData.selfIndex = index;
                    friendRankData.self = value;
                }
            })
            console.log("getFriendData success--------", res);

            callback && callback();
        },
        fail: res => {
            console.log("getFriendData fail--------", res);
            callback && callback(res.data);
        },
    });
}