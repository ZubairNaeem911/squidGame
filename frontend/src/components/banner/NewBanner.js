import { React, useEffect, useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import { CheckMetaMaskInstalled, MetamaskConnection } from "../../redux/connectWallet/action";
import { useDispatch, useSelector } from "react-redux";
import { getLatestData } from "../../redux/connectWallet/action";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import Clouds from "../../assets/images/Clouds/cloud.png";
import backgroundVideo from "../../assets/images/background.mp4";
import Sun from "../../assets/images/sun.png";
import Stairs from "../../assets/images/stairs.png";
import Nftfram from "../../assets/images/nft-fram.png";
import Tile12 from "../../assets/images/tile12.png";
import Tile11 from "../../assets/images/tile11.png";
import LeftIcon from "../../assets/images/left-arrow.png";
import RightIcon from "../../assets/images/right-arrow.png";
import TopIcon from "../../assets/images/top-arrow.png";
import BottomIcon from "../../assets/images/bottom-arrow.png";
import ConnectWallet from "../connectWallet/connect";
import Loader from "../Loader/loader";
import Timer from "./time";
import axios from "axios";
import SwitchSideModal from "../Modals/switchSideModal";
import CongratulationModal from "../Modals/congratulationModel";
import NftListModal from "../Modals/nftListModal";
import PlayerListModal from "../Modals/playersListModal";
import MyNftModal from "../Modals/myNftModal";
import NftCardModal from "../Modals/nftCardModal";
import CountdownModal from "../Modals/countDownModal";
import contractAbi from "../../utils/contract_abi/contractAbi.json";
import RemainingNftModal from "../Modals/remainingNftModal";
import GameDataModal from "../Modals/gameDataModal";
import { LOADER_STATE_TRUE, LOADER_STATE_FALSE, GLOBAL_STAGE,TRESUARY_BALANCE } from "../../redux/actionType";
import RestartGameModal from "../Modals/restartGameModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowAltCircleUp,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";

const Banner = (props) => {
  let dispatch = useDispatch();
  const contractData = useSelector((state) => state.contract);

  const [show, setShow] = useState(false);
  const [myNftModal, setmyNftModalShoww] = useState(false);
  const [congratulationShow, setCongratulationShow] = useState(false);
  const [winnerReward, setWinnerReward] = useState(0);
  const [claimAmount, setClaimAmount] = useState(0);
  const [nftListShow, setNftListShow] = useState(false);

  const [LeftMove, SetLeftMove] = useState(false);
  const [RightMove, SetRightMove] = useState(false);
  const [isZeroNfts, setIsZeroNfts] = useState(false);
  const [StimeoutTrue, setStimeoutTrue] = useState(false);
  const [stage, setstage] = useState(contractData.globalStage);
  const [tilenumber, settilenumber] = useState(6);
  const [stages, setstages] = useState(0);
  const [sstages, setsstages] = useState(0);
  const [current, setcurrent] = useState(0);
  const [loader, setLoader] = useState(false);
  // const [safeSides, setSafeSide] = useState([]);
  const [stop, setstop] = useState(false);
  const [usersNft, setusersNft] = useState([]);
  const [userNft, setUserNft] = useState([]);
  const [leftRightModal, setleftRightModal] = useState(false);
  const [countedArray, setCountedArray] = useState([]);
  const [allNftList, setAllNftList] = useState([]);
  const [claimDisable, setclaimDisable] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [myNfts, setMyNfts] = useState([]);
  const [switchSideModal, setSwitchSideModal] = useState(false);
  const [clickedNft, setClickedNft] = useState({});
  const [singlePlayerId, setsinglePlayerId] = useState("");
  const [claim, setClaim] = useState(true);
  const [restartGameModal, setRestartGameModal] = useState(false);
  const [nftCardModal, setNftCardModal] = useState(false);
  const [gameDataModal, setGameDataModal] = useState(false);
  const [stair, setstair] = useState(0);
  const [gameEndModalHandle, setGameEndModalHandle] = useState(false);
  const [reRender, setReRender] = useState(false);
  useEffect(() => {
    getLatestStage();
    dispatch(CheckMetaMaskInstalled());
  }, [contractData.signerWallet]);

  useEffect(() => {
    if (contractData?.signerWallet) {
      availableNFts();
    }
  }, [contractData?.signerWallet]);

  // useEffect(() => {
  //   safeTilesForGame();
  // }, [contractData?.safetiles]);

  useEffect(() => {
    setstages(stage);
  }, [stage]);

  useEffect(() => {
    setcurrent(contractData.globalStage);
  }, [contractData.globalStage]);

  useEffect(() => {
    userDataForStage();
  }, []);

  useEffect(() => {
    userDataForStage();
  }, [contractData.stagesUserData, contractData.globalStage]);
  useEffect(() => {
    if (contractData.countdownLoader == false) {
      setstages(contractData.globalStage);
    }
  }, [contractData.globalStage, contractData.countdownLoader]);

  useEffect(() => {
    window.onload = () => {
      isConnected();
    };

    async function isConnected() {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length) {
        console.log(`You're connected to: ${accounts[0]}`);
        // setConnectionCheck(true)
        dispatch(MetamaskConnection())
      }
    }
  }, [])

  const getLatestStage = async () => {
    if (contractData?.signerWallet) {
      let provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/avalanche_fuji"
      );
      let contractInstance = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        contractAbi,
        provider
      );

      let gameStatusGlobalData = await contractInstance.gameStatusInitialized(1);
      let globalStage = Number(gameStatusGlobalData.stageNumber);
      const isHybridEnd = gameStatusGlobalData.ishybridEnd;
      const tilesNumber =
        globalStage < 5
          ? 5
          : isHybridEnd == false
            ? globalStage
            : globalStage + 1;
      settilenumber(tilesNumber);
    }
  };

  useEffect(() => {
    setstages(stage);
    if (contractData.startGameTime !== 0 && contractData.gameInitializeDay > 0 && contractData.isHybridEnd == false) {
      setstair(13)
    }
    else {
      setstair(stage)
    }
  }, [stage]);

  useEffect(() => {

    if (contractData?.contractInstance) {


      const readEvent = () => {

        contractData.contractInstance.on(
          [
            "ParticipateOfPlayerInGame",
            "ParticipateOfPlayerInBuyBackIn",
            "EntryFee",
            "ParticipatePlayerInLateBuyBackIn",
            // "RestartNFt",
            // "GameReward"
          ], (eventData) => {


            let findUser = allUsers[Number(eventData.args.stage)] !== undefined ? allUsers[Number(eventData.args.stage)].filter(item => item.playerId === eventData.args.playerId) : [];

            if (findUser.length <= 0) {

              updateStageData(eventData);
              setReRender(true);
            }
            


          }
        )
      }
      if (!reRender) {
        readEvent();
      }
    }
  }, [allUsers, reRender])

  const updateStageData = (event) => {

    if (event.event == "ParticipateOfPlayerInGame") {
      let wholeData = allUsers;
      let nftsCount = countedArray;


      wholeData[Number(event.args.stage) - 1].map((data, i) => {
        if (data.playerId == event.args.playerId) {
          // if(contractData?.globalStage !== Number(event.args.globalStage)){
          //   dispatch({
          //     type: GLOBAL_STAGE,
          //     payload: Number(event.args.globalStage),
          //   });
          // }


          if (nftsCount[Number(event.args.stage)] === undefined) {

            let rightUsers = 0;
            let leftUsers = 0;
            event.args.lastJumpSide == true ? rightUsers = rightUsers + 1 : leftUsers = leftUsers + 1;

            nftsCount[Number(event.args.stage)] = { "rightUsers": rightUsers, "leftUsers": leftUsers }

            if (data.lastJumpSide == true) {
              if (nftsCount[Number(event.args.stage) - 1].rightUsers !== 0) {
                nftsCount[Number(event.args.stage) - 1].rightUsers = nftsCount[Number(event.args.stage) - 1] - 1;
              }
            } else {

              if (nftsCount[Number(event.args.stage) - 1].leftUsers !== 0) {
                nftsCount[Number(event.args.stage) - 1].leftUsers = nftsCount[Number(event.args.stage) - 1].leftUsers - 1;
              }

            }

          }
          else {
            event.args.lastJumpSide == true ?
              nftsCount[Number(event.args.stage)].rightUsers = nftsCount[Number(event.args.stage)].rightUsers + 1
              : nftsCount[Number(event.args.stage)].leftUsers = nftsCount[Number(event.args.stage)].leftUsers + 1;

            if (data.lastJumpSide == true) {
              if (nftsCount[Number(event.args.stage) - 1].rightUsers !== 0) {
                nftsCount[Number(event.args.stage) - 1].rightUsers = nftsCount[Number(event.args.stage) - 1] - 1;
              }
            }
            else {
              if (nftsCount[Number(event.args.stage) - 1].leftUsers !== 0) {
                nftsCount[Number(event.args.stage) - 1].leftUsers = nftsCount[Number(event.args.stage) - 1].leftUsers - 1;

              }
            }
          }

          data.stage = event.args.stage;
          data.lastJumpSide = event.args.lastJumpSide;
          data.lastJumpAt = event.args.lastJumpAt;
          data.day = event.args.day;
          if (wholeData[Number(event.args.stage)] !== undefined) {


            wholeData[Number(event.args.stage)].push(data)
          }
          else {

            wholeData[Number(event.args.stage)] = [data];
          }

          let newArray = wholeData[Number(event.args.stage) - 1].filter(item => item.playerId !== event.args.playerId);
          wholeData[Number(event.args.stage) - 1] = newArray;

        }

      })

      const tilesNumber =
        Number(event.args.globalStage) < 5
          ? 5
          : event.args.ishybridEnd == false
            ? Number(event.args.globalStage)
            : Number(event.args.globalStage) + 1;
      settilenumber(tilesNumber);
      setAllUsers([...wholeData]);
      setCountedArray([...nftsCount]);

    }
    if (event.event == "ParticipateOfPlayerInBuyBackIn") {
      liveBuyBackIn(event);
    }
    if (event.event == "EntryFee") {
      if(Number(event.args.failAt) > 0){
        liveRestartNft(event)  
      }
      else{
      liveEntryFee(event)}
    }
    if (event.event == "ParticipatePlayerInLateBuyBackIn") {
      liveLateBuyIn(event)
    }
   
  }
  const liveRestartNft = (event) => {
    const { playerId,failAt,_gameReward } = event.args;
    let wholeData = allUsers;
    // let nftsCount = countedArray;
    wholeData[Number(failAt)].map((data, i) => {
      if (data.playerId == playerId) {
        data.day = ethers.BigNumber.from("0");
        data.stage = ethers.BigNumber.from("0");
        data.lastJumpTime = ethers.BigNumber.from("0");
        data.lastJumpSide = false;
        wholeData[0].push(data)
        let newArray = wholeData[Number(failAt)].filter(item => item.playerId !== playerId);
        wholeData[Number(failAt)] = newArray;
      }
    })

              const amount = (Number(_gameReward)) / 10 ** 18;
              dispatch({
                type: TRESUARY_BALANCE,
                payload: amount ,
              });

    setAllUsers([...wholeData]);
  }

  const generateObject = async (event) => {
    const { day, lastJumpAt, lastJumpSide, nftId, nftSeries, playerId, stage, startAT, userWalletAddress } = event.args;
    const response = await axios
      .post(
        `${process.env.REACT_APP_SERVER_URL}/v1/game/get/metadata`,
        {
          tokenId: Number(event.args.nftId._hex),
          series:
            Number(event.args.nftSeries) == 1
              ? "seriesOne"
              : "seriesTwo",
        },
      );
    let data = {
      day,
      feeStatus: true,
      lastJumpSide,
      lastJumpTime: lastJumpAt,
      metaData: response.data.data,
      nftId,
      nftSeriestype: Number(nftSeries),
      playerId,
      stage: Number(stage),
      startAt: startAT,
      userWalletAddress
    }
    return data;
  }

  const liveLateBuyIn = async (event) => {
    const object = await generateObject(event);
    let wholeData = allUsers;
    let nftsCount = countedArray;

    event.args.lastJumpSide == true ?
      nftsCount[Number(event.args.stage)].rightUsers = nftsCount[Number(event.args.stage)].rightUsers + 1
      : nftsCount[Number(event.args.stage)].leftUsers = nftsCount[Number(event.args.stage)].leftUsers + 1;

    wholeData[Number(event.args.stage)].push(object);
    setAllUsers([...wholeData]);
    setCountedArray([...nftsCount]);
    const amount = (Number(event.args._gameReward)) / 10 ** 18;
    dispatch({
      type: TRESUARY_BALANCE,
      payload: amount ,
    });

  }

  const liveEntryFee = async (event) => {
    const object = await generateObject(event);
    let wholeData = allUsers;
    // let nftsCount = countedArray;
    if (wholeData[Number(event.args.stage)] !== undefined) {

      wholeData[Number(event.args.stage)].push(object)
    }
    else {

      wholeData[Number(event.args.stage)] = [object];
    }

    setAllUsers([...wholeData]);
    const amount = (Number(event.args._gameReward)) / 10 ** 18;
    dispatch({
      type: TRESUARY_BALANCE,
      payload: amount ,
    });

  }

  const liveBuyBackIn = (event) => {
    let wholeData = allUsers;
    let nftsCount = countedArray;

    wholeData[Number(event.args.stage) + 1].map((data, i) => {
      if (data.playerId == event.args.playerId) {


        event.args.lastJumpSide == true ?
          nftsCount[Number(event.args.stage)].rightUsers = nftsCount[Number(event.args.stage)].rightUsers + 1
          : nftsCount[Number(event.args.stage)].leftUsers = nftsCount[Number(event.args.stage)].leftUsers + 1;

        if (data.lastJumpSide == true) {
          if (nftsCount[Number(event.args.stage) + 1].rightUsers !== 0) {
            nftsCount[Number(event.args.stage) + 1].rightUsers = nftsCount[Number(event.args.stage) + 1] - 1;
          }
        }
        else {
          if (nftsCount[Number(event.args.stage) + 1].leftUsers !== 0) {
            nftsCount[Number(event.args.stage) + 1].leftUsers = nftsCount[Number(event.args.stage) + 1].leftUsers - 1;

          }
        }

        data.stage = event.args.stage;
        data.lastJumpSide = event.args.lastJumpSide;
        data.lastJumpAt = event.args.lastJumpAt;
        data.day = event.args.day;
        wholeData[Number(event.args.stage)].push(data);
        let newArray = wholeData[Number(event.args.stage) + 1].filter(item => item.playerId !== event.args.playerId);
        wholeData[Number(event.args.stage) + 1] = newArray;

      }

    });

    const amount = (Number(event.args._gameReward)) / 10 ** 18;
    dispatch({
      type: TRESUARY_BALANCE,
      payload: amount ,
    });
    setAllUsers([...wholeData]);

  }

  const handleShoww = () => {
    myNfts &&
      Object.keys(myNfts).map((i, index) => {
        {
          myNfts[i] &&
            myNfts[i].map((data, key) => {
              if (contractData?.safetiles[Number(data.stage) - 1] !== undefined) {
                if (
                  (data.lastJumpSide == true &&
                    contractData?.safetiles[Number(data.stage) - 1].safeTile >= 50) ||
                  (data.lastJumpSide == false &&
                    contractData?.safetiles[Number(data.stage) - 1].safeTile < 50)
                ) {
                  data.stageStatus = true;
                } else {
                  data.stageStatus = false;
                }
              }
            });
        }
      });
    setmyNftModalShoww(true);
  };

  const handleMyNftModalClose = () => setmyNftModalShoww(false);

  const handleNftListClose = () => {
    // setnftSelected([]);
    // setfirstNftSelected([]);
    setNftListShow(false);
  };

  const handleNftListShow = async () => {
    setNftListShow(true);
  };

  const handleShow = (stageNumber, side) => {
    if (stageNumber !== 0) {
      if (side === false) {
        const result = allUsers[stageNumber].filter(
          (obj) => obj.lastJumpSide == false
        );
        setAllNftList(result);
      }
      if (side === true) {
        const result = allUsers[stageNumber].filter(
          (obj) => obj.lastJumpSide == true
        );
        setAllNftList(result);
      }
    } else {
      setAllNftList(allUsers[stageNumber]);
    }
    setShow(true);
  };

  const handleClose = () => setShow(false);


  const availableNFts = async () => {

    if (contractData?.signerWallet) {
      dispatch({
        type: LOADER_STATE_TRUE,
      });
      console.log("????????? Available Nfts Loaderstatetrue")
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/v1/game/existedNft?walletAddress=${contractData?.signerWallet}`
        // { walletAddress: contractData?.signerWallet }
      );

      setusersNft(response.data.data);
      dispatch({
        type: LOADER_STATE_FALSE,
      });
      console.log("????????? Available Nfts LoaderstateFALSE")
    }
  };

  const participationInGame = async (direction, playerID) => {
    if (contractData?.contractInstance) {
      let participation =
        await contractData?.contractInstance.participateInGame(
          direction,
          playerID
        );

      return participation;
    }
  };

  const back = () => {
    if (stages >= 1) {
      setstop(true);
      setstages(stages - 1);
      setstair(stair - 1);
    } else {
      setstop(false);
    }
  };

  const forward = () => {
    setstop(true);
    if (stages < tilenumber) {
      setstages(stages + 1);
      setstair(stair + 1);
    }
  };

  const leftOrRightMove = async (direction) => {
    if (contractData?.contractInstance) {
      try {
        setLoader(true);
        setleftRightModal(false);
        console.log("?????????? move looader true")
        const side = direction == "left" ? false : true;
        let participation = await participationInGame(side, userNft.playerId);

        let participationSuccess = await participation.wait();
        if (participationSuccess) {
          setsinglePlayerId(userNft.playerId);
          side == false ? SetLeftMove(true) : SetRightMove(true);
          await getLatestStage();
          dispatch(getLatestData(contractData?.contractInstance));
          // setLoader(false);
        console.log("?????????? move looader false")
          
        } else {
          setLoader(false);
          toast.error("Transaction Failed ");
        }
      } catch (error) {
        setLoader(false);
        toast.error(error.error.data.message.split(":")[1]);
      }
    }
  };


  const userDataForStage = async () => {
    if (contractData.stagesUserData.length > 0) {
    //  setLoader(true);
      console.log("?????????? userDataForStage Loaderstatetrue")
      let allUsersArray = [];
      let userArray = [];
      let countArray = [];

      let loopPromises = [];

      contractData.stagesUserData.map((data) => {
        loopPromises.push(
          new Promise(function (resolve1, reject1) {
            let promises = [];
            for (let i = 0; i < data.stageData?.length; i++) {

              if (data.stageData[i].nftId._hex !== "0x00") {
                promises.push(
                  new Promise((resolve, reject) => {
                    axios
                      .post(
                        `${process.env.REACT_APP_SERVER_URL}/v1/game/get/metadata`,
                        {
                          tokenId: Number(data.stageData[i].nftId._hex),
                          series:
                            data.stageData[i].nftSeriestype == 1
                              ? "seriesOne"
                              : "seriesTwo",
                        },
                      )
                      .then((res) => {

                        resolve(
                          {
                            ...data.stageData[i],
                            metaData: res?.data.data
                          }
                        );
                      })
                      .catch((e) => {
                        console.log("CALL? userDataForStage", e);
                        reject(e);
                      });
                  })
                );
              }
            }
            Promise.all(promises).then((x) => {

              let tempUserData = [];
              let leftUsers = [];
              let rightUsers = [];
              if (x.length > 0) {
                x.forEach((item) => {
                  if (item.userWalletAddress == contractData.signerWallet) {
                    tempUserData.push(item);
                  }
                });
              }
              if (data.stageNumber !== 0) {
                leftUsers = x.filter((obj) => obj.lastJumpSide == false);
                rightUsers = x.filter((obj) => obj.lastJumpSide == true);
              }
              const testObj = {
                stage: data.stageNumber,
                usersData: x,
                userArray: tempUserData,
                countArray: {
                  rightUsers: rightUsers.length,
                  leftUsers: leftUsers.length,
                },
              };
              resolve1(testObj);
            });
          })
        )

      });

      Promise.all(loopPromises).then((x) => {
        let zeroNftsCheck = 0;

        x.map((data) => {
          countArray[data.stage] = data.countArray;
          data.usersData?.sort((a) =>
            a.userWalletAddress == contractData?.signerWallet ? -1 : 1
          );
          allUsersArray[data.stage] = data.usersData;
          userArray[data.stage] = data.userArray;
          if (data.userArray.length > 0) {
            zeroNftsCheck = zeroNftsCheck + 1;
          }

        });
        if (
          contractData?.isHybridEnd == false &&
          userArray[contractData.globalStage].length > 0 &&
          contractData.gameInitializeDay !== 0 &&
          contractData?.safetiles[contractData.globalStage - 1] !== undefined
        ) {
          const safeTile = contractData?.safetiles[contractData.globalStage - 1].safeTile;
          let successNfts = false;
          userArray[contractData.globalStage].map((data, i) => {

            if (
              (data.lastJumpSide == false && safeTile < 50) ||
              (data.lastJumpSide == true && safeTile >= 50)
            ) {

              successNfts = true;
            }
          });

          if (successNfts === true) {
            setClaim(true);
          } else {
            setClaim(false);
          }
        } else {
          setClaim(false);
        }
        setIsZeroNfts(zeroNftsCheck > 0 ? false : true);
        setCountedArray(countArray);
        setAllUsers(allUsersArray);
        setMyNfts(userArray);
        SetLeftMove(false);
        SetRightMove(false);
       setLoader(false);
      console.log("?????????? userDataForStage Loaderstate False")
        
      });
    }
  };

  const handleSwitchSideModal = () => {
    setSwitchSideModal(true);
  };

  const closeSwitchSideModal = () => {
    setClickedNft({});
    setSwitchSideModal(false);
  };

  const closeCongratulationModel = () => {
    setCongratulationShow(!congratulationShow);
    setLoader(true);
    // dispatch(getLatestStage(contractData?.contractInstance));
    getLatestStage()
    dispatch(getLatestData(contractData?.contractInstance));
  };

  const handleLoader = (type) => {
    setLoader(type);
  };

  const conditionalModalHandling = (data) => {
    const stage = Number(data.stage);
    setClickedNft(data);
    if (
      contractData?.globalStage == stage &&
      stage !== 0 &&
      contractData?.safetiles[contractData?.globalStage - 1]?.safeTile == undefined
    ) {
      if (contractData.signerWallet == data.userWalletAddress) {
        setClickedNft(data);
        handleSwitchSideModal();
      } else {
        setNftCardModal(true);
      }
    } else {
      handleLeftRightModal(data);
    }
  };

  const handleLeftRightModal = async (data) => {
    if (contractData.signerWallet == data.userWalletAddress) {
      setstages(Number(data.stage));
      setsstages(Number(data.stage));
      if (contractData.isHybridEnd === false && claim === true && stages === contractData.globalStage) {
        setclaimDisable(true);
      } else {
        setleftRightModal(true);
      }
      setstop(false);
      setUserNft(data);
    } else {
      setNftCardModal(true);
      // toast.error("Not your NFT");
    }
  };

  const dataFunForTile = (arr, side) => {
    let returnData = [];
    let count = 0;
    arr.map((data) => {
      if (data.lastJumpSide == side && count < 3) {
        returnData.push(data);
        count++;
      }
    });
    return returnData;
  };

  const claimButtonFunctionality = async (playerId) => {
    if (contractData?.contractInstance) {
      try {
        setLoader(true);
        let claimReward = await contractData?.contractInstance.claimWinnerEther(
          playerId
        );
        let successClaim = await claimReward.wait();
        if (successClaim) {
          setclaimDisable(false);
          setLoader(false);
          setCongratulationShow(true);
        }
      } catch (e) {
        setLoader(false);
        toast.error(e.error.data.message.split(":")[1]);
      }
    }
  };

  const handleRestartGameModal = () => {
    setRestartGameModal(true);
  };

  const closeRestartGameModal = () => {
    setRestartGameModal(false);
  };

  const nftCardModalClose = () => {
    setClickedNft({});
    setNftCardModal(false);
  };

  const handleGameDataModal = (data) => {
    setGameDataModal(data);
  };
  const closeGameDataModal = () => {
    setGameEndModalHandle(false);
    setGameDataModal(false);
  };

  return (
    <div
      className={`game-banner-wraper ${stop ? "step" : ""} ${contractData.latestTimestampOfUsers > contractData?.gameEndDays ? "disable" : ""
        } ${current > 0 ? "stop" : ""}  ${StimeoutTrue ? "" : ""}`}
    >
      {loader === true || contractData?.loaderRedux === true ? <Loader /> : ""}
      <div className="connect-wallet">
        <div className="claim-btn">
          {contractData.signerWallet ? (
            <p>Total Game Reward : {contractData?.totalReward} ETH</p>
          ) : (
            <p>Please connect to MetaMask</p>
          )}
          {claimDisable == true ? (
            <button
              onClick={() => claimButtonFunctionality(userNft.playerId)}
              className="btn-connect claim"
            >
              Claim
            </button>
          ) : (
            ""
          )}
        </div>

        <div className="btn-wrapper">
          {contractData.signerWallet != "" ? (<button className="btn-connect" onClick={handleShoww}>
            My NFTS
          </button>) : ""}
          {contractData.signerWallet != "" ? (<button onClick={handleNftListShow} className="btn-connect">
            NFT List{" "}
          </button>) : ""}
          {contractData.signerWallet !== "" &&
            contractData?.ownerAddress == contractData?.signerWallet ? (
            <button onClick={handleRestartGameModal} className="btn-connect">
              Restart Game{" "}
            </button>
          ) : (
            ""
          )}
          <ConnectWallet />
        </div>
        <Timer countedArray={countedArray} />

        {contractData?.reloadPopUp ? (
          <div className="timeout-error">
            <p>Your Game Data is out Dated. Please Reload your Game. </p>
            <button
              className="btn btn-white"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="bridge-background">
        {/* <Image src={backgroundGif} fluid /> */}
        <video width="320" height="240" autoPlay loop>
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="sun-image">
        <Image className="rotate" src={Sun} fluid />
      </div>
      <div className="clouds slow-up-down">
        <img src={Clouds} alt="Clouds" className="img-fluid" />
      </div>
      <div
        // className={`stairs-image stage-${stair} ${contractData.startGameTime !== 0 && contractData.gameInitializeDay > 0 && contractData.isHybridEnd == false && stair > 7 ? "show" : ""}`}
        className={`stairs-image stage-12 ${contractData.gameInitializeDay !== 0 && contractData.isHybridEnd == false && stages >= contractData?.globalStage ? "show" : ""
          }`}
      >
        <Image src={Stairs} fluid />
      </div>
      <div className="stage-title">Stage {stages}</div>
      <div className="titles-wrapper">

        {(() => {
          const arr = [];
          for (let i = tilenumber + 1; i >= 2; i--) {
            arr.push(
              <div
                className={`tile-row ${sstages === i ? "stay" : ""} ${current >= i ? "current" : ""} tile-row${i - stages}-image ${i >= "15" && i - stages >= "15" ? 'stage-large' : ''} ${stages - i > "12" ? 'stage-small' : ''}`}              >


                <div className="slow-up-down">
                  <div className="d-flex justify-content-between">
                    <div
                      className={`tile left-tile ${contractData?.safetiles[i - 2]?.safeTile !== undefined &&
                        contractData?.safetiles[i - 2]?.safeTile >= 50
                        ? contractData.countdownLoader == false &&
                          gameDataModal == false
                          ? "drop-left-tile drop-left-tile-no-anim"
                          : contractData.countDownStageNumber != i - 1
                            ? "drop-left-tile"
                            : ""
                        : ""
                        }`}
                    >
                      <Image src={Tile12} fluid />

                      <div className="current-all-nfts d-flex align-items-end">
                        {countedArray[i - 1]?.leftUsers > 3 ? (
                          <button
                            className="more-button"
                            onClick={() => handleShow(i - 1, false)}
                          >
                            <span className="fa fa-bars"></span><span className="number">{countedArray[i - 1]?.leftUsers}</span>
                          </button>
                        ) : (
                          ""
                        )}
                        <div className="related-nft">
                          {allUsers[i - 1] &&
                            dataFunForTile(allUsers[i - 1], false).map(
                              (dataOfUser, key) => {
                                return dataOfUser.lastJumpSide == false ? (
                                  <>
                                    <div
                                      key={key}
                                      className={`nft-fram ${singlePlayerId != "" &&
                                        singlePlayerId == dataOfUser.playerId
                                        ? ` ${LeftMove ? `left-move ` : ""
                                        }  ${RightMove ? `right-move ` : ""
                                        }`
                                        : ""
                                        } `}
                                    >
                                      {Number(dataOfUser.day) >=
                                        Math.floor(
                                          contractData?.gameInitializeDay
                                        ) ? (
                                        <div className="moved-icon">
                                          <span className="icon">
                                            {" "}
                                            <FontAwesomeIcon
                                              icon={faArrowAltCircleUp}
                                            />
                                          </span>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                      {dataOfUser.lastJumpSide == false ? (
                                        <Image
                                          onClick={() =>
                                            conditionalModalHandling(dataOfUser)
                                          }
                                          src={
                                            dataOfUser.metaData.imageUrl
                                              ? dataOfUser.metaData.imageUrl
                                              : Nftfram
                                          }
                                          fluid
                                        />
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  ""
                                );
                              }
                            )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`tile right-tile ${contractData?.safetiles[i - 2]?.safeTile < 50 &&
                        contractData?.safetiles[i - 2]?.safeTile !== undefined
                        ? contractData.countdownLoader == false &&
                          gameDataModal == false
                          ? "drop-right-tile drop-right-tile-no-anim"
                          : contractData.countDownStageNumber != i - 1
                            ? "drop-right-tile"
                            : ""
                        : ""
                        }`}
                    >
                      <Image src={Tile11} fluid />
                      <div className="current-all-nfts d-flex align-items-end">
                        {countedArray[i - 1]?.rightUsers > 3 ? (
                          <button
                            className="more-button"
                            onClick={() => handleShow(i - 1, true)}
                          >
                            <span className="fa fa-bars"></span><span className="number">{countedArray[i - 1]?.rightUsers}</span>
                          </button>
                        ) : (
                          ""
                        )}
                        <div className="related-nft">
                          {allUsers[i - 1] &&
                            dataFunForTile(allUsers[i - 1], true).map(
                              (dataOfUser, key) => {
                                return (
                                  <>
                                    <div
                                      key={key}
                                      className={`nft-fram ${singlePlayerId != "" &&
                                        singlePlayerId == dataOfUser.playerId
                                        ? ` ${LeftMove ? `left-move ` : ""
                                        }  ${RightMove ? `right-move ` : ""
                                        }`
                                        : ""
                                        } `}
                                    >
                                      {Number(dataOfUser.day) >=
                                        Math.floor(
                                          contractData?.gameInitializeDay
                                        ) ? (
                                        <div className="moved-icon">
                                          <span className="icon">
                                            {" "}
                                            <FontAwesomeIcon
                                              icon={faArrowAltCircleUp}
                                            />
                                          </span>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                      {dataOfUser.lastJumpSide == true ? (
                                        <Image
                                          onClick={() =>
                                            conditionalModalHandling(dataOfUser)
                                          }
                                          src={
                                            dataOfUser.metaData.imageUrl
                                              ? dataOfUser.metaData.imageUrl
                                              : Nftfram
                                          }
                                          fluid
                                        />
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </>
                                );
                              }
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return arr;
        })()}

        {/* Tile 0 */}
        <div
          className={`tile-row ${sstages === 0 ? "stay" : ""} base ${current >= 0 ? "current" : ""
            } tile-row${1 - stages}-image`}
        >
          <div className="up-down">
            <div className="d-flex justify-content-around">
              <div className="tile ">
                <Image src={Tile11} fluid />
                <div className="current-all-nfts d-flex align-items-end">
                  {allUsers[0]?.length > 3 ? (
                    <button
                      className="more-button"
                      onClick={() => handleShow(0)}
                    >
                      <span className="fa fa-bars"></span>
                      <span className="number">{allUsers[0]?.length}</span>
                    </button>
                  ) : (
                    ""
                  )}
                  <div className="related-nft">
                    {allUsers[0] &&
                      allUsers[0].map((dataOfUser, key) => {
                        return key <= 2 ? (
                          <>
                            <div
                              key={key}
                              className={`nft-fram ${singlePlayerId != "" &&
                                singlePlayerId == dataOfUser.playerId
                                ? ` ${LeftMove ? `left-move ` : ""}  ${RightMove ? `right-move ` : ""
                                }`
                                : ""
                                } `}
                            >
                              {/* {dataOfUser.lastJumpSide == false ? ( */}
                              <Image
                                onClick={() =>
                                  conditionalModalHandling(dataOfUser)
                                }
                                src={
                                  dataOfUser.metaData.imageUrl
                                    ? dataOfUser.metaData.imageUrl
                                    : Nftfram
                                }
                                fluid
                              />
                              {/* ) : (
                                ""
                              )} */}
                            </div>
                          </>
                        ) : (
                          ""
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="move-btns">
        <div className="">
          <button className="back-btn " onClick={back}>
            <img src={BottomIcon} alt="Bottom Icon" className="img-fluid" />
          </button>
          <button className="forward-btn mb-3" onClick={forward}>
            <img src={TopIcon} alt="Top Icon" className="img-fluid" />
          </button>
        </div>
      </div>
      {leftRightModal === true ? (
        <div className="time-modal">
          <button
            type="button"
            className="close"
            onClick={() => setleftRightModal(!leftRightModal)}
          >
            {/* <span aria-hidden="true">&times;</span> */}
          </button>
          <div className="custom-modal-header">Select Tile For Jump </div>
          <div className="custom-modal-content">
            <div className="arrow-wrapper d-flex align-items-center justify-content-between">
              {contractData?.safetiles[Number(userNft.stage)] !== undefined &&
                contractData?.safetiles[Number(userNft.stage)].safeTile >= 50 ? (
                <div className="arrow-icon right-icon"></div>
              ) : (
                <div
                  className="arrow-icon left-icon"
                  onClick={() => leftOrRightMove("left")}
                >
                  <img src={LeftIcon} alt="icon left" className="img-fluid" />
                </div>
              )}

              {contractData?.safetiles[Number(userNft.stage)] !== undefined &&
                contractData?.safetiles[Number(userNft.stage)].safeTile < 50 ? (
                <div className="arrow-icon right-icon"></div>
              ) : (
                <div
                  className="arrow-icon right-icon"
                  onClick={() => leftOrRightMove("right")}
                >
                  <img src={RightIcon} alt="icon right" className="img-fluid" />
                </div>
              )}
            </div>
            {/* <button className="btn-connect">Stay</button> */}
          </div>
        </div>
      ) : (
        ""
      )}

      {contractData.signerWallet != "" &&
        contractData?.ownerAddress !== contractData?.signerWallet ? (
        (contractData.latestTimestampOfUsers > contractData?.gameEndDays && claim == false && contractData.countdownLoader == false &&
          gameDataModal == false ) ||
          (contractData?.isHybridEnd === false &&
            contractData.gameInitializeDay !== 0 && contractData.countdownLoader == false &&
            gameDataModal == false && gameEndModalHandle == false &&
            contractData?.safetiles[contractData.globalStage - 1] !== undefined &&
            claim === false && contractData?.winningDayEnd == true) ? (
          <>
            <div className="game-over-bg"></div>
            <div className="time-modal">
              <div className="custom-modal-content pt-0">
                <h1 className="text-center my-5">Game Ended</h1>
                {/* setIsZeroNfts */}
              </div>
            </div>
          </>
        ) : (
          ""
        )
      ) : (
        ""
      )}
      

      {contractData.countdownLoader === true &&
        contractData?.loaderRedux === false ? (
       
        <CountdownModal
          gameDataModalShow={(data) => {
            handleGameDataModal(data);
          }}
          gameEndModalHandler={() => { setGameEndModalHandle(true) }}
        />
      ) : (
        ""
      )}

      {contractData.latestTimestampOfUsers > contractData?.gameEndDays ||
        (contractData?.isHybridEnd === false &&
          contractData.gameInitializeDay !== 0 &&
          contractData.latestTimestampOfUsers >= 1) ? (
        ""
      ) : contractData?.remainingNftLoader === true ? (
        <>
          <RemainingNftModal allUsers={allUsers} />
        </>
      ) : (
        ""
      )}

      <MyNftModal
        show={myNftModal}
        close={() => handleMyNftModalClose()}
        myNfts={myNfts}
        conditionalModalHandling={(data) => {
          conditionalModalHandling(data);
        }}
        lodaer={(type) => handleLoader(type)}
        // getLatestStage={() => getLatestStage()}
        // safeSides={safeSides}
        allUsers={allUsers}
        zeroNftCheck={isZeroNfts}
      />
      <PlayerListModal
        show={show}
        close={() => handleClose()}
        allNftList={allNftList}
        conditionalModalHandling={(data) => {
          conditionalModalHandling(data);
        }}
      />
      <NftListModal
        show={nftListShow}
        close={() => handleNftListClose()}
        lodaer={(type) => handleLoader(type)}
        myNftData={usersNft}
        availableNFts={availableNFts}
      // safeSides={safeSides}
      />
      <SwitchSideModal
        show={switchSideModal}
        close={() => closeSwitchSideModal()}
        nftData={clickedNft}
        lodaer={(type) => handleLoader(type)}
      />
      <RestartGameModal
        show={restartGameModal}
        close={() => closeRestartGameModal()}
        lodaer={(type) => handleLoader(type)}
      />
      <CongratulationModal
        show={congratulationShow}
        close={() => closeCongratulationModel()}
        congratulationShow={congratulationShow}
        claimAmount={claimAmount}
        lodaer={(type) => handleLoader(type)}
      />
      <NftCardModal
        show={nftCardModal}
        close={() => {
          nftCardModalClose();
        }}
        nftData={clickedNft}
      />

      <GameDataModal
        show={gameDataModal}
        close={() => closeGameDataModal()}
        // safeSides={safeSides}
        allUsers={allUsers}
        myNfts={myNfts}
        countedArray={countedArray}
        lodaer={(type) => handleLoader(type)}
      />
    </div>
  );
};

export default Banner;
