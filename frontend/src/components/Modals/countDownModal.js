import React, { useState, useEffect } from 'react'
import { Modal } from "react-bootstrap";
import timer from '../../assets/images/white-timer.png'
import { useDispatch } from "react-redux";
import {closeModal} from '../../redux/connectWallet/action'


const CountdownModal = (props) => {

  let dispatch = useDispatch();
  const [time, setTime] = useState(10)
  const [close, setclose] = useState(false);
  useEffect(() =>{
    props.gameEndModalHandler();
  },[])

  useEffect(() => {

    if (time == 0) {
      props.gameDataModalShow(true);
      setTime(0);
      handleClose()
      dispatch(closeModal());
      
    }
    else {
      const intervalId = setInterval(() => {
        setTime(time - 1);
      }, 1000);
      return () => {
        clearInterval(intervalId)
      }
    }
  }, [time])

  // setTimeout(() => {

  // }, 10000)
  const handleClose = () => {
    setclose(true)
  }

  return (
    <Modal
      className="mynft-list nft-card"
      show={close === false ? true : false}
      // cancel={props.close}
      size="lg"
      centered
    >
      <Modal.Header className="justify-content-center">
        <Modal.Title>CountDown</Modal.Title>
        {/* <button type="button" className="close"  */}
        {/*  onClick={props.close} */}
        {/* > */}
        {/* <span aria-hidden="true">&times;</span> */}
        {/* </button> */}
      </Modal.Header>
      <Modal.Body>
        <div className='timer-wrapper'>
          <div className='icon'>
            <img src={timer} className='img-fluid' />
          </div>
          <h3>{time}</h3>
        </div>
      </Modal.Body>
      {/* <Modal.Footer>
                    <Button className="btn-connect" 
                    // onClick={()=> {window.open(`${process.env.REACT_APP_OPENSEA_URL}/${props.nftData?.metaData?.series == 2 ?process.env.REACT_APP_NFT_SERIES2_ADDRESS : process.env.REACT_APP_NFT_SERIES1_ADDRESS}/${props.nftData?.metaData?.tokenId}`)}} 
                    >
                        See Nft
                    </Button>
                </Modal.Footer> */}
    </Modal>
  )
}

export default CountdownModal