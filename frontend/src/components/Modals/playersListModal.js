import { React} from "react";
import {  Modal,Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Nftfram from "../../assets/images/nft-fram.png";

const PlayerListModal = (props) => {
    return (
        <> 
       <Modal className="nft-modal" show={props.show} onHide={props.close}>
        <Modal.Header className="justify-content-center">
          <Modal.Title>Players List</Modal.Title>
        </Modal.Header>
        <Modal.Body closeButton>
          {props.allNftList?.map((data, key) => {
            return (
              <div
                key={key}
                className="nft-content-wrapper d-flex align-items-center"
                onClick={() => {
                  props.close();
                  props.conditionalModalHandling(data)
                }}
              >
                <div className="nft-img">
                  <Image src={data.metaData.imageUrl ? data.metaData.imageUrl : Nftfram} fluid />
                </div>
                <div className="nft-content">
                  <h3>NFT ID :{Number(data.nftId)}</h3>
                  <h4>Stage :{Number(data.stage)}</h4>
                </div>
                <div className="address">
                  <h4>
                    <span>{data.userWalletAddress}</span>
                  </h4>
                </div>
              </div>
            );
          })}
        </Modal.Body>

      </Modal>
        </>
    );
};

export default PlayerListModal;
