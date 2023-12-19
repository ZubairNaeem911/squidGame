import {React,useState} from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import LeftIcon from "../../assets/images/left-arrow.png";
import RightIcon from "../../assets/images/right-arrow.png";
import { useDispatch, useSelector } from "react-redux";
import { getLatestData } from "../../redux/connectWallet/action";
import { toast } from "react-toastify";
import { LOADER_STATE_FALSE, LOADER_STATE_TRUE } from "../../redux/actionType";
const BulkParticipateModal = (props) => {
    let dispatch = useDispatch();
    const contractData = useSelector((state) => state.contract);
    const leftOrRightMove = async(direction) =>{
        if (contractData?.contractInstance) {
            try {
                dispatch({
                    type: LOADER_STATE_TRUE,
                  });
              props.close();
              const side = direction == "left" ? false : true;

              const transaction = await  contractData?.contractInstance.bulkParticipateInGame(side,props.playerIds);
              const compTransaction = await transaction.wait();
              if(compTransaction){
                dispatch(getLatestData(contractData?.contractInstance));
                // dispatch({
                //     type: LOADER_STATE_FALSE,
                //   });
                // toast.success("Bulk Participate completed successfully")
              }
              else{
                dispatch({
                    type: LOADER_STATE_FALSE,
                  });
                toast.error("Error In Transaction")
              }
      
            } catch (error) {
                dispatch({
                    type: LOADER_STATE_FALSE,
                  });
              toast.error(error?.error?.data.message ? error.error.data.message.split(":")[1] : "Error In Transaction");
              console.log("ERROR>>",error)
            }
          }
    }
    return (

        <>
            {props.show === true ? (
                <div className="time-modal">
                    <button
                        type="button"
                        className="close"
                        onClick={() => props.close()}
                    >
                        {/* <span aria-hidden="true">&times;</span> */}
                    </button>
                    <div className="custom-modal-header">Select Tile For Jump </div>
                    <div className="custom-modal-content">
                        <div className="arrow-wrapper d-flex align-items-center justify-content-between">
                            {contractData?.safetiles[props.stage] !== undefined &&
                                contractData?.safetiles[props.stage].safeTile >= 50 ? (
                                <div className="arrow-icon right-icon"></div>
                            ) : (
                                <div
                                    className="arrow-icon left-icon"
                                    onClick={() => leftOrRightMove("left")}
                                >
                                    <img src={LeftIcon} alt="icon left" className="img-fluid" />
                                </div>
                            )}

                            {contractData?.safetiles[props.stage] !== undefined &&
                                contractData?.safetiles[props.stage].safeTile < 50 ? (
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
        </>
    )
}
export default BulkParticipateModal;