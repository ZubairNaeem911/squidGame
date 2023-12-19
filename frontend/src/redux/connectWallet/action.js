import { ethers } from "ethers";
import axios from "axios";

import {
  FAILING_CONNECTION,
  IS_INSTALLED,
  IS_NOT_INSTALLED,
  ACCOUNTS_CHANGE,
  CONTRACT_INSTANCE,
  STAGES_DATA,
  TOKEN_BALANCE,
  GLOBAL_STAGE,
  LOADER_STATE_TRUE,
  LOADER_STATE_FALSE,
  TRESUARY_BALANCE,
  COUNTDOWN_LOADER_TRUE,
  COUNTDOWN_LOADER_FALSE,
} from "../actionType";
import { toast } from "react-toastify";
import contractAbi from "../../utils/contract_abi/contractAbi.json";
import tokenAbi from "../../utils/contract_abi/tokenContractAbi.json";

export const MetamaskConnection = () => async (dispatch) => {
 
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const network = await provider.getNetwork();

      if (provider) {
        if (network.chainId == process.env.REACT_APP_CHAIN_ID_AVALANCHE) {
          try {
            dispatch({
              type: LOADER_STATE_TRUE,
            });

            console.log("?????????ACTION LOADER TRUE")
            await provider.send("eth_requestAccounts", []);
            let signer = provider.getSigner();
            let address = await signer.getAddress();
            // let balance = await checkBalance(address, provider);
            let contractInstance = new ethers.Contract(
              process.env.REACT_APP_CONTRACT_ADDRESS,
              contractAbi,
              signer
            );
            const tokenInstance = new ethers.Contract(
              process.env.REACT_APP_WRAPPED_ETHER,
              tokenAbi,
              signer
            );
            let globalStageLocal = "";

            let dataForCounter = false;
            let safeTilesData = "";

            if (contractInstance) {
              let contractCallPromises = [];
              contractCallPromises.push(contractInstance.getAll());

              contractCallPromises.push(
                contractInstance.gameStatusInitialized(1)
              );
              contractCallPromises.push(tokenInstance.balanceOf(address));
              contractCallPromises.push(contractInstance.isWinningDayEnd());
              Promise.all(contractCallPromises).then(async (x) => {
                const currentTime = Math.floor(Date.now() / 1000);
                const lastJumpTime = Number(x[1].lastUpdateTimeStamp);
                const adminStartTime = Number(x[1].startAt);
                const latestTimestampOfUsers = lastJumpTime == 0 || undefined ? 0 : (currentTime - lastJumpTime) / process.env.REACT_APP_TIMESLOT;

                const gameInitializeDay = adminStartTime == 0 ? 0 : (currentTime - adminStartTime) / process.env.REACT_APP_TIMESLOT;

                globalStageLocal = Number(x[1].stageNumber);
                safeTilesData = x[0];
                const countDownStageNumber = globalStageLocal > 0 && safeTilesData[globalStageLocal - 1] !== undefined
                  ? globalStageLocal : globalStageLocal > 1 ? globalStageLocal - 1 : 0;


                if (globalStageLocal > 0 && x[0][countDownStageNumber - 1] !== undefined) {

                  const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/v1/counter/data`,
                    {
                      walletAddress: address,
                      globalStage: countDownStageNumber,
                      gameNumber: 2,
                    }
                  );

                  if (
                    latestTimestampOfUsers > Number(900) ||
                    (x[1].ishybridEnd === false &&
                      gameInitializeDay !== 0 &&
                      latestTimestampOfUsers >= 1 && response.data.success == false)
                  ) {

                    dataForCounter = false;
                  } else {


                    dataForCounter = response.data.success;
                  }
                }

                const data = {
                  contractInstance: contractInstance,
                  signerWallet: address,
                  safetiles: safeTilesForGame(x[0]),
                  globalStage: Number(x[1].stageNumber),
                  startGameTime: Number(x[1].startAt),
                  latestTimestampOfUsers: latestTimestampOfUsers,
                  wrappedEtherInstance: tokenInstance,
                  gameInitializeDay: gameInitializeDay,
                  lastJumpTime: lastJumpTime,
                  ownerAddress: x[1].owner,
                  gameEndDays: Number(x[1].gameEnded),
                  totalReward:
                    (Number(x[1].ethnologyTeam)) /
                    10 ** 18,
                  countDownStageNumber: countDownStageNumber,
                  isHybridEnd:x[1].ishybridEnd,
                  winningDayEnd:x[3]
                };
                let promises = [];
              for (let i = 0; i <= globalStageLocal; i++) {
                promises.push(contractInstance.getUsers(i));
              }
              Promise.all(promises).then((x) => {
                if (x.length > 0) {
                  let formattedData = [];
                  x.forEach((item, index) => {
                    formattedData.push({ stageNumber: index, stageData: item });
                  });
                  dispatch({
                    type: STAGES_DATA,
                    payload: formattedData,
                  });
                } else {
                  dispatch({
                    type: STAGES_DATA,
                    payload: [],
                  });
                }
              });
              dispatch({
                type: TOKEN_BALANCE,
                payload: Number(x[2] / 10 ** 18),
              });

              dispatch({
                type: CONTRACT_INSTANCE,
                payload: data,
              });

              dispatch({
                type: LOADER_STATE_FALSE,
              });
              console.log("?????????ACTION LOADER FALSE")
              if (dataForCounter == true) {
                dispatch({
                  type: COUNTDOWN_LOADER_TRUE,
                  payload: true,
                });
              } else {
                dispatch({
                  type: COUNTDOWN_LOADER_FALSE,
                  payload: false,
                });
              }
            });

            }

          } catch (error) {
            dispatch({
              type: LOADER_STATE_FALSE,
            });
            dispatch({
              type: FAILING_CONNECTION,
              payload: error,
            });
            if (error.code === 4001) {
              toast.error("Error while connecting");
            } else if (error.code === -32002) {
              toast.error(error.message);
            } else {
              toast.error(error.message);
            }
          }
        } else {
          toast.error("Please Connect to Avalanche first");
        }
      }
    } else {
      alert("Metamask not installed");
    }
  
};

const safeTilesForGame = (safeTiles) => {
  let array = [];
  for (let i = 0; i < safeTiles?.length; i++) {
    let data = {
      stage: i,
      safeTile: Number(safeTiles[i]) ,
    };
    array.push(data);
  }
  return array;
};

export const closeModal = () => async (dispatch) => {
  dispatch({
    type: COUNTDOWN_LOADER_FALSE,
    payload: false,
  });
};

export const getLatestData = (contractInstance) => async (dispatch) => {
  let gameStatusGlobalData = await contractInstance.gameStatusInitialized(1);
  const totalReward = (Number(gameStatusGlobalData.ethnologyTeam) ) /    10 ** 18;
  let globalStage = Number(gameStatusGlobalData.stageNumber);
  let promises = [];

  for (let i = 0; i <= globalStage; i++) {
    promises.push(contractInstance.getUsers(i));
  }
  Promise.all(promises).then((x) => {
    if (x.length > 0) {
      let formattedData = [];
      x.forEach((item, index) => {
        formattedData.push({ stageNumber: index, stageData: item });
      });
      dispatch({
        type: GLOBAL_STAGE,
        payload: globalStage,
      });
      dispatch({
        type: STAGES_DATA,
        payload: formattedData,
      });

      dispatch({
        type: TRESUARY_BALANCE,
        payload: totalReward ,
      });

      dispatch({
        type: LOADER_STATE_FALSE,
      });
      console.log("?????????? GET LATEST DATA LOADER FALSE")
    } else {
      dispatch({
        type: GLOBAL_STAGE,
        payload: globalStage,
      });
      dispatch({
        type: STAGES_DATA,
        payload: [],
      });
      dispatch({
        type: LOADER_STATE_FALSE,
      });
    }
  });
};

export const CheckMetaMaskInstalled = () => async (dispatch) => {
  window.addEventListener("load", () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        dispatch({
          type: IS_INSTALLED,
          payload: true,
        });
      } else {
        dispatch({
          type: IS_NOT_INSTALLED,
          payload: false,
        });
      }
    } catch (error) {
      toast.error("error in metamask connection");
    }
  });
};

export const accountsCheck = () => async (dispatch) => {
  window.addEventListener("load", () => {
    try {
      window.ethereum.on("accountsChanged", (accounts) => {
        let data = {};
        if (accounts.length > 0) {
          data.account = accounts;
          data.length = accounts.length;
          dispatch({
            type: ACCOUNTS_CHANGE,
            payload: data,
          });
        }
      });
    } catch (error) {
      toast.error("error in accounts changing in metamask");
    }
  });
};
