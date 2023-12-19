import { React, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const NftCardModal = (props) => {
    let dispatch = useDispatch();
    const contractData = useSelector((state) => state.contract);

    return (
        <>
            <Modal
                className="mynft-list nft-card"
                show={props.show}
                cancel={props.close}
                size="lg"
                centered
            >
                <Modal.Header className="justify-content-center">
                    <Modal.Title>Nft Card </Modal.Title>
                    <button type="button" className="close" onClick={props.close}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <div className="nft-card">
                        <div className="nft-image">
                            <img src={props.nftData.metaData?.imageUrl} alt="NFT" className="img-fluid" />
                        </div>
                        <div className="nft-detail">
                            <ul>
                                <li><label>Owner : </label> <span>{props.nftData.userWalletAddress}</span></li>
                                <li><label>Name : </label> <span>{props.nftData?.metaData?.name}</span></li>
                            </ul>

                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-connect" onClick={()=> {window.open(`${process.env.REACT_APP_OPENSEA_URL}/${props.nftData?.nftSeriestype == 2 ?process.env.REACT_APP_NFT_SERIES2_ADDRESS : process.env.REACT_APP_NFT_SERIES1_ADDRESS}/${Number(props.nftData?.nftId)}`)}} >
                        See Nft
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NftCardModal;
