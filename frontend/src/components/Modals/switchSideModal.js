import React from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import { getLatestData } from "../../redux/connectWallet/action";
import { toast } from "react-toastify";

const SwitchSideModal = (props) => {
    let dispatch = useDispatch();
    const contractData = useSelector((state) => state.contract);
    const switchSide = async () => {
        try {

            if (contractData?.contractInstance) {
                if (contractData.signerWallet == props.nftData.userWalletAddress) {
                props.lodaer(true);
                props.close();
                const playerID = props.nftData.playerId;
                let transaction =
                    await contractData?.contractInstance.switchSide(
                        playerID
                    );
                    let waitTransaction = await transaction.wait();
                    if (waitTransaction) {
                    dispatch(getLatestData(contractData?.contractInstance, contractData?.globalStage));
                } else {
                    toast.error("Transaction Failed ");
                }
            }
            else{
                toast.error("Not Your Nft");
            }
            }
        } catch (e) {
            props.lodaer(false);
            toast.error(e.error.data.message.split(":")[1]);
            toast.error(e);

        }
    }
    return (
        <>
            <Modal
                className="mynft-list"
                show={props.show}
                cancel={props.close}
                size="lg"
                centered
            >
                <Modal.Header className="justify-content-center">
                    <Modal.Title>Switch Side</Modal.Title>
                    <button type="button" className="close" onClick={props.close}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <div className="nft-list">


                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-connect" onClick={() => switchSide()} >
                        Switch Side
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SwitchSideModal;
