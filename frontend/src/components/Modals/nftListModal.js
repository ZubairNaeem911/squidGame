import { React,useState } from "react";
import { Button, Modal,Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import { getLatestData } from "../../redux/connectWallet/action";
import { toast } from "react-toastify";
import { ethers } from "ethers";
const NftListModal = (props) => {
    let dispatch = useDispatch();
    const contractData = useSelector((state) => state.contract);
    const [nftSelected, setnftSelected] = useState([]);
    const [firstNftSelected, setfirstNftSelected] = useState([]);
    const [error, setError] = useState("");
    const [errorState, setErrorState] = useState(false);

    const handleModalClose = () =>{
        props.close();
        setnftSelected([]);
        setfirstNftSelected([]);
    }

    // const handleError = () => {
    //   setErrorState(true)
    // }
    const handleNftSelected = (data) => {

        let itemIndex = nftSelected.map((c) => c.tokenId);
        itemIndex = itemIndex.indexOf(data.tokenId);
        let firstNFTSelect = firstNftSelected.filter(x => x == data.series)
    
        if (firstNftSelected[0] != undefined && firstNFTSelect.length > -1 && firstNftSelected[0] != data.series) {
          setError('you can select either series one or two simultaneously')
        }
        else {
          if (itemIndex < 0) {
            setfirstNftSelected([...firstNftSelected, data.series])
            setnftSelected([...nftSelected, data]);
            setError("")
          } else {
            let prevData = [...nftSelected];
            prevData.splice(itemIndex, 1);
            let prevFirstNft = [...firstNftSelected]
            prevFirstNft.pop()
            setfirstNftSelected(prevFirstNft)
            setError("")
            setnftSelected([...prevData]);
          }
        }
    
      };

    const lateBuyInFee = async (data) => {
        if (contractData.contractInstance) {
          try {
            props.lodaer(true);
            handleModalClose();
            
            let curveAmount =  await contractData?.contractInstance._calculateBuyBackIn(contractData?.globalStage,1);    
            const series = data?.series == "seriesOne" ? 1 : 2;
            if (series == 2) {
              curveAmount = Number(curveAmount / 10 ** 18) + 0.01;
              curveAmount = ethers.utils.parseEther(curveAmount.toString());
            }
            try {
              if (contractData.isDistribution === false) {
                toast.error('Game is Ended')
              }
              else {
                if (contractData.isDistribution === false) {
                  toast.error('Game is Ended')
                }
                else {
                  if(contractData.globalStage < 6 && contractData.latestTimestampOfUsers < contractData?.gameEndDays || ( contractData.globalStage > 5 && 
                    contractData?.isHybridEnd !== false && contractData.latestTimestampOfUsers < contractData?.gameEndDays)){
                    var approve = await contractData?.wrappedEtherInstance.approve(process.env.REACT_APP_CONTRACT_ADDRESS, curveAmount);
                  }
                  else {
                    props.lodaer(false);
                    toast.error("Game is Ended")
                  }
              }
            }
            }
            catch (e) {
              props.lodaer(false);
              console.log("ERROR>>>", e)
            }
            const approveTransaction = await approve.wait();
            if (approveTransaction) {
                let transaction = await contractData.contractInstance.LateBuyInFee(
                data?.playerId,
                data?.tokenId,
                series
              );
              let transactionWait = await transaction.wait();
              if (transactionWait) {
                dispatch(getLatestData(contractData?.contractInstance));
                await props.availableNFts();
              }
            } else {
              props.lodaer(false);
              toast.error("Approve Transaction fail")
            }
          }
          catch (e) {
            toast.error(e.error.data?.message.split(":")[1]);
            props.lodaer(false);
    
          }
        }
      };

    const handleSubmitNft = async () => {
        try {
          if (nftSelected.length < 1) {
            setError("Please Select NFT first");
          } else {
            if (contractData?.contractInstance) {
                props.lodaer(true);
                handleModalClose();
    
              if (nftSelected.length === 1) {
                let nftConvertedId = nftSelected[0].tokenId;
                const series = nftSelected[0].series == "seriesOne" ? 1 : 2;
                let entryFees;
                if (series == 2) {
                  if (contractData.balance >= 0.01) {
                    const amount = ethers.utils.parseEther('0.01');
                    try {
                      if(contractData.globalStage < 6 && contractData.latestTimestampOfUsers < contractData?.gameEndDays || ( contractData.globalStage > 5 && 
                        contractData?.isHybridEnd !== false && contractData.latestTimestampOfUsers < contractData?.gameEndDays)){
                        var approve = await contractData?.wrappedEtherInstance.approve(process.env.REACT_APP_CONTRACT_ADDRESS, amount);
                      }
                      else {
                        props.lodaer(false);
                        toast.error("Game is Ended");
                      }
                    }
                    catch (e) {
                      props.lodaer(false);
                      console.log("ERROR>>>", e)
                    }
                    const approveTransaction = await approve.wait();
                    if (approveTransaction) {
                      entryFees = await contractData?.contractInstance.entryFeeSeries(
                        nftSelected[0].playerId,
                        nftConvertedId,
                        series
                      );
                    }
                    else {
                        props.lodaer(false);
                      toast.error("APPROVE TRANSACTION FAILED");
                    }
                  }
                  else {
                    toast.error("you have insufficient balance")
                  }
                }
                else {
                  entryFees = await contractData?.contractInstance.entryFeeSeries(
                    nftSelected[0].playerId,
                    nftConvertedId,
                    series
                  );
                }
    
    
                let waitTransaction = await entryFees.wait();
                if (waitTransaction) {
                  dispatch(getLatestData(contractData?.contractInstance));
    
                  await props.availableNFts();
             
                  setnftSelected([]);
                  setfirstNftSelected([]);
                  props.lodaer(false);
                }
              } else {
                let playerIds = [];
                let nftIds = [];
                let series = '';
                for (let i = 0; i < nftSelected.length; i++) {
                  playerIds.push(nftSelected[i].playerId);
                  nftIds.push(nftSelected[i].tokenId)
                  series = nftSelected[i].series
                }
                let uintSeries = series == "seriesOne" ? 1 : 2
                let bulkEntryFee = await bulkNftFees(playerIds, nftIds, uintSeries)
                props.lodaer(true);
                handleModalClose();
                let bulkEntryFeeSuccess = await bulkEntryFee.wait()
                if (bulkEntryFeeSuccess) {
                  dispatch(getLatestData(contractData?.contractInstance));
                  await props.availableNFts();
                  setnftSelected([]);
                  setfirstNftSelected([]);
                  props.lodaer(false);
                }
              }
            } else {
              setnftSelected([]);
              props.lodaer(false);
              setError("Issue in connection, Try again later");
            }
          }
        } catch (e) {
          console.log("ERROR>>>>>>>>>>>",e)
          props.lodaer(false);
          handleModalClose();
          setnftSelected([]);
          toast.error(e?.error?.data?.message? e?.error?.data?.message.split(":")[1] : "Transaction Failed");
        }
      };

    const bulkNftFees = async (playerIds, NftIds, series) => {
        try {
          if (contractData.contractInstance) {
            props.lodaer(true);
            if (series == 2) {
              let amount = 0.01 * NftIds.length;
               amount = ethers.utils.parseEther(amount.toString());
              try {
                if(contractData.globalStage < 6 && contractData.latestTimestampOfUsers < contractData?.gameEndDays || ( contractData.globalStage > 5 && 
                  contractData?.isHybridEnd !== false && contractData.latestTimestampOfUsers < contractData?.gameEndDays)){
                  var approve = await contractData?.wrappedEtherInstance.approve(process.env.REACT_APP_CONTRACT_ADDRESS, amount);
                }
                else {
                  props.lodaer(false);
                  toast.error('Game is Ended');
                }
              }
              catch (e) {
                console.log("ERROR>>>", e)
              }
              const approveTransaction = await approve.wait();
              if (!approveTransaction) {
                props.lodaer(false);
                toast.error("Approve Transaction Fail");
              }
            }
            let bulkNft = await contractData.contractInstance.bulkEntryFeeSeries(
              playerIds, NftIds, series
            );
    
            const transaction = await bulkNft.wait();
            if (transaction) {
                props.lodaer(false);
            }
    
            props.lodaer(false);
            return bulkNft;
          }
        } catch (e) {
            props.lodaer(false);
            toast.error(e.error.data.message.split(":")[1]);
          console.log(e);
        }
      }
   
    return (
        <> 
        <Modal
        className="mynft-list"
        show={props.show}
        cancel={handleModalClose}
        size="lg"
        centered
      >
        <Modal.Header className="justify-content-center">
          <Modal.Title>NFT List</Modal.Title>
          <button type="button" className="close" onClick={handleModalClose}>
            <span aria-hidden="true">&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="nft-list">
       
            {props.myNftData &&
              props.myNftData.map((data, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleNftSelected(data)}
                    className={`nft-item ${nftSelected.map((c) => c.tokenId).indexOf(data.tokenId) < 0 ? "" : "active"
                      }`}
                  >
                    <div className="nft-img">
                      <Image src={data.image} fluid />
                    </div>
                    <div className="nft-content">
                      <h2>{data.name}</h2>
                      {data.series == "seriesOne" ? "" : <p>0.01 Eth</p>}
                    </div>
                    {contractData.globalStage > 1 ? (
                      <button
                        onClick={() => lateBuyInFee(data)}
                      >
                        Buy In
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
     
          </div>
          {error ? (
            <div style={{ color: "#000" }} className="alert alert-danger">
              {" "}
              {error}{" "}
            </div>
          ) : (
            ""
          )}
           {props.myNftData.length > 0 ? "" :
            <div className="nft-label fail-nft no-data" style={{ color: 'white', margin:'0' }}>
              <h2>

                {""} You don't have NFT to play{" "}

              </h2>
            </div>
          } 
        </Modal.Body>
        <Modal.Footer>
        {props.myNftData.length > 0 ?  <Button variant="primary" onClick={() => handleSubmitNft()}>
            Continue
          </Button> : ""}
        </Modal.Footer>
      </Modal>
        </>
    );
};

export default NftListModal;
