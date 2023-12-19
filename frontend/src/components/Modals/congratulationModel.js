import React from "react";
import {  Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CongratulationModal = (props) => {

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
                    <Modal.Title>Reward</Modal.Title>
                    <button type="button" className="close" onClick={props.close}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {/* <div className="nft-list"> */}
                        {props.congratulationShow ?
                            <>
                                {/* <div className="game-over-bg"></div> */}
                                {/* <div className="time-modal"> */}
                                    <div className="custom-modal-content pt-0">
                                        <h2 className="text-center my-2">CONGRATULATIONS YOU'VE WON !</h2>
                                        {/* <p>YOU'VE WON {((props.claimAmount)/1e18 > 0) ? (props.claimAmount)/1e18 : ""} ETH REWARD AMOUNT</p> */}
                                    </div>
                                {/* </div> */}
                            </>
                            : ''
                        }

                    {/* </div> */}

                </Modal.Body>

            </Modal>
        </>
    );
};

export default CongratulationModal;
