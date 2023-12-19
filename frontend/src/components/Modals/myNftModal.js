import { React, useState,useEffect   } from "react";
import { Button, Modal, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import Nftfram from "../../assets/images/nft-fram.png";
import { getLatestData } from "../../redux/connectWallet/action";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import BulkParticipateModal from "./bulkParticipateModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowAltCircleUp,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";
const MyNftModal = (props) => {
  let dispatch = useDispatch();
  const contractData = useSelector((state) => state.contract);
  const [nftSelected, setnftSelected] = useState([]);
  const [firstNftSelected, setfirstNftSelected] = useState([]);
  const [bulkMovementModalShow, setBulkMovementModalShow] = useState(false);
  const [stage, setStage] = useState("");
  const [playerIds, setPlayerIds] = useState([]);
  const [checkBoxFlag, setcheckBoxFlag] = useState(false)

  const modalClose = () => {
    props.close();
    setnftSelected([]);
    setfirstNftSelected([]);
  };

  const currentDay = (data) => {
    
    const diff = contractData?.gameInitializeDay - Number(data.day);
    return diff;
  };

  const buyBackInFee = async (playerId, series, stage) => {
    try {
      if (contractData?.contractInstance) {
        props.lodaer(true);
        modalClose();

        let curveAmount =  await contractData?.contractInstance._calculateBuyBackIn(Number(stage),0);
        try {
          if((contractData.globalStage < 6 && contractData.latestTimestampOfUsers < contractData?.gameEndDays) || (contractData.globalStage > 5 && 
            contractData?.isHybridEnd !== false && contractData.latestTimestampOfUsers < contractData?.gameEndDays)){
          var approve = await contractData?.wrappedEtherInstance.approve(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            curveAmount
          );
        }
        else {
          props.lodaer(false);
          toast.error("Game is Ended")
        }
        } catch (e) {
          props.lodaer(false);
          toast.error(e);
        }
        const approveTransaction = await approve.wait();
        if (approveTransaction) {
          let fee = await contractData?.contractInstance.buyBackInFee(playerId);

          let successFee = await fee.wait();
          if (successFee) {
            dispatch(getLatestData(contractData?.contractInstance));
            props.lodaer(false);
          }
        } else {
          props.lodaer(false);
          toast.error("Approve transaction fail");
        }
      }
    } catch (e) {
      props.lodaer(false);
      toast.error(
        e?.error?.data?.message
          ? e.error.data.message.split(":")[1]
          : "Error In Transaction"
      );
    }
  };

  const restartGame = async (data) => {
    try {
      props.lodaer(true);
      modalClose();

      if (data.nftSeriestype == 2) {
        const amount = ethers.utils.parseEther("0.01");
        try {
          if((contractData.globalStage < 6 && contractData.latestTimestampOfUsers < contractData?.gameEndDays) || (contractData.globalStage > 5 && 
            contractData?.isHybridEnd !== false && contractData.latestTimestampOfUsers < contractData?.gameEndDays)){
          var approve = await contractData?.wrappedEtherInstance.approve(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            amount
          );
        }
        else {
          props.lodaer(false);
          toast.error("Game is Ended")
        }
        } catch (e) {
          toast.error("ERROR>>>", e);
        }
        const approveTransaction = await approve.wait();
        if (!approveTransaction) {
          props.lodaer(false);
          toast.error("Approve Transaction Fail");
        }
      }
      const entryFees = await contractData?.contractInstance.entryFeeSeries(
        data.playerId,
        Number(data.nftId._hex),
        data.nftSeriestype
      );
      let waitTransaction = await entryFees.wait();
      if (waitTransaction) {
        // dispatch(getLatestStages(contractData?.contractInstance));
        dispatch(getLatestData(contractData?.contractInstance));
        props.lodaer(false);
        // setLoader(false);
        // toast.success("Game restarted successfully!")
      }
    } catch (e) {
      console.log("TEST ERROR>>>>", e);
      props.lodaer(false);
      toast.error(
        e?.error?.data?.message
          ? e.error.data.message.split(":")[1]
          : "Transaction failed"
      );
      modalClose();
    }
  };

  const handleNftSelected = (data) => {

    if (parseInt(contractData?.gameInitializeDay) > Number(data.day) || Number(data.stage) === 0) {


        let itemIndex = nftSelected.map((c) => c.nftId);
        itemIndex = itemIndex.indexOf(data.nftId);
        let dataStage = Number(data.stage);
       
        let firstNFTSelect = firstNftSelected.filter(x => x.seriesType == data.nftSeriestype && x.stage == dataStage);

            if (firstNftSelected[0] != undefined && firstNFTSelect.length > -1 && (firstNftSelected[0].stage != dataStage)) {
            toast.error('you can select nfts with same stage')
        }
        else {
          setStage(dataStage);
            if (itemIndex < 0) {
                setfirstNftSelected([...firstNftSelected, { seriesType: data.nftSeriestype, stage: dataStage }])
                setnftSelected([...nftSelected, data]);
                // setError("")
            } else {
                let prevData = [...nftSelected];
                prevData.splice(itemIndex, 1);
                let prevFirstNft = [...firstNftSelected]
                prevFirstNft.pop()
                setfirstNftSelected(prevFirstNft)
                // setError("")
                setnftSelected([...prevData]);
            }
        }
    }
    else {
        toast.error("Already jump in current slot")
    }
};

  const bulkParticipate = () => {
    try {
      let playerIds = [];
      for (let i = 0; i < nftSelected.length; i++) {
        playerIds.push(nftSelected[i].playerId);
      }
      setPlayerIds(playerIds);
      setBulkMovementModalShow(true);
      modalClose();
    } catch (e) {
      toast.error(
        e?.error?.data?.message
          ? e.error.data.message.split(":")[1]
          : "Transaction failed"
      );
    }
  };

  const closeModal = () => {
    setBulkMovementModalShow(false);
  };
  const findCurrentDay = (data) => {
    const diff = contractData?.gameInitializeDay - Number(data.day);
    return diff;
  };

  useEffect(() => {
    if(contractData?.reloadPopUp == true){
     modalClose();
    }
   }, [contractData?.reloadPopUp])

  return (
    <>
      <Modal className="nft-modal" show={props.show} onHide={modalClose}>
        <Modal.Header className="justify-content-center">
          <Modal.Title>My NFTS</Modal.Title>
          <button type="button" className="custom btn-close" onClick={modalClose}>
          </button>
        </Modal.Header>
        <Modal.Body >
          {
            props.zeroNftCheck == true ? <h4 style= {{textAlign: 'center'}}>No Nft Found</h4> :
              <h4>Selected Nft's : {nftSelected.length}</h4>
          }
          {props.myNfts &&
            Object.keys(props.myNfts).map((data, index) => {
              return (
                <>
                  {props.myNfts[data] &&
                    props.myNfts[data].map((data, key) => {
                      return (
                        <div
                          key={key}
                          className={`nft-content-wrapper d-flex align-items-center ${
                            data.stageStatus == false || data.isDrop === false
                              ? "game-over"
                              : `nft-item ${
                                  nftSelected
                                    .map((c) => c.nftId)
                                    .indexOf(data.nftId) < 0
                                    ? ""
                                    : "active"
                                }`
                          }`}
                          >

                          {data.stageStatus === false ||
                                 data.isDrop === false ? "" :  <div className="custom-check" > <label className="custom-container">
                             <input type="checkbox" onClick={
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
                             }/>
                             <span className="checkmark"></span>
                           </label> </div> }
                         
                          {Number(data.day) >=
                            Math.floor(contractData?.gameInitializeDay) &&
                          Number(data.stage) !== 0 ? (
                            <div className="moved-icon">
                              <span className="icon">
                                {" "}
                                <FontAwesomeIcon icon={faArrowAltCircleUp} />
                              </span>
                            </div>
                          ) : (
                            ""
                          )}

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
                                <div className="stage-series">
                                  <h4>Stage : {Number(data.stage)}</h4>
                                  <h4 className="stage-series-margin">
                                    Series : {data.nftSeriestype}
                                  </h4>
                                </div>
                                {nftSelected.length > 0 ? "" :
                                (data.stageStatus === false ||
                                data.isDrop === false ? (
                                  currentDay(data) <= 2 ? (
                                    <button
                                      className="restart"
                                      onClick={() =>
                                        buyBackInFee(
                                          data.playerId,
                                          data.nftSeriestype,
                                          Number(data.stage)
                                        )
                                      }
                                    >
                                      Buy Back In
                                    </button>
                                  ) : (
                                    <button
                                      className="restart"
                                      onClick={() => restartGame(data)}
                                    >
                                      Restart Game
                                    </button>
                                  )
                                ) : (
                                  <div className="d-flex align-items-center mt-3">
                                  <button style={{margin:'0'}}
                                    className="restart"
                                    onClick={() => {
                                      modalClose();
                                      props.conditionalModalHandling(data);
                                    }}
                                  >
                                    Jump
                                  </button>
                                  
                                  </div>
                                  
                                ))}
                              </div>
                            </div>
                            
                          );
                        })}
                    </>
                  );
                })}
        </Modal.Body>
        <Modal.Footer>
          {nftSelected.length > 1 ? (
            <Button variant="primary" onClick={() => bulkParticipate()}>
             {nftSelected.length == 1 ? "Participate" :
                            "Bulk Participate"
                        }
            </Button>
          ) : (
            ""
          )}
        </Modal.Footer>
      </Modal>
      <BulkParticipateModal
        show={bulkMovementModalShow}
        close={() => closeModal()}
        stage={stage}
        playerIds={playerIds}
        lodaer={(type) => props.lodaer(type)}
      />
    </>
  );
};

export default MyNftModal;
