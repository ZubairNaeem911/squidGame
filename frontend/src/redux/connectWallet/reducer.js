import {
    SUCCESS_CONNECTION, FAILING_CONNECTION, IS_NOT_INSTALLED,
    CONTRACT_INSTANCE,
    IS_INSTALLED, ACCOUNTS_CHANGE,
    STAGES_DATA, ALL_USERS_DATA, MY_NFT_DATA, WALLET_NFTS,
    TOKEN_BALANCE, GLOBAL_STAGE,LOADER_STATE_FALSE,LOADER_STATE_TRUE,SET_LATEST_STAGES,TRESUARY_BALANCE,RELOAD_POPUP_TRUE,RELOAD_POPUP_FALSE,COUNTDOWN_LOADER_TRUE,
    COUNTDOWN_LOADER_FALSE
} from '../actionType';

const initialState = {
    walletAddress: '',
    success: false,
    errorConnection: "",
    isInstalled: false,
    accounts: {},
    flagAccount: false,
    contractInstance: "",
    signerWallet: "",
    safetiles : [],
    stage : 0,
    // nftData: [],
    allPlayerIds: [],
    globalStage: 0,
    stagesUserData: [],
    usersData: [],
    // myNftData : [],
    startGameTime : 0,
    // nftIds: [],
    balance: 0 ,
    latestTimestampOfUsers : 0,
    gameInitializeDay : 0,
    wrappedEtherInstance:"",
    isHybridEnd:true,
    loaderRedux:false,
    ownerAddress:'',
    totalReward:0,
    gameEndDays:0,
    totalReward:0,
    countdownLoader: null,
    remainingNftLoader: null,
    countDownStageNumber:0,
    winningDayEnd:false
    // buyBackCurve : [],
    // tilesNumber:1
}

const WalletReducer = (state = initialState, action) => {
    switch (action.type) {
        case SUCCESS_CONNECTION:
            return {
                ...state,
                walletAddress: action.payload,
                success: true
            }
        case FAILING_CONNECTION:
            return {
                ...state,
                errorConnection: action.payload
            }
        case IS_INSTALLED:
            return {
                ...state,
                isInstalled: action.payload
            }
        case IS_NOT_INSTALLED:
            return {
                ...state,
                isInstalled: action.payload
            }
        case ACCOUNTS_CHANGE:
            return {
                ...state,
                accounts: action.payload,
                flagAccount: true
            }
        case CONTRACT_INSTANCE:
            return {
                ...state,
                contractInstance: action.payload.contractInstance,
                signerWallet: action.payload.signerWallet,
                safetiles : action.payload.safetiles,
                allPlayerIds :action.payload.allPlayerIds,
                globalStage: action.payload.globalStage,
                startGameTime : action.payload.startGameTime,
                // nftIds : action.payload.nftIds,
                latestTimestampOfUsers : action.payload.latestTimestampOfUsers,
                wrappedEtherInstance:action.payload.wrappedEtherInstance,
                gameInitializeDay : action.payload.gameInitializeDay,
                lastJumpTime : action.payload.lastJumpTime,
                isHybridEnd:action.payload.isHybridEnd,
                ownerAddress:action.payload.ownerAddress,
                totalReward:action.payload.totalReward,
                gameEndDays:action.payload.gameEndDays,
                countDownStageNumber:action.payload.countDownStageNumber,
                buyBackCurve : action.payload.buyBackCurve,
                winningDayEnd:action.payload.winningDayEnd
                // tilesNumber:action.payload.tilesNumber

            }
        case STAGES_DATA:
            return{
                ...state,
                stagesUserData: action.payload
            }
       
        case ALL_USERS_DATA:
            return {
                ...state,
                usersData: action.payload
            }
        
        case TOKEN_BALANCE:
            return {
                ...state,
                balance: action.payload
            }
        case GLOBAL_STAGE:
            return {
                ...state,
                globalStage: action.payload
                
            }
        
        case LOADER_STATE_FALSE:{
            return{
                ...state,
                loaderRedux:false
            }
        }

        case LOADER_STATE_TRUE:{
            return{
                ...state,
                loaderRedux:true
            }
        }

        case TRESUARY_BALANCE:{
            return{
                ...state,
                totalReward:action.payload
            }
        }

        case RELOAD_POPUP_TRUE:{
            return{
                ...state,
                reloadPopUp: action.payload

            }
        }
        case RELOAD_POPUP_FALSE:{
            return{
                ...state,
                reloadPopUp: action.payload,
            }
        }

        case COUNTDOWN_LOADER_TRUE:{
            return{
                ...state,
                countdownLoader: action.payload

            }
        }
        case COUNTDOWN_LOADER_FALSE:{
            return{
                ...state,
                countdownLoader: action.payload,
                remainingNftLoader: true
            }
        }
        default:
            return state;
    }
}

export default WalletReducer