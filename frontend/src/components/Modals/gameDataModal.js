import { React, useState } from "react";
import { Button, Modal, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Nftfram from "../../assets/images/nft-fram.png";
import { ethers } from "ethers";
import { getLatestData } from "../../redux/connectWallet/action";
import { LOADER_STATE_FALSE, LOADER_STATE_TRUE } from "../../redux/actionType";

const GameDataModal = (props) => {
  let dispatch = useDispatch();
  const contractData = useSelector((state) => state.contract);
  const [nftSelected, setnftSelected] = useState([]);
  const [firstNftSelected, setfirstNftSelected] = useState([]);
  const [stage, setStage] = useState("");
  const [playerIds, setPlayerIds] = useState([]);
  const [counter, setCounter] = useState(0);
  const forwardCounter = () => {
    setCounter(counter == 2 ? counter : counter + 1);
  };

  const reverseCounter = () => {
    setCounter(counter == 0 ? counter : counter - 1);
  };

  const currentDay = (day) => {
       
    const diff = contractData?.gameInitializeDay - Number(day);
    return diff;
};

  const handleNftSelected = (data) => {
    if (currentDay(data.day) > 2 ) {
      toast.error("Buy back only be perform in 24 hours")
    }
    else if(contractData?.isHybridEnd === false){
      toast.error("Game is Ended")
    }
    else {
      if (
        parseInt(contractData?.gameInitializeDay) > Number(data.day) ||
        Number(data.stage) === 0
      ) {
        let itemIndex = nftSelected.map((c) => c.nftId);
        itemIndex = itemIndex.indexOf(data.nftId);
        let dataStage = Number(data.stage);
        setStage(dataStage);
        let firstNFTSelect = firstNftSelected.filter(
          (x) => x.seriesType == data.nftSeriestype && x.stage == dataStage
        );

        if (
          firstNftSelected[0] != undefined &&
          firstNFTSelect.length > -1 &&
          firstNftSelected[0].stage != dataStage
        ) {
          toast.error("you can select nfts with same stage");
        } else {
          if (itemIndex < 0) {
            setfirstNftSelected([
              ...firstNftSelected,
              { seriesType: data.nftSeriestype, stage: dataStage },
            ]);
            setnftSelected([...nftSelected, data]);
          } else {
            let prevData = [...nftSelected];
            prevData.splice(itemIndex, 1);
            let prevFirstNft = [...firstNftSelected];
            prevFirstNft.pop();
            setfirstNftSelected(prevFirstNft);
            setnftSelected([...prevData]);
          }
        }
      } else {
        toast.error("Already jump in current slot");
      }
    }
  };


  const singleBuyBackIn = async (data) => {
    try {
      if (contractData?.contractInstance) {
        if(currentDay(data.day) > 2 || contractData?.isHybridEnd === false){
          toast.error(currentDay(data.day) > 2 ? "Buy Back can be used in 24 hours only" : "Game Ended")
        }
        else{
        props.lodaer(true);
        props.close();

        let curveAmount =  await contractData?.contractInstance._calculateBuyBackIn(Number(data.stage),0);
        try {
          var approve = await contractData?.wrappedEtherInstance.approve(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            curveAmount
          );
        } catch (e) {
          props.lodaer(false);
          toast.error(e);
        }
        const approveTransaction = await approve.wait();
        if (approveTransaction) {
          let fee = await contractData?.contractInstance.buyBackInFee(data.playerId);
          let successFee = await fee.wait();
          if (successFee) {
            dispatch(getLatestData(contractData?.contractInstance));
            props.lodaer(false);
          }
          else{
            props.lodaer(false);
            toast.error("transaction fail");
          }
        } else {
          props.lodaer(false);
          toast.error("Approve transaction fail");
        }
      }}
    } catch (e) {
      props.lodaer(false);
      toast.error(
        e?.error?.data?.message
          ? e.error.data.message.split(":")[1]
          : "Error In Transaction"
      );
    }
  };

  const bulkBuyBackIn = async() => {
    try {
      if(currentDay(nftSelected[0].day) > 2 || contractData?.isHybridEnd === false ){
        toast.error(currentDay(nftSelected[0].day) > 2 ? "Buy Back can be used in 24 hours only" : "Game Ended")
      }
      else{
      let playerIds = [];
      let approveAmount = 0;
      let curveAmount =  await contractData?.contractInstance._calculateBuyBackIn(Number(nftSelected[0].stage),0);

      for (let i = 0; i < nftSelected.length; i++) {
        playerIds.push(nftSelected[i].playerId);
        approveAmount = approveAmount + Number(curveAmount / 10 ** 18);
      }
      approveAmount = ethers.utils.parseEther(approveAmount.toString());
      setPlayerIds(playerIds);
      props.lodaer(true);
      props.close();
      bulkBuyBackInTransaction(playerIds,approveAmount);}
    } catch (e) {
      props.lodaer(false);
      toast.error(
        e?.error?.data?.message
          ? e.error.data.message.split(":")[1]
          : "Transaction failed"
      );
    }
  };
  const bulkBuyBackInTransaction = async (playerIds,amount) => {
    try {
      var approve = await contractData?.wrappedEtherInstance.approve(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        amount
      );
    } catch (e) {
      props.lodaer(false);
      toast.error(e);
    }
    const approveTransaction = await approve.wait();
    if (approveTransaction) {
      let fee = await contractData?.contractInstance.bulkBuyBackInFee(playerIds);

      let successFee = await fee.wait();
      if (successFee) {
        // dispatch(getLatestStage(contractData.contractInstance))
        dispatch(getLatestData(contractData?.contractInstance));
        props.lodaer(false);
      }else{
        props.lodaer(false);
        toast.error("transaction fail");
      }
    } else {
      props.lodaer(false);
      toast.error("Approve transaction fail");
    }
  };
  return (
    <>
      <Modal
        className="mynft-list restart nfts-data"
        show={props.show}
        cancel={props.close}
        size="lg"
        centered
      >
        <Modal.Header className="justify-content-center">
          <Modal.Title>
            {counter == 0
              ? "Safe Side"
              : counter == 1
              ? "Total Nft's"
              : counter == 2
              ? "My Dead Nft's"
              : ""}
          </Modal.Title>

          
        </Modal.Header>
        <Modal.Body>
          <div className="form-wrapper nft-content">
            {counter === 0 ? (
              contractData.globalStage > 0 ? (
                contractData?.safetiles[contractData.countDownStageNumber - 1]
                  ?.safeTile !== undefined ? (
                  <div className="nft-label">
                    <h2>
                      {" "}
                      safe side :{" "}
                      {contractData?.safetiles[contractData.countDownStageNumber - 1]
                        ?.safeTile < 50
                        ? "Left "
                        : "Right "}{" "}
                    </h2>
                  </div>
                ) : (
                  ""
                )
              ) : (
                ""
              )
            ) : counter === 1 ? (
              <div className="nft-label">
                <h2>
                  Total Safe Nfts :{" "}
                  {contractData?.safetiles[contractData.countDownStageNumber - 1]
                    ?.safeTile < 50 &&
                  props.countedArray[contractData.countDownStageNumber] !==
                    undefined
                    ? props.countedArray[contractData.countDownStageNumber]
                        .leftUsers
                    : props.countedArray[contractData.countDownStageNumber]
                        .rightUsers}
                </h2>
                <h2>
                  Total Dead Nfts :{" "}
                  {contractData?.safetiles[contractData.countDownStageNumber - 1]
                    ?.safeTile < 50 &&
                  props.countedArray[contractData.countDownStageNumber] !==
                    undefined
                    ? props.countedArray[contractData.countDownStageNumber]
                        .rightUsers
                    : props.countedArray[contractData.countDownStageNumber]
                        .leftUsers}
                </h2>
              </div>
            ) : counter === 2 &&
              contractData?.safetiles[contractData?.countDownStageNumber - 1]
                ?.safeTile !== undefined ? (
              <div className="bulk-nft-list">
                <>
                  {
                    
                    contractData?.safetiles[contractData.countDownStageNumber - 1]?.safeTile !==
                    undefined && props.myNfts[contractData.countDownStageNumber] !== undefined && 
                  contractData?.safetiles[contractData.countDownStageNumber - 1].safeTile < 50
                    && props.myNfts[contractData.countDownStageNumber]?.filter(
                        (data) => data.lastJumpSide == true
                      ).length > 0
                    || props.myNfts[contractData.countDownStageNumber] !== undefined && 
                    contractData?.safetiles[contractData.countDownStageNumber - 1].safeTile >= 50 &&
                     props.myNfts[contractData.countDownStageNumber]?.filter(
                        (data) => data.lastJumpSide == false
                      ).length > 0 ?
                  
                  props.myNfts[contractData?.countDownStageNumber] &&
                    props.myNfts[contractData?.countDownStageNumber].map(
                      (data, key) => {
                        if (
                          (contractData?.safetiles[
                            contractData?.countDownStageNumber - 1
                          ]?.safeTile >= 50 &&
                            data.lastJumpSide == false) ||
                          (contractData?.safetiles[
                            contractData?.countDownStageNumber - 1
                          ]?.safeTile < 50 &&
                            data.lastJumpSide == true)
                        ) {
                          return (
                            <div className={`item-no-padding ${
                              nftSelected
                                .map((c) => c.nftId)
                                .indexOf(data.nftId) < 0
                                ? ""
                                : "active"
                            }`}>
                            <div
                              key={key}
                              className={`nft-content-wrapper d-flex align-items-center ${
                                data.stageStatus == false ||
                                data.isDrop === false
                                  ? "game-over"
                                  : `nft-item `
                              }`}
                              onClick={
                                (data.stageStatus == false &&
                                  data.isDrop === true) ||
                                (data.stageStatus == true &&
                                  data.isDrop === false &&
                                  data.stageStatus == false &&
                                  data.isDrop === true)
                                  ? ""
                                  : () => {
                                      handleNftSelected(data);
                                    }
                              }
                            >
                              <div className="nft-img">
                                <Image
                                  src={
                                    data.metaData.imageUrl
                                      ? data.metaData.imageUrl
                                      : Nftfram
                                  }
                                  fluid
                                />
                              </div>
                              <div className="nft-content">
                                <h3>NFT ID : {Number(data.nftId)}</h3>
                                <h3>Series Type: {data.nftSeriestype}</h3>
                                
                              </div>
                            </div>
                            {/* <button
                                  className="restart"
                                  onClick={() =>
                                    singleBuyBackIn(
                                      data.playerId,
                                      data.metaData.series,
                                      data.day
                                    )
                                  }
                                >
                                  Buy Back In
                                </button> */}
                            </div>
                          );
                        }
                      }
                    )
                  
                  :(
                    <div className="nft-label fail-nft">
                    <h2>
                      
                     {""} None of your NFT {" "}
                     
                    </h2>
                  </div>
                  )}
                </>
              </div>
            ) : (
              ""
            )}

            <div className="d-flex">
              {counter !== 0 ? (
                <Button
                  className="btn-connect"
                  onClick={() => reverseCounter()}
                >
                  Back
                </Button>
              ) : (
                ""
              )}
              {counter == 2 ? (
                nftSelected.length > 0 ? (
                  <Button className="btn-connect" onClick={()=>{nftSelected.length == 1 ? singleBuyBackIn(nftSelected[0]) : bulkBuyBackIn()}}>
                    {nftSelected.length == 1 ? "Buy Back" : "Bulk Buy Back"}</Button>                
                    ) : (
                  <Button className="btn-connect" onClick={props.close}>
                    Close
                  </Button>
                )
              ) : (
                <Button
                  className="btn-connect"
                  onClick={() => forwardCounter()}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default GameDataModal;