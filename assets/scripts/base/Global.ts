import { sys } from 'cc';
export interface PlayerInfo {
    playerId:string,
    nickName:string,
    avatarUrl:string
}
export class Global{
    private static _instance: Global;
    public static getInstance(): Global {
        if (!this._instance) {
            this._instance = new Global();
        }
        return this._instance;
    }

    public setPlayerInfo(playerInfo: PlayerInfo) {
        sys.localStorage.setItem("playerInfo", JSON.stringify(playerInfo));
    }
    public getPlayerInfo(): PlayerInfo {
        return JSON.parse(sys.localStorage.getItem('playerInfo'))
    }

}