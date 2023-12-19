import {React,useState} from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";

const RestartGameModal = (props) => {
    let dispatch = useDispatch();
    const contractData = useSelector((state) => state.contract);
    const [timeStamp,setTimeStamp] = useState('');
    const reStart = async () => {
        try {
            if (contractData.contractInstance) {
                props.lodaer(true);
                let date = Math.floor(Date.now() / 1000);
                if(timeStamp >= date){
                 props.close(); 
                  
                const transaction = await contractData.contractInstance.restartGame(timeStamp);
                const result = await transaction.wait();
                setTimeStamp('');
                if(result){
                    await axios.post(`${process.env.REACT_APP_SERVER_URL}/v1/counter/delete`,{gameNumber:2})
                    props.lodaer(false);
                    toast.success("Game ReStarted");
                    window.location.reload();
                }
                else{
                    props.lodaer(false);
                    toast.error("Error!")
                }
            }
            else{
                props.lodaer(false);
                toast.error("Timestamp must be greater or equal to current time !")
            }
            }
        }
        catch (e) {
            props.lodaer(false);
            toast.error(e);
            console.log("TimeStamp>>>>>>",e)
        }
    }
    
    return (
        <>
            <Modal
                className="mynft-list restart"
                show={props.show}
                cancel={props.close}
                size="lg"
                centered
            >
                <Modal.Header className="justify-content-center">
                    <Modal.Title>Restart Game</Modal.Title>
                    <button type="button" className="close" onClick={props.close}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-wrapper">
                        <div className="form-group">
                            <div className="form-field">
                                <label>Enter Time</label>
                                <input type="text" className="input-field" 
                                value={timeStamp}
                                name="timeStamp"
                                onChange={(e)=>{
                                    setTimeStamp(e.target.value)
                                }}
                                />
                            </div>
                        </div>
                        
                        <Button className="btn-connect"  onClick={() => reStart()}>
                            Restart
                        </Button>
                    </div>

                </Modal.Body>
                {/* <Modal.Footer>
                    <Button className="btn-connect" onClick={() => switchSide()} >
                        Switch Side
                    </Button>
                </Modal.Footer> */}
            </Modal>
        </>
    );
};

export default RestartGameModal;